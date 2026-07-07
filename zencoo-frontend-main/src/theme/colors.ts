/**
 * Shared color tokens for values that repeat across many screens/styles.
 * Values are copied as-is from existing usage — this file is a single
 * source of truth, not a redesign. Prefer these over raw hex literals for
 * the brand/status/background colors; one-off decorative colors used in a
 * single place are left inline.
 */
export const colors = {
  primary: "#FF8C00",
  primaryLight: "#FFA500",
  background: "#E5ECF6",
  danger: "#F44336",
  likeRed: "#FF6B6B",
  success: "#43A047",
  textPrimary: "#222",
  textSecondary: "#888",
  textMuted: "#444",
  white: "#fff",
  black: "#000",
} as const;
