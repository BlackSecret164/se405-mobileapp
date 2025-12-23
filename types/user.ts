/**
 * User types for search and profile features
 */

export interface UserSummary {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_following: boolean;
}

export interface SearchHistoryUser extends UserSummary {
  searched_at: number; // timestamp when user was searched
}

// Search API response
export interface SearchUsersResponse {
  users: UserSummary[];
}

// Full user profile (matches backend)
export interface UserProfile {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  follower_count: number;
  following_count: number;
  post_count: number;
  is_following: boolean;
  created_at: string;
}
