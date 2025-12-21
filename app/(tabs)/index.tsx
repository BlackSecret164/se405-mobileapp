import { CommentSheet, CommentSheetRef } from "@/components/comments";
import { FeedList } from "@/components/feed";
import { Header } from "@/components/ui/header";
import { useFeed } from "@/hooks/use-feed";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const {
    posts,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    handleLikeToggle,
    handleDeletePost,
    updateCommentCount,
  } = useFeed();

  const commentSheetRef = useRef<CommentSheetRef>(null);

  // Auto refresh feed when tab is focused (e.g., after creating a new post)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we already have posts (skip initial load)
      if (posts.length > 0) {
        refresh();
      }
    }, [posts.length > 0, refresh])
  );

  const handleRefresh = useCallback(async () => {
    await refresh();
  }, [refresh]);

  const handleLoadMore = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const handleCommentPress = useCallback((postId: number) => {
    // Open comment sheet
    commentSheetRef.current?.open(postId);
  }, []);

  const handleUserPress = useCallback((userId: number) => {
    // Navigate to user profile - will implement later
    console.log(`Open profile for user ${userId}`);
  }, []);

  const handleCommentCountChange = useCallback(
    (postId: number, delta: number) => {
      updateCommentCount(postId, delta);
    },
    [updateCommentCount]
  );

  // Show loading state on initial load
  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-zinc-900"
        edges={["top"]}
      >
        <Header />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text className="mt-4 text-gray-500">Loading feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error && posts.length === 0) {
    return (
      <SafeAreaView
        className="flex-1 bg-white dark:bg-zinc-900"
        edges={["top"]}
      >
        <Header />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center mb-4">{error}</Text>
          <Text className="text-blue-500 underline" onPress={handleRefresh}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900" edges={["top"]}>
      {/* Sticky Header */}
      <Header />

      {/* Feed */}
      <FeedList
        posts={posts}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLikeToggle={handleLikeToggle}
        onCommentPress={handleCommentPress}
        onUserPress={handleUserPress}
        onDeletePost={handleDeletePost}
      />

      {/* Comment Sheet */}
      <CommentSheet
        ref={commentSheetRef}
        postId={null}
        onCommentCountChange={handleCommentCountChange}
      />
    </SafeAreaView>
  );
}
