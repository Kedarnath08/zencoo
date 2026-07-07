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

interface FeedPostCardProps {
  post: FeedPost;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onOrder: () => void;
}

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
      <Avatar uri={post.profilePic} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.name}>{post.fullName}</Text>
        <Text style={styles.handle}>@{post.username}</Text>
      </View>
      <TouchableOpacity style={styles.iconBtn} onPress={onOrder}>
        <Icon name="cart-outline" size={22} color="#222" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn}>
        <Icon name="dots-vertical" size={22} color="#222" />
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
    <View style={styles.actionBarContainer}>
      <View style={styles.actionBar}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.countText}>{post.likeCount}</Text>
          <TouchableOpacity onPress={onLike}>
            <Icon
              name={post.likedByMe ? "heart" : "heart-outline"}
              size={22}
              color={post.likedByMe ? "#E94F37" : "#fff"}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.countText}>{post.commentCount}</Text>
          <TouchableOpacity onPress={onComment}>
            <Icon
              name="comment-outline"
              size={22}
              color="#fff"
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={onShare}>
          <Icon
            name="send-outline"
            size={22}
            color="#fff"
            style={styles.actionIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave}>
          <Icon
            name="bookmark-outline"
            size={22}
            color="#fff"
            style={styles.actionIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
    {/* Description and Time */}
    {post.caption ? (
      <Text style={styles.description}>{post.caption}</Text>
    ) : null}
    <Text style={styles.timeText}>Posted {timeAgo(post.createdAt)} ago</Text>
  </View>
);

const CARD_RADIUS = 22;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: CARD_RADIUS,
    marginHorizontal: 8,
    marginBottom: 18,
    paddingBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#eee",
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: -2,
  },
  handle: {
    fontSize: 14,
    color: "#7B8CA6",
    marginTop: 0,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  priceTag: {
    position: "absolute",
    top: 20,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceTagText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cardImage: {
    width: "100%",
    height: 210,
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 0,
    backgroundColor: "#eee",
  },
  actionBarContainer: {
    alignItems: "flex-start",
    paddingHorizontal: 0,
    marginTop: -38,
    marginBottom: 0,
    width: "100%",
  },
  actionBar: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.22)",
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  actionIcon: {
    marginRight: 0,
    marginLeft: 0,
    paddingHorizontal: 4,
  },
  description: {
    fontSize: 15,
    color: "#444",
    paddingHorizontal: 16,
    marginBottom: 0,
    marginTop: 10,
    fontWeight: "400",
  },
  timeText: {
    fontSize: 13,
    color: "#B0B0B0",
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 2,
    textAlign: "left",
  },
  countText: {
    color: "#fff",
    fontSize: 15,
    marginRight: 2,
    marginLeft: 0,
    fontWeight: "bold",
  },
});

export default FeedPostCard;
