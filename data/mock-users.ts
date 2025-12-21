import { SearchHistoryUser, UserSummary } from "@/types/user";

/**
 * Mock users for search feature
 * DEPRECATED: Now using backend API
 */
export const mockUsers: UserSummary[] = [];

/**
 * Initial mock search history
 * DEPRECATED: Now using local storage
 */
export const mockSearchHistory: SearchHistoryUser[] = [];

/**
 * Search users by query
 * DEPRECATED: Now using UserService.search
 */
export function searchUsers(query: string): UserSummary[] {
  return [];
}
