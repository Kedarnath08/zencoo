package com.zencoo.controller;

import com.zencoo.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users/{id}/follow")
public class FollowController {

    @Autowired
    private FollowService followService;

    @PostMapping
    public ResponseEntity<?> follow(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long id
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        followService.follow(userId, id);
        return ResponseEntity.ok(followState(userId, id));
    }

    @DeleteMapping
    public ResponseEntity<?> unfollow(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long id
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        followService.unfollow(userId, id);
        return ResponseEntity.ok(followState(userId, id));
    }

    private Map<String, Object> followState(Long currentUserId, Long targetId) {
        return Map.of(
                "followedByMe", followService.isFollowing(currentUserId, targetId),
                "followersCount", followService.countFollowers(targetId),
                "followingCount", followService.countFollowing(targetId)
        );
    }
}
