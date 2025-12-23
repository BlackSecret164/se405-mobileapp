import { CommentSheet, CommentSheetRef } from "@/components/comments";
import { likePost, unlikePost } from "@/services/feed-service";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { postsAPI } from "../../services/api";

const { width } = Dimensions.get("window");

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Interactive state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  // Comment sheet ref
  const commentSheetRef = useRef<CommentSheetRef>(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await postsAPI.getPostDetail(Number(id));
        const data = response.data;
        setPost(data);
        // Initialize interactive state from fetched data
        setIsLiked(data.is_liked ?? false);
        setLikeCount(data.like_count ?? 0);
        setCommentCount(data.comment_count ?? 0);
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  const handleLikePress = useCallback(async () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikeCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    try {
      if (newIsLiked) {
        await likePost(Number(id));
      } else {
        await unlikePost(Number(id));
      }
    } catch (error) {
      // Revert on error
      console.error("Failed to toggle like:", error);
      setIsLiked(!newIsLiked);
      setLikeCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
    }
  }, [id, isLiked]);

  const handleCommentPress = useCallback(() => {
    commentSheetRef.current?.open(Number(id));
  }, [id]);

  const handleCommentCountChange = useCallback(
    (postId: number, delta: number) => {
      setCommentCount((prev) => Math.max(0, prev + delta));
    },
    []
  );

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  if (!post)
    return (
      <View style={styles.centered}>
        <Text>Post not found</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Author Section */}
        <Pressable
          style={styles.author}
          onPress={() => router.push(`/profile/${post.author?.id}` as any)}
        >
          <Image
            source={{
              uri: post.author?.avatar_url || "https://via.placeholder.com/150",
            }}
            style={styles.avatar}
          />
          <Text style={styles.username}>
            {post.author?.display_name || post.author?.username}
          </Text>
        </Pressable>

        {/* Media Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {post.media && post.media.length > 0 ? (
            post.media.map((m: any) => (
              <Image
                key={m.id}
                source={{ uri: m.media_url }}
                style={styles.mainImage}
              />
            ))
          ) : (
            <Image
              source={{ uri: post.thumbnail_url }}
              style={styles.mainImage}
            />
          )}
        </ScrollView>

        {/* Actions Row */}
        <View style={styles.content}>
          <View style={styles.actions}>
            {/* Like Button */}
            <Pressable onPress={handleLikePress} style={styles.actionButton}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={26}
                color={isLiked ? "#ef4444" : "#000"}
              />
            </Pressable>
            <Text style={styles.countText}>{formatNumber(likeCount)}</Text>

            {/* Comment Button */}
            <Pressable onPress={handleCommentPress} style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#000" />
            </Pressable>
            <Text style={styles.countText}>{formatNumber(commentCount)}</Text>
          </View>

          {/* Caption */}
          <Text style={styles.caption}>
            <Text style={{ fontWeight: "bold" }}>{post.author?.username} </Text>
            {post.caption}
          </Text>

          {/* Date */}
          <Text style={styles.timeText}>
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString("en-US")
              : ""}
          </Text>
        </View>
      </ScrollView>

      {/* Comment Sheet */}
      <CommentSheet
        ref={commentSheetRef}
        postId={null}
        onCommentCountChange={handleCommentCountChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  author: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: "bold", fontSize: 14 },
  mainImage: { width: width, height: width },
  content: { padding: 12 },
  actions: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  actionButton: { padding: 4 },
  countText: {
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 4,
    marginRight: 16,
  },
  caption: { fontSize: 14, lineHeight: 20, marginBottom: 4 },
  timeText: {
    color: "#8e8e8e",
    fontSize: 11,
    marginTop: 8,
    textTransform: "uppercase",
  },
});
