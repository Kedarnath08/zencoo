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

/** Three-level elevation scale (UI_UX_REDESIGN.md Part 2.4). */
export const elevation: Record<"flat" | "raised" | "floating", ViewStyle> = {
  flat: {},
  raised: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 6,
  },
};
