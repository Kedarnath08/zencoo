package com.zencoo.controller;

import com.zencoo.dto.CommentDto;
import com.zencoo.dto.PostDto;
import com.zencoo.dto.request.CommentRequest;
import com.zencoo.dto.request.CreatePostRequest;
import com.zencoo.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public ResponseEntity<?> getFeed(@AuthenticationPrincipal(expression = "id") Long userId) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(postService.getFeed(userId));
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPost(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(postService.getPost(postId, userId));
    }

    @GetMapping("/user/{authorId}")
    public ResponseEntity<?> getUserPosts(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long authorId
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(postService.getUserPosts(authorId, userId));
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody CreatePostRequest body
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        String caption = body.getCaption() == null ? "" : body.getCaption();
        PostDto created = postService.createPost(userId, body.getImageUrl(), caption, body.getPrice());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        postService.deletePost(postId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(postService.toggleLike(postId, userId));
    }

    @GetMapping("/{postId}/comments")
    public ResponseEntity<?> getComments(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        List<CommentDto> comments = postService.getComments(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> addComment(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest body
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        CommentDto comment = postService.addComment(postId, userId, body.getText().trim());
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }
}
