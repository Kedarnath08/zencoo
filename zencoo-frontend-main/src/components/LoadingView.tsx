import React from "react";
import { ActivityIndicator, StyleProp, ViewStyle } from "react-native";
import { tokens } from "../theme/colors";

interface LoadingViewProps {
  size?: "small" | "large";
  color?: string;
  style?: StyleProp<ViewStyle>;
}

/** Shared loading spinner — same default size/color used across screens. */
const LoadingView: React.FC<LoadingViewProps> = ({
  size = "large",
  color = tokens.primary,
  style,
}) => <ActivityIndicator size={size} color={color} style={style} />;

export default LoadingView;
