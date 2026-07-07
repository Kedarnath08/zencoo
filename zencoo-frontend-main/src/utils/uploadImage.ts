import * as ImageManipulator from "expo-image-manipulator";
import { CLOUDINARY_URL, CLOUDINARY_UPLOAD_PRESET } from "../config/env";

export interface UploadOptions {
  /** Resize so the longest edge is at most this many px. */
  maxWidth?: number;
  /** Try to compress the WEBP output below this size (bytes). */
  maxSizeBytes?: number;
}

const DEFAULTS: Required<UploadOptions> = {
  maxWidth: 1080,
  maxSizeBytes: 600 * 1024, // 600KB
};

/**
 * Compresses a local image to WEBP (iteratively shrinking quality to hit the
 * size budget) and uploads it unsigned to Cloudinary. Returns the secure URL.
 * Throws on failure so callers can surface an error to the user.
 */
export async function uploadImageToCloudinary(
  uri: string,
  options: UploadOptions = {}
): Promise<string> {
  const { maxWidth, maxSizeBytes } = { ...DEFAULTS, ...options };

  let quality = 0.7;
  let manip = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxWidth } }],
    { compress: quality, format: ImageManipulator.SaveFormat.WEBP }
  );
  let compressedUri = manip.uri;
  let size = (await fetch(compressedUri).then((r) => r.blob())).size;

  while (size > maxSizeBytes && quality > 0.2) {
    quality -= 0.1;
    manip = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.WEBP }
    );
    compressedUri = manip.uri;
    size = (await fetch(compressedUri).then((r) => r.blob())).size;
  }

  const formData = new FormData();
  formData.append("file", {
    uri: compressedUri,
    name: "upload.webp",
    type: "image/webp",
  } as any);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!data.secure_url) {
    throw new Error(data?.error?.message || "Image upload failed");
  }
  return data.secure_url as string;
}
