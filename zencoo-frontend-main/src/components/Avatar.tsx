import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

const placeholderAvatar = require("../../assets/images/profile-placeholder.jpg");

const SIZES = { sm: 40, md: 56, lg: 88 } as const;

interface AvatarProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  /**
   * Design-system sizing (UI_UX_REDESIGN.md Part 2.5) — pass instead of a
   * one-off `{width, height, borderRadius}` style object. Ignored (falls
   * back to whatever `style` provides) when omitted, so existing callers
   * that pass their own dimensions are unaffected.
   */
  size?: keyof typeof SIZES;
}

/** Avatar image that falls back to the shared placeholder when no uri is set. */
const Avatar: React.FC<AvatarProps> = ({ uri, style, size }) => {
  const sizeStyle = size
    ? { width: SIZES[size], height: SIZES[size], borderRadius: SIZES[size] / 2 }
    : undefined;
  return <Image source={uri ? { uri } : placeholderAvatar} style={[sizeStyle, style]} />;
};

export default Avatar;
