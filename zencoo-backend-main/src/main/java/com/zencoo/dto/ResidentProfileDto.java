package com.zencoo.dto;

import java.util.List;

/** Full resident profile for the "other user" profile screen. */
public class ResidentProfileDto {
    private Long id;
    private String displayName;
    private String username;
    private String wing;
    private String door;
    private String bio;
    private String hometown;
    private String profilePic;
    private String headerBg;
    private long followersCount;
    private long followingCount;
    private boolean followedByMe;
    private List<PostSummaryDto> posts;

    public ResidentProfileDto() {}

    public ResidentProfileDto(Long id, String displayName, String username, String wing,
                              String door, String bio, String hometown, String profilePic,
                              String headerBg, long followersCount, long followingCount,
                              boolean followedByMe, List<PostSummaryDto> posts) {
        this.id = id;
        this.displayName = displayName;
        this.username = username;
        this.wing = wing;
        this.door = door;
        this.bio = bio;
        this.hometown = hometown;
        this.profilePic = profilePic;
        this.headerBg = headerBg;
        this.followersCount = followersCount;
        this.followingCount = followingCount;
        this.followedByMe = followedByMe;
        this.posts = posts;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getWing() { return wing; }
    public void setWing(String wing) { this.wing = wing; }

    public String getDoor() { return door; }
    public void setDoor(String door) { this.door = door; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getHometown() { return hometown; }
    public void setHometown(String hometown) { this.hometown = hometown; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public String getHeaderBg() { return headerBg; }
    public void setHeaderBg(String headerBg) { this.headerBg = headerBg; }

    public long getFollowersCount() { return followersCount; }
    public void setFollowersCount(long followersCount) { this.followersCount = followersCount; }

    public long getFollowingCount() { return followingCount; }
    public void setFollowingCount(long followingCount) { this.followingCount = followingCount; }

    public boolean isFollowedByMe() { return followedByMe; }
    public void setFollowedByMe(boolean followedByMe) { this.followedByMe = followedByMe; }

    public List<PostSummaryDto> getPosts() { return posts; }
    public void setPosts(List<PostSummaryDto> posts) { this.posts = posts; }
}
