import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import residentsStyles from "../styles/residentsStyles";
import ordersStyles from "../styles/ordersStyles";
import { fetchFollowers, fetchFollowing } from "../api/follow";
import type { Resident } from "../api/residents";

const placeholderAvatar = require("../../assets/images/profile-placeholder.jpg");

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
  const [list, setList] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + 56;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data =
        activeTab === "followers"
          ? await fetchFollowers(userId)
          : await fetchFollowing(userId);
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={residentsStyles.container}>
      <View
        style={[
          residentsStyles.header,
          { paddingTop: insets.top, height: headerHeight },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={residentsStyles.backBtn}
        >
          <Ionicons name="arrow-back" size={28} color="#444" />
        </TouchableOpacity>
        <Text style={residentsStyles.headerTitle}>
          {activeTab === "followers" ? "Followers" : "Following"}
        </Text>
      </View>

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
          <ActivityIndicator
            size="large"
            color="#FF8C00"
            style={{ marginTop: 32 }}
          />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: insets.bottom + 32,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  navigation.push("OthersProfile", { id: String(item.id) })
                }
                activeOpacity={0.7}
              >
                <View style={residentsStyles.residentRow}>
                  <Image
                    source={
                      item.profilePic
                        ? { uri: item.profilePic }
                        : placeholderAvatar
                    }
                    style={residentsStyles.avatar}
                  />
                  <View style={residentsStyles.info}>
                    <Text style={residentsStyles.name}>
                      {item.displayName}
                    </Text>
                    <Text style={residentsStyles.username}>
                      @{item.username}
                    </Text>
                    <Text style={residentsStyles.subInfo}>
                      Wing {item.wing} • Door {item.door}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
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
