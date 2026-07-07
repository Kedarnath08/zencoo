package com.zencoo.dto;

public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String doorNumber;
    private String bio;
    private String hometown;
    private String profilePic;
    private long followersCount;
    private long followingCount;

    // Constructors
    public UserProfileDto() {}
    public UserProfileDto(Long id, String username, String email, String fullName, String doorNumber, String bio, String hometown, String profilePic) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.doorNumber = doorNumber;
        this.bio = bio;
        this.hometown = hometown;
        this.profilePic = profilePic;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getDoorNumber() { return doorNumber; }
    public void setDoorNumber(String doorNumber) { this.doorNumber = doorNumber; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public long getFollowersCount() { return followersCount; }
    public void setFollowersCount(long followersCount) { this.followersCount = followersCount; }

    public long getFollowingCount() { return followingCount; }
    public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }
}