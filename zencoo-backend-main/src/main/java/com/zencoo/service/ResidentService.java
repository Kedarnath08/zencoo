package com.zencoo.service;

import com.zencoo.dto.PostSummaryDto;
import com.zencoo.dto.ResidentDto;
import com.zencoo.dto.ResidentProfileDto;
import com.zencoo.model.User;
import com.zencoo.repository.PostRepository;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResidentService {

    @Autowired private UserRepository userRepository;
    @Autowired private PostRepository postRepository;
    @Autowired private FollowService followService;

    /**
     * All residents except the current user. Optionally filtered to a single
     * wing (derived from the first character of the door number).
     */
    @Transactional(readOnly = true)
    public List<ResidentDto> getResidents(Long currentUserId, String wing) {
        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .filter(u -> wing == null || wing.isBlank() || wing.equals(ResidentMapper.wingOf(u.getDoorNumber())))
                .map(ResidentMapper::toResidentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResidentProfileDto getResident(Long id, Long currentUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resident not found"));
        List<PostSummaryDto> posts = postRepository.findByUserIdOrderByCreatedAtDesc(id).stream()
                .map(p -> new PostSummaryDto(p.getId(), p.getImageUrl()))
                .collect(Collectors.toList());
        return new ResidentProfileDto(
                user.getId(),
                user.getFullName(),
                ResidentMapper.displayUsername(user.getUsername()),
                ResidentMapper.wingOf(user.getDoorNumber()),
                user.getDoorNumber(),
                user.getBio(),
                user.getHometown(),
                user.getProfilePic(),
                null,          // header background not stored per-user yet
                followService.countFollowers(id),
                followService.countFollowing(id),
                followService.isFollowing(currentUserId, id),
                posts
        );
    }
}
