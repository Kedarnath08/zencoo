import type { OrderStatus } from "../api/orders";

/**
 * Badge tone per order status — PENDING gets its own `warning` amber instead
 * of reusing the same green as ACCEPTED/COMPLETED (UI_UX_REDESIGN.md Part 1.6:
 * a PENDING order looked "already accepted" at a glance before this).
 */
export const ORDER_STATUS_TONE: Record<OrderStatus, "success" | "danger" | "warning"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  CANCELLED: "danger",
};
