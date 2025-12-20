export type UserSummary = {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type Notification = {
  id: number;
  actor_id: number;
  type: "follow" | "like" | "comment";
  post_id?: number;       // null for follow notifications
  comment_id?: number;    // only for comment notifications
  is_read: boolean;
  created_at: string;     // ISO string
  actor?: UserSummary;    // Who triggered the notification
};

export type AggregatedNotification = {
  type: "like" | "comment";
  post_id?: number;                // For navigation to post
  actors: UserSummary[];           // First 2-3 actors (for "user1 and X others")
  total_count: number;             // Total number of actors
  latest_at: string;               // Most recent activity
  is_read: boolean;                // True if ALL in group are read
};

export type NotificationListResponse = {
  follows: Notification[];              // Individual follow notifications
  aggregated: AggregatedNotification[]; // Grouped likes/comments
  unread_count: number;                 // For badge display
};