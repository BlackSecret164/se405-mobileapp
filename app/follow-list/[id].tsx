import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usersAPI } from "../../services/api";

const FollowListScreen = () => {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (
    currentCursor: string | null = null,
    isRefreshing = false
  ) => {
    if (isRefreshing) setRefreshing(true);
    else if (currentCursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const userId = Number(id);
      // Gọi qua usersAPI và lấy dữ liệu từ res.data
      const res =
        type === "followers"
          ? await usersAPI.getFollowers(userId, currentCursor)
          : await usersAPI.getFollowing(userId, currentCursor);

      const data = res.data;
      setUsers((prev) =>
        currentCursor ? [...prev, ...data.users] : data.users
      );
      setCursor(data.cursor); // Cursor dạng RFC3339 timestamp
      setHasMore(data.has_more);
    } catch (err) {
      console.error("Error loading list:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, type]);

  const onEndReached = () => {
    // Chỉ load thêm nếu has_more là true và có cursor
    if (hasMore && !loadingMore && cursor) {
      loadData(cursor);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: type === "followers" ? "Followers" : "Following" }}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(null, true)}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userCard}
            onPress={() => router.push(`/profile/${item.id}` as any)}
          >
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
            {/* Hiển thị nút Follow tương ứng nếu cần */}
            {item.is_following ? (
              <View style={styles.followingBadge}>
                <Text style={styles.followingText}>Following</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ padding: 20 }} /> : null
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  avatar: { width: 54, height: 54, borderRadius: 27, marginRight: 15 },
  displayName: { fontWeight: "600", fontSize: 15 },
  username: { color: "#666", fontSize: 14 },
  emptyText: { color: "#999", fontSize: 15 },
  followingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
  },
  followingText: { fontSize: 13, fontWeight: "600" },
});

export default FollowListScreen;
