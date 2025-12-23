/**
 * Feed API Service
 * Handles all feed-related API calls
 */

import { FeedResponse } from "@/types/feed";
import { apiFetch } from "./api-client";

/**
 * Get feed posts with optional cursor pagination
 *
 * @param cursor - Optional cursor for pagination (from previous response's next_cursor)
 * @param limit - Number of posts to fetch (default: 10, max: 50)
 * @returns Feed response with posts, next_cursor, and has_more flag
 */
export async function getFeed(
  cursor?: string | null,
  limit: number = 10
): Promise<FeedResponse> {
  const params = new URLSearchParams();

  if (cursor) {
    params.append("cursor", cursor);
  }

  if (limit !== 10) {
    params.append("limit", limit.toString());
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/feed?${queryString}` : "/feed";

  return apiFetch<FeedResponse>(endpoint);
}

/**
 * Like a post
 *
 * @param postId - ID of the post to like
 * @returns Success message
 */
export async function likePost(postId: number): Promise<{ message: string }> {
  return apiFetch(`/posts/${postId}/likes`, {
    method: "POST",
  });
}

/**
 * Unlike a post
 *
 * @param postId - ID of the post to unlike
 * @returns Success message
 */
export async function unlikePost(postId: number): Promise<{ message: string }> {
  return apiFetch(`/posts/${postId}/likes`, {
    method: "DELETE",
  });
}

/**
 * Delete a post (only owner can delete)
 *
 * @param postId - ID of the post to delete
 * @returns Success message
 */
export async function deletePost(postId: number): Promise<{ message: string }> {
  return apiFetch(`/posts/${postId}`, {
    method: "DELETE",
  });
}
