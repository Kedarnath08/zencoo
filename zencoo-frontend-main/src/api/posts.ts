import api from "./axiosInstance";

export interface FeedPost {
  id: number;
  authorId: number;
  username: string;
  fullName: string;
  profilePic: string | null;
  imageUrl: string;
  caption: string;
  price: number | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
}

export interface PostComment {
  id: number;
  authorId: number;
  username: string;
  fullName: string;
  profilePic: string | null;
  text: string;
  createdAt: string;
}

export async function fetchFeed(): Promise<FeedPost[]> {
  const res = await api.get(`/posts`);
  return res.data;
}

export async function fetchPost(postId: number | string): Promise<FeedPost> {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
}

export async function fetchUserPosts(authorId: number): Promise<FeedPost[]> {
  const res = await api.get(`/posts/user/${authorId}`);
  return res.data;
}

export async function createPost(
  imageUrl: string,
  caption: string,
  price?: number | null
): Promise<FeedPost> {
  const res = await api.post(`/posts`, { imageUrl, caption, price });
  return res.data;
}

export async function deletePost(postId: number): Promise<void> {
  await api.delete(`/posts/${postId}`);
}

export async function toggleLike(postId: number): Promise<FeedPost> {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
}

export async function fetchComments(postId: number): Promise<PostComment[]> {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
}

export async function addComment(
  postId: number,
  text: string
): Promise<PostComment> {
  const res = await api.post(`/posts/${postId}/comments`, { text });
  return res.data;
}
