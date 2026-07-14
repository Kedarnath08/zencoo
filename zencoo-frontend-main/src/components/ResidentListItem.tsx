import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import residentsStyles from "../styles/residentsStyles";
import Avatar from "./Avatar";

interface ResidentListItemProps {
  displayName: string;
  username: string;
  wing: string;
  door: string;
  profilePic: string | null;
  onPress: () => void;
}

/** Avatar + name + username + wing/door row shared by Residents and FollowList. */
const ResidentListItem: React.FC<ResidentListItemProps> = ({
  displayName,
  username,
  wing,
  door,
  profilePic,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View style={residentsStyles.residentRow}>
      <Avatar uri={profilePic} size="md" style={residentsStyles.avatar} />
      <View style={residentsStyles.info}>
        <Text style={residentsStyles.name}>{displayName}</Text>
        <Text style={residentsStyles.username}>@{username}</Text>
        <Text style={residentsStyles.subInfo}>
          Wing {wing} • Door {door}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default ResidentListItem;
