import { UserSummary } from "@/types/user";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

interface UserSearchItemProps {
  user: UserSummary;
  onPress: (user: UserSummary) => void;
}

/**
 * User search result item
 * - Avatar on the left
 * - Username and display name on the right
 * - Pressable to navigate to user profile
 */
export function UserSearchItem({ user, onPress }: UserSearchItemProps) {
  return (
    <Pressable
      onPress={() => onPress(user)}
      className="flex-row items-center px-4 py-3 active:bg-gray-100 dark:active:bg-zinc-800"
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
  );
}
