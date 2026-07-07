import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "../utils/uploadImage";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB source cap

export function useProfileImageUpload(onUpload: (url: string) => void) {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const { uri, fileSize, type } = asset;

    const getExtension = (u: string) => {
      const match = u.match(/\.(\w+)$/);
      return match ? match[1].toLowerCase() : "";
    };

    const isAcceptedType = (t?: string | null, u?: string) => {
      if (t && ACCEPTED_TYPES.includes(t)) return true;
      const ext = u ? getExtension(u) : "";
      return ["jpg", "jpeg", "png", "heic"].includes(ext);
    };

    if (!isAcceptedType(type, uri)) {
      Alert.alert(
        "Invalid file type",
        "Please select a JPEG, PNG, or HEIC image."
      );
      return;
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      Alert.alert("File too large", "Please select an image under 5MB.");
      return;
    }

    setUploading(true);
    try {
      // Profile pics: smaller footprint (square avatars).
      const url = await uploadImageToCloudinary(uri, {
        maxWidth: 512,
        maxSizeBytes: 300 * 1024,
      });
      onUpload(url);
      Alert.alert("Upload Success", "Image uploaded successfully!");
    } catch (err: any) {
      Alert.alert("Upload Error", err.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return { uploading, pickAndUpload };
}
