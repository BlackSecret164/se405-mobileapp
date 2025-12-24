import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProfileHeader } from "../components/ProfileHeader";
import { useAuth } from "../contexts/AuthContext";
import { useProfileSync } from "../contexts/FollowContext";
import { postsAPI, usersAPI } from "../services/api";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3;

const ProfileScreen = () => {
  const { id } = useLocalSearchParams();
  const { currentUser, logout } = useAuth();
  const { followingDelta, postDelta, newPosts, resetAll } = useProfileSync();
  // Nếu có id từ param thì dùng, không thì lấy id của user đang đăng nhập
  const userId = id ? Number(id) : currentUser?.id ?? 0;
  const isOwnProfile = userId === currentUser?.id;
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Handle logout - navigation is handled by AuthContext
  const handleLogout = async () => {
    await logout();
  };

  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Tải dữ liệu ban đầu
  const loadData = useCallback(
    async (isRefreshing = false) => {
      if (!userId) return;
      if (!isRefreshing) setLoading(true);
      try {
        // Gọi qua các đối tượng API mới và truy cập dữ liệu qua .data
        const [profileRes, postsRes] = await Promise.all([
          usersAPI.getProfile(userId),
          postsAPI.getUserPosts(userId, null),
        ]);

        setProfile(profileRes.data);

        const postsData = postsRes.data;
        setPosts(postsData.posts || []);
        setNextCursor(postsData.next_cursor || null);
        setHasMore(postsData.has_more);
      } catch (err) {
        console.error("Failed to load initial data:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  // 2. Logic Tải thêm (Infinite Scroll) dùng Cursor
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;

    setIsLoadingMore(true);
    try {
      const response = await postsAPI.getUserPosts(userId, nextCursor);
      const newData = response.data;

      setPosts((prevPosts) => [...prevPosts, ...(newData.posts || [])]);
      setNextCursor(newData.next_cursor || null);
      setHasMore(newData.has_more);
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load data một lần khi mount (không reload mỗi lần focus)
  useEffect(() => {
    loadData();
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Reset tất cả delta khi refresh vì sẽ có data mới từ server
    resetAll();
    loadData(true);
  }, [userId, resetAll]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <View style={styles.headerPlaceholder} />
        <Text style={styles.headerText}>{profile?.username || "Profile"}</Text>
        {isOwnProfile ? (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      <FlatList
        data={
          isOwnProfile && newPosts.length > 0
            ? [
                ...newPosts,
                // Filter out posts that already exist in newPosts to avoid duplicates
                ...posts.filter(
                  (post) => !newPosts.some((np) => np.id === post.id)
                ),
              ]
            : posts
        }
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListHeaderComponent={
          <ProfileHeader
            profile={{
              ...profile,
              id: userId,
              // Áp dụng delta vào following_count và post_count cho MyProfile
              following_count: isOwnProfile
                ? (profile?.following_count ?? 0) + followingDelta
                : profile?.following_count ?? 0,
              post_count: isOwnProfile
                ? (profile?.post_count ?? 0) + postDelta
                : profile?.post_count ?? 0,
            }}
            isOwnProfile={isOwnProfile}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.gridItem}
            activeOpacity={0.8}
            onPress={() => router.push(`/post/${item.id}` as any)}
          >
            <Image
              source={{ uri: item.thumbnail_url }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            {item.media_count > 1 && (
              <View style={styles.multiMediaBadge}>
                <View style={styles.multiMediaIcon} />
              </View>
            )}
          </TouchableOpacity>
        )}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: { width: 24 },
  logoutButton: { padding: 4 },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 0.5,
    borderColor: "#fff",
  },
  gridImage: { width: "100%", height: "100%" },
  footerLoader: { paddingVertical: 20, alignItems: "center" },
  multiMediaBadge: { position: "absolute", top: 8, right: 8 },
  multiMediaIcon: {
    width: 14,
    height: 14,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 2,
  },
});

export default ProfileScreen;
