import { UserPreview, UserSummary } from "./feed";

// Comment from API (matches backend Comment model)
export interface ApiComment {
  id: number;
  post_id: number;
  content: string;
  parent_comment_id: number | null;
  created_at: string;
  author: UserSummary;
}

// Legacy Comment type for backward compatibility with mock data
export interface Comment {
  id: number;
  user: UserPreview;
  content: string;
  created_at: string;
  parent_comment_id: number | null;
  reply_count: number;
}

// Comments API response (flat structure with pagination - matches backend)
export interface CommentsResponse {
  comments: ApiComment[];
  next_cursor?: string;
  has_more: boolean;
}

// Extended Comment with nested replies for UI rendering
export interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
}

// Extended ApiComment with nested replies for UI rendering
export interface ApiCommentWithReplies extends ApiComment {
  replies?: ApiCommentWithReplies[];
}
