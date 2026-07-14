import { TextStyle } from "react-native";

/**
 * Named type scale (UI_UX_REDESIGN.md Part 2.2). Spread one of these into a
 * component's style array instead of picking a raw fontSize/fontWeight per
 * screen, e.g. `style={[typography.heading, { color: tokens.ink900 }]}`.
 */
export const typography: Record<
  "display" | "title" | "heading" | "body" | "label" | "caption",
  TextStyle
> = {
  display: { fontSize: 28, fontWeight: "700" },
  title: { fontSize: 20, fontWeight: "700" },
  heading: { fontSize: 17, fontWeight: "600" },
  body: { fontSize: 15, fontWeight: "400" },
  label: { fontSize: 13, fontWeight: "500" },
  caption: { fontSize: 12, fontWeight: "400" },
};
