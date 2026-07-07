package com.zencoo.dto;

public class CommentDto {
    private Long id;
    private Long authorId;
    private String username;
    private String fullName;
    private String profilePic;
    private String text;
    private String createdAt;

    public CommentDto() {}

    public CommentDto(Long id, Long authorId, String username, String fullName,
                      String profilePic, String text, String createdAt) {
        this.id = id;
        this.authorId = authorId;
        this.username = username;
        this.fullName = fullName;
        this.profilePic = profilePic;
        this.text = text;
        this.createdAt = createdAt;
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

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
