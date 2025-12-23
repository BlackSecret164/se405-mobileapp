import { useColorScheme } from "@/hooks/use-color-scheme";
import { ApiCommentWithReplies } from "@/types/comment";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import { Alert, Modal, Pressable, Text, View } from "react-native";

interface CommentItemProps {
  comment: ApiCommentWithReplies;
  onReply: (comment: ApiCommentWithReplies) => void;
  onDelete?: (commentId: number) => void;
  currentUserId?: number;
  isReply?: boolean;
  isExpanded?: boolean;
  onToggleReplies?: (commentId: number) => void;
  visibleRepliesCount?: number;
  onLoadMoreReplies?: (commentId: number) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y`;
}

export function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  isReply = false,
  isExpanded = false,
  onToggleReplies,
  visibleRepliesCount = 5,
  onLoadMoreReplies,
}: CommentItemProps) {
  const colorScheme = useColorScheme();
  const [menuVisible, setMenuVisible] = useState(false);

  const iconColor = colorScheme === "dark" ? "#9BA1A6" : "#687076";

  const hasReplies = comment.replies && comment.replies.length > 0;
  const totalReplies = comment.replies?.length || 0;
  const visibleReplies = comment.replies?.slice(0, visibleRepliesCount) || [];
  const hasMoreReplies = visibleRepliesCount < totalReplies;

  // Check if current user owns this comment
  const isOwnComment = currentUserId && comment.author.id === currentUserId;

  const handleReplyPress = useCallback(() => {
    onReply(comment);
  }, [comment, onReply]);

  const handleToggleReplies = useCallback(() => {
    onToggleReplies?.(comment.id);
  }, [comment.id, onToggleReplies]);

  const handleLoadMoreReplies = useCallback(() => {
    onLoadMoreReplies?.(comment.id);
  }, [comment.id, onLoadMoreReplies]);

  const handleMenuPress = useCallback(() => {
    setMenuVisible(true);
  }, []);

  const handleDeletePress = useCallback(() => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(comment.id),
        },
      ]
    );
  }, [comment.id, onDelete]);

  return (
    <View className={isReply ? "ml-10" : ""}>
      {/* Main Comment */}
      <View className="flex-row px-4 py-3">
        {/* Avatar */}
        <Image
          source={{ uri: comment.author.avatar_url ?? undefined }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
          className="bg-gray-200 dark:bg-zinc-700"
          contentFit="cover"
          transition={200}
        />

        {/* Content */}
        <View className="flex-1 ml-3">
          {/* Username and Time */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Text className="font-semibold text-black dark:text-white text-sm">
                {comment.author.username}
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs ml-2">
                {formatTimeAgo(comment.created_at)}
              </Text>
            </View>

            {/* Menu button for own comments */}
            {isOwnComment && (
              <Pressable onPress={handleMenuPress} hitSlop={12}>
                <Ionicons
                  name="ellipsis-vertical"
                  size={16}
                  color={iconColor}
                />
              </Pressable>
            )}
          </View>

          {/* Comment Content */}
          <Text className="text-black dark:text-white text-sm mt-1">
            {comment.content}
          </Text>

          {/* Reply Button - Only for parent comments (not replies) */}
          {!isReply && (
            <Pressable onPress={handleReplyPress} className="mt-2" hitSlop={8}>
              <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                Reply
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* View Replies / Hide Replies Toggle */}
      {!isReply && hasReplies && (
        <Pressable
          onPress={handleToggleReplies}
          className="flex-row items-center ml-[52px] mb-2"
          hitSlop={8}
        >
          <View className="w-6 h-[1px] bg-gray-400 dark:bg-gray-600 mr-2" />
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
            {isExpanded
              ? "Hide replies"
              : `View ${totalReplies} ${
                  totalReplies === 1 ? "reply" : "replies"
                }`}
          </Text>
        </Pressable>
      )}

      {/* Replies */}
      {!isReply && isExpanded && (
        <View>
          {visibleReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              isReply={true}
            />
          ))}

          {/* Load More Replies Button */}
          {hasMoreReplies && (
            <Pressable
              onPress={handleLoadMoreReplies}
              className="flex-row items-center ml-[52px] mb-2 mt-1"
              hitSlop={8}
            >
              <View className="w-6 h-[1px] bg-gray-400 dark:bg-gray-600 mr-2" />
              <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                View {Math.min(5, totalReplies - visibleRepliesCount)} more{" "}
                {totalReplies - visibleRepliesCount === 1 ? "reply" : "replies"}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Delete Menu Modal */}
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

            {/* Delete option */}
            <Pressable
              onPress={handleDeletePress}
              className="flex-row items-center px-5 py-4"
            >
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
              <Text className="ml-4 text-base text-red-500">
                Delete comment
              </Text>
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
