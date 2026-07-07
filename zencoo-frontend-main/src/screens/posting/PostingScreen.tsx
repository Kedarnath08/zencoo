import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import PlusIcon from "../../../assets/icons/NewPost.svg";
import styles from "../../styles/postingScreenStyles";
import { uploadImageToCloudinary } from "../../utils/uploadImage";
import { createPost } from "../../api/posts";

const PostPreviewScreen: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [inputHeight, setInputHeight] = useState(60);
  const [captionFocused, setCaptionFocused] = useState(false); // <-- add this
  const [posting, setPosting] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const pickImage = async (fromCamera: boolean) => {
    let result: ImagePicker.ImagePickerResult;
    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera permission is needed.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Gallery permission is needed.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    }
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!imageUri || posting) return;
    setPosting(true);
    try {
      const imageUrl = await uploadImageToCloudinary(imageUri);
      await createPost(imageUrl, caption.trim());
      setImageUri(null);
      setCaption("");
      setInputHeight(60);
      navigation.navigate("Feed" as never); // Feed refreshes on focus
    } catch (err: any) {
      Alert.alert(
        "Post failed",
        err?.message ?? "Something went wrong. Please try again."
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, height: insets.top + 56 },
        ]}
      >
        <View style={styles.plusBorder}>
          <PlusIcon width={20} height={20} color="#222" />
        </View>
        <Text style={styles.headerTitle}>Create a Post</Text>
      </View>
      {/* KeyboardAvoidingView wraps the scrollable area */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 24 }, // Add safe area padding
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.imageArea}>
              {!imageUri ? (
                <>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => pickImage(true)}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color="#222"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.selectButtonText}>Capture</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => pickImage(false)}
                  >
                    <Ionicons
                      name="images-outline"
                      size={20}
                      color="#222"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.selectButtonText}>Gallery</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setImageUri(null)}
                    activeOpacity={0.7}
                    accessibilityLabel="Remove selected image"
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Caption input and Post button always visible */}
            <View
              style={{
                width: "100%",
                marginBottom: 24,
                position: "relative",
                minHeight: 60,
                justifyContent: "center",
              }}
            >
              <View style={styles.captionArea}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      height: Math.max(60, inputHeight),
                      paddingRight: 44,
                      paddingTop: 16,
                    },
                    captionFocused && styles.inputFocused,
                  ]}
                  placeholder="Write a caption..."
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  onContentSizeChange={(e) =>
                    setInputHeight(e.nativeEvent.contentSize.height)
                  }
                  onFocus={() => setCaptionFocused(true)} // <-- set focus
                  onBlur={() => setCaptionFocused(false)} // <-- unset focus
                />
                {caption.length > 0 && (
                  <TouchableOpacity
                    style={[styles.captionCloseButton, { top: 8, right: 8 }]}
                    onPress={() => {
                      setCaption("");
                      setInputHeight(60);
                    }}
                    activeOpacity={0.7}
                    accessibilityLabel="Clear caption"
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.postButton,
                {
                  marginBottom: insets.bottom + 28,
                  opacity: imageUri && !posting ? 1 : 0.6,
                },
              ]}
              onPress={handlePost}
              disabled={!imageUri || posting}
            >
              {posting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostPreviewScreen;
