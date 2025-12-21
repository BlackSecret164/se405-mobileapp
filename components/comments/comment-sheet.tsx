import { getCommentsForPost } from "@/data/mock-comments";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Comment, CommentWithReplies } from "@/types/comment";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CommentInput, CommentInputRef } from "./comment-input";
import { CommentItem } from "./comment-item";

interface CommentSheetProps {
  postId: number | null;
}

export interface CommentSheetRef {
  open: (postId: number) => void;
  close: () => void;
}

export const CommentSheet = forwardRef<CommentSheetRef, CommentSheetProps>(
  function CommentSheet(_, ref) {
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const inputRef = useRef<CommentInputRef>(null);
    const [currentPostId, setCurrentPostId] = useState<number | null>(null);
    const [comments, setComments] = useState<CommentWithReplies[]>([]);
    const [replyingTo, setReplyingTo] = useState<CommentWithReplies | null>(
      null
    );
    const [expandedComments, setExpandedComments] = useState<Set<number>>(
      new Set()
    );
    const [visibleRepliesCounts, setVisibleRepliesCounts] = useState<
      Map<number, number>
    >(new Map());

    const snapPoints = useMemo(() => ["60%", "90%"], []);

    const iconColor = colorScheme === "dark" ? "#ECEDEE" : "#11181C";
    const backgroundColor = colorScheme === "dark" ? "#18181b" : "#ffffff";
    const handleIndicatorColor = colorScheme === "dark" ? "#71717a" : "#d4d4d8";

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      open: (postId: number) => {
        setCurrentPostId(postId);
        setComments(getCommentsForPost(postId));
        setReplyingTo(null);
        setExpandedComments(new Set());
        setVisibleRepliesCounts(new Map());
        bottomSheetRef.current?.present();
      },
      close: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    const handleClose = useCallback(() => {
      Keyboard.dismiss();
      bottomSheetRef.current?.dismiss();
    }, []);

    const handleReply = useCallback((comment: CommentWithReplies) => {
      setReplyingTo(comment);
      // Focus input after a short delay to allow state update
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, []);

    const handleCancelReply = useCallback(() => {
      setReplyingTo(null);
    }, []);

    const handleToggleReplies = useCallback((commentId: number) => {
      setExpandedComments((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(commentId)) {
          newSet.delete(commentId);
          // Reset visible count when collapsing
          setVisibleRepliesCounts((prevCounts) => {
            const newCounts = new Map(prevCounts);
            newCounts.delete(commentId);
            return newCounts;
          });
        } else {
          newSet.add(commentId);
        }
        return newSet;
      });
    }, []);

    const handleLoadMoreReplies = useCallback((commentId: number) => {
      setVisibleRepliesCounts((prev) => {
        const newCounts = new Map(prev);
        const currentCount = newCounts.get(commentId) || 5;
        newCounts.set(commentId, currentCount + 5);
        return newCounts;
      });
    }, []);

    const handleSubmitComment = useCallback(
      (content: string, parentCommentId: number | null) => {
        // Create a new mock comment
        const newComment: Comment = {
          id: Date.now(),
          user: {
            id: 999,
            username: "current_user",
            display_name: "You",
            avatar_url: "https://i.pravatar.cc/150?img=68",
          },
          content,
          created_at: new Date().toISOString(),
          parent_comment_id: parentCommentId,
          reply_count: 0,
          replies: [],
        };

        if (parentCommentId) {
          // Add as reply to existing comment
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === parentCommentId) {
                return {
                  ...comment,
                  reply_count: comment.reply_count + 1,
                  replies: [...(comment.replies || []), newComment],
                };
              }
              return comment;
            })
          );
        } else {
          // Add as new top-level comment
          setComments((prev) => [newComment, ...prev]);
        }

        // Clear reply state
        setReplyingTo(null);
      },
      []
    );

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const renderComment = useCallback(
      ({ item }: { item: Comment }) => (
        <CommentItem
          comment={item}
          onReply={handleReply}
          isExpanded={expandedComments.has(item.id)}
          onToggleReplies={handleToggleReplies}
          visibleRepliesCount={visibleRepliesCounts.get(item.id) || 5}
          onLoadMoreReplies={handleLoadMoreReplies}
        />
      ),
      [
        handleReply,
        expandedComments,
        handleToggleReplies,
        visibleRepliesCounts,
        handleLoadMoreReplies,
      ]
    );

    const renderHeader = useCallback(
      () => (
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-zinc-800">
          <View className="w-8" />
          <Text className="text-base font-semibold text-black dark:text-white">
            Comments
          </Text>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={iconColor} />
          </Pressable>
        </View>
      ),
      [handleClose, iconColor]
    );

    const renderEmpty = useCallback(
      () => (
        <View className="flex-1 items-center justify-center py-20">
          <Ionicons
            name="chatbubble-outline"
            size={48}
            color={colorScheme === "dark" ? "#71717a" : "#a1a1aa"}
          />
          <Text className="text-gray-500 dark:text-gray-400 text-base mt-4">
            No comments yet
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Be the first to comment!
          </Text>
        </View>
      ),
      [colorScheme]
    );

    const renderFooter = useCallback(
      (props: BottomSheetFooterProps) => (
        <BottomSheetFooter {...props} bottomInset={0}>
          <View
            style={{
              backgroundColor,
              paddingBottom: insets.bottom,
            }}
          >
            <CommentInput
              ref={inputRef}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
              onSubmit={handleSubmitComment}
            />
          </View>
        </BottomSheetFooter>
      ),
      [
        replyingTo,
        handleCancelReply,
        handleSubmitComment,
        insets.bottom,
        backgroundColor,
      ]
    );

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        footerComponent={renderFooter}
        handleIndicatorStyle={{ backgroundColor: handleIndicatorColor }}
        backgroundStyle={{ backgroundColor }}
        enablePanDownToClose={true}
        keyboardBehavior="extend"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        animateOnMount={true}
        enableDynamicSizing={false}
      >
        {/* Comments List */}
        <BottomSheetFlatList
          data={comments}
          keyExtractor={(item: Comment) => item.id.toString()}
          renderItem={renderComment}
          extraData={[expandedComments, visibleRepliesCounts]}
          contentContainerStyle={{
            paddingBottom: 80,
          }}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </BottomSheetModal>
    );
  }
);
