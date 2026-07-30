import { AuthContext } from "@/context/auth-context";
import { AuthState } from "@/domain/auth/authTypes";
import api from "@/interceptors/axios";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Platform } from "react-native";
import { useContext, useState } from "react";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.75;
const CONTENT_TYPE = "image/jpeg";

type PresignResponse = {
  upload_url: string;
  photo_url: string;
  expires_in: number;
};

export type PhotoSource = "camera" | "library";

type PickedImage = { uri: string; width: number; height: number };

export default function useItemPhotoUpload() {
  const { state } = useContext<{ state: AuthState; dispatch: React.Dispatch<any> }>(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = { headers: { Authorization: `Bearer ${state.tokens.accessToken}` } };

  // Requests permission and launches the camera/library picker. Returns the
  // picked asset's local uri and dimensions, or null if the user cancelled
  // or permission was denied (in which case a message is already set on
  // `error`).
  const pickImage = async (source: PhotoSource): Promise<PickedImage | null> => {
    setError(null);

    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setError("Permission denied.");
      return null;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 1, allowsEditing: false });

    if (result.canceled || result.assets.length === 0) return null;

    const asset = result.assets[0];
    return { uri: asset.uri, width: asset.width, height: asset.height };
  };

  // Resizes the longest edge down to MAX_DIMENSION and re-encodes as JPEG at
  // JPEG_QUALITY, keeping uploads small while staying visually close to
  // lossless. Returns the local uri of the compressed copy.
  const compressImage = async ({ uri, width, height }: PickedImage): Promise<string> => {
    const context = ImageManipulator.manipulate(uri);
    if (width > 0 && height > 0 && height > width) {
      context.resize({ height: MAX_DIMENSION });
    } else {
      context.resize({ width: MAX_DIMENSION });
    }
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });
    return saved.uri;
  };

  // Requests a presigned S3 PUT URL for the item, uploads the local file
  // directly to S3, then persists the resulting URL on the item via the
  // existing generic field-update endpoint. Returns the final photo URL on
  // success, or null on failure (with a message set on `error`).
  const uploadToItem = async (itemId: number | string, localUri: string, expectedUpdatedAt?: string): Promise<string | null> => {
    setUploading(true);
    setError(null);

    try {
      const presignRes = await api.post<PresignResponse>(
        `/app/item/${itemId}/photo/presign`,
        { content_type: CONTENT_TYPE },
        authHeaders,
      );
      const { upload_url, photo_url } = presignRes.data;

      const fileRes = await fetch(localUri);
      const blob = await fileRes.blob();

      const putRes = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": CONTENT_TYPE },
        body: blob,
      });
      if (!putRes.ok) throw new Error(`Upload to storage failed (${putRes.status}).`);

      await api.post(`/app/item/${itemId}/update`, { picture: photo_url, expected_updated_at: expectedUpdatedAt }, authHeaders);

      return photo_url;
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Could not upload photo, please try again.")
        : "Could not upload photo, please try again.";
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Convenience wrapper for the common case: pick, compress, and upload in
  // one call, for an item that already exists.
  const pickAndUpload = async (itemId: number | string, source: PhotoSource): Promise<string | null> => {
    const picked = await pickImage(source);
    if (!picked) return null;

    const compressedUri = await compressImage(picked);
    return uploadToItem(itemId, compressedUri);
  };

  const removePhoto = async (itemId: number | string): Promise<boolean> => {
    setError(null);
    try {
      await api.post(`/app/item/${itemId}/photo/delete`, {}, authHeaders);
      return true;
    } catch (err) {
      const message = axios.isAxiosError(err) ? (err.response?.data?.message ?? "Could not remove photo.") : "Could not remove photo.";
      setError(message);
      return false;
    }
  };

  return {
    uploading,
    error,
    canUseCamera: Platform.OS !== "web",
    pickImage,
    compressImage,
    uploadToItem,
    pickAndUpload,
    removePhoto,
  };
}
