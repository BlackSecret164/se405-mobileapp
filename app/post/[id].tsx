import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// SỬA TẠI ĐÂY: Import postsAPI từ userApi thay vì apiService từ notificationApi
import { postsAPI } from '../../services/userApi'; 

const { width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        // Sử dụng postsAPI.getPostDetail và truy cập dữ liệu qua .data của Axios
        const response = await postsAPI.getPostDetail(Number(id));
        setPost(response.data); 
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#000" /></View>;
  if (!post) return <View style={styles.centered}><Text>Bài viết không tồn tại</Text></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Author Section */}
      <TouchableOpacity 
        style={styles.author} 
        onPress={() => router.push(`/profile/${post.author?.id}` as any)}
      >
        <Image 
          source={{ uri: post.author?.avatar_url || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <Text style={styles.username}>{post.author?.display_name || post.author?.username}</Text>
      </TouchableOpacity>

      {/* Media Carousel */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {post.media && post.media.length > 0 ? (
          post.media.map((m: any) => (
            <Image key={m.id} source={{ uri: m.media_url }} style={styles.mainImage} />
          ))
        ) : (
          <Image source={{ uri: post.thumbnail_url }} style={styles.mainImage} />
        )}
      </ScrollView>

      {/* Actions & Caption */}
      <View style={styles.content}>
        <View style={styles.actions}>
          <Ionicons 
            name={post.is_liked ? "heart" : "heart-outline"} 
            size={26} 
            color={post.is_liked ? "red" : "black"} 
          />
          <Ionicons name="chatbubble-outline" size={24} style={{ marginLeft: 15 }} />
        </View>
        <Text style={styles.likes}>{post.like_count || 0} lượt thích</Text>
        <Text style={styles.caption}>
          <Text style={{ fontWeight: 'bold' }}>{post.author?.username} </Text>
          {post.caption}
        </Text>
        <Text style={styles.timeText}>
          {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  author: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: 'bold', fontSize: 14 },
  mainImage: { width: width, height: width },
  content: { padding: 12 },
  actions: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  likes: { fontWeight: 'bold', marginBottom: 5, fontSize: 14 },
  caption: { fontSize: 14, lineHeight: 20 },
  timeText: { color: '#8e8e8e', fontSize: 11, marginTop: 8, textTransform: 'uppercase' }
});