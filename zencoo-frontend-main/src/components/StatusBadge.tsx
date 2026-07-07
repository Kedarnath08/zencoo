import React from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";

/** Shared status → color mapping used by order status badges. */
export const STATUS_COLORS: Record<string, string> = {
  PENDING: colors.success,
  ACCEPTED: colors.success,
  COMPLETED: colors.success,
  REJECTED: colors.danger,
  CANCELLED: colors.danger,
};

interface StatusBadgeProps {
  status: string;
  /** Text shown in the badge; defaults to the raw status. */
  label?: string;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/** Colored status pill; background color always comes from STATUS_COLORS. */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, icon, style, textStyle }) => (
  <View style={[style, { backgroundColor: STATUS_COLORS[status] ?? "#ccc" }]}>
    {icon}
    <Text style={textStyle}>{label ?? status}</Text>
  </View>
);

export default StatusBadge;
