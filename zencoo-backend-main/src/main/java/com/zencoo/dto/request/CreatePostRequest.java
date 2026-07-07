package com.zencoo.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreatePostRequest {

    @NotBlank(message = "imageUrl is required")
    private String imageUrl;

    private String caption;

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
}
