package com.zencoo.model;

/**
 * Lifecycle of a resident-to-resident order.
 *
 * Transitions:
 *   PENDING  --(seller accepts)-->  ACCEPTED
 *   PENDING  --(seller rejects)-->  REJECTED   (terminal)
 *   PENDING  --(buyer cancels)-->   CANCELLED  (terminal)
 *   ACCEPTED --(seller completes)-> COMPLETED  (terminal)
 *   ACCEPTED --(seller cancels)-->  CANCELLED  (terminal)
 */
public enum OrderStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    COMPLETED,
    CANCELLED
}
