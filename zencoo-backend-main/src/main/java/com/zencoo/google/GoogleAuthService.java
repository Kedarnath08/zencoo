package com.zencoo.google;

import com.zencoo.model.User;
import com.zencoo.repository.UserRepository;
import com.zencoo.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class GoogleAuthService {

    @Autowired private GoogleTokenVerifier googleTokenVerifier;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    /**
     * Verifies the Google ID token and either logs an existing/linkable user
     * in (returns a JWT) or reports that this is a new Google identity that
     * still needs door number/community before an account can be created.
     */
    @Transactional
    public GoogleLoginResult login(String idToken) {
        GoogleTokenVerifier.GoogleProfile profile = verifyOrThrow(idToken);

        Optional<User> user = userRepository.findByGoogleId(profile.sub());
        if (user.isEmpty()) {
            String email = normalizeEmail(profile.email());
            user = email == null ? Optional.empty() : userRepository.findByEmail(email);
            // A password-based account with this verified email — link it so
            // either sign-in method works from now on.
            if (user.isPresent() && user.get().getGoogleId() == null) {
                user.get().setGoogleId(profile.sub());
                userRepository.save(user.get());
            }
        }

        if (user.isPresent()) {
            String jwt = jwtUtil.generateToken(user.get().getId(), user.get().getEmail());
            return GoogleLoginResult.existingUser(jwt);
        }

        String suggestedUsername = suggestUsername(profile.name(), profile.email());
        return GoogleLoginResult.newUser(profile.email(), profile.name(), suggestedUsername);
    }

    /** Creates the account for a new Google identity once door number/community are collected. */
    @Transactional
    public String completeRegistration(String idToken, String username, String doorNumber, String community) {
        GoogleTokenVerifier.GoogleProfile profile = verifyOrThrow(idToken);

        if (userRepository.findByGoogleId(profile.sub()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This Google account is already registered");
        }
        String email = normalizeEmail(profile.email());
        if (email != null && userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already registered");
        }
        String trimmedUsername = username == null ? "" : username.trim();
        if (trimmedUsername.isEmpty() || userRepository.existsByUsername(trimmedUsername)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username not available");
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(trimmedUsername);
        user.setPasswordHash(null);
        user.setGoogleId(profile.sub());
        user.setFullName(profile.name());
        user.setDoorNumber(doorNumber);
        user.setCommunity(community);
        userRepository.save(user);

        return jwtUtil.generateToken(user.getId(), user.getEmail());
    }

    private GoogleTokenVerifier.GoogleProfile verifyOrThrow(String idToken) {
        return googleTokenVerifier.verify(idToken)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token"));
    }

    private String suggestUsername(String name, String email) {
        String base;
        if (name != null && !name.isBlank()) {
            base = name.trim().replaceAll("\\s+", "_").toLowerCase();
        } else if (email != null && email.contains("@")) {
            base = email.substring(0, email.indexOf('@')).replace(".", "_").toLowerCase();
        } else {
            base = "user";
        }
        String candidate = "@" + base;
        if (!userRepository.existsByUsername(candidate)) {
            return candidate;
        }
        for (int i = 0; i < 50; i++) {
            String withSuffix = "@" + base + (10 + (int) (Math.random() * 90));
            if (!userRepository.existsByUsername(withSuffix)) {
                return withSuffix;
            }
        }
        return "@" + base + (System.currentTimeMillis() % 10000);
    }

    private static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    /** Either an existing user's JWT, or the profile info needed to finish registering a new one. */
    public record GoogleLoginResult(
            boolean matchedExistingUser,
            String token,
            String email,
            String fullName,
            String suggestedUsername
    ) {
        static GoogleLoginResult existingUser(String token) {
            return new GoogleLoginResult(true, token, null, null, null);
        }

        static GoogleLoginResult newUser(String email, String fullName, String suggestedUsername) {
            return new GoogleLoginResult(false, null, email, fullName, suggestedUsername);
        }
    }
}
