package com.zencoo.dto;

public class PostDto {
    private Long id;
    private Long authorId;
    private String username;
    private String fullName;
    private String profilePic;
    private String imageUrl;
    private String caption;
    private String createdAt;
    private long likeCount;
    private long commentCount;
    private boolean likedByMe;

    public PostDto() {}

    public PostDto(Long id, Long authorId, String username, String fullName, String profilePic,
                   String imageUrl, String caption, String createdAt,
                   long likeCount, long commentCount, boolean likedByMe) {
        this.id = id;
        this.authorId = authorId;
        this.username = username;
        this.fullName = fullName;
        this.profilePic = profilePic;
        this.imageUrl = imageUrl;
        this.caption = caption;
        this.createdAt = createdAt;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.likedByMe = likedByMe;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public long getLikeCount() { return likeCount; }
    public void setLikeCount(long likeCount) { this.likeCount = likeCount; }

    public long getCommentCount() { return commentCount; }
    public void setCommentCount(long commentCount) { this.commentCount = commentCount; }

    public boolean isLikedByMe() { return likedByMe; }
    public void setLikedByMe(boolean likedByMe) { this.likedByMe = likedByMe; }
}
