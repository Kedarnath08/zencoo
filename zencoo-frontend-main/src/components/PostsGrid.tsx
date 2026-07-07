import React from "react";
import {
  FlatList,
  Image,
  ImageStyle,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

interface PostItem {
  id: number;
  imageUrl: string;
}

interface PostsGridStyles {
  postImage: StyleProp<ImageStyle>;
  postWrapper?: StyleProp<ViewStyle>;
  postContainer?: StyleProp<ViewStyle>;
  checkboxContainer?: StyleProp<ViewStyle>;
  checkbox?: StyleProp<ViewStyle>;
  checkboxSelected?: StyleProp<ViewStyle>;
}

interface PostsGridProps<T extends PostItem> {
  posts: T[];
  onPressPost: (post: T) => void;
  emptyMessage: string;
  emptyTextStyle?: StyleProp<TextStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  styles: PostsGridStyles;
  scrollEnabled?: boolean;
  activeOpacity?: number;
  /** Selection mode (MyProfile's edit mode) — renders a checkmark overlay per item. */
  editMode?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (id: number) => void;
}

/** 3-column post thumbnail grid shared by MyProfile and OthersProfile. */
function PostsGrid<T extends PostItem>({
  posts,
  onPressPost,
  emptyMessage,
  emptyTextStyle,
  contentContainerStyle,
  styles,
  scrollEnabled = false,
  activeOpacity,
  editMode = false,
  selectedIds = [],
  onToggleSelect,
}: PostsGridProps<T>) {
  return (
    <FlatList
      key="posts-3col"
      data={posts}
      keyExtractor={(item) => item.id.toString()}
      numColumns={3}
      renderItem={({ item }) => {
        const cell = (
          <TouchableOpacity
            onPress={() => (editMode ? onToggleSelect?.(item.id) : onPressPost(item))}
            style={styles.postContainer}
            activeOpacity={activeOpacity}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
            {editMode && (
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    selectedIds.includes(item.id) && styles.checkboxSelected,
                  ]}
                >
                  {selectedIds.includes(item.id) && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
        return styles.postWrapper ? <View style={styles.postWrapper}>{cell}</View> : cell;
      }}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      ListEmptyComponent={<Text style={emptyTextStyle}>{emptyMessage}</Text>}
    />
  );
}

export default PostsGrid;
