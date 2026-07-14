import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { tokens } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { radius, spacing } from "../../theme/spacing";

interface TextFieldProps extends TextInputProps {
  label: string;
  /** Shown below the field in red when set. */
  error?: string;
  /** Shown below the field in green when set and `error` isn't. */
  success?: string;
  /** Locked/read-only visual (gray fill, no border, lock icon) instead of `editable={false}`'s default look. */
  locked?: boolean;
  /** Right-aligned slot inside the field box — e.g. a password show/hide toggle. */
  rightAccessory?: React.ReactNode;
}

/**
 * Design-system text input — persistent label above the field (not
 * placeholder-as-label), a focus ring, and inline error/success states.
 * See UI_UX_REDESIGN.md Part 2.5. New auth/form screens should use this
 * instead of `components/auth/FormField.tsx`.
 */
const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  success,
  locked = false,
  rightAccessory,
  onFocus,
  onBlur,
  style,
  ...inputProps
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.fieldWrapper,
          focused && styles.fieldWrapperFocused,
          !!error && styles.fieldWrapperError,
          locked && styles.fieldWrapperLocked,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={tokens.ink400}
          editable={!locked && inputProps.editable !== false}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {locked && (
          <Ionicons name="lock-closed" size={16} color={tokens.ink400} style={styles.lockIcon} />
        )}
        {rightAccessory}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : success ? (
        <Text style={styles.successText}>{success}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: tokens.ink600,
    marginBottom: spacing.xs,
  },
  fieldWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: tokens.line,
    borderRadius: radius.md,
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.md,
  },
  fieldWrapperFocused: {
    borderColor: tokens.primary,
  },
  fieldWrapperError: {
    borderColor: tokens.danger,
  },
  fieldWrapperLocked: {
    borderColor: "transparent",
    backgroundColor: tokens.canvas,
  },
  input: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: tokens.ink900,
  },
  lockIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    ...typography.caption,
    color: tokens.danger,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  successText: {
    ...typography.caption,
    color: tokens.success,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default TextField;
