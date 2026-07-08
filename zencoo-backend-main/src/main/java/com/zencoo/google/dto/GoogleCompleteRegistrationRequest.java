package com.zencoo.google.dto;

import jakarta.validation.constraints.NotBlank;

public class GoogleCompleteRegistrationRequest {

    @NotBlank(message = "idToken is required")
    private String idToken;

    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Door number is required")
    private String doorNumber;

    private String community;

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDoorNumber() { return doorNumber; }
    public void setDoorNumber(String doorNumber) { this.doorNumber = doorNumber; }

    public String getCommunity() { return community; }
    public void setCommunity(String community) { this.community = community; }
}
