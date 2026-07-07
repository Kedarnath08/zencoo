package com.zencoo.service;

import com.zencoo.dto.OrderDto;
import com.zencoo.model.*;
import com.zencoo.repository.OrderRepository;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationService notificationService;

    @Transactional
    public OrderDto createOrder(Long buyerId, Long sellerId, String productName,
                                String productImage, int quantity, BigDecimal price, String note) {
        if (sellerId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sellerId is required");
        }
        if (sellerId.equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot order from yourself");
        }
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found"));

        BigDecimal unitPrice = price != null ? price : BigDecimal.ZERO;
        Order order = orderRepository.save(
                new Order(buyer, seller, productName, productImage, quantity, unitPrice, note));
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(Long orderId, Long currentUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        boolean isSeller = order.getSeller().getId().equals(currentUserId);
        boolean isBuyer = order.getBuyer().getId().equals(currentUserId);
        if (!isSeller && !isBuyer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getPlacedOrders(Long buyerId, int page, int size) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getReceivedOrders(Long sellerId, int page, int size) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, PageRequest.of(page, size))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateStatus(Long orderId, Long currentUserId, String statusStr) {
        OrderStatus target = parseStatus(statusStr);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        boolean isSeller = order.getSeller().getId().equals(currentUserId);
        boolean isBuyer = order.getBuyer().getId().equals(currentUserId);
        if (!isSeller && !isBuyer) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }

        OrderStatus current = order.getStatus();
        boolean allowed = switch (target) {
            case ACCEPTED, REJECTED -> isSeller && current == OrderStatus.PENDING;
            case COMPLETED -> isSeller && current == OrderStatus.ACCEPTED;
            case CANCELLED -> (isBuyer && current == OrderStatus.PENDING)
                    || (isSeller && current == OrderStatus.ACCEPTED);
            case PENDING -> false; // cannot move back to pending
        };
        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot change status from " + current + " to " + target);
        }

        order.setStatus(target);
        Order savedOrder = orderRepository.save(order);

        // Notify relevant parties based on status change
        String title = "Order " + target;
        String buyerMsg = null;
        String sellerMsg = null;

        switch (target) {
            case ACCEPTED -> {
                buyerMsg = "Your order for " + order.getProductName() + " was accepted";
                sellerMsg = null; // Seller already knows they accepted it
            }
            case REJECTED -> {
                buyerMsg = "Your order for " + order.getProductName() + " was rejected";
                sellerMsg = null;
            }
            case COMPLETED -> {
                buyerMsg = null; // Buyer already knows they completed/received
                sellerMsg = "Order for " + order.getProductName() + " is complete";
            }
            case CANCELLED -> {
                buyerMsg = current == OrderStatus.PENDING ? "Your order was cancelled" : null;
                sellerMsg = "An order was cancelled";
            }
            default -> {}
        }

        if (buyerMsg != null) {
            notificationService.createNotification(
                    order.getBuyer().getId(),
                    NotificationType.ORDER_STATUS,
                    order.getId(),
                    title,
                    buyerMsg
            );
        }
        if (sellerMsg != null) {
            notificationService.createNotification(
                    order.getSeller().getId(),
                    NotificationType.ORDER_STATUS,
                    order.getId(),
                    title,
                    sellerMsg
            );
        }

        return toDto(savedOrder);
    }

    private static OrderStatus parseStatus(String statusStr) {
        if (statusStr == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status is required");
        }
        try {
            return OrderStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + statusStr);
        }
    }

    private OrderDto toDto(Order o) {
        return new OrderDto(
                o.getId(),
                o.getProductName(),
                o.getProductImage(),
                o.getQuantity(),
                o.getUnitPrice(),
                o.getNote(),
                o.getStatus().name(),
                o.getBuyer().getId(),
                o.getBuyer().getFullName(),
                o.getSeller().getId(),
                o.getSeller().getFullName(),
                o.getCreatedAt() != null ? o.getCreatedAt().format(ISO) : null,
                o.getUpdatedAt() != null ? o.getUpdatedAt().format(ISO) : null
        );
    }
}
