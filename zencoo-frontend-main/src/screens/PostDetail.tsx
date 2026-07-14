import React, { useState } from "react";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPost, deletePost } from "../api/posts";
import { timeAgo } from "../utils/time";
import Avatar from "../components/Avatar";
import ScreenHeader from "../components/ScreenHeader";
import LoadingView from "../components/LoadingView";
import { useComments, flattenComments } from "../hooks/useComments";
import { useAddComment } from "../hooks/useAddComment";
import { useLikePost } from "../hooks/useLikePost";
import { removePostFromCache } from "../api/postsCache";
import { queryKeys } from "../api/queryKeys";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing } from "../theme/spacing";

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
  const qc = useQueryClient();

  const [commentText, setCommentText] = useState("");

  const postQuery = useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => fetchPost(postId),
  });
  const commentsQuery = useComments(postId);
  const comments = flattenComments(commentsQuery.data);

  const loading = postQuery.isPending || commentsQuery.isPending;
  // Matches the prior coupled-failure behavior: if either the post or its
  // comments fail to load, the whole screen falls back to "not available".
  const post = postQuery.isError || commentsQuery.isError ? null : postQuery.data ?? null;

  const likeMutation = useLikePost();
  const addCommentMutation = useAddComment(postId);
  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      removePostFromCache(qc, postId);
      navigation.goBack();
    },
    onError: () => Alert.alert("Couldn't delete this post. Please try again."),
  });

  const handleLike = () => {
    likeMutation.mutate(postId);
  };

  const submitComment = () => {
    const text = commentText.trim();
    if (!text) return;
    addCommentMutation.mutate(text, {
      onSuccess: () => setCommentText(""),
      onError: () => Alert.alert("Couldn't post comment. Please try again."),
    });
  };

  const handleDelete = () => {
    Alert.alert("Delete post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const headerHeight = insets.top + 56;

  if (loading) {
    return (
      <View style={styles.centered}>
        <LoadingView color={tokens.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: tokens.ink600 }}>This post is no longer available.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScreenHeader
        title="Post"
        onBack={() => navigation.goBack()}
        iconSize={26}
        style={[styles.header, { paddingTop: insets.top, height: headerHeight }]}
        titleStyle={styles.headerTitle}
        right={
          isOwn ? (
            <TouchableOpacity onPress={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
                <ActivityIndicator size="small" color={tokens.danger} />
              ) : (
                <Ionicons name="trash-outline" size={22} color={tokens.danger} />
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
            <View style={styles.cardHeader}>
              <Avatar uri={post.profilePic} size="sm" />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={styles.name}>{post.fullName}</Text>
                <Text style={styles.handle}>@{post.username}</Text>
              </View>
            </View>
            <Image source={{ uri: post.imageUrl }} style={styles.image} />
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={handleLike}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Icon
                  name={post.likedByMe ? "heart" : "heart-outline"}
                  size={26}
                  color={post.likedByMe ? tokens.danger : tokens.ink600}
                />
                <Text style={styles.countText}>{post.likeCount}</Text>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: spacing.lg,
                }}
              >
                <Icon name="comment-outline" size={24} color={tokens.ink600} />
                <Text style={styles.countText}>{post.commentCount}</Text>
              </View>
            </View>
            {post.caption ? <Text style={styles.description}>{post.caption}</Text> : null}
            <Text style={styles.timeText}>Posted {timeAgo(post.createdAt)} ago</Text>
            <Text style={styles.commentsHeading}>Comments ({comments.length})</Text>
          </View>
        }
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
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: tokens.ink600, marginTop: 8 }}>
            No comments yet. Be the first!
          </Text>
        }
        onEndReached={() => {
          if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
            commentsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          commentsQuery.isFetchingNextPage ? (
            <LoadingView color={tokens.primary} style={{ marginVertical: 16 }} />
          ) : null
        }
      />

      <View style={styles.commentInput}>
        <TextInput
          style={styles.textInput}
          placeholder="Add a comment..."
          placeholderTextColor={tokens.ink400}
          value={commentText}
          onChangeText={setCommentText}
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
            <Icon name="send" size={22} color={tokens.primary} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
  },
  headerTitle: {
    ...typography.heading,
    color: tokens.ink900,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  name: {
    ...typography.heading,
    color: tokens.ink900,
  },
  handle: {
    ...typography.caption,
    color: tokens.ink600,
    marginTop: 1,
  },
  image: {
    width: "100%",
    height: 320,
    backgroundColor: tokens.canvas,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  countText: {
    marginLeft: spacing.xs,
    ...typography.label,
    color: tokens.ink600,
  },
  description: {
    ...typography.body,
    color: tokens.ink900,
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  timeText: {
    ...typography.caption,
    color: tokens.ink400,
    backgroundColor: tokens.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  commentsHeading: {
    ...typography.heading,
    color: tokens.ink900,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  commentItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  commentText: {
    ...typography.body,
    color: tokens.ink900,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: tokens.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.line,
  },
  textInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: tokens.line,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    maxHeight: 100,
    ...typography.body,
    color: tokens.ink900,
  },
  sendButton: {
    padding: spacing.sm,
  },
});

export default PostDetail;
