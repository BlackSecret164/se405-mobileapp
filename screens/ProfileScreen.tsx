import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  ActivityIndicator, 
  Dimensions, 
  FlatList, 
  Image, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  View,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';
// Sử dụng các đối tượng API mới từ AnhNT
import { usersAPI, postsAPI } from '../services/userApi';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;

const ProfileScreen = () => {
  const { id } = useLocalSearchParams();
  const userId = id ? Number(id) : 1; 
  const router = useRouter(); 

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Tải dữ liệu ban đầu
  const loadData = async (isRefreshing = false) => {
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
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Logic Tải thêm (Infinite Scroll) dùng Cursor
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !nextCursor) return;

    setIsLoadingMore(true);
    try {
      const response = await postsAPI.getUserPosts(userId, nextCursor);
      const newData = response.data;
      
      setPosts(prevPosts => [...prevPosts, ...(newData.posts || [])]);
      setNextCursor(newData.next_cursor || null);
      setHasMore(newData.has_more);
    } catch (err) {
      console.error('Failed to load more posts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [userId]);

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
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>{profile?.username || 'Profile'}</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListHeaderComponent={<ProfileHeader profile={{...profile, id: userId}} />}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  gridItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  gridImage: { width: '100%', height: '100%' },
  footerLoader: { paddingVertical: 20, alignItems: 'center' },
  multiMediaBadge: { position: 'absolute', top: 8, right: 8 },
  multiMediaIcon: {
    width: 14,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 2,
  }
});

export default ProfileScreen;