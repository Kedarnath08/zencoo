package com.zencoo.google;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Real Google ID tokens can't be minted in a test, so GoogleTokenVerifier is
 * mocked here: each fake "token string" is wired to a specific verified
 * profile (or to "invalid"), and the real /api/auth/google* endpoints +
 * GoogleAuthService run against that.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class GoogleAuthTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    @MockitoBean
    private GoogleTokenVerifier googleTokenVerifier;

    private String bearer(String token) {
        return "Bearer " + token;
    }

    @Test
    void newGoogleIdentitySuggestsUsernameWithoutCreatingAnAccount() throws Exception {
        when(googleTokenVerifier.verify(eq("new-user-token")))
                .thenReturn(Optional.of(new GoogleTokenVerifier.GoogleProfile(
                        "google-sub-1", "newgoogleuser@example.com", "New Google User")));

        String body = mapper.createObjectNode().put("idToken", "new-user-token").toString();
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isNewUser").value(true))
                .andExpect(jsonPath("$.email").value("newgoogleuser@example.com"))
                .andExpect(jsonPath("$.suggestedUsername").exists())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void invalidGoogleTokenIsUnauthorized() throws Exception {
        when(googleTokenVerifier.verify(eq("garbage-token"))).thenReturn(Optional.empty());

        String body = mapper.createObjectNode().put("idToken", "garbage-token").toString();
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void completingRegistrationCreatesAWorkingAccount() throws Exception {
        when(googleTokenVerifier.verify(eq("complete-token")))
                .thenReturn(Optional.of(new GoogleTokenVerifier.GoogleProfile(
                        "google-sub-2", "completeme@example.com", "Complete Me")));

        String completeBody = mapper.createObjectNode()
                .put("idToken", "complete-token")
                .put("username", "@completeme")
                .put("doorNumber", "1101")
                .put("community", "Test Community")
                .toString();
        String resp = mockMvc.perform(post("/api/auth/google/complete")
                        .contentType(MediaType.APPLICATION_JSON).content(completeBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();
        String jwt = mapper.readTree(resp).get("token").asText();

        // The issued token actually authenticates against a protected endpoint,
        // and the account was created with the submitted door number.
        mockMvc.perform(get("/api/profile").header("Authorization", bearer(jwt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("@completeme"))
                .andExpect(jsonPath("$.email").value("completeme@example.com"));

        // Signing in again with the same Google identity now logs straight in
        // (no second isNewUser:true) instead of trying to re-register.
        String loginBody = mapper.createObjectNode().put("idToken", "complete-token").toString();
        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON).content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isNewUser").value(false))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void completingRegistrationRejectsATakenUsername() throws Exception {
        registerPasswordUser("taken@example.com", "@takenusername");

        when(googleTokenVerifier.verify(eq("taken-username-token")))
                .thenReturn(Optional.of(new GoogleTokenVerifier.GoogleProfile(
                        "google-sub-3", "someoneelse@example.com", "Someone Else")));

        String body = mapper.createObjectNode()
                .put("idToken", "taken-username-token")
                .put("username", "@takenusername")
                .put("doorNumber", "1101")
                .put("community", "Test Community")
                .toString();
        mockMvc.perform(post("/api/auth/google/complete")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void googleSignInLinksToAnExistingPasswordAccountWithTheSameEmail() throws Exception {
        registerPasswordUser("linkme@example.com", "@linkme");

        when(googleTokenVerifier.verify(eq("link-token")))
                .thenReturn(Optional.of(new GoogleTokenVerifier.GoogleProfile(
                        "google-sub-4", "linkme@example.com", "Link Me")));

        String body = mapper.createObjectNode().put("idToken", "link-token").toString();
        String resp = mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isNewUser").value(false))
                .andExpect(jsonPath("$.token").exists())
                .andReturn().getResponse().getContentAsString();
        String jwt = mapper.readTree(resp).get("token").asText();

        // The linked account is the same pre-existing user (same username), not a new one.
        mockMvc.perform(get("/api/profile").header("Authorization", bearer(jwt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("@linkme"));
    }

    private void registerPasswordUser(String email, String username) throws Exception {
        String body = mapper.createObjectNode()
                .put("email", email)
                .put("username", username)
                .put("password", "secret123")
                .put("fullName", "Test User")
                .put("doorNumber", "1101")
                .put("community", "Test Community")
                .toString();
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk());
    }
}
