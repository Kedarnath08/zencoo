import React from "react";
import { StyleProp, Text, TextInput, TextInputProps, TextStyle } from "react-native";

interface FormFieldProps extends TextInputProps {
  focused: boolean;
  error?: string;
  /** Whether to render the error text below the input (matches each screen's own touched/errors check). */
  showError?: boolean;
  styles: {
    input: StyleProp<TextStyle>;
    inputFocused: StyleProp<TextStyle>;
    errorText: StyleProp<TextStyle>;
  };
}

/**
 * Formik-driven text input with focus-tracked border + error text — the
 * pattern repeated across Login/SignUp screens. All TextInput props pass
 * through unchanged; this only consolidates the repeated style/error JSX.
 */
const FormField: React.FC<FormFieldProps> = ({
  focused,
  error,
  showError = true,
  styles,
  style,
  ...textInputProps
}) => (
  <>
    <TextInput
      style={[styles.input, focused && styles.inputFocused, style]}
      placeholderTextColor="#888"
      {...textInputProps}
    />
    {showError && error ? <Text style={styles.errorText}>{error}</Text> : null}
  </>
);

export default FormField;
