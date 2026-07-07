import api from "./axiosInstance";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface Order {
  id: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note: string | null;
  status: OrderStatus;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  sellerId: number;
  productName: string;
  productImage?: string | null;
  quantity?: number;
  price?: number | null;
  note?: string;
}

export async function fetchPlacedOrders(): Promise<Order[]> {
  const res = await api.get(`/orders/placed`);
  return res.data;
}

export async function fetchReceivedOrders(): Promise<Order[]> {
  const res = await api.get(`/orders/received`);
  return res.data;
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await api.post(`/orders`, input);
  return res.data;
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<Order> {
  const res = await api.patch(`/orders/${orderId}/status`, { status });
  return res.data;
}
