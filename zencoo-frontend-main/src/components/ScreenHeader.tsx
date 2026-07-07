import React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "../theme/colors";

interface ScreenHeaderProps {
  title: string;
  onBack: () => void;
  iconSize?: number;
  iconColor?: string;
  /** Custom right-side element. Pass `null` for no right slot; omit for a spacer matching iconSize. */
  right?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  backButtonStyle?: StyleProp<ViewStyle>;
}

/** Back button + title bar shared by several detail/list screens. */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  iconSize = 28,
  iconColor = colors.textMuted,
  right,
  style,
  titleStyle,
  backButtonStyle,
}) => (
  <View style={style}>
    <TouchableOpacity onPress={onBack} style={backButtonStyle}>
      <Ionicons name="arrow-back" size={iconSize} color={iconColor} />
    </TouchableOpacity>
    <Text style={titleStyle}>{title}</Text>
    {right !== undefined ? right : <View style={{ width: iconSize }} />}
  </View>
);

export default ScreenHeader;
