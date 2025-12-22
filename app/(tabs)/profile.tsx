import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    console.log("[ProfileScreen] Logout button pressed");
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          console.log("[ProfileScreen] User confirmed logout");
          await logout();
          console.log("[ProfileScreen] Logout completed, navigating to /");
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="person-circle-outline" size={80} color="#9ca3af" />

        {currentUser && (
          <View className="mt-4 items-center">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {currentUser.display_name}
            </Text>
            <Text className="text-gray-500 mt-1">@{currentUser.username}</Text>
          </View>
        )}

        <Text className="text-gray-400 text-sm mt-4">
          Profile page coming soon...
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 bg-red-500 px-8 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
