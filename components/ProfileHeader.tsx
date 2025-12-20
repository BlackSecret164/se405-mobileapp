import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileHeaderProps {
  profile: {
    avatar_url: string;
    display_name: string;
    username: string;
    bio?: string | null;
    follower_count: number;
    following_count: number;
    post_count: number;
  };
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Avatar + Stats */}
      <View style={styles.topSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBorder}>
            <Image
              source={{ uri: profile.avatar_url }}
              style={styles.avatar}
            />
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.post_count}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.follower_count}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.following_count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioName}>{profile.display_name}</Text>
        {profile.bio ? (
          <Text style={styles.bioText}>{profile.bio}</Text>
        ) : null}
      </View>

      {/* Edit Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          onPress={() => router.push('/edit-profile' as Href)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.activeTab}>
          <Ionicons name="grid-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarWrapper: {
    marginRight: 16,
  },
  avatarBorder: {
    padding: 2,
    borderRadius: 999, 
    borderWidth: 1,
    borderColor: '#d1d5db', 
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#111827', 
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bioName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#000',
  },
  bioText: {
    color: '#000',
    fontSize: 14,
    marginTop: 2,
  },
  linkText: {
    color: '#2563eb', 
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  editButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  activeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
});