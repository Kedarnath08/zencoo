package com.zencoo.repository;

import com.zencoo.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {

    /** Fetches buyer + seller in the same query to avoid a lazy-load per row. */
    @Query(value = "SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.seller " +
            "WHERE o.buyer.id = :buyerId ORDER BY o.createdAt DESC",
            countQuery = "SELECT COUNT(o) FROM Order o WHERE o.buyer.id = :buyerId")
    Page<Order> findByBuyerIdOrderByCreatedAtDesc(@Param("buyerId") Long buyerId, Pageable pageable);

    @Query(value = "SELECT o FROM Order o JOIN FETCH o.buyer JOIN FETCH o.seller " +
            "WHERE o.seller.id = :sellerId ORDER BY o.createdAt DESC",
            countQuery = "SELECT COUNT(o) FROM Order o WHERE o.seller.id = :sellerId")
    Page<Order> findBySellerIdOrderByCreatedAtDesc(@Param("sellerId") Long sellerId, Pageable pageable);
}
