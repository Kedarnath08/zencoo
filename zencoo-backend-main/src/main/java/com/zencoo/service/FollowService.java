package com.zencoo.service;

import com.zencoo.dto.ResidentDto;
import com.zencoo.model.*;
import com.zencoo.repository.FollowRepository;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    @Autowired private FollowRepository followRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    /** Current user follows the target. Idempotent. */
    @Transactional
    public void follow(Long followerId, Long targetId) {
        if (followerId.equals(targetId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot follow yourself");
        }
        if (!userRepository.existsById(targetId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        if (followRepository.existsByFollowerIdAndFollowingId(followerId, targetId)) {
            return; // already following
        }
        User follower = userRepository.getReferenceById(followerId);
        User target = userRepository.getReferenceById(targetId);
        followRepository.save(new Follow(follower, target));

        notificationService.createNotification(
                targetId,
                NotificationType.FOLLOW,
                followerId,
                "New follower",
                follower.getUsername() + " started following you"
        );
    }

    /** Current user unfollows the target. Idempotent. */
    @Transactional
    public void unfollow(Long followerId, Long targetId) {
        followRepository.deleteByFollowerIdAndFollowingId(followerId, targetId);
    }

    @Transactional(readOnly = true)
    public long countFollowers(Long userId) {
        return followRepository.countByFollowingId(userId);
    }

    @Transactional(readOnly = true)
    public long countFollowing(Long userId) {
        return followRepository.countByFollowerId(userId);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long targetId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, targetId);
    }

    /** The people who follow this user. */
    @Transactional(readOnly = true)
    public List<ResidentDto> getFollowers(Long userId) {
        return followRepository.findByFollowingIdOrderByCreatedAtDesc(userId).stream()
                .map(f -> ResidentMapper.toResidentDto(f.getFollower()))
                .collect(Collectors.toList());
    }

    /** The people this user follows. */
    @Transactional(readOnly = true)
    public List<ResidentDto> getFollowing(Long userId) {
        return followRepository.findByFollowerIdOrderByCreatedAtDesc(userId).stream()
                .map(f -> ResidentMapper.toResidentDto(f.getFollowing()))
                .collect(Collectors.toList());
    }
}
