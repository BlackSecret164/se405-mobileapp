import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { LocalMedia } from "@/types/feed";

interface MediaPreviewListProps {
  media: LocalMedia[];
  onRemove: (position: number) => void;
}

export function MediaPreviewList({ media, onRemove }: MediaPreviewListProps) {
  const { width: screenWidth } = useWindowDimensions();

  // Calculate item size: roughly 60% of screen width with 1:1.25 aspect ratio
  const itemWidth = screenWidth * 0.6;
  const itemHeight = itemWidth * 1.25;

  if (media.length === 0) {
    return null;
  }

  return (
    <View className="py-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {media.map((item, index) => (
          <View
            key={`${item.uri}-${index}`}
            className="relative rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800"
            style={{ width: itemWidth, height: itemHeight }}
          >
            {/* Media content */}
            <Image
              source={{ uri: item.uri }}
              style={{ width: itemWidth, height: itemHeight }}
              contentFit="cover"
            />

            {/* Position badge (top-left) */}
            <View className="absolute top-2 left-2 bg-black/60 rounded-full px-2 py-1">
              <Text className="text-white text-xs font-semibold">
                {index + 1}
              </Text>
            </View>

            {/* Remove button (top-right) */}
            <Pressable
              onPress={() => onRemove(item.position)}
              className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
              hitSlop={8}
            >
              <Ionicons name="close" size={16} color="white" />
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Media count indicator */}
      <View className="px-4 mt-2">
        <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
          {media.length}/10 photos selected
        </Text>
      </View>
    </View>
  );
}
