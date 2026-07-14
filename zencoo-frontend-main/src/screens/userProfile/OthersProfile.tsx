import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { styles } from "../../styles/othersProfileStyles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ResidentsStackParamList } from "../../navigation/ResidentsStack";
import { fetchResident } from "../../api/residents";
import { followUser, unfollowUser } from "../../api/follow";
import { queryKeys } from "../../api/queryKeys";
import { Alert } from "react-native";
import Avatar from "../../components/Avatar";
import ProfileStatsRow from "../../components/ProfileStatsRow";
import PostsGrid from "../../components/PostsGrid";
import LoadingView from "../../components/LoadingView";
import { tokens } from "../../theme/colors";
const HEADER_HEIGHT = 200;
Dimensions.get("window");

const OthersProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ResidentsStackParamList>>();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const { id } = route.params as { id: string };
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.resident(id),
    queryFn: () => fetchResident(id),
  });
  const profile = profileQuery.data ?? null;
  const loading = profileQuery.isPending;

  const followMutation = useMutation({
    mutationFn: () =>
      profile!.followedByMe ? unfollowUser(profile!.id) : followUser(profile!.id),
    onSuccess: (state) =>
      qc.setQueryData(queryKeys.resident(id), (old) =>
        old ? { ...old, ...state } : old
      ),
  });
  const followBusy = followMutation.isPending;

  const toggleFollow = () => {
    if (!profile || followBusy) return;
    followMutation.mutate(undefined, {
      onError: () => Alert.alert("Couldn't update follow. Please try again."),
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <LoadingView />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: tokens.ink600 }}>Profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        {profile?.headerBg && (
          <Image
            source={{ uri: profile.headerBg }}
            style={styles.headerBgImage}
          />
        )}
        {/* Back Button OUTSIDE header but visually at top right */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={28} color={tokens.ink600} />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatarColumn}>
            <View style={styles.avatarWrapper}>
              <Avatar uri={profile.profilePic} style={styles.avatar} />
            </View>
            <View style={styles.profileInfoFixed}>
              <Text style={styles.name}>{profile.displayName}</Text>
              <Text style={styles.username}>@{profile.username}</Text>
              <Text style={styles.subInfo}>
                <Ionicons name="business" size={14} color={tokens.ink600} /> Wing{" "}
                {profile.wing} - {profile.door}
              </Text>
            </View>
          </View>
          <ProfileStatsRow
            followersCount={profile.followersCount}
            postsCount={profile.posts.length}
            onFollowersPress={() =>
              navigation.navigate("FollowList", {
                userId: profile.id,
                initialTab: "followers",
              })
            }
            styles={styles}
          />
        </View>
        {/* Bio */}
        <View style={styles.bioContainer}>
          <Text style={styles.bioText} numberOfLines={4} ellipsizeMode="tail">
            {profile.bio}
          </Text>
        </View>
        {/* Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              profile.followedByMe ? styles.messageBtn : styles.followBtn,
              followBusy && { opacity: 0.6 },
            ]}
            onPress={toggleFollow}
            disabled={followBusy}
          >
            <Text
              style={[
                styles.actionBtnText,
                { color: profile.followedByMe ? tokens.ink900 : "#fff" },
              ]}
            >
              {profile.followedByMe ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.messageBtn]}>
            <Text style={[styles.actionBtnText, { color: tokens.ink900 }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>
        {/* Location */}
        <View style={styles.hometownRow}>
          <Ionicons name="location-outline" size={18} color={tokens.ink600} />
          <Text style={styles.hometownText}>{profile.hometown}</Text>
        </View>
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>
        <PostsGrid
          posts={profile?.posts || []}
          onPressPost={(item) =>
            navigation.navigate("PostDetail", { postId: item.id })
          }
          emptyMessage="No posts yet."
          emptyTextStyle={{ color: tokens.ink600, padding: 16 }}
          contentContainerStyle={styles.postsGrid}
          styles={{ postImage: styles.postImage }}
        />
      </View>
    </ScrollView>
  );
};

export default OthersProfileScreen;
