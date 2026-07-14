import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchNotifications, markAsRead, Notification } from "../api/notifications";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeedStackParamList } from "../navigation/FeedStack";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { queryKeys } from "../api/queryKeys";
import ScreenHeader from "../components/ScreenHeader";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing } from "../theme/spacing";

type NavigationProp = NativeStackNavigationProp<FeedStackParamList>;

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: () => fetchNotifications(0, 20),
  });
  useRefreshOnFocus(() => {
    qc.invalidateQueries({ queryKey: queryKeys.notifications() });
  });
  const notifications = notificationsQuery.data ?? [];
  const loading = notificationsQuery.isPending;

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markAsRead(id),
    onSuccess: (_data, id) => {
      qc.setQueryData<Notification[]>(queryKeys.notifications(), (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      qc.setQueryData<number>(queryKeys.unreadCount(), (old) =>
        typeof old === "number" ? Math.max(0, old - 1) : old
      );
    },
  });

  const handleNotificationPress = (notif: Notification) => {
    if (!notif.isRead) {
      markReadMutation.mutate(notif.id);
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
                color={item.type === "LIKE" ? tokens.danger : tokens.primary}
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
            icon={<Ionicons name="notifications-off" size={48} color={tokens.line} />}
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
    backgroundColor: tokens.canvas,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: tokens.surface,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
  },
  title: {
    ...typography.heading,
    color: tokens.ink900,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    backgroundColor: tokens.surface,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
  },
  unreadItem: {
    backgroundColor: tokens.canvas,
    borderLeftColor: tokens.primary,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: tokens.primaryTint,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  message: {
    ...typography.body,
    color: tokens.ink600,
    marginTop: 2,
  },
  time: {
    ...typography.caption,
    color: tokens.ink400,
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: tokens.primary,
    marginLeft: spacing.sm,
  },
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    ...typography.body,
    color: tokens.ink400,
    marginTop: spacing.md,
  },
});

export default NotificationsScreen;
