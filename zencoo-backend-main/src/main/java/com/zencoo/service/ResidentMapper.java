package com.zencoo.service;

import com.zencoo.dto.ResidentDto;
import com.zencoo.model.User;

/**
 * Shared mapping from {@link User} to the lightweight {@link ResidentDto}, used
 * by both the residents directory and follower/following lists.
 */
final class ResidentMapper {

    private ResidentMapper() {}

    static ResidentDto toResidentDto(User u) {
        return new ResidentDto(
                u.getId(),
                u.getFullName(),
                displayUsername(u.getUsername()),
                wingOf(u.getDoorNumber()),
                u.getDoorNumber(),
                u.getProfilePic()
        );
    }

    /** Wing is the first character of the door number (e.g. "2143" -> "2"). */
    static String wingOf(String doorNumber) {
        return (doorNumber != null && !doorNumber.isBlank())
                ? doorNumber.trim().substring(0, 1)
                : "";
    }

    /** Usernames are stored with a leading "@"; the UI prepends its own. */
    static String displayUsername(String username) {
        if (username == null) return null;
        return username.startsWith("@") ? username.substring(1) : username;
    }
}
