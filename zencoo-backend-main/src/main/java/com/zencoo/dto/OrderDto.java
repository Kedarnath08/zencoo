package com.zencoo.dto;

/**
 * Unified order representation used by both the "placed" and "received" lists.
 * The client shows the seller for placed orders and the buyer for received ones.
 */
public class OrderDto {
    private Long id;
    private String productName;
    private String productImage;
    private int quantity;
    private String note;
    private String status;

    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;

    private String createdAt;
    private String updatedAt;

    public OrderDto() {}

    public OrderDto(Long id, String productName, String productImage, int quantity, String note,
                    String status, Long buyerId, String buyerName, Long sellerId, String sellerName,
                    String createdAt, String updatedAt) {
        this.id = id;
        this.productName = productName;
        this.productImage = productImage;
        this.quantity = quantity;
        this.note = note;
        this.status = status;
        this.buyerId = buyerId;
        this.buyerName = buyerName;
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
