import { ViewStyle } from "react-native";

/** 8-based spacing scale (UI_UX_REDESIGN.md Part 2.3). */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Radius scale (UI_UX_REDESIGN.md Part 2.3). */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * Three-level elevation scale (UI_UX_REDESIGN.md Part 2.4) — deliberately
 * very soft. Modern flat UI (Instagram, current iOS) barely uses shadow at
 * all; separation comes from whitespace and hairline borders, not drop
 * shadows. `floating` is for content that's genuinely lifted off the page
 * (e.g. a profile card overlapping a header image) — app bars/headers
 * should use a hairline `borderBottomColor: tokens.line` instead, not this.
 */
export const elevation: Record<"flat" | "raised" | "floating", ViewStyle> = {
  flat: {},
  raised: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 3,
  },
};
