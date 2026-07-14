import * as React from "react";
import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import FeedPostCard from "../components/FeedPostCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, getFeedContainerStyle } from "../styles/feedStyles";
import { fetchFeed, type FeedPost } from "../api/posts";
import { createOrder } from "../api/orders";
import { timeAgo } from "../utils/time";
import { formatPrice } from "../utils/currency";
import { fetchUnreadCount } from "../api/notifications";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeedStackParamList } from "../navigation/FeedStack";
import { useRefreshOnFocus } from "../hooks/useRefreshOnFocus";
import { useComments, flattenComments } from "../hooks/useComments";
import { useAddComment } from "../hooks/useAddComment";
import { useLikePost } from "../hooks/useLikePost";
import { queryKeys } from "../api/queryKeys";
import { tokens } from "../theme/colors";
import LoadingView from "../components/LoadingView";

const PAGE_SIZE = 20;

const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const qc = useQueryClient();
  const [commentController, setCommentController] = useState<string>("");
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const insets = useSafeAreaInsets();

  const feedQuery = useInfiniteQuery({
    queryKey: queryKeys.feed(),
    queryFn: ({ pageParam }) => fetchFeed(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });
  useRefreshOnFocus(() => {
    feedQuery.refetch();
  });
  const posts = feedQuery.data?.pages.flat() ?? [];
  const loadingError = feedQuery.isError
    ? "Couldn't load the feed. Pull down to retry."
    : null;

  const unreadQuery = useQuery({
    queryKey: queryKeys.unreadCount(),
    queryFn: fetchUnreadCount,
  });
  useRefreshOnFocus(() => {
    qc.invalidateQueries({ queryKey: queryKeys.unreadCount() });
  });
  const unreadCount = unreadQuery.data ?? 0;

  const likeMutation = useLikePost();
  const commentsQuery = useComments(activePostId ?? -1, showCommentsModal && activePostId != null);
  const addCommentMutation = useAddComment(activePostId ?? -1);
  const comments = flattenComments(commentsQuery.data);

  const handleToggleLike = (postId: number) => {
    likeMutation.mutate(postId, {
      onError: () => Alert.alert("Couldn't update like. Please try again."),
    });
  };

  const openComments = (postId: number) => {
    setActivePostId(postId);
    setShowCommentsModal(true);
  };

  const submitComment = () => {
    const text = commentController.trim();
    if (!text || activePostId == null) return;
    addCommentMutation.mutate(text, {
      onSuccess: () => setCommentController(""),
      onError: () => Alert.alert("Couldn't post comment. Please try again."),
    });
  };

  const closeComments = () => {
    setShowCommentsModal(false);
    setActivePostId(null);
    setCommentController("");
  };

  const placeOrder = (post: FeedPost) => {
    const productName = post.caption?.trim() || "Item";
    const priceLine = post.price != null ? ` for ${formatPrice(post.price)}` : "";
    Alert.alert(
      "Place order",
      `Order "${productName}"${priceLine} from ${post.fullName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Order",
          onPress: async () => {
            try {
              await createOrder({
                sellerId: post.authorId,
                productName,
                productImage: post.imageUrl,
                quantity: 1,
                price: post.price,
              });
              Alert.alert(
                "Order placed",
                "You'll find it under Orders → Placed."
              );
            } catch (err: any) {
              Alert.alert(
                "Couldn't place order",
                err?.response?.data?.message ?? "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderPost = ({ item }: { item: FeedPost }) => (
    <FeedPostCard
      post={item}
      onLike={() => handleToggleLike(item.id)}
      onComment={() => openComments(item.id)}
      onShare={() => Alert.alert("Share functionality")}
      onSave={() => Alert.alert("Save functionality")}
      onOrder={() => placeOrder(item)}
    />
  );

  if (feedQuery.isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <LoadingView color={tokens.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={tokens.surface} />
      {/* App Bar */}
      <View
        style={[
          styles.appBar,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <Image
          source={require("../../assets/images/zencoo.png")}
          style={[
            styles.logo,
            { position: "absolute", left: 0, top: insets.top, marginLeft: 0 },
          ]}
        />
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate("Notifications")}
        >
          <Icon name="bell-outline" size={28} color={tokens.ink900} />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: tokens.danger,
                borderRadius: 10,
                width: 20,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={getFeedContainerStyle(insets.bottom)}
        showsVerticalScrollIndicator={false}
        refreshing={feedQuery.isRefetching && !feedQuery.isFetchingNextPage}
        onRefresh={() => feedQuery.refetch()}
        onEndReached={() => {
          if (feedQuery.hasNextPage && !feedQuery.isFetchingNextPage) {
            feedQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          feedQuery.isFetchingNextPage ? (
            <LoadingView color={tokens.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: tokens.ink600, marginTop: 40 }}>
              {loadingError ?? "No posts yet. Be the first to share!"}
            </Text>
          </View>
        }
      />

      {/* Comments Modal */}
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        onRequestClose={closeComments}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={closeComments}>
              <Icon name="close" size={24} style={styles.closeButton} />
            </TouchableOpacity>
          </View>
          {commentsQuery.isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color={tokens.primary} />
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={{ fontWeight: "bold", color: tokens.ink900 }}>
                    @{item.username}
                    <Text style={{ color: tokens.ink400, fontWeight: "normal" }}>
                      {"  "}
                      {timeAgo(item.createdAt)}
                    </Text>
                  </Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              style={styles.commentsList}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: tokens.ink600, marginTop: 24 }}>
                  No comments yet.
                </Text>
              }
            />
          )}
          <View style={styles.commentInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your comment"
              placeholderTextColor={tokens.ink400}
              value={commentController}
              onChangeText={setCommentController}
              multiline
            />
            <TouchableOpacity
              onPress={submitComment}
              style={styles.sendButton}
              disabled={addCommentMutation.isPending}
            >
              {addCommentMutation.isPending ? (
                <ActivityIndicator size="small" color={tokens.primary} />
              ) : (
                <Icon name="send" size={22} style={styles.sendIcon} />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default FeedScreen;
