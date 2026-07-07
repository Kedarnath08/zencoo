import React from "react";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface BackArrowButtonProps {
  onPress: () => void;
}

/** Absolute-positioned back arrow used on the sign-up step screens. */
const BackArrowButton: React.FC<BackArrowButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    style={{ position: "absolute", top: 48, left: 16, zIndex: 10 }}
    onPress={onPress}
  >
    <Ionicons name="arrow-back" size={28} color="#222" />
  </TouchableOpacity>
);

export default BackArrowButton;
