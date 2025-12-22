import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  ActivityIndicator, Alert, Dimensions, FlatList, 
  Image, SafeAreaView, StyleSheet, Text, View, TouchableOpacity 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ProfileHeader } from '../../components/ProfileHeader'; 
// Thay thế các import cũ bằng các đối tượng API mới
import { usersAPI, postsAPI } from '../../services/userApi';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;

export default function DynamicProfileScreen() {
  const { id } = useLocalSearchParams();
  const userId = Number(id);
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        // Sử dụng cấu trúc gọi hàm mới và truy cập dữ liệu qua .data của Axios
        const [profileRes, postsRes] = await Promise.all([
          usersAPI.getProfile(userId),
          postsAPI.getUserPosts(userId),
        ]);
        
        setProfile(profileRes.data);
        // postsRes.data chứa { posts, next_cursor, has_more }
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error("Profile Load Error:", err);
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header hiển thị Username */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {profile?.username ? `@${profile.username}` : 'Profile'}
        </Text>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        // Truyền profile kèm ID để ProfileHeader xử lý điều hướng follow-list
        ListHeaderComponent={<ProfileHeader profile={{ ...profile, id: userId }} />}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.imageContainer}
            activeOpacity={0.8}
            onPress={() => router.push(`/post/${item.id}` as any)}
          >
            <Image 
              source={{ uri: item.thumbnail_url }} // Sử dụng đúng field từ backend
              style={styles.gridImage} 
              resizeMode="cover" 
            />
            {/* Hiển thị icon nếu là bài viết nhiều phương tiện */}
            {item.media_count > 1 && (
              <View style={styles.multiBadge}>
                <View style={styles.multiIcon} />
              </View>
            )}
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
    backgroundColor: '#fff' 
  },
  headerText: { fontSize: 16, fontWeight: 'bold' },
  imageContainer: { 
    width: IMAGE_SIZE, 
    height: IMAGE_SIZE, 
    borderWidth: 0.5, 
    borderColor: '#fff' 
  },
  gridImage: { width: '100%', height: '100%' },
  multiBadge: { 
    position: 'absolute', 
    top: 8, 
    right: 8 
  },
  multiIcon: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 2
  }
});