package com.zencoo.dto;

/** Lightweight resident representation for the directory list. */
public class ResidentDto {
    private Long id;
    private String displayName;
    private String username;
    private String wing;
    private String door;
    private String profilePic;

    public ResidentDto() {}

    public ResidentDto(Long id, String displayName, String username, String wing,
                       String door, String profilePic) {
        this.id = id;
        this.displayName = displayName;
        this.username = username;
        this.wing = wing;
        this.door = door;
        this.profilePic = profilePic;
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

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
}
