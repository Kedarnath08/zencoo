import api from "./axiosInstance";

export interface Resident {
  id: number;
  displayName: string;
  username: string;
  wing: string;
  door: string;
  profilePic: string | null;
}

export interface PostSummary {
  id: number;
  imageUrl: string;
}

export interface ResidentProfile {
  id: number;
  displayName: string;
  username: string;
  wing: string;
  door: string;
  bio: string | null;
  hometown: string | null;
  profilePic: string | null;
  headerBg: string | null;
  followersCount: number;
  followingCount: number;
  followedByMe: boolean;
  posts: PostSummary[];
}

export async function fetchResidents(
  wing?: string,
  page = 0,
  size = 20
): Promise<Resident[]> {
  const res = await api.get(`/residents`, {
    params: { wing: wing || undefined, page, size },
  });
  return res.data;
}

export async function fetchResident(id: string | number): Promise<ResidentProfile> {
  const res = await api.get(`/residents/${id}`);
  return res.data;
}
