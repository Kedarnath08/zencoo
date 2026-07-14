import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { tokens } from "../../theme/colors";
import { elevation, radius, spacing } from "../../theme/spacing";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Set false for a card meant to sit flush inside another surface (no shadow). */
  raised?: boolean;
}

/**
 * One shared card surface (radius.lg, elevation.raised, white background)
 * instead of every screen hand-rolling a near-identical StyleSheet block
 * for feed posts / order rows / resident rows / wing tiles.
 * See UI_UX_REDESIGN.md Part 2.5.
 */
const Card: React.FC<CardProps> = ({ children, style, raised = true }) => (
  <View style={[styles.base, raised && elevation.raised, style]}>{children}</View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: tokens.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
});

export default Card;
