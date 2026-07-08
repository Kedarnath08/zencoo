package com.zencoo.google;

import com.zencoo.google.dto.GoogleCompleteRegistrationRequest;
import com.zencoo.google.dto.GoogleLoginRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.Map;

/**
 * Sign in / sign up with Google. Mounted under /api/auth/**, which
 * SecurityConfig already permits without a JWT.
 */
@RestController
@RequestMapping("/api/auth/google")
public class GoogleAuthController {

    @Autowired
    private GoogleAuthService googleAuthService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody GoogleLoginRequest body) {
        GoogleAuthService.GoogleLoginResult result = googleAuthService.login(body.getIdToken());

        Map<String, Object> response = new HashMap<>();
        response.put("isNewUser", !result.matchedExistingUser());
        if (result.matchedExistingUser()) {
            response.put("token", result.token());
        } else {
            response.put("email", result.email());
            response.put("fullName", result.fullName());
            response.put("suggestedUsername", result.suggestedUsername());
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete")
    public ResponseEntity<Map<String, Object>> complete(@Valid @RequestBody GoogleCompleteRegistrationRequest body) {
        String token = googleAuthService.completeRegistration(
                body.getIdToken(), body.getUsername(), body.getDoorNumber(), body.getCommunity());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        return ResponseEntity.ok(response);
    }
}
