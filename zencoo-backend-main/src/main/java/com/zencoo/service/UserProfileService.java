package com.zencoo.service;

import com.zencoo.dto.UserProfileDto;
import com.zencoo.model.User;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowService followService;

    public Optional<UserProfileDto> getUserProfileById(Long userId) {
        return userRepository.findById(userId).map(this::toDto);
    }

    public Optional<UserProfileDto> updateUserBio(Long userId, String bio) {
        return userRepository.findById(userId).map(user -> {
            user.setBio(bio);
            return toDto(userRepository.save(user));
        });
    }

    public Optional<UserProfileDto> updateUserHometown(Long userId, String hometown) {
        return userRepository.findById(userId).map(user -> {
            user.setHometown(hometown);
            return toDto(userRepository.save(user));
        });
    }

    public Optional<UserProfileDto> updateUserProfilePic(Long userId, String profilePic) {
        return userRepository.findById(userId).map(user -> {
            user.setProfilePic(profilePic);
            return toDto(userRepository.save(user));
        });
    }

    private UserProfileDto toDto(User user) {
        UserProfileDto dto = new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getDoorNumber(),
                user.getBio(),
                user.getHometown(),
                user.getProfilePic()
        );
        dto.setFollowersCount(followService.countFollowers(user.getId()));
        dto.setFollowingCount(followService.countFollowing(user.getId()));
        return dto;
    }
}