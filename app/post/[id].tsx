import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, ActivityIndicator, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/notificationApi'; // Hoặc file chứa fetchPostDetail

const { width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await apiService.fetchPostDetail(Number(id));
        setPost(response);
      } catch (error) {
        console.error("Lỗi tải bài viết:", error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id]);

  if (loading) return <ActivityIndicator style={styles.centered} color="#000" />;
  if (!post) return <View style={styles.centered}><Text>Bài viết không tồn tại</Text></View>;

  return (
    <ScrollView style={styles.container}>
      {/* Author Section */}
      <TouchableOpacity style={styles.author} onPress={() => router.push(`/profile/${post.author?.id}` as any)}>
        <Image source={{ uri: post.author?.avatar_url }} style={styles.avatar} />
        <Text style={styles.username}>{post.author?.display_name || post.author?.username}</Text>
      </TouchableOpacity>

      {/* Media Carousel */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {post.media?.map((m: any) => (
          <Image key={m.id} source={{ uri: m.media_url }} style={styles.mainImage} />
        ))}
      </ScrollView>

      {/* Actions & Caption */}
      <View style={styles.content}>
        <View style={styles.actions}>
          <Ionicons name={post.is_liked ? "heart" : "heart-outline"} size={26} color={post.is_liked ? "red" : "black"} />
          <Ionicons name="chatbubble-outline" size={24} style={{ marginLeft: 15 }} />
        </View>
        <Text style={styles.likes}>{post.like_count} lượt thích</Text>
        <Text style={styles.caption}>
          <Text style={{ fontWeight: 'bold' }}>{post.author?.username} </Text>
          {post.caption}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  author: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  username: { fontWeight: 'bold' },
  mainImage: { width: width, height: width },
  content: { padding: 10 },
  actions: { flexDirection: 'row', marginBottom: 10 },
  likes: { fontWeight: 'bold', marginBottom: 5 },
  caption: { fontSize: 14, lineHeight: 18 }
});