package com.zencoo;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthAndPostFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    private String registerAndGetToken(String email, String username) throws Exception {
        String body = mapper.createObjectNode()
                .put("email", email)
                .put("username", username)
                .put("password", "secret123")
                .put("fullName", "Test User")
                .put("doorNumber", "1101")
                .put("community", "Test Community")
                .toString();
        String resp = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(resp).get("token").asText();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private long myId(String token) throws Exception {
        String resp = mockMvc.perform(get("/api/profile").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(resp).get("id").asLong();
    }

    @Test
    void fullAuthAndPostLifecycle() throws Exception {
        String token = registerAndGetToken("alice@example.com", "@alice10");

        // Login is case-insensitive on email and verifies the BCrypt hash.
        String loginBody = mapper.createObjectNode()
                .put("email", "ALICE@example.com")
                .put("password", "secret123").toString();
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        // Wrong password rejected.
        String badLogin = mapper.createObjectNode()
                .put("email", "alice@example.com").put("password", "wrong").toString();
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(badLogin))
                .andExpect(status().isUnauthorized());

        // Protected endpoint requires a token.
        mockMvc.perform(get("/api/posts"))
                .andExpect(status().is4xxClientError());

        // Create a post.
        String postBody = mapper.createObjectNode()
                .put("imageUrl", "https://example.com/pic.webp")
                .put("caption", "Hello Zencoo").toString();
        String postResp = mockMvc.perform(post("/api/posts")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(postBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.caption").value("Hello Zencoo"))
                .andExpect(jsonPath("$.likeCount").value(0))
                .andExpect(jsonPath("$.likedByMe").value(false))
                .andReturn().getResponse().getContentAsString();
        long postId = mapper.readTree(postResp).get("id").asLong();

        // Feed contains the post.
        mockMvc.perform(get("/api/posts").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].imageUrl").value("https://example.com/pic.webp"));

        // Fetching the single post by id returns the same data.
        mockMvc.perform(get("/api/posts/" + postId).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(postId))
                .andExpect(jsonPath("$.caption").value("Hello Zencoo"));

        // A non-existent post id 404s.
        mockMvc.perform(get("/api/posts/999999").header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());

        // Like -> count 1, likedByMe true.
        mockMvc.perform(post("/api/posts/" + postId + "/like").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likeCount").value(1))
                .andExpect(jsonPath("$.likedByMe").value(true));

        // Toggle again -> unlike.
        mockMvc.perform(post("/api/posts/" + postId + "/like").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likeCount").value(0))
                .andExpect(jsonPath("$.likedByMe").value(false));

        // Comment on the post.
        String commentBody = mapper.createObjectNode().put("text", "Looks tasty!").toString();
        mockMvc.perform(post("/api/posts/" + postId + "/comments")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(commentBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.text").value("Looks tasty!"))
                .andExpect(jsonPath("$.username").value("@alice10"));

        // Comments list reflects it.
        mockMvc.perform(get("/api/posts/" + postId + "/comments").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void residentsDirectoryExcludesSelfAndDerivesWing() throws Exception {
        String aliceToken = registerAndGetToken("alice3@example.com", "@aliced");
        // The register helper uses door 1101 -> wing "1" for everyone.
        registerAndGetToken("bob3@example.com", "@bobd");

        // Directory as seen by Alice must exclude Alice and include Bob.
        String listResp = mockMvc.perform(get("/api/residents")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].wing").value("1"))
                .andReturn().getResponse().getContentAsString();
        // username is returned without the stored leading "@"
        org.assertj.core.api.Assertions.assertThat(listResp).doesNotContain("alice3@example.com");
        org.assertj.core.api.Assertions.assertThat(listResp).contains("\"username\":\"bobd\"");

        // Fetch a single resident by id (parse Bob's id from the list not needed;
        // just confirm the shape on the first entry).
        long bobId = mapper.readTree(listResp).get(0).get("id").asLong();
        mockMvc.perform(get("/api/residents/" + bobId)
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.door").value("1101"))
                .andExpect(jsonPath("$.followersCount").value(0))
                .andExpect(jsonPath("$.followedByMe").value(false))
                .andExpect(jsonPath("$.posts").isArray());
    }

    @Test
    void followAndUnfollowUpdatesCounts() throws Exception {
        String aliceToken = registerAndGetToken("alicef@example.com", "@alicef");
        String bobToken = registerAndGetToken("bobf@example.com", "@bobf");
        long bobId = myId(bobToken);

        // Cannot follow yourself.
        long aliceId = myId(aliceToken);
        mockMvc.perform(post("/api/users/" + aliceId + "/follow")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isBadRequest());

        // Alice follows Bob.
        mockMvc.perform(post("/api/users/" + bobId + "/follow")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.followedByMe").value(true))
                .andExpect(jsonPath("$.followersCount").value(1));

        // Idempotent — following again keeps the count at 1.
        mockMvc.perform(post("/api/users/" + bobId + "/follow")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.followersCount").value(1));

        // Bob's resident profile (as seen by Alice) reflects the follow.
        mockMvc.perform(get("/api/residents/" + bobId).header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.followersCount").value(1))
                .andExpect(jsonPath("$.followedByMe").value(true));

        // Alice's own profile shows followingCount = 1.
        mockMvc.perform(get("/api/profile").header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.followingCount").value(1))
                .andExpect(jsonPath("$.followersCount").value(0));

        // Bob's followers list contains Alice; Alice's following list contains Bob.
        mockMvc.perform(get("/api/users/" + bobId + "/followers").header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username").value("alicef"));
        mockMvc.perform(get("/api/users/" + aliceId + "/following").header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username").value("bobf"));
        // Alice has no followers of her own; Bob follows nobody.
        mockMvc.perform(get("/api/users/" + aliceId + "/followers").header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // Unfollow drops the count back to 0 and removes them from the lists.
        mockMvc.perform(delete("/api/users/" + bobId + "/follow")
                        .header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.followedByMe").value(false))
                .andExpect(jsonPath("$.followersCount").value(0));
        mockMvc.perform(get("/api/users/" + bobId + "/followers").header("Authorization", bearer(aliceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void registrationValidationRejectsBadInput() throws Exception {
        // Invalid email + too-short password -> 400 with a validation message.
        String bad = mapper.createObjectNode()
                .put("email", "not-an-email")
                .put("username", "@x")
                .put("password", "123")
                .toString();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(bad))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());

        // Missing password on login -> 400.
        String noPass = mapper.createObjectNode().put("email", "a@b.com").toString();
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON).content(noPass))
                .andExpect(status().isBadRequest());

        // Order with quantity 0 -> 400 (bean validation @Min).
        String token = registerAndGetToken("valid@example.com", "@validu");
        long sellerId = myId(registerAndGetToken("seller9@example.com", "@seller9"));
        String badOrder = mapper.createObjectNode()
                .put("sellerId", sellerId).put("productName", "X").put("quantity", 0).toString();
        mockMvc.perform(post("/api/orders").header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON).content(badOrder))
                .andExpect(status().isBadRequest());
    }

    @Test
    void duplicateEmailIsRejected() throws Exception {
        registerAndGetToken("bob@example.com", "@bobby10");
        String body = mapper.createObjectNode()
                .put("email", "bob@example.com")
                .put("username", "@bobby20")
                .put("password", "secret123")
                .put("fullName", "Bob")
                .put("doorNumber", "2101")
                .put("community", "C")
                .toString();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void deletingSomeoneElsesPostIsForbidden() throws Exception {
        String aliceToken = registerAndGetToken("alice2@example.com", "@alice20");
        String postBody = mapper.createObjectNode()
                .put("imageUrl", "https://example.com/x.webp")
                .put("caption", "mine").toString();
        String postResp = mockMvc.perform(post("/api/posts")
                        .header("Authorization", bearer(aliceToken))
                        .contentType(MediaType.APPLICATION_JSON).content(postBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long postId = mapper.readTree(postResp).get("id").asLong();

        String bobToken = registerAndGetToken("bob2@example.com", "@bobby30");
        mockMvc.perform(delete("/api/posts/" + postId)
                        .header("Authorization", bearer(bobToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void orderLifecycleAndAuthorization() throws Exception {
        String sellerToken = registerAndGetToken("seller@example.com", "@seller1");
        long sellerId = myId(sellerToken);
        String buyerToken = registerAndGetToken("buyer@example.com", "@buyer1");

        // You cannot order from yourself.
        String selfOrder = mapper.createObjectNode()
                .put("sellerId", sellerId).put("productName", "X").put("quantity", 1).toString();
        mockMvc.perform(post("/api/orders").header("Authorization", bearer(sellerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(selfOrder))
                .andExpect(status().isBadRequest());

        // Buyer places an order with the seller.
        String orderBody = mapper.createObjectNode()
                .put("sellerId", sellerId)
                .put("productName", "Fresh Veggies")
                .put("quantity", 2)
                .put("note", "before 6pm")
                .toString();
        String orderResp = mockMvc.perform(post("/api/orders").header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(orderBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.sellerName").value("Test User"))
                .andExpect(jsonPath("$.buyerName").value("Test User"))
                .andReturn().getResponse().getContentAsString();
        long orderId = mapper.readTree(orderResp).get("id").asLong();

        // Shows up in buyer's placed and seller's received lists.
        mockMvc.perform(get("/api/orders/placed").header("Authorization", bearer(buyerToken)))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));
        mockMvc.perform(get("/api/orders/received").header("Authorization", bearer(sellerToken)))
                .andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));

        // Buyer cannot accept (only the seller can) -> invalid transition.
        String accept = mapper.createObjectNode().put("status", "ACCEPTED").toString();
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", bearer(buyerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isBadRequest());

        // A stranger cannot touch the order at all -> forbidden.
        String strangerToken = registerAndGetToken("stranger@example.com", "@stranger1");
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", bearer(strangerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isForbidden());

        // Seller accepts, then completes.
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", bearer(sellerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(accept))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACCEPTED"));

        String complete = mapper.createObjectNode().put("status", "COMPLETED").toString();
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", bearer(sellerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(complete))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));

        // Completed is terminal — cannot cancel afterwards.
        String cancel = mapper.createObjectNode().put("status", "CANCELLED").toString();
        mockMvc.perform(patch("/api/orders/" + orderId + "/status")
                        .header("Authorization", bearer(sellerToken))
                        .contentType(MediaType.APPLICATION_JSON).content(cancel))
                .andExpect(status().isBadRequest());
    }
}
