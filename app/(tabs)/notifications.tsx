import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-zinc-900">
      <View className="flex-1 items-center justify-center">
        <Ionicons name="notifications-outline" size={64} color="#9ca3af" />
        <Text className="text-gray-500 text-lg mt-4">Notifications</Text>
        <Text className="text-gray-400 text-sm mt-2">Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
}
