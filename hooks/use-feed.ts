/**
 * useFeed Hook
 * Custom hook to manage feed state with infinite scroll pagination
 */

import {
  deletePost,
  getFeed,
  likePost,
  unlikePost,
} from "@/services/feed-service";
import { FeedPost } from "@/types/feed";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseFeedReturn {
  posts: FeedPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  handleLikeToggle: (postId: number, isLiked: boolean) => void;
  handleDeletePost: (postId: number) => Promise<void>;
  updateCommentCount: (postId: number, delta: number) => void;
}

export function useFeed(): UseFeedReturn {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch initial feed on mount
   */
  const fetchInitialFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getFeed(null, 10);

      setPosts(response.posts);
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
    } catch (err) {
      console.error("[useFeed] Initial fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh feed (pull-to-refresh)
   */
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const response = await getFeed(null, 10);

      setPosts(response.posts);
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
    } catch (err) {
      console.error("[useFeed] Refresh error:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh feed");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Load more posts (infinite scroll)
   */
  const loadMore = useCallback(async () => {
    // Don't load more if already loading or no more posts
    if (isLoadingMore || !hasMore || !nextCursor) {
      return;
    }

    try {
      setIsLoadingMore(true);

      const response = await getFeed(nextCursor, 10);

      // Append new posts to existing list
      setPosts((prev) => [...prev, ...response.posts]);
      setNextCursor(response.next_cursor);
      setHasMore(response.has_more);
    } catch (err) {
      console.error("[useFeed] Load more error:", err);
      // Don't show error toast for load more - just log it
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, nextCursor]);

  /**
   * Handle like/unlike with optimistic update
   */
  const handleLikeToggle = useCallback((postId: number, isLiked: boolean) => {
    // Optimistic update - update UI immediately
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked: isLiked,
              like_count: post.like_count + (isLiked ? 1 : -1),
            }
          : post
      )
    );

    // Call API in background
    const apiCall = isLiked ? likePost(postId) : unlikePost(postId);

    apiCall.catch((err) => {
      console.error(`[useFeed] Like toggle error:`, err);

      // Revert on failure
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: !isLiked,
                like_count: post.like_count + (isLiked ? -1 : 1),
              }
            : post
        )
      );
    });
  }, []);

  /**
   * Handle delete post
   */
  const handleDeletePost = useCallback(async (postId: number) => {
    try {
      await deletePost(postId);
      // Remove post from local state
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (err) {
      console.error("[useFeed] Delete post error:", err);
      Alert.alert("Error", "Failed to delete post. Please try again.");
    }
  }, []);

  /**
   * Update comment count for a post
   */
  const updateCommentCount = useCallback((postId: number, delta: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comment_count: Math.max(0, post.comment_count + delta),
            }
          : post
      )
    );
  }, []);

  // Fetch initial feed on mount
  useEffect(() => {
    fetchInitialFeed();
  }, [fetchInitialFeed]);

  return {
    posts,
    isLoading,
    isLoadingMore,
    isRefreshing,
    hasMore,
    error,
    refresh,
    loadMore,
    handleLikeToggle,
    handleDeletePost,
    updateCommentCount,
  };
}
