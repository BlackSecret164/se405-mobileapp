// app/follow-list/[id].tsx
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { fetchFollowers, fetchFollowing } from '../../services/userApi';

const FollowListScreen = () => {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (currentCursor: string | null = null, isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else if (currentCursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const userId = Number(id);
      const data = type === 'followers' 
        ? await fetchFollowers(userId, currentCursor) 
        : await fetchFollowing(userId, currentCursor);
      
      setUsers(prev => currentCursor ? [...prev, ...data.users] : data.users);
      setCursor(data.cursor);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [id, type]);

  const onEndReached = () => {
    if (hasMore && !loadingMore && cursor) {
      loadData(cursor);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: type === 'followers' ? 'Followers' : 'Following' }} />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(null, true)} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.userCard}
            onPress={() => router.push(`/profile/${item.id}` as any)}
          >
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
            <View>
              <Text style={styles.displayName}>{item.display_name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 20 }} /> : null}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  displayName: { fontWeight: 'bold', fontSize: 16 },
  username: { color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default FollowListScreen;