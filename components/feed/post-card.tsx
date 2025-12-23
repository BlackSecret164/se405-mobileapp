import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FeedPost } from "@/types/feed";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";
import { ImageCarousel } from "./image-carousel";

interface PostCardProps {
  post: FeedPost;
  onLikeToggle?: (postId: number, isLiked: boolean) => void;
  onCommentPress?: (postId: number) => void;
  onUserPress?: (userId: number) => void;
  onDeletePost?: (postId: number) => void;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

export function PostCard({
  post,
  onLikeToggle,
  onCommentPress,
  onUserPress,
  onDeletePost,
}: PostCardProps) {
  const colorScheme = useColorScheme();
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [menuVisible, setMenuVisible] = useState(false);

  const iconColor = colorScheme === "dark" ? "#ECEDEE" : "#11181C";
  const isOwnPost = currentUser?.id === post.author.id;

  const handleLikePress = () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));
    onLikeToggle?.(post.id, newIsLiked);
  };

  const handleCommentPress = () => {
    onCommentPress?.(post.id);
  };

  const handleUserPress = () => {
    onUserPress?.(post.author.id);
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeletePost?.(post.id),
        },
      ]
    );
  };

  const handleEditPress = () => {
    setMenuVisible(false);
    // TODO: Implement edit functionality later
    Alert.alert("Coming Soon", "Edit post feature will be available soon.");
  };

  return (
    <View className="bg-white dark:bg-zinc-900 mb-2">
      {/* Header - Avatar, Username, and Menu */}
      <View className="flex-row items-center justify-between px-3 py-2">
        <Pressable
          onPress={handleUserPress}
          className="flex-row items-center flex-1"
        >
          <Image
            source={{ uri: post.author.avatar_url ?? undefined }}
            style={{ width: 36, height: 36, borderRadius: 18 }}
            contentFit="cover"
          />
          <Text className="ml-3 font-semibold text-black dark:text-white">
            {post.author.username}
          </Text>
        </Pressable>

        {/* Menu button - only show for own posts */}
        {isOwnPost && (
          <Pressable onPress={handleMenuPress} className="p-2">
            <Ionicons name="ellipsis-horizontal" size={20} color={iconColor} />
          </Pressable>
        )}
      </View>

      {/* Image Carousel */}
      <ImageCarousel media={post.media} />

      {/* Actions Row */}
      <View className="flex-row items-center px-3 py-2">
        {/* Like Button */}
        <Pressable onPress={handleLikePress} className="p-1">
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={26}
            color={isLiked ? "#ef4444" : iconColor}
          />
        </Pressable>
        <Text className="ml-1 mr-4 text-black dark:text-white font-medium">
          {formatNumber(likeCount)}
        </Text>

        {/* Comment Button */}
        <Pressable onPress={handleCommentPress} className="p-1">
          <Ionicons name="chatbubble-outline" size={24} color={iconColor} />
        </Pressable>
        <Text className="ml-1 text-black dark:text-white font-medium">
          {formatNumber(post.comment_count)}
        </Text>
      </View>

      {/* Caption */}
      {post.caption && (
        <View className="px-3 pb-1">
          <Text className="text-black dark:text-white">
            <Text className="font-semibold">{post.author.username}</Text>{" "}
            {post.caption}
          </Text>
        </View>
      )}

      {/* Date */}
      <View className="px-3 pb-3">
        <Text className="text-gray-500 text-xs">
          {formatDate(post.created_at)}
        </Text>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-end"
          onPress={() => setMenuVisible(false)}
        >
          <View className="bg-white dark:bg-zinc-800 rounded-t-2xl pb-8">
            {/* Handle bar */}
            <View className="items-center py-3">
              <View className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </View>

            {/* Edit option */}
            <Pressable
              onPress={handleEditPress}
              className="flex-row items-center px-5 py-4"
            >
              <Ionicons name="pencil-outline" size={24} color={iconColor} />
              <Text className="ml-4 text-base text-black dark:text-white">
                Edit post
              </Text>
            </Pressable>

            {/* Delete option */}
            <Pressable
              onPress={handleDeletePress}
              className="flex-row items-center px-5 py-4"
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
              <Text className="ml-4 text-base text-red-500">Delete post</Text>
            </Pressable>

            {/* Cancel */}
            <Pressable
              onPress={() => setMenuVisible(false)}
              className="flex-row items-center justify-center px-5 py-4 mt-2 border-t border-gray-200 dark:border-gray-700"
            >
              <Text className="text-base text-black dark:text-white font-medium">
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
