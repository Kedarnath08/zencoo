import axios from "axios";
import { API_URL } from "../config/env";
import { getJWT } from "../utils/secureStore";

/**
 * Shared axios instance for all backend calls.
 * - Attaches the stored JWT as a Bearer token on every request.
 * - On a 401 response, notifies a registered handler so the app can log the
 *   user out (token expired / revoked).
 */
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await getJWT();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Lets the auth layer react to expired/invalid tokens without importing React here.
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export default api;
