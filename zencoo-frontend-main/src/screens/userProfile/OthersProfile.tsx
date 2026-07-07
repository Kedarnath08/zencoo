import React, { useEffect, useState } from "react";
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
import { styles } from "../../styles/othersProfileStyles";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { ResidentsStackParamList } from "../../navigation/ResidentsStack";
import { fetchResident, type ResidentProfile } from "../../api/residents";
import { followUser, unfollowUser } from "../../api/follow";
import { Alert } from "react-native";
import Avatar from "../../components/Avatar";
import ProfileStatsRow from "../../components/ProfileStatsRow";
import PostsGrid from "../../components/PostsGrid";
import LoadingView from "../../components/LoadingView";
const HEADER_HEIGHT = 200;
Dimensions.get("window");

const OthersProfileScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<ResidentsStackParamList>>();
  const insets = useSafeAreaInsets();
  const route = useRoute();

  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  const toggleFollow = async () => {
    if (!profile || followBusy) return;
    setFollowBusy(true);
    try {
      const state = profile.followedByMe
        ? await unfollowUser(profile.id)
        : await followUser(profile.id);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followedByMe: state.followedByMe,
              followersCount: state.followersCount,
              followingCount: state.followingCount,
            }
          : prev
      );
    } catch {
      Alert.alert("Couldn't update follow. Please try again.");
    } finally {
      setFollowBusy(false);
    }
  };

  useEffect(() => {
    const { id } = route.params as { id: string };
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchResident(id);
        if (active) setProfile(data);
      } catch (err) {
        if (active) setProfile(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [route.params]);

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
        <Text style={{ color: "#888" }}>Profile not found.</Text>
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
          <Ionicons name="arrow-back" size={28} color="#444" />
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
                <Ionicons name="business" size={14} color="#888" /> Wing{" "}
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
                { color: profile.followedByMe ? "#000" : "#fff" },
              ]}
            >
              {profile.followedByMe ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.messageBtn]}>
            <Text style={[styles.actionBtnText, { color: "#000" }]}>
              Message
            </Text>
          </TouchableOpacity>
        </View>
        {/* Location */}
        <View style={styles.hometownRow}>
          <Ionicons name="location-outline" size={18} color="#888" />
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
          emptyTextStyle={{ color: "#888", padding: 16 }}
          contentContainerStyle={styles.postsGrid}
          styles={{ postImage: styles.postImage }}
        />
      </View>
    </ScrollView>
  );
};

export default OthersProfileScreen;
