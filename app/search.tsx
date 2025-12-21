import { SearchHistoryItem, UserSearchItem } from "@/components/search";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useDebounce } from "@/hooks/use-debounce";
import { useSearchHistory } from "@/hooks/use-search-history";
import { UserService } from "@/services";
import { SearchHistoryUser, UserSummary } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Search screen
 * - Header with back button and search input (auto-focus)
 * - Shows search results when query is entered (debounced 300ms)
 * - Shows search history when query is empty
 */
export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { history, addToHistory, removeFromHistory } = useSearchHistory();

  const iconColor = colorScheme === "dark" ? "#ECEDEE" : "#11181C";
  const placeholderColor = colorScheme === "dark" ? "#9BA1A6" : "#9ca3af";

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<UserSummary[]>([]);

  // Search results based on debounced query
  useEffect(() => {
    const fetchUsers = async () => {
      // If query is empty, clear results
      if (!debouncedQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const users = await UserService.search(debouncedQuery);
        setSearchResults(users);
      } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  // Handle user press from search results
  const handleUserPress = useCallback(
    (user: UserSummary) => {
      // Add to search history
      addToHistory(user);
      // Navigate to user profile (TODO: implement profile page)
      // router.push(`/user/${user.id}`);
      console.log("Navigate to user profile:", user.id);
    },
    [addToHistory]
  );

  // Handle user press from history
  const handleHistoryPress = useCallback(
    (user: SearchHistoryUser) => {
      // Add to history (moves to top)
      addToHistory(user);
      // Navigate to user profile (TODO: implement profile page)
      // router.push(`/user/${user.id}`);
      console.log("Navigate to user profile:", user.id);
    },
    [addToHistory]
  );

  // Handle remove from history
  const handleRemoveFromHistory = useCallback(
    (userId: number) => {
      removeFromHistory(userId);
    },
    [removeFromHistory]
  );

  // Handle back press
  const handleBackPress = () => {
    router.back();
  };

  // Determine what to show
  const showSearchResults = debouncedQuery.trim().length > 0;
  const showHistory = !showSearchResults && history.length > 0;
  const showEmptyState = !showSearchResults && history.length === 0;

  // Render search result item
  const renderSearchResultItem = useCallback(
    ({ item }: { item: UserSummary }) => (
      <UserSearchItem user={item} onPress={handleUserPress} />
    ),
    [handleUserPress]
  );

  // Render history item
  const renderHistoryItem = useCallback(
    ({ item }: { item: SearchHistoryUser }) => (
      <SearchHistoryItem
        user={item}
        onPress={handleHistoryPress}
        onRemove={handleRemoveFromHistory}
      />
    ),
    [handleHistoryPress, handleRemoveFromHistory]
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-zinc-900"
      edges={["top", "bottom"]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header with back button and search input */}
        <View className="flex-row items-center px-4 py-2 border-b border-gray-200 dark:border-zinc-800">
          {/* Back button */}
          <Pressable onPress={handleBackPress} hitSlop={8} className="mr-3">
            <Ionicons name="chevron-back" size={28} color={iconColor} />
          </Pressable>

          {/* Search input */}
          <View className="flex-1 flex-row items-center bg-gray-100 dark:bg-zinc-800 rounded-lg px-3">
            <Ionicons name="search" size={18} color={placeholderColor} />
            <TextInput
              className="flex-1 ml-2 text-black dark:text-white"
              style={{ fontSize: 16, paddingVertical: 14, height: 48 }}
              placeholder="Search"
              placeholderTextColor={placeholderColor}
              value={query}
              onChangeText={setQuery}
              autoFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={placeholderColor}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Content */}
        {showSearchResults && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSearchResultItem}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-500 dark:text-gray-400">
                  {isLoading ? "Searching..." : "No users found"}
                </Text>
              </View>
            }
          />
        )}

        {showHistory && (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderHistoryItem}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              <View className="px-4 py-3">
                <Text className="text-base font-semibold text-black dark:text-white">
                  Recent
                </Text>
              </View>
            }
          />
        )}

        {showEmptyState && (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 dark:text-gray-400">
              {isLoading ? "Searching..." : "Search for users"}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
