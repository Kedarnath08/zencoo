package com.zencoo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateProfilePicRequest {

    @NotBlank(message = "profilePic is required")
    @Size(max = 1000, message = "profilePic must be at most 1000 characters")
    private String profilePic;

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
}
