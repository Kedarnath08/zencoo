import React from "react";
import { StyleProp, Text, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

interface ProfileStatsRowStyles {
  statsColumnFixed: StyleProp<ViewStyle>;
  statsRowFixed: StyleProp<ViewStyle>;
  statBoxFixed: StyleProp<ViewStyle>;
  statNumber: StyleProp<TextStyle>;
  statLabel: StyleProp<TextStyle>;
}

interface ProfileStatsRowProps {
  followersCount: number;
  postsCount: number;
  onFollowersPress: () => void;
  styles: ProfileStatsRowStyles;
}

/** Followers / Posts stat row shared by MyProfile and OthersProfile. */
const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({
  followersCount,
  postsCount,
  onFollowersPress,
  styles,
}) => (
  <View style={styles.statsColumnFixed}>
    <View style={styles.statsRowFixed}>
      <TouchableOpacity style={styles.statBoxFixed} onPress={onFollowersPress}>
        <Text style={styles.statNumber}>{followersCount}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>
      <View style={styles.statBoxFixed}>
        <Text style={styles.statNumber}>{postsCount}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
    </View>
  </View>
);

export default ProfileStatsRow;
