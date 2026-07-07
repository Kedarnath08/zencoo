package com.zencoo.repository;

import com.zencoo.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** How many people follow this user. */
    long countByFollowingId(Long userId);

    /** How many people this user follows. */
    long countByFollowerId(Long userId);

    /** The people who follow this user (most recent first). */
    List<Follow> findByFollowingIdOrderByCreatedAtDesc(Long followingId);

    /** The people this user follows (most recent first). */
    List<Follow> findByFollowerIdOrderByCreatedAtDesc(Long followerId);

    @Transactional
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
