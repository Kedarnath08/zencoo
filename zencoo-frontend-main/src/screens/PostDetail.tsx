import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { styles as feedStyles } from "../styles/feedStyles";
import {
  fetchPost,
  fetchComments,
  addComment,
  toggleLike,
  deletePost,
  type FeedPost,
  type PostComment,
} from "../api/posts";
import { timeAgo } from "../utils/time";
import Avatar from "../components/Avatar";
import ScreenHeader from "../components/ScreenHeader";
import LoadingView from "../components/LoadingView";
import { usePaginatedList } from "../hooks/usePaginatedList";

type PostDetailParams = {
  postId: number;
  /** Pass true when navigating from the current user's own posts grid. */
  isOwn?: boolean;
};

const PostDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { postId, isOwn } = route.params as PostDetailParams;
  const insets = useSafeAreaInsets();

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Tracks whether the comments fetch failed during the current load(), so the
  // whole screen falls back to "not available" — matching the prior behavior
  // where a single Promise.all covered both the post and its comments.
  const commentsErrorRef = useRef(false);

  const fetchCommentsPage = useCallback(
    async (page: number, size: number) => {
      try {
        return await fetchComments(postId, page, size);
      } catch (err) {
        commentsErrorRef.current = true;
        throw err;
      }
    },
    [postId]
  );

  const {
    items: comments,
    setItems: setComments,
    loadingMore: loadingMoreComments,
    reset: resetComments,
    loadMore: loadMoreComments,
  } = usePaginatedList<PostComment>(fetchCommentsPage, 20);

  const load = useCallback(async () => {
    setLoading(true);
    commentsErrorRef.current = false;
    try {
      const [postData] = await Promise.all([fetchPost(postId), resetComments()]);
      setPost(commentsErrorRef.current ? null : postData);
    } catch {
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId, resetComments]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLike = async () => {
    if (!post) return;
    setPost({
      ...post,
      likedByMe: !post.likedByMe,
      likeCount: post.likeCount + (post.likedByMe ? -1 : 1),
    });
    try {
      const updated = await toggleLike(postId);
      setPost(updated);
    } catch {
      setPost((prev) =>
        prev
          ? {
              ...prev,
              likedByMe: !prev.likedByMe,
              likeCount: prev.likeCount + (prev.likedByMe ? -1 : 1),
            }
          : prev
      );
    }
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    setPosting(true);
    try {
      const created = await addComment(postId, text);
      setComments((prev) => [...prev, created]);
      setCommentText("");
      setPost((prev) =>
        prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev
      );
    } catch {
      Alert.alert("Couldn't post comment. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await deletePost(postId);
            navigation.goBack();
          } catch {
            Alert.alert("Couldn't delete this post. Please try again.");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const headerHeight = insets.top + 56;

  if (loading) {
    return (
      <View style={feedStyles.centered}>
        <LoadingView color="#FFA500" />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          feedStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#888" }}>This post is no longer available.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={feedStyles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScreenHeader
        title="Post"
        onBack={() => navigation.goBack()}
        iconSize={26}
        style={[local.header, { paddingTop: insets.top, height: headerHeight }]}
        titleStyle={local.headerTitle}
        right={
          isOwn ? (
            <TouchableOpacity onPress={handleDelete} disabled={deleting}>
              {deleting ? (
                <ActivityIndicator size="small" color="#F44336" />
              ) : (
                <Ionicons name="trash-outline" size={22} color="#F44336" />
              )}
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )
        }
      />

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        ListHeaderComponent={
          <View>
            <View style={feedStyles.cardHeader}>
              <Avatar uri={post.profilePic} style={feedStyles.avatar} />
              <View style={{ marginLeft: 10 }}>
                <Text style={feedStyles.name}>{post.fullName}</Text>
                <Text style={feedStyles.handle}>@{post.username}</Text>
              </View>
            </View>
            <Image source={{ uri: post.imageUrl }} style={local.image} />
            <View style={local.actionRow}>
              <TouchableOpacity
                onPress={handleLike}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Icon
                  name={post.likedByMe ? "heart" : "heart-outline"}
                  size={26}
                  color={post.likedByMe ? "#E94F37" : "#444"}
                />
                <Text style={local.countText}>{post.likeCount}</Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 20,
                }}
              >
                <Icon name="comment-outline" size={24} color="#444" />
                <Text style={local.countText}>{post.commentCount}</Text>
              </View>
            </View>
            {post.caption ? (
              <Text style={feedStyles.description}>{post.caption}</Text>
            ) : null}
            <Text style={feedStyles.timeText}>
              Posted {timeAgo(post.createdAt)} ago
            </Text>
            <Text style={local.commentsHeading}>
              Comments ({comments.length})
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[feedStyles.commentItem, { paddingHorizontal: 18 }]}>
            <Text style={{ fontWeight: "bold", color: "#222" }}>
              @{item.username}
              <Text style={{ color: "#B0B0B0", fontWeight: "normal" }}>
                {"  "}
                {timeAgo(item.createdAt)}
              </Text>
            </Text>
            <Text style={feedStyles.commentText}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginTop: 8 }}>
            No comments yet. Be the first!
          </Text>
        }
        onEndReached={loadMoreComments}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMoreComments ? <LoadingView color="#FFA500" style={{ marginVertical: 16 }} /> : null
        }
      />

      <View style={feedStyles.commentInput}>
        <TextInput
          style={feedStyles.textInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          onPress={submitComment}
          style={feedStyles.sendButton}
          disabled={posting}
        >
          {posting ? (
            <ActivityIndicator size="small" color="#FFA500" />
          ) : (
            <Icon name="send" size={22} color="#FFA500" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const local = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  image: {
    width: "100%",
    height: 320,
    backgroundColor: "#eee",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  countText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "bold",
    color: "#444",
  },
  commentsHeading: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 4,
  },
});

export default PostDetail;
