package com.zencoo.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CommentRequest {

    @NotBlank(message = "text is required")
    private String text;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
}
