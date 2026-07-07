import * as React from "react";
import { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import FeedPostCard from "../components/FeedPostCard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles, getFeedContainerStyle } from "../styles/feedStyles";
import {
  fetchFeed,
  toggleLike,
  fetchComments,
  addComment,
  type FeedPost,
  type PostComment,
} from "../api/posts";
import { createOrder } from "../api/orders";
import { timeAgo } from "../utils/time";
import { fetchUnreadCount } from "../api/notifications";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { FeedStackParamList } from "../navigation/FeedStack";

const FeedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const [commentController, setCommentController] = useState<string>("");
  const [showCommentsModal, setShowCommentsModal] = useState<boolean>(false);
  const [activePostId, setActivePostId] = useState<number | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [postingComment, setPostingComment] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const insets = useSafeAreaInsets();

  // Load unread notification count on focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const count = await fetchUnreadCount();
          if (active) setUnreadCount(count);
        } catch {
          if (active) setUnreadCount(0);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await fetchFeed();
      setPosts(data);
      setError(null);
    } catch (err) {
      setError("Couldn't load the feed. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Refresh whenever the tab regains focus (e.g. after creating a post).
  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed])
  );

  const handleToggleLike = async (postId: number) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
            }
          : p
      )
    );
    try {
      const updated = await toggleLike(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likedByMe: !p.likedByMe,
                likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
              }
            : p
        )
      );
      Alert.alert("Couldn't update like. Please try again.");
    }
  };

  const openComments = async (postId: number) => {
    setActivePostId(postId);
    setShowCommentsModal(true);
    setComments([]);
    setCommentsLoading(true);
    try {
      setComments(await fetchComments(postId));
    } catch {
      Alert.alert("Couldn't load comments.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    const text = commentController.trim();
    if (!text || activePostId == null) return;
    setPostingComment(true);
    try {
      const created = await addComment(activePostId, text);
      setComments((prev) => [...prev, created]);
      setCommentController("");
      // keep the feed's comment count in sync
      setPosts((prev) =>
        prev.map((p) =>
          p.id === activePostId
            ? { ...p, commentCount: p.commentCount + 1 }
            : p
        )
      );
    } catch {
      Alert.alert("Couldn't post comment. Please try again.");
    } finally {
      setPostingComment(false);
    }
  };

  const closeComments = () => {
    setShowCommentsModal(false);
    setActivePostId(null);
    setComments([]);
    setCommentController("");
  };

  const placeOrder = (post: FeedPost) => {
    const productName = post.caption?.trim() || "Item";
    Alert.alert(
      "Place order",
      `Order "${productName}" from ${post.fullName}?`,
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FFA500" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
          <Icon name="bell-outline" size={30} color="#FFA500" />
          {unreadCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                backgroundColor: "#FF6B6B",
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
        refreshing={refreshing}
        onRefresh={() => loadFeed(true)}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: "#888", marginTop: 40 }}>
              {error ?? "No posts yet. Be the first to share!"}
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
          {commentsLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="small" color="#FFA500" />
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Text style={{ fontWeight: "bold", color: "#222" }}>
                    @{item.username}
                    <Text style={{ color: "#B0B0B0", fontWeight: "normal" }}>
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
                <Text style={{ textAlign: "center", color: "#888", marginTop: 24 }}>
                  No comments yet.
                </Text>
              }
            />
          )}
          <View style={styles.commentInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your comment"
              value={commentController}
              onChangeText={setCommentController}
              multiline
            />
            <TouchableOpacity
              onPress={submitComment}
              style={styles.sendButton}
              disabled={postingComment}
            >
              {postingComment ? (
                <ActivityIndicator size="small" color="#FFA500" />
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
