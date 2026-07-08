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
import { styles as feedStyles } from "../styles/feedStyles";
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
            <TouchableOpacity onPress={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? (
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
        onEndReached={() => {
          if (commentsQuery.hasNextPage && !commentsQuery.isFetchingNextPage) {
            commentsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          commentsQuery.isFetchingNextPage ? (
            <LoadingView color="#FFA500" style={{ marginVertical: 16 }} />
          ) : null
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
          disabled={addCommentMutation.isPending}
        >
          {addCommentMutation.isPending ? (
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
