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
  post_id?: number;
  comment_id?: number;
  is_read: boolean;
  created_at: string;
  actor?: UserSummary;
};

export type AggregatedNotification = {
  id: number; // BẮT BUỘC THÊM TRƯỜNG NÀY
  type: "like" | "comment";
  post_id?: number;
  actors: UserSummary[];
  total_count: number;
  latest_at: string;
  is_read: boolean;
};

export type NotificationItemData = Notification | AggregatedNotification;

export type NotificationListResponse = {
  follows: Notification[];
  aggregated: AggregatedNotification[];
  unread_count: number;
};