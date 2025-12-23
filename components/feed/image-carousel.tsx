import { Media } from "@/types/feed";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import PagerView from "react-native-pager-view";

interface ImageCarouselProps {
  media: Media[];
}

const { width: screenWidth } = Dimensions.get("window");

export function ImageCarousel({ media }: ImageCarouselProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const showIndicator = media.length > 1;

  return (
    <View className="relative">
      <PagerView
        style={{ width: screenWidth, height: screenWidth * 1.25 }}
        initialPage={0}
        onPageSelected={(e) => setCurrentPage(e.nativeEvent.position)}
      >
        {media.map((item, index) => (
          <View key={index} className="flex-1">
            <Image
              source={{ uri: item.media_url }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={200}
            />
          </View>
        ))}
      </PagerView>

      {showIndicator && (
        <View className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full">
          <Text className="text-white text-sm font-medium">
            {currentPage + 1}/{media.length}
          </Text>
        </View>
      )}

      {showIndicator && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
          {media.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentPage ? "bg-primary" : "bg-white/50"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
