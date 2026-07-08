import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateOrderStatus, type OrderStatus } from "../api/orders";
import { patchOrderInCache } from "../api/ordersCache";

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (updated) => patchOrderInCache(qc, updated.id, () => updated),
  });
}
