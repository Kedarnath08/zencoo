import api from "./axiosInstance";

export interface GoogleLoginResult {
  isNewUser: boolean;
  token?: string;
  email?: string;
  fullName?: string;
  suggestedUsername?: string;
}

/** Sends the verified Google ID token; logs in (existing/linked account) or reports a new identity to onboard. */
export async function loginWithGoogle(idToken: string): Promise<GoogleLoginResult> {
  const res = await api.post(`/auth/google`, { idToken });
  return res.data;
}

/** Finishes registering a brand-new Google identity once door number/community are collected. */
export async function completeGoogleSignup(
  idToken: string,
  username: string,
  doorNumber: string,
  community: string
): Promise<{ token: string }> {
  const res = await api.post(`/auth/google/complete`, {
    idToken,
    username,
    doorNumber,
    community,
  });
  return res.data;
}
