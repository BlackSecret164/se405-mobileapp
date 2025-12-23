import { useColorScheme } from "@/hooks/use-color-scheme";
import { SearchHistoryUser } from "@/types/user";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

interface SearchHistoryItemProps {
  user: SearchHistoryUser;
  onPress: (user: SearchHistoryUser) => void;
  onRemove: (userId: number) => void;
}

/**
 * Search history item
 * - Avatar on the left
 * - Username and display name in the middle
 * - Trash icon button on the right to remove from history
 */
export function SearchHistoryItem({
  user,
  onPress,
  onRemove,
}: SearchHistoryItemProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#9BA1A6" : "#687076";

  return (
    <View className="flex-row items-center px-4 py-3">
      {/* Pressable area for user info */}
      <Pressable
        onPress={() => onPress(user)}
        className="flex-row items-center flex-1 active:opacity-70"
      >
        {/* Avatar */}
        <Image
          source={{ uri: user.avatar_url }}
          style={{ width: 48, height: 48, borderRadius: 24 }}
          className="bg-gray-200 dark:bg-zinc-700"
          contentFit="cover"
          transition={200}
        />

        {/* User info */}
        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-black dark:text-white">
            {user.username}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">
            {user.display_name}
          </Text>
        </View>
      </Pressable>

      {/* Remove button */}
      <Pressable
        onPress={() => onRemove(user.id)}
        hitSlop={12}
        className="p-2 active:opacity-50"
      >
        <Ionicons name="close" size={20} color={iconColor} />
      </Pressable>
    </View>
  );
}
