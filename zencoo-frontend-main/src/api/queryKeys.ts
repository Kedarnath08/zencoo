export const queryKeys = {
  feed: () => ["feed"] as const,
  post: (postId: number) => ["post", postId] as const,
  comments: (postId: number) => ["comments", postId] as const,
  myPosts: (userId: number) => ["myPosts", userId] as const,

  residents: (wing?: string) => ["residents", wing ?? "all"] as const,
  resident: (id: number | string) => ["resident", id] as const,

  ordersPlaced: () => ["orders", "placed"] as const,
  ordersReceived: () => ["orders", "received"] as const,
  order: (orderId: number) => ["order", orderId] as const,

  followers: (userId: number | string) => ["followers", userId] as const,
  following: (userId: number | string) => ["following", userId] as const,

  notifications: () => ["notifications"] as const,
  unreadCount: () => ["unreadCount"] as const,

  myProfile: () => ["myProfile"] as const,
};
