import { Platform } from "react-native";

/**
 * Base URL for the Zencoo backend API.
 *
 * Resolution order:
 *  1. `EXPO_PUBLIC_API_URL` env var (set this in production / staging builds,
 *     e.g. in eas.json or a .env file — Expo inlines EXPO_PUBLIC_* at build time).
 *  2. A platform-aware localhost default for development:
 *       - Android emulator reaches the host machine via 10.0.2.2
 *       - iOS simulator / web reach it via localhost
 *
 * If you run a real device, set EXPO_PUBLIC_API_URL to your machine's LAN IP,
 * e.g. EXPO_PUBLIC_API_URL=http://192.168.1.10:8080
 */
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, "");

  const host = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${host}:8080`;
}

export const API_BASE_URL = resolveApiUrl();
export const API_URL = `${API_BASE_URL}/api`;

/**
 * Cloudinary (unsigned) upload config. Override in production via
 * EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME / EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.
 */
export const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "djnc2yevw";
export const CLOUDINARY_UPLOAD_PRESET =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unsigned_uploads";
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
