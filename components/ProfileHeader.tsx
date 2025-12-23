// components/ProfileHeader.tsx
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usersAPI } from "../services/api";

interface ProfileHeaderProps {
  profile: {
    id: number;
    avatar_url: string;
    display_name: string;
    username: string;
    bio?: string | null;
    follower_count: number;
    following_count: number;
    post_count: number;
    is_following?: boolean; // Trạng thái follow từ backend
  };
  isOwnProfile?: boolean; // true nếu đây là profile của mình
}

export const ProfileHeader = ({
  profile,
  isOwnProfile = false,
}: ProfileHeaderProps) => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(profile.is_following ?? false);
  const [followerCount, setFollowerCount] = useState(profile.follower_count);
  const [isLoading, setIsLoading] = useState(false);

  // Hàm helper để điều hướng đến danh sách follow
  const navigateToFollowList = (type: "followers" | "following") => {
    router.push({
      pathname: `/follow-list/${profile.id}`,
      params: { type },
    } as Href);
  };

  // Xử lý Follow/Unfollow
  const handleFollowToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isFollowing) {
        await usersAPI.unfollow(profile.id);
        setIsFollowing(false);
        setFollowerCount((prev) => prev - 1);
      } else {
        await usersAPI.follow(profile.id);
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Follow/Unfollow error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBorder}>
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
          </View>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.post_count}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>

          {/* Clickable Followers */}
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigateToFollowList("followers")}
          >
            <Text style={styles.statNumber}>{followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>

          {/* Clickable Following */}
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigateToFollowList("following")}
          >
            <Text style={styles.statNumber}>{profile.following_count}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bio */}
      <View style={styles.bioSection}>
        <Text style={styles.bioName}>{profile.display_name}</Text>
        {profile.bio ? <Text style={styles.bioText}>{profile.bio}</Text> : null}
      </View>
      {/* Action Buttons - only show for other users' profiles */}
      {!isOwnProfile && (
        <View style={styles.actionSection}>
          <TouchableOpacity
            onPress={handleFollowToggle}
            style={[
              styles.followButton,
              isFollowing ? styles.followingButton : styles.notFollowingButton,
            ]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator
                size="small"
                color={isFollowing ? "#000" : "#fff"}
              />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing
                    ? styles.followingButtonText
                    : styles.notFollowingButtonText,
                ]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

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
    backgroundColor: "#fff",
  },
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    borderColor: "#d1d5db",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  statsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  statLabel: {
    fontSize: 14,
    color: "#111827",
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bioName: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#000",
  },
  bioText: {
    color: "#000",
    fontSize: 14,
    marginTop: 2,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  editButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  editButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  followButton: {
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  notFollowingButton: {
    backgroundColor: "#3b82f6", // blue
  },
  followingButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  followButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  notFollowingButtonText: {
    color: "#fff",
  },
  followingButtonText: {
    color: "#000",
  },
  tabContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  activeTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
});
