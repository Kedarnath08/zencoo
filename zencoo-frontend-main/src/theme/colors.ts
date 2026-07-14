/**
 * Design-system color tokens (UI_UX_REDESIGN.md Part 2.1). Single source of
 * truth for every color in the app — prefer these over raw hex literals.
 */
export const tokens = {
  // Brand
  primary: "#FF8C00",
  primaryDark: "#E67A00",
  primaryTint: "#FFF3E0",

  // Neutrals
  ink900: "#1A1A1A",
  ink600: "#6B7280",
  ink400: "#9CA3AF",
  line: "#E8E8EC",
  surface: "#FFFFFF",
  canvas: "#FAFAFA",

  // Status
  success: "#2E9E5B",
  danger: "#E5484D",
  warning: "#F5A524",
} as const;

export type ColorToken = keyof typeof tokens;
