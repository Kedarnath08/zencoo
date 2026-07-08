import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import residentsStyles from "../styles/residentsStyles";
import ordersStyles from "../styles/ordersStyles";
import { fetchFollowers, fetchFollowing } from "../api/follow";
import { queryKeys } from "../api/queryKeys";
import ScreenHeader from "../components/ScreenHeader";
import ResidentListItem from "../components/ResidentListItem";
import LoadingView from "../components/LoadingView";

type FollowListParams = {
  userId: number;
  initialTab?: "followers" | "following";
};

const FollowList: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { userId, initialTab } = route.params as FollowListParams;

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    initialTab ?? "followers"
  );
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 56;

  const listQuery = useQuery({
    queryKey:
      activeTab === "followers"
        ? queryKeys.followers(userId)
        : queryKeys.following(userId),
    queryFn: () =>
      activeTab === "followers" ? fetchFollowers(userId) : fetchFollowing(userId),
  });
  const list = listQuery.data ?? [];
  const loading = listQuery.isPending;

  return (
    <View style={residentsStyles.container}>
      <ScreenHeader
        title={activeTab === "followers" ? "Followers" : "Following"}
        onBack={() => navigation.goBack()}
        style={[residentsStyles.header, { paddingTop: insets.top, height: headerHeight }]}
        titleStyle={residentsStyles.headerTitle}
        backButtonStyle={residentsStyles.backBtn}
        right={null}
      />

      <View style={{ paddingTop: headerHeight, flex: 1 }}>
        <View style={ordersStyles.tabContainer}>
          <TouchableOpacity
            style={[
              ordersStyles.tab,
              activeTab === "followers" && ordersStyles.activeTab,
            ]}
            onPress={() => setActiveTab("followers")}
          >
            <Text
              style={[
                ordersStyles.tabText,
                activeTab === "followers" && ordersStyles.activeTabText,
              ]}
            >
              Followers
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              ordersStyles.tab,
              activeTab === "following" && ordersStyles.activeTab,
            ]}
            onPress={() => setActiveTab("following")}
          >
            <Text
              style={[
                ordersStyles.tabText,
                activeTab === "following" && ordersStyles.activeTabText,
              ]}
            >
              Following
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <LoadingView style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + 32,
            }}
            renderItem={({ item }) => (
              <ResidentListItem
                displayName={item.displayName}
                username={item.username}
                wing={item.wing}
                door={item.door}
                profilePic={item.profilePic}
                onPress={() =>
                  navigation.push("OthersProfile", { id: String(item.id) })
                }
              />
            )}
            ListEmptyComponent={
              <Text style={residentsStyles.noResults}>
                {activeTab === "followers"
                  ? "No followers yet."
                  : "Not following anyone yet."}
              </Text>
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default FollowList;
