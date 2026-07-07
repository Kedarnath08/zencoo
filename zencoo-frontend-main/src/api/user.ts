import api from "./axiosInstance";

export async function checkEmailRegistered(email: string): Promise<boolean> {
  const res = await api.get(`/auth/check-email`, { params: { email } });
  return res.data.exists;
}

export async function checkUsernameUnique(username: string): Promise<boolean> {
  const res = await api.get(`/auth/check-username`, {
    params: { username },
  });
  return res.data.unique;
}

export async function registerUser(user: {
  email: string;
  username: string;
  password: string;
  fullName: string;
  doorNumber: string;
  community: string;
}): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    const res = await api.post(`/auth/register`, user);
    return { success: true, message: res.data.message, token: res.data.token };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || "Registration failed",
    };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await api.post(`/auth/login`, { email, password });
    return { success: true, token: res.data.token };
  } catch (err: any) {
    if (err.response?.status === 401) {
      return { success: false, error: "Invalid email or password" };
    }
    return {
      success: false,
      error: err.response?.data?.message || "Network error. Please try again.",
    };
  }
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  doorNumber: string;
  bio: string | null;
  hometown: string | null;
  profilePic: string | null;
  followersCount: number;
  followingCount: number;
}

export async function fetchMyProfile(): Promise<UserProfile> {
  const res = await api.get(`/profile`);
  return res.data;
}

export async function updateBio(bio: string): Promise<UserProfile> {
  const res = await api.patch(`/profile/bio`, { bio });
  return res.data;
}

export async function updateHometown(hometown: string): Promise<UserProfile> {
  const res = await api.patch(`/profile/hometown`, { hometown });
  return res.data;
}

export async function updateProfilePic(profilePic: string): Promise<UserProfile> {
  const res = await api.patch(`/profile/profile-pic`, { profilePic });
  return res.data;
}
