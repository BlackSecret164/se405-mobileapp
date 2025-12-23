import { UserSummary } from "@/types/user";
import { apiFetch } from "./api-client";

export const UserService = {
  /**
   * Search users by username prefix
   * @param query Search query (min 2 chars recommended)
   * @param limit Max number of results (default 20)
   */
  async search(query: string, limit: number = 20): Promise<UserSummary[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    // Using URLSearchParams to properly encode the query
    const params = new URLSearchParams();
    params.append("q", query.trim());
    params.append("limit", limit.toString());

    try {
      const response = await apiFetch<{ users: UserSummary[] }>(
        `/users/search?${params.toString()}`,
        {
          // Search API is public/optional auth
          skipAuth: false,
        }
      );

      return response.users || [];
    } catch (error) {
      console.error("Search API error:", error);
      // Return empty array on error to prevent crashing UI
      return [];
    }
  },
};
