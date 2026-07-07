package com.zencoo.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateHometownRequest {

    @NotNull(message = "hometown is required")
    @Size(max = 255, message = "Hometown must be at most 255 characters")
    private String hometown;

    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }
}
