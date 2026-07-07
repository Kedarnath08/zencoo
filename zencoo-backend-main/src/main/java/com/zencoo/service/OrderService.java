package com.zencoo.service;

import com.zencoo.dto.OrderDto;
import com.zencoo.model.Order;
import com.zencoo.model.OrderStatus;
import com.zencoo.model.User;
import com.zencoo.repository.OrderRepository;
import com.zencoo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;

    @Transactional
    public OrderDto createOrder(Long buyerId, Long sellerId, String productName,
                                String productImage, int quantity, String note) {
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

        Order order = orderRepository.save(
                new Order(buyer, seller, productName, productImage, quantity, note));
        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getPlacedOrders(Long buyerId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getReceivedOrders(Long sellerId) {
        return orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(this::toDto).collect(Collectors.toList());
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
        return toDto(orderRepository.save(order));
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
