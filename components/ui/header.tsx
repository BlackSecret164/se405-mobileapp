import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

interface HeaderProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  onLogoPress?: () => void;
}

/**
 * Instagram-style header component
 * - Logo "Instagram" centered (tappable to scroll to top and refresh)
 * - Search icon on the right (navigates to /search)
 * - Optional back button on the left
 */
export function Header({
  showBackButton = false,
  onBackPress,
  onLogoPress,
}: HeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#ECEDEE" : "#11181C";

  const handleSearchPress = () => {
    router.push("/search");
  };

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
      {/* Left: Back button or empty space */}
      <View className="w-10">
        {showBackButton && (
          <Pressable onPress={handleBackPress} hitSlop={8}>
            <Ionicons name="chevron-back" size={28} color={iconColor} />
          </Pressable>
        )}
      </View>

      {/* Center: Instagram logo (tappable) */}
      <Pressable onPress={onLogoPress} hitSlop={8}>
        <Text
          className="text-2xl text-black dark:text-white"
          style={{
            fontFamily: "System",
            fontStyle: "italic",
            fontWeight: "600",
          }}
        >
          Iamstagram
        </Text>
      </Pressable>

      {/* Right: Search button */}
      <View className="w-10 items-end">
        <Pressable onPress={handleSearchPress} hitSlop={8}>
          <Ionicons name="search-outline" size={24} color={iconColor} />
        </Pressable>
      </View>
    </View>
  );
}
