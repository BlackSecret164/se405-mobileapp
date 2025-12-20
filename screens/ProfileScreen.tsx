
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';
import { fetchUserPosts, fetchUserProfile } from '../services/userApi';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;

const USER_ID = 1; // TODO: Replace with dynamic userId (from navigation params or auth)

const ProfileScreen = () => {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, postsData] = await Promise.all([
          fetchUserProfile(USER_ID),
          fetchUserPosts(USER_ID),
        ]);
        setProfile(profileData);
        setPosts(postsData);
      } catch (err: any) {
        setError('Failed to load profile');
        Alert.alert('Error', err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red', fontSize: 16 }}>{error || 'Profile not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerText}>{profile.username}</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={<ProfileHeader profile={profile} />}
        renderItem={({ item }) => (
          <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderWidth: 1, borderColor: '#fff' }}>
            <Image
              source={{ uri: item.image }}
              style={styles.gridImage}
              resizeMode="cover"
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProfileScreen;