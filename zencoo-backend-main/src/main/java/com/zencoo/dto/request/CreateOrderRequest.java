package com.zencoo.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateOrderRequest {

    @NotNull(message = "sellerId is required")
    private Long sellerId;

    @NotBlank(message = "productName is required")
    private String productName;

    private String productImage;

    /** Optional; defaults to 1 when omitted. Must be positive if provided. */
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String note;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
