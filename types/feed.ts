// User summary used in posts, comments, etc. (matches backend UserSummary)
export interface UserSummary {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
}

// Simplified user preview (for backward compatibility in some UI components)
export interface UserPreview {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Media {
  id: number;
  media_url: string;
  media_type: "image" | "video";
  position: number;
}

// Local media for creating new posts (before upload)
export interface LocalMedia {
  uri: string;
  type: "image";
  position: number;
}

// Post from BE (matches backend Post model)
export interface Post {
  id: number;
  user_id: number;
  caption: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  media: Media[];
  author: UserSummary;
  is_liked: boolean;
}

// FeedPost from BE (matches backend FeedPost)
export interface FeedPost extends Post {
  author: UserSummary;
}

// Feed API response format (matches backend FeedResponse)
export interface FeedResponse {
  posts: FeedPost[];
  next_cursor: string | null;
  has_more: boolean;
}

// Generic API error response
export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
