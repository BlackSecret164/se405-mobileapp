import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ApiComment,
  createComment,
  deleteComment,
  getComments,
} from "@/services/comment-service";
import { ApiCommentWithReplies } from "@/types/comment";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetFooter,
  BottomSheetFooterProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
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
  onCommentCountChange?: (postId: number, delta: number) => void;
}

export interface CommentSheetRef {
  open: (postId: number) => void;
  close: () => void;
}

export const CommentSheet = forwardRef<CommentSheetRef, CommentSheetProps>(
  function CommentSheet({ onCommentCountChange }, ref) {
    const { currentUser } = useAuth();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const inputRef = useRef<CommentInputRef>(null);
    const [currentPostId, setCurrentPostId] = useState<number | null>(null);
    const [comments, setComments] = useState<ApiCommentWithReplies[]>([]);
    const [replyingTo, setReplyingTo] = useState<ApiCommentWithReplies | null>(
      null
    );
    const [isLoading, setIsLoading] = useState(false);
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

    // Helper function to organize flat comments into nested structure
    const organizeComments = useCallback(
      (flatComments: ApiComment[]): ApiCommentWithReplies[] => {
        const commentMap = new Map<number, ApiCommentWithReplies>();
        const topLevelComments: ApiCommentWithReplies[] = [];

        // First pass: create all comment objects with empty replies
        flatComments.forEach((comment) => {
          commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: organize into parent-child relationships
        flatComments.forEach((comment) => {
          const commentWithReplies = commentMap.get(comment.id)!;
          if (comment.parent_comment_id) {
            const parent = commentMap.get(comment.parent_comment_id);
            if (parent) {
              parent.replies = parent.replies || [];
              parent.replies.push(commentWithReplies);
            } else {
              // Parent not found, treat as top-level
              topLevelComments.push(commentWithReplies);
            }
          } else {
            topLevelComments.push(commentWithReplies);
          }
        });

        return topLevelComments;
      },
      []
    );

    // Fetch comments from API
    const fetchComments = useCallback(
      async (postId: number) => {
        setIsLoading(true);
        try {
          const response = await getComments(postId);
          const organizedComments = organizeComments(response.comments);
          setComments(organizedComments);
        } catch (error) {
          console.error("Failed to fetch comments:", error);
          setComments([]);
        } finally {
          setIsLoading(false);
        }
      },
      [organizeComments]
    );

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      open: (postId: number) => {
        setCurrentPostId(postId);
        setComments([]); // Clear old comments immediately to prevent flash
        setReplyingTo(null);
        setExpandedComments(new Set());
        setVisibleRepliesCounts(new Map());
        fetchComments(postId);
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

    const handleReply = useCallback((comment: ApiCommentWithReplies) => {
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
      async (content: string, parentCommentId: number | null) => {
        if (!currentPostId) return;

        try {
          const newComment = await createComment(
            currentPostId,
            content,
            parentCommentId
          );

          const newCommentWithReplies: ApiCommentWithReplies = {
            ...newComment,
            replies: [],
          };

          if (parentCommentId) {
            // Add as reply to existing comment
            setComments((prev) =>
              prev.map((comment) => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: [
                      ...(comment.replies || []),
                      newCommentWithReplies,
                    ],
                  };
                }
                return comment;
              })
            );
            // Auto-expand the parent comment to show the new reply
            setExpandedComments((prev) => new Set(prev).add(parentCommentId));
          } else {
            // Add as new top-level comment
            setComments((prev) => [newCommentWithReplies, ...prev]);
          }

          // Update comment count on post
          onCommentCountChange?.(currentPostId, 1);

          // Clear reply state
          setReplyingTo(null);
        } catch (error) {
          console.error("Failed to create comment:", error);
        }
      },
      [currentPostId, onCommentCountChange]
    );

    const handleDeleteComment = useCallback(
      async (commentId: number) => {
        if (!currentPostId) return;

        try {
          await deleteComment(currentPostId, commentId);

          // Remove comment from state (check both top-level and replies)
          setComments((prev) => {
            // First, try to remove from top-level comments
            const filteredComments = prev.filter((c) => c.id !== commentId);

            // If length changed, it was a top-level comment
            if (filteredComments.length !== prev.length) {
              return filteredComments;
            }

            // Otherwise, it might be a reply - remove from replies
            return prev.map((comment) => ({
              ...comment,
              replies: comment.replies?.filter((r) => r.id !== commentId) || [],
            }));
          });

          // Update comment count on post
          onCommentCountChange?.(currentPostId, -1);
        } catch (error) {
          console.error("Failed to delete comment:", error);
        }
      },
      [currentPostId, onCommentCountChange]
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
      ({ item }: { item: ApiCommentWithReplies }) => (
        <CommentItem
          comment={item}
          onReply={handleReply}
          onDelete={handleDeleteComment}
          currentUserId={currentUser?.id}
          isExpanded={expandedComments.has(item.id)}
          onToggleReplies={handleToggleReplies}
          visibleRepliesCount={visibleRepliesCounts.get(item.id) || 5}
          onLoadMoreReplies={handleLoadMoreReplies}
        />
      ),
      [
        handleReply,
        handleDeleteComment,
        currentUser?.id,
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
          keyExtractor={(item: ApiCommentWithReplies) => item.id.toString()}
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
