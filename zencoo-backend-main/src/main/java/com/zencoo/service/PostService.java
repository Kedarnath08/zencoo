package com.zencoo.service;

import com.zencoo.dto.CommentDto;
import com.zencoo.dto.PostDto;
import com.zencoo.model.*;
import com.zencoo.repository.PostCommentRepository;
import com.zencoo.repository.PostLikeRepository;
import com.zencoo.repository.PostRepository;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired private PostRepository postRepository;
    @Autowired private PostLikeRepository postLikeRepository;
    @Autowired private PostCommentRepository postCommentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    @Transactional
    public PostDto createPost(Long userId, String imageUrl, String caption, BigDecimal price) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        Post post = postRepository.save(new Post(user, imageUrl, caption, price));
        return toDto(post, userId);
    }

    @Transactional(readOnly = true)
    public PostDto getPost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return toDto(post, currentUserId);
    }

    @Transactional(readOnly = true)
    public List<PostDto> getFeed(Long currentUserId) {
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> toDto(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostDto> getUserPosts(Long authorId, Long currentUserId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(authorId).stream()
                .map(p -> toDto(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (!post.getUser().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own posts");
        }
        postCommentRepository.deleteByPostId(postId);
        postLikeRepository.deleteByPostId(postId);
        postRepository.delete(post);
    }

    /** Toggles the current user's like. Returns the post with fresh like state. */
    @Transactional
    public PostDto toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        if (postLikeRepository.existsByPostIdAndUserId(postId, userId)) {
            postLikeRepository.deleteByPostIdAndUserId(postId, userId);
        } else {
            User user = userRepository.getReferenceById(userId);
            postLikeRepository.save(new PostLike(post, user));
            if (!post.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        post.getUser().getId(),
                        NotificationType.LIKE,
                        postId,
                        "New like",
                        user.getUsername() + " liked your post"
                );
            }
        }
        return toDto(post, userId);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found");
        }
        return postCommentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(this::toCommentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long postId, Long userId, String text) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        PostComment comment = postCommentRepository.save(new PostComment(post, user, text));
        if (!post.getUser().getId().equals(userId)) {
            notificationService.createNotification(
                    post.getUser().getId(),
                    NotificationType.COMMENT,
                    postId,
                    "New comment",
                    user.getUsername() + " commented on your post"
            );
        }
        return toCommentDto(comment);
    }

    private PostDto toDto(Post post, Long currentUserId) {
        User author = post.getUser();
        return new PostDto(
                post.getId(),
                author.getId(),
                author.getUsername(),
                author.getFullName(),
                author.getProfilePic(),
                post.getImageUrl(),
                post.getCaption(),
                post.getPrice(),
                post.getCreatedAt() != null ? post.getCreatedAt().format(ISO) : null,
                postLikeRepository.countByPostId(post.getId()),
                postCommentRepository.countByPostId(post.getId()),
                postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUserId)
        );
    }

    private CommentDto toCommentDto(PostComment comment) {
        User author = comment.getUser();
        return new CommentDto(
                comment.getId(),
                author.getId(),
                author.getUsername(),
                author.getFullName(),
                author.getProfilePic(),
                comment.getText(),
                comment.getCreatedAt() != null ? comment.getCreatedAt().format(ISO) : null
        );
    }
}
