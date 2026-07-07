package com.zencoo.dto;

/** Minimal post reference used in profile post grids (id + image only). */
public class PostSummaryDto {
    private Long id;
    private String imageUrl;

    public PostSummaryDto() {}

    public PostSummaryDto(Long id, String imageUrl) {
        this.id = id;
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
