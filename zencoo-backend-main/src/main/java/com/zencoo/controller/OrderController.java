package com.zencoo.controller;

import com.zencoo.dto.OrderDto;
import com.zencoo.dto.request.CreateOrderRequest;
import com.zencoo.dto.request.UpdateOrderStatusRequest;
import com.zencoo.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/placed")
    public ResponseEntity<?> getPlaced(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(orderService.getPlacedOrders(userId, page, size));
    }

    @GetMapping("/received")
    public ResponseEntity<?> getReceived(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(orderService.getReceivedOrders(userId, page, size));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long orderId
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(orderService.getOrder(orderId, userId));
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @Valid @RequestBody CreateOrderRequest body
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");

        int quantity = body.getQuantity() == null ? 1 : body.getQuantity();
        OrderDto created = orderService.createOrder(
                userId,
                body.getSellerId(),
                body.getProductName().trim(),
                body.getProductImage(),
                quantity,
                body.getPrice(),
                body.getNote());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<?> updateStatus(
            @AuthenticationPrincipal(expression = "id") Long userId,
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest body
    ) {
        if (userId == null) return ResponseEntity.status(401).body("Unauthorized");
        return ResponseEntity.ok(orderService.updateStatus(orderId, userId, body.getStatus()));
    }
}
