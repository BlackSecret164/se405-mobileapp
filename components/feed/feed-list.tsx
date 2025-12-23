import { FeedPost } from "@/types/feed";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { PostCard } from "./post-card";

interface FeedListProps {
  posts: FeedPost[];
  onRefresh?: () => Promise<void>;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLikeToggle?: (postId: number, isLiked: boolean) => void;
  onCommentPress?: (postId: number) => void;
  onUserPress?: (userId: number) => void;
  onDeletePost?: (postId: number) => void;
  ListHeaderComponent?: React.ReactElement;
}

export interface FeedListRef {
  scrollToTop: () => void;
}

export const FeedList = forwardRef<FeedListRef, FeedListProps>(
  (
    {
      posts,
      onRefresh,
      onLoadMore,
      hasMore = false,
      isLoadingMore = false,
      onLikeToggle,
      onCommentPress,
      onUserPress,
      onDeletePost,
      ListHeaderComponent,
    },
    ref
  ) => {
    const [refreshing, setRefreshing] = useState(false);
    const flatListRef = useRef<FlatList<FeedPost>>(null);

    // Expose scrollToTop method to parent components
    useImperativeHandle(ref, () => ({
      scrollToTop: () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      },
    }));

    const handleRefresh = useCallback(async () => {
      if (!onRefresh) return;
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }, [onRefresh]);

    const handleEndReached = useCallback(() => {
      if (hasMore && !isLoadingMore && onLoadMore) {
        onLoadMore();
      }
    }, [hasMore, isLoadingMore, onLoadMore]);

    const renderItem = useCallback(
      ({ item }: { item: FeedPost }) => (
        <PostCard
          post={item}
          onLikeToggle={onLikeToggle}
          onCommentPress={onCommentPress}
          onUserPress={onUserPress}
          onDeletePost={onDeletePost}
        />
      ),
      [onLikeToggle, onCommentPress, onUserPress, onDeletePost]
    );

    const renderFooter = useCallback(() => {
      if (isLoadingMore) {
        return (
          <View className="py-4">
            <ActivityIndicator size="small" color="#0a7ea4" />
          </View>
        );
      }

      // Show "all caught up" message when there are posts but no more to load
      if (posts.length > 0 && !hasMore) {
        return (
          <View className="py-6 items-center">
            <Text className="text-gray-400 text-sm">
              ✓ You're all caught up!
            </Text>
          </View>
        );
      }

      return null;
    }, [isLoadingMore, posts.length, hasMore]);

    const renderEmpty = useCallback(
      () => (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-gray-500 text-base">No posts yet</Text>
        </View>
      ),
      []
    );

    const keyExtractor = useCallback(
      (item: FeedPost) => item.id.toString(),
      []
    );

    return (
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0a7ea4"
              colors={["#0a7ea4"]}
            />
          ) : undefined
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    );
  }
);
