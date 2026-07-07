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
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(user -> {
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
            dto.setFollowersCount(followService.countFollowers(userId));
            dto.setFollowingCount(followService.countFollowing(userId));
            return dto;
        });
    }

    public Optional<User> updateUserBio(Long userId, String bio) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setBio(bio);
            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public Optional<User> updateUserHometown(Long userId, String hometown) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setHometown(hometown);
            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public Optional<User> updateUserProfilePic(Long userId, String profilePic) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setProfilePic(profilePic);
            userRepository.save(user);
            return Optional.of(user);
        }
        return Optional.empty();
    }
}