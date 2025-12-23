import React from "react";
import { TextInput, View } from "react-native";

interface CaptionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function CaptionInput({
  value,
  onChangeText,
  placeholder = "What's on your mind?",
  maxLength = 2200,
}: CaptionInputProps) {
  return (
    <View className="px-4 py-3">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline
        maxLength={maxLength}
        className="text-base text-zinc-900 dark:text-zinc-100 min-h-[100px]"
        style={{ textAlignVertical: "top" }}
      />
    </View>
  );
}
