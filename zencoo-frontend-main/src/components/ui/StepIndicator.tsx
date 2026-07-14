import React from "react";
import { StyleSheet, View } from "react-native";
import { tokens } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface StepIndicatorProps {
  /** 1-based current step. */
  step: number;
  total: number;
}

/** Dots showing progress through a multi-step flow (e.g. the 3-step signup). */
const StepIndicator: React.FC<StepIndicatorProps> = ({ step, total }) => (
  <View style={styles.row}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[styles.dot, i < step ? styles.dotActive : styles.dotInactive]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: tokens.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: tokens.line,
  },
});

export default StepIndicator;
