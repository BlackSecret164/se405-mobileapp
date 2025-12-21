import { useColorScheme } from "@/hooks/use-color-scheme";
import { ApiCommentWithReplies } from "@/types/comment";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { TextInput } from "react-native-gesture-handler";

interface CommentInputProps {
  replyingTo: ApiCommentWithReplies | null;
  onCancelReply: () => void;
  onSubmit: (content: string, parentCommentId: number | null) => void;
  isSubmitting?: boolean;
}

export interface CommentInputRef {
  focus: () => void;
}

export const CommentInput = memo(
  forwardRef<CommentInputRef, CommentInputProps>(function CommentInput(
    { replyingTo, onCancelReply, onSubmit, isSubmitting = false },
    ref
  ) {
    const colorScheme = useColorScheme();
    const inputRef = useRef<TextInput>(null);
    const [text, setText] = useState("");

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    const iconColor = colorScheme === "dark" ? "#ECEDEE" : "#11181C";
    const placeholderColor = colorScheme === "dark" ? "#9BA1A6" : "#687076";
    const sendColor =
      text.trim() && !isSubmitting ? "#0a7ea4" : placeholderColor;

    const handleSubmit = useCallback(() => {
      if (!text.trim() || isSubmitting) return;

      onSubmit(text.trim(), replyingTo?.id || null);
      setText("");
    }, [text, replyingTo, onSubmit, isSubmitting]);

    const handleCancelReply = useCallback(() => {
      onCancelReply();
    }, [onCancelReply]);

    return (
      <View className="border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        {/* Replying To Banner */}
        {replyingTo && (
          <View className="flex-row items-center justify-between px-4 py-2 bg-gray-100 dark:bg-zinc-800">
            <Text className="text-gray-600 dark:text-gray-400 text-sm">
              Replying to{" "}
              <Text className="font-semibold">
                @{replyingTo.author.username}
              </Text>
            </Text>
            <Pressable onPress={handleCancelReply} hitSlop={12}>
              <Ionicons name="close" size={18} color={iconColor} />
            </Pressable>
          </View>
        )}

        {/* Input Row */}
        <View className="flex-row items-center px-4 py-3">
          <BottomSheetTextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={
              replyingTo
                ? `Reply to @${replyingTo.author.username}...`
                : "Add a comment..."
            }
            placeholderTextColor={placeholderColor}
            className="flex-1 text-black dark:text-white text-base py-2 px-4 bg-gray-100 dark:bg-zinc-800 rounded-full"
            multiline
            maxLength={2200}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
            editable={!isSubmitting}
          />

          {/* Send Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!text.trim() || isSubmitting}
            className="ml-3 p-2"
            hitSlop={8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : (
              <Ionicons name="send" size={24} color={sendColor} />
            )}
          </Pressable>
        </View>
      </View>
    );
  })
);
