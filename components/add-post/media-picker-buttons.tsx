import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface MediaPickerButtonsProps {
  onPickFromGallery: () => void;
  onOpenCamera: () => void;
  disabled?: boolean;
}

export function MediaPickerButtons({
  onPickFromGallery,
  onOpenCamera,
  disabled = false,
}: MediaPickerButtonsProps) {
  return (
    <View className="flex-row gap-3 px-4 py-4">
      {/* Gallery Button */}
      <Pressable
        onPress={onPickFromGallery}
        disabled={disabled}
        className={`flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl border ${
          disabled
            ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
            : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700"
        }`}
      >
        <Ionicons
          name="images-outline"
          size={22}
          color={disabled ? "#9ca3af" : "#3b82f6"}
        />
        <Text
          className={`font-medium ${
            disabled
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-700 dark:text-zinc-200"
          }`}
        >
          Gallery
        </Text>
      </Pressable>

      {/* Camera Button */}
      <Pressable
        onPress={onOpenCamera}
        disabled={disabled}
        className={`flex-1 flex-row items-center justify-center gap-2 py-3 px-4 rounded-xl border ${
          disabled
            ? "border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
            : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700"
        }`}
      >
        <Ionicons
          name="camera-outline"
          size={22}
          color={disabled ? "#9ca3af" : "#3b82f6"}
        />
        <Text
          className={`font-medium ${
            disabled
              ? "text-zinc-400 dark:text-zinc-500"
              : "text-zinc-700 dark:text-zinc-200"
          }`}
        >
          Camera
        </Text>
      </Pressable>
    </View>
  );
}
