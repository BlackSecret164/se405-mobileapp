import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ProfileHeader } from '../../components/ProfileHeader'; 
import { fetchUserPosts, fetchUserProfile } from '../../services/userApi';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;

export default function DynamicProfileScreen() {
  const { id } = useLocalSearchParams();
  const userId = Number(id);

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [profileData, postsData] = await Promise.all([
          fetchUserProfile(userId),
          fetchUserPosts(userId),
        ]);
        setProfile(profileData);
        setPosts(postsData);
      } catch (err) {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  if (loading) return <ActivityIndicator size="large" style={styles.centered} color="#000" />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>@{profile?.username}</Text>
      </View>
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        ListHeaderComponent={<ProfileHeader profile={profile} />}
        renderItem={({ item }) => (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.thumbnail_url }}
              style={styles.gridImage} 
              resizeMode="cover" 
            />
            {item.media_count > 1 && <View style={styles.multiBadge} />}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center' },
  header: { height: 50, justifyContent: 'center', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerText: { fontSize: 16, fontWeight: 'bold' },
  imageContainer: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderWidth: 0.5, borderColor: '#fff' },
  gridImage: { width: '100%', height: '100%' },
  multiBadge: { position: 'absolute', top: 5, right: 5, width: 10, height: 10, backgroundColor: 'white', borderRadius: 2 }
});