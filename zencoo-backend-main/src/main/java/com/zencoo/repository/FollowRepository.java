package com.zencoo.repository;

import com.zencoo.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface FollowRepository extends JpaRepository<Follow, Long> {
    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    /** How many people follow this user. */
    long countByFollowingId(Long userId);

    /** How many people this user follows. */
    long countByFollowerId(Long userId);

    /** The people who follow this user (most recent first). Fetches the follower eagerly to avoid a lazy-load per row. */
    @Query("SELECT f FROM Follow f JOIN FETCH f.follower WHERE f.following.id = :followingId ORDER BY f.createdAt DESC")
    List<Follow> findByFollowingIdOrderByCreatedAtDesc(@Param("followingId") Long followingId);

    /** The people this user follows (most recent first). Fetches the target eagerly to avoid a lazy-load per row. */
    @Query("SELECT f FROM Follow f JOIN FETCH f.following WHERE f.follower.id = :followerId ORDER BY f.createdAt DESC")
    List<Follow> findByFollowerIdOrderByCreatedAtDesc(@Param("followerId") Long followerId);

    @Transactional
    void deleteByFollowerIdAndFollowingId(Long followerId, Long followingId);
}
