/**
 * Post API Service
 * Handles post creation with media upload to R2
 */

import { Post } from "@/types/feed";
import { apiFetch } from "./api-client";

// Types for presign API
export interface PresignItem {
  content_type: string;
  file_size?: number;
}

export interface PresignResponse {
  upload_url: string;
  public_url: string;
  key: string;
  expires_in: number;
}

export interface PresignBatchResponse {
  items: PresignResponse[];
}

export interface CreatePostRequest {
  caption?: string;
  media_urls: string[];
}

/**
 * Get presigned URLs for batch media upload
 *
 * @param items - Array of items with content_type and optional file_size
 * @returns Array of presign responses with upload_url and public_url
 */
export async function getPresignedUrls(
  items: PresignItem[]
): Promise<PresignBatchResponse> {
  return apiFetch<PresignBatchResponse>("/media/posts/presign/batch", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}

/**
 * Upload media file directly to R2 using presigned URL
 *
 * @param uploadUrl - Presigned URL from getPresignedUrls
 * @param imageUri - Local file URI from image picker
 * @param contentType - Content type (e.g., 'image/jpeg')
 */
export async function uploadMediaToR2(
  uploadUrl: string,
  imageUri: string,
  contentType: string
): Promise<void> {
  // Fetch the image file as blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Upload to R2 using PUT
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload media: ${uploadResponse.status}`);
  }
}

/**
 * Create a new post with uploaded media
 *
 * @param caption - Optional post caption (max 2200 characters)
 * @param mediaUrls - Array of public URLs from R2 (required, 1-10 items)
 * @returns Created post object
 */
export async function createPost(
  caption: string | undefined,
  mediaUrls: string[]
): Promise<Post> {
  const body: CreatePostRequest = {
    media_urls: mediaUrls,
  };

  if (caption && caption.trim()) {
    body.caption = caption.trim();
  }

  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Helper to get content type from image URI
 */
export function getContentTypeFromUri(uri: string): string {
  const extension = uri.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "jpg":
    case "jpeg":
    default:
      return "image/jpeg";
  }
}
