import React from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";

interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** Centered icon + message for empty lists. */
const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, style, textStyle }) => (
  <View style={style}>
    {icon}
    <Text style={textStyle}>{message}</Text>
  </View>
);

export default EmptyState;
