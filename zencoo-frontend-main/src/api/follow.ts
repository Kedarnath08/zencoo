import api from "./axiosInstance";
import type { Resident } from "./residents";

export interface FollowState {
  followedByMe: boolean;
  followersCount: number;
  followingCount: number;
}

export async function followUser(userId: number | string): Promise<FollowState> {
  const res = await api.post(`/users/${userId}/follow`);
  return res.data;
}

export async function unfollowUser(
  userId: number | string
): Promise<FollowState> {
  const res = await api.delete(`/users/${userId}/follow`);
  return res.data;
}

export async function fetchFollowers(
  userId: number | string
): Promise<Resident[]> {
  const res = await api.get(`/users/${userId}/followers`);
  return res.data;
}

export async function fetchFollowing(
  userId: number | string
): Promise<Resident[]> {
  const res = await api.get(`/users/${userId}/following`);
  return res.data;
}
