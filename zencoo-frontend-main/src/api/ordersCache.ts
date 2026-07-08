import { InfiniteData, QueryClient } from "@tanstack/react-query";
import type { Order } from "./orders";
import { queryKeys } from "./queryKeys";

export function patchOrderInCache(
  qc: QueryClient,
  orderId: number,
  updater: (order: Order) => Order
) {
  qc.setQueryData<Order>(queryKeys.order(orderId), (old) => old && updater(old));

  for (const key of [queryKeys.ordersPlaced(), queryKeys.ordersReceived()]) {
    qc.setQueriesData<InfiniteData<Order[]>>({ queryKey: key }, (old) =>
      old && {
        ...old,
        pages: old.pages.map((page) => page.map((o) => (o.id === orderId ? updater(o) : o))),
      }
    );
  }
}
