import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import type { FeedPost } from "../api/posts";
import { timeAgo } from "../utils/time";
import { formatPrice } from "../utils/currency";
import Avatar from "./Avatar";
import { tokens } from "../theme/colors";
import { typography } from "../theme/typography";
import { radius, spacing } from "../theme/spacing";

interface FeedPostCardProps {
  post: FeedPost;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onOrder: () => void;
}

/**
 * Full-bleed, borderless post — Instagram's chrome is whitespace and a
 * hairline separator between posts, not a floating card with a shadow.
 */
const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onOrder,
}) => (
  <View style={styles.card}>
    {/* Card Header */}
    <View style={styles.cardHeader}>
      <Avatar uri={post.profilePic} size="sm" style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <Text style={styles.name}>{post.fullName}</Text>
        <Text style={styles.handle}>@{post.username}</Text>
      </View>
      <TouchableOpacity style={styles.iconBtn} onPress={onOrder}>
        <Icon name="cart-outline" size={22} color={tokens.ink900} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn}>
        <Icon name="dots-vertical" size={22} color={tokens.ink900} />
      </TouchableOpacity>
    </View>
    {/* Card Image */}
    <View style={styles.imageWrapper}>
      <Image source={{ uri: post.imageUrl }} style={styles.cardImage} />
      {post.price != null && (
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>{formatPrice(post.price)}</Text>
        </View>
      )}
    </View>
    {/* Action Bar */}
    <View style={styles.actionBar}>
      <TouchableOpacity onPress={onLike} style={styles.actionItem}>
        <Icon
          name={post.likedByMe ? "heart" : "heart-outline"}
          size={25}
          color={post.likedByMe ? tokens.danger : tokens.ink900}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onComment} style={styles.actionItem}>
        <Icon name="comment-outline" size={24} color={tokens.ink900} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onShare} style={styles.actionItem}>
        <Icon name="send-outline" size={24} color={tokens.ink900} />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity onPress={onSave} style={styles.actionItem}>
        <Icon name="bookmark-outline" size={24} color={tokens.ink900} />
      </TouchableOpacity>
    </View>
    {/* Likes, caption, comments, time */}
    {post.likeCount > 0 && (
      <Text style={styles.likeCount}>
        {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
      </Text>
    )}
    {post.caption ? (
      <Text style={styles.description}>
        <Text style={styles.name}>{post.username}</Text> {post.caption}
      </Text>
    ) : null}
    {post.commentCount > 0 && (
      <TouchableOpacity onPress={onComment}>
        <Text style={styles.viewComments}>
          View all {post.commentCount}{" "}
          {post.commentCount === 1 ? "comment" : "comments"}
        </Text>
      </TouchableOpacity>
    )}
    <Text style={styles.timeText}>Posted {timeAgo(post.createdAt)} ago</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.surface,
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: tokens.line,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatar: {
    borderWidth: 2,
    borderColor: tokens.surface,
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
  iconBtn: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  priceTag: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  priceTagText: {
    color: "#fff",
    ...typography.label,
  },
  cardImage: {
    width: "100%",
    height: 220,
    backgroundColor: tokens.canvas,
  },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },
  actionItem: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  likeCount: {
    ...typography.heading,
    color: tokens.ink900,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  description: {
    ...typography.body,
    color: tokens.ink900,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  viewComments: {
    ...typography.body,
    color: tokens.ink600,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: tokens.ink400,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
});

export default FeedPostCard;
