import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  CaptionInput,
  MediaPickerButtons,
  MediaPreviewList,
} from "@/components/add-post";
import {
  createPost,
  getContentTypeFromUri,
  getPresignedUrls,
  uploadMediaToR2,
} from "@/services/post-service";
import { LocalMedia } from "@/types/feed";

const MAX_MEDIA_COUNT = 10;

export default function AddPostScreen() {
  const router = useRouter();
  const [media, setMedia] = useState<LocalMedia[]>([]);
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canAddMore = media.length < MAX_MEDIA_COUNT;

  const handleCancel = () => {
    if (media.length > 0 || caption.trim()) {
      Alert.alert(
        "Discard Post?",
        "You have unsaved changes. Are you sure you want to discard this post?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleShare = async () => {
    if (media.length === 0) {
      Alert.alert("No Media", "Please add at least one photo.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Get presigned URLs for all images
      const presignItems = media.map((m) => ({
        content_type: getContentTypeFromUri(m.uri),
      }));

      const presignResponse = await getPresignedUrls(presignItems);

      // Step 2: Upload each image to R2 in parallel
      const uploadPromises = media.map((m, index) => {
        const presignItem = presignResponse.items[index];
        return uploadMediaToR2(
          presignItem.upload_url,
          m.uri,
          getContentTypeFromUri(m.uri)
        );
      });

      await Promise.all(uploadPromises);

      // Step 3: Create post with public URLs
      const mediaUrls = presignResponse.items.map((item) => item.public_url);
      await createPost(caption || undefined, mediaUrls);

      // Success - navigate to home
      setMedia([]);
      setCaption("");
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create post. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePickFromGallery = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to select media."
      );
      return;
    }

    const remainingSlots = MAX_MEDIA_COUNT - media.length;
    if (remainingSlots <= 0) {
      Alert.alert(
        "Limit Reached",
        `You can only add up to ${MAX_MEDIA_COUNT} media items.`
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      // Check total media limit
      if (media.length + result.assets.length > MAX_MEDIA_COUNT) {
        Alert.alert(
          "Limit Reached",
          `You can only add up to ${MAX_MEDIA_COUNT} photos. Please select fewer items.`
        );
        return;
      }

      const newMedia: LocalMedia[] = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: "image",
        position: media.length + index,
      }));

      setMedia([...media, ...newMedia]);
    }
  };

  const handleOpenCamera = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your camera to take photos."
      );
      return;
    }

    if (!canAddMore) {
      Alert.alert(
        "Limit Reached",
        `You can only add up to ${MAX_MEDIA_COUNT} photos.`
      );
      return;
    }

    // Launch camera directly for photo
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const newMedia: LocalMedia = {
        uri: asset.uri,
        type: "image",
        position: media.length,
      };

      setMedia([...media, newMedia]);
    }
  };

  const handleRemoveMedia = (position: number) => {
    const updatedMedia = media
      .filter((m) => m.position !== position)
      .map((m, index) => ({ ...m, position: index }));
    setMedia(updatedMedia);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900" edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <Pressable onPress={handleCancel} hitSlop={8}>
            <Text className="text-base text-zinc-600 dark:text-zinc-400">
              Cancel
            </Text>
          </Pressable>

          <Text className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            New Post
          </Text>

          <Pressable
            onPress={handleShare}
            disabled={media.length === 0 || isSubmitting}
            hitSlop={8}
          >
            <Text
              className={`text-base font-semibold ${
                media.length === 0 || isSubmitting
                  ? "text-blue-300 dark:text-blue-800"
                  : "text-blue-500 dark:text-blue-400"
              }`}
            >
              {isSubmitting ? "Posting..." : "Share"}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Media Preview */}
          {media.length > 0 ? (
            <MediaPreviewList media={media} onRemove={handleRemoveMedia} />
          ) : (
            <View className="items-center justify-center py-16">
              <View className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 items-center justify-center mb-4">
                <Ionicons name="images-outline" size={36} color="#9ca3af" />
              </View>
              <Text className="text-zinc-500 dark:text-zinc-400 text-base">
                No media selected
              </Text>
              <Text className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">
                Add photos to your post
              </Text>
            </View>
          )}

          {/* Caption Input */}
          <View className="border-t border-zinc-200 dark:border-zinc-800">
            <CaptionInput value={caption} onChangeText={setCaption} />
          </View>

          {/* Media Picker Buttons */}
          <View className="border-t border-zinc-200 dark:border-zinc-800">
            <MediaPickerButtons
              onPickFromGallery={handlePickFromGallery}
              onOpenCamera={handleOpenCamera}
              disabled={!canAddMore}
            />
          </View>

          {/* Tips */}
          <View className="px-4 py-3">
            <Text className="text-zinc-400 dark:text-zinc-500 text-xs text-center">
              Tip: You can add up to {MAX_MEDIA_COUNT} photos
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <Modal visible={isSubmitting} transparent={true} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View className="bg-white dark:bg-zinc-800 rounded-2xl px-8 py-6 items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-zinc-700 dark:text-zinc-200 mt-3 font-medium">
              Posting...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
