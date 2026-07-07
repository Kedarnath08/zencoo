package com.zencoo.controller;

import com.zencoo.dto.UserProfileDto;
import com.zencoo.dto.request.UpdateBioRequest;
import com.zencoo.dto.request.UpdateHometownRequest;
import com.zencoo.dto.request.UpdateProfilePicRequest;
import com.zencoo.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal(expression = "id") Long userId) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return respond(userProfileService.getUserProfileById(userId));
    }

    @PatchMapping("/profile/bio")
    public ResponseEntity<?> updateBio(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody UpdateBioRequest body
    ) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return respond(userProfileService.updateUserBio(userId, body.getBio()));
    }

    @PatchMapping("/profile/hometown")
    public ResponseEntity<?> updateHometown(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody UpdateHometownRequest body
    ) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return respond(userProfileService.updateUserHometown(userId, body.getHometown()));
    }

    @PatchMapping("/profile/profile-pic")
    public ResponseEntity<?> updateProfilePic(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody UpdateProfilePicRequest body
    ) {
        if (userId == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        return respond(userProfileService.updateUserProfilePic(userId, body.getProfilePic()));
    }

    private ResponseEntity<?> respond(Optional<UserProfileDto> profile) {
        return profile
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body("User not found"));
    }
}
