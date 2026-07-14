import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { radius, spacing } from "../../theme/spacing";

type BadgeTone = "success" | "danger" | "warning" | "neutral";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const TONE_COLORS: Record<BadgeTone, string> = {
  success: tokens.success,
  danger: tokens.danger,
  warning: tokens.warning,
  neutral: tokens.ink400,
};

/**
 * Generic status pill (UI_UX_REDESIGN.md Part 2.5) — includes a real
 * `warning` tone for in-progress states like a PENDING order, which today
 * (`components/StatusBadge.tsx`) reuses the success/green color and reads
 * as "already accepted" at a glance. `StatusBadge` stays as-is until the
 * screens that use it (Orders, OrderDetail) are migrated.
 */
const Badge: React.FC<BadgeProps> = ({ label, tone = "neutral", icon, style }) => (
  <View style={[styles.base, { backgroundColor: TONE_COLORS[tone] }, style]}>
    {icon}
    <Text style={[styles.text, icon ? { marginLeft: spacing.xs } : null]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.label,
    color: "#fff",
  },
});

export default Badge;
