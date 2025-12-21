import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search users...",
}: SearchBarProps) {
  return (
    <View className="px-4 py-2 bg-white dark:bg-zinc-900">
      <View className="flex-row items-center bg-gray-100 dark:bg-zinc-800 rounded-xl px-3 py-2">
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          className="flex-1 ml-2 text-black dark:text-white text-base"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color="#9ca3af"
            onPress={() => onChangeText("")}
          />
        )}
      </View>
    </View>
  );
}
