import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

const placeholderAvatar = require("../../assets/images/profile-placeholder.jpg");

interface AvatarProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
}

/** Avatar image that falls back to the shared placeholder when no uri is set. */
const Avatar: React.FC<AvatarProps> = ({ uri, style }) => (
  <Image source={uri ? { uri } : placeholderAvatar} style={style} />
);

export default Avatar;
