package com.zencoo.controller;

import com.zencoo.service.FollowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{id}")
public class FollowListController {

    @Autowired
    private FollowService followService;

    @GetMapping("/followers")
    public ResponseEntity<?> getFollowers(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long id
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(followService.getFollowers(id));
    }

    @GetMapping("/following")
    public ResponseEntity<?> getFollowing(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long id
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(followService.getFollowing(id));
    }
}
