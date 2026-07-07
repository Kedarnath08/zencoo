package com.zencoo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateBioRequest {

    @NotNull(message = "bio is required")
    @Size(max = 500, message = "Bio must be at most 500 characters")
    private String bio;

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}
