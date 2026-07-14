import React from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { radius, spacing } from "../../theme/spacing";

type ButtonVariant = "primary" | "secondary" | "destructive";

interface ButtonProps {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Design-system button — primary (solid orange), secondary (outlined),
 * destructive (solid danger), all sharing one shape/press/loading behavior
 * instead of each screen hand-rolling its own TouchableOpacity+ActivityIndicator.
 * See UI_UX_REDESIGN.md Part 2.5.
 */
const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "destructive" && styles.destructive,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? tokens.primary : "#fff"} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              variant === "secondary" && styles.textSecondary,
              icon ? { marginLeft: spacing.sm } : null,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    height: 50,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: tokens.primary,
  },
  secondary: {
    backgroundColor: tokens.surface,
    borderWidth: 1.5,
    borderColor: tokens.primary,
  },
  destructive: {
    backgroundColor: tokens.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.heading,
    color: "#fff",
  },
  textSecondary: {
    color: tokens.primary,
  },
});

export default Button;
