package com.zencoo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class CreatePostRequest {

    @NotBlank(message = "imageUrl is required")
    private String imageUrl;

    private String caption;

    /** Optional; when present, lists this post's item for sale at this price. */
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
