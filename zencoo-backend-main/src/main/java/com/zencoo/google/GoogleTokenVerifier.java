package com.zencoo.google;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.GeneralSecurityException;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * Verifies Google Sign-In ID tokens (signature, issuer, audience, expiry) via
 * Google's official verifier, which handles fetching/caching/rotating
 * Google's public signing keys internally.
 */
@Component
public class GoogleTokenVerifier {

    @Value("${google.oauth.client-ids:}")
    private String clientIdsProperty;

    private GoogleIdTokenVerifier verifier;

    @PostConstruct
    void init() throws GeneralSecurityException, IOException {
        List<String> clientIds = clientIdsProperty == null || clientIdsProperty.isBlank()
                ? Collections.emptyList()
                : Arrays.stream(clientIdsProperty.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();

        // An empty audience list means every token is rejected (fails closed)
        // until GOOGLE_OAUTH_CLIENT_IDS is actually configured.
        this.verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance())
                .setAudience(clientIds)
                .build();
    }

    /** Verifies the token and returns the Google profile, or empty if invalid/expired/untrusted. */
    public Optional<GoogleProfile> verify(String idTokenString) {
        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) return Optional.empty();
            GoogleIdToken.Payload payload = idToken.getPayload();
            Object name = payload.get("name");
            return Optional.of(new GoogleProfile(
                    payload.getSubject(),
                    payload.getEmail(),
                    name != null ? name.toString() : null
            ));
        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    /** A verified Google identity: {@code sub} (stable user id), email, display name. */
    public record GoogleProfile(String sub, String email, String name) {}
}
