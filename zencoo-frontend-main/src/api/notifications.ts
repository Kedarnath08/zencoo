import axiosInstance from './axiosInstance';

export interface Notification {
  id: number;
  type: 'LIKE' | 'COMMENT' | 'ORDER_STATUS' | 'FOLLOW';
  relatedId: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function fetchNotifications(page = 0, size = 20): Promise<Notification[]> {
  const response = await axiosInstance.get('/api/notifications', {
    params: { page, size },
  });
  return response.data;
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await axiosInstance.get('/api/notifications/unread-count');
  return response.data.unreadCount;
}

export async function markAsRead(notificationId: number): Promise<void> {
  await axiosInstance.put(`/api/notifications/${notificationId}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await axiosInstance.put('/api/notifications/mark-all-read');
}
