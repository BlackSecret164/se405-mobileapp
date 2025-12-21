/**
 * Comment API Service
 * Handles all comment-related API calls
 */

import { apiFetch } from "./api-client";

// Types matching backend API
export interface CommentAuthor {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
}

export interface ApiComment {
  id: number;
  post_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  author: CommentAuthor;
}

export interface CommentListResponse {
  comments: ApiComment[];
  next_cursor?: string;
  has_more: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parent_comment_id?: number | null;
}

/**
 * Get comments for a post with optional cursor pagination
 *
 * @param postId - ID of the post
 * @param cursor - Optional cursor for pagination (from previous response's next_cursor)
 * @param limit - Number of comments to fetch (default: 10, max: 50)
 * @returns Comment list response with comments, next_cursor, and has_more flag
 */
export async function getComments(
  postId: number,
  cursor?: string | null,
  limit: number = 10
): Promise<CommentListResponse> {
  const params = new URLSearchParams();

  if (cursor) {
    params.append("cursor", cursor);
  }

  if (limit !== 10) {
    params.append("limit", limit.toString());
  }

  const queryString = params.toString();
  const endpoint = queryString
    ? `/posts/${postId}/comments?${queryString}`
    : `/posts/${postId}/comments`;

  return apiFetch<CommentListResponse>(endpoint);
}

/**
 * Create a new comment or reply on a post
 *
 * @param postId - ID of the post
 * @param content - Comment content (max 2200 characters)
 * @param parentCommentId - Optional parent comment ID for replies
 * @returns Created comment object
 */
export async function createComment(
  postId: number,
  content: string,
  parentCommentId?: number | null
): Promise<ApiComment> {
  const body: CreateCommentRequest = {
    content,
  };

  if (parentCommentId) {
    body.parent_comment_id = parentCommentId;
  }

  return apiFetch<ApiComment>(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Delete a comment (only owner can delete)
 *
 * @param postId - ID of the post
 * @param commentId - ID of the comment to delete
 * @returns Success message
 */
export async function deleteComment(
  postId: number,
  commentId: number
): Promise<{ message: string }> {
  return apiFetch(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
