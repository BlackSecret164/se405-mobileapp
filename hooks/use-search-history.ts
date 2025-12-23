import { SearchHistoryUser, UserSummary } from "@/types/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "search_history";
const MAX_HISTORY_SIZE = 5;

/**
 * Custom hook to manage search history
 * Stores up to 5 most recent searched users in AsyncStorage
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history from AsyncStorage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        // Initialize empty history
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHistory = async (newHistory: SearchHistoryUser[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  /**
   * Add a user to search history
   * - If user already exists, move to top and update timestamp
   * - If history is full (5 users), remove oldest entry
   */
  const addToHistory = useCallback(
    async (user: UserSummary) => {
      const historyUser: SearchHistoryUser = {
        ...user,
        searched_at: Date.now(),
      };

      // Remove if already exists
      const filtered = history.filter((h) => h.id !== user.id);

      // Add to beginning and limit to MAX_HISTORY_SIZE
      const newHistory = [historyUser, ...filtered].slice(0, MAX_HISTORY_SIZE);

      setHistory(newHistory);
      await saveHistory(newHistory);
    },
    [history]
  );

  /**
   * Remove a user from search history
   */
  const removeFromHistory = useCallback(
    async (userId: number) => {
      const newHistory = history.filter((h) => h.id !== userId);
      setHistory(newHistory);
      await saveHistory(newHistory);
    },
    [history]
  );

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    isLoading,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
