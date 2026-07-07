package com.zencoo.repository;

import com.zencoo.model.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPostId(Long postId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    @Transactional
    void deleteByPostIdAndUserId(Long postId, Long userId);

    @Transactional
    void deleteByPostId(Long postId);
}
