import ActionRows from "@/components/places/ActionRows";
import useItemPhotoUpload, { PhotoSource } from "@/domain/photos/useItemPhotoUpload";
import { SheetAction } from "@/utils/actionSelectionBridge";
import { backModal } from "@/utils/modalNav";
import { consumePendingPhotoCallback } from "@/utils/photoSelectionBridge";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";

export default function PhotoScreen() {
  const { itemId, pictureUrl } = useLocalSearchParams<{ itemId?: string; pictureUrl?: string }>();
  const photoUpload = useItemPhotoUpload();

  // Only the "add photo to a not-yet-created item" flow (no itemId) needs to
  // report a result back — the item-detail flow just relies on its screen
  // reloading on focus, same as every other edit made from a pushed modal.
  const reportAndClose = (result: string | null) => {
    if (!itemId) {
      const callback = consumePendingPhotoCallback();
      callback?.(result);
    }
    backModal();
  };

  // Presenting the native camera/library picker here — while this screen is
  // still fully on-screen and nothing is mid-transition — avoids racing a
  // navigation pop: launching it *after* backModal() (e.g. from a
  // focus-effect on the screen underneath) can present the picker while the
  // pop animation is still in flight, which tears the picker back down as
  // soon as that animation settles.
  const handlePick = async (source: PhotoSource) => {
    const picked = await photoUpload.pickImage(source);
    if (!picked) {
      if (photoUpload.error) Alert.alert("Error", photoUpload.error);
      return;
    }

    const compressedUri = await photoUpload.compressImage(picked);

    if (itemId) {
      const uploadedUrl = await photoUpload.uploadToItem(itemId, compressedUri);
      if (!uploadedUrl) {
        Alert.alert("Error", photoUpload.error ?? "Could not upload photo.");
        return;
      }
      reportAndClose(uploadedUrl);
    } else {
      reportAndClose(compressedUri);
    }
  };

  const handleRemove = async () => {
    if (itemId) {
      const removed = await photoUpload.removePhoto(itemId);
      if (!removed) {
        Alert.alert("Error", photoUpload.error ?? "Could not remove photo.");
        return;
      }
    }
    reportAndClose(null);
  };

  const select = (key: string) => {
    if (key === "camera" || key === "library") handlePick(key);
    else if (key === "remove") handleRemove();
  };

  const actions: SheetAction[] = [
    ...(photoUpload.canUseCamera ? [{ key: "camera", label: "Take Photo", icon: "camera-outline" as const }] : []),
    { key: "library", label: "Choose from Library", icon: "image-outline" },
    ...(pictureUrl ? [{ key: "remove", label: "Remove Photo", icon: "delete-outline" as const, destructive: true }] : []),
  ];

  return (
    <>
      <Stack.Screen options={{ title: "Photo" }} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {pictureUrl && (
          <Image source={{ uri: pictureUrl }} style={{ width: "100%", height: 320, backgroundColor: "#000" }} contentFit="contain" />
        )}
        <View pointerEvents={photoUpload.uploading ? "none" : "auto"} style={{ opacity: photoUpload.uploading ? 0.5 : 1 }}>
          <ActionRows actions={actions} onSelect={select} />
        </View>
        {photoUpload.uploading && (
          <View style={{ paddingVertical: 16, alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        )}
      </ScrollView>
    </>
  );
}
