package com.zencoo.service;

import com.zencoo.model.User;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public boolean validateLogin(String email, String password) {
        logger.info("Validating login for email: {}", email);
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.warn("User not found for email: {}", email);
            return false;
        }
        String storedHash = userOpt.get().getPasswordHash();
        if (storedHash == null) {
            return false;
        }
        return passwordEncoder.matches(password, storedHash);
    }

    public boolean isEmailRegistered(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean isUsernameUnique(String username) {
        return !userRepository.existsByUsername(username);
    }

    public User registerUser(String email, String username, String rawPassword, String fullName, String doorNumber, String community) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setFullName(fullName);
        user.setDoorNumber(doorNumber);
        user.setCommunity(community);
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}