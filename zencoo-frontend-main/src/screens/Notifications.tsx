import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchNotifications, markAsRead, Notification } from "../api/notifications";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeedStackParamList } from "../navigation/FeedStack";
import ScreenHeader from "../components/ScreenHeader";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";

type NavigationProp = NativeStackNavigationProp<FeedStackParamList>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        try {
          const data = await fetchNotifications();
          if (active) setNotifications(data);
        } catch (err) {
          if (active) setNotifications([]);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const handleNotificationPress = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
    }

    // Navigate based on notification type
    switch (notif.type) {
      case "LIKE":
      case "COMMENT":
        navigation.navigate("PostDetail", { postId: notif.relatedId });
        break;
      case "FOLLOW":
        navigation.navigate("OthersProfile", { id: notif.relatedId.toString() });
        break;
      case "ORDER_STATUS":
        navigation.navigate("Orders", {});
        break;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <LoadingView />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        style={styles.header}
        titleStyle={styles.title}
      />

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.isRead && styles.unreadItem,
            ]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name={
                  item.type === "LIKE"
                    ? "heart"
                    : item.type === "COMMENT"
                    ? "chatbubble"
                    : item.type === "FOLLOW"
                    ? "person-add"
                    : "cart"
                }
                size={20}
                color={item.type === "LIKE" ? "#FF6B6B" : "#FF8C00"}
              />
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {!item.isRead && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={<Ionicons name="notifications-off" size={48} color="#CCC" />}
            message="No notifications yet"
            style={styles.emptyContainer}
            textStyle={styles.emptyText}
          />
        }
        contentContainerStyle={styles.listContent}
        scrollEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5ECF6",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  unreadItem: {
    backgroundColor: "#F9F9F9",
    borderLeftColor: "#FF8C00",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF8C00",
    marginLeft: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
});

export default NotificationsScreen;
