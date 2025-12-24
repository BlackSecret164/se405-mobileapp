// contexts/ProfileSyncContext.tsx
import React, { createContext, useCallback, useContext, useState } from "react";

// Type cho post mới được thêm vào
export interface NewPost {
  id: number;
  thumbnail_url: string;
  media_count: number;
}

interface ProfileSyncContextType {
  // === Following sync ===
  followingDelta: number;
  incrementFollowing: () => void;
  decrementFollowing: () => void;

  // === Post sync ===
  postDelta: number;
  newPosts: NewPost[];
  addNewPost: (post: NewPost) => void;
  removePost: (postId: number) => void;

  // === Reset all ===
  resetAll: () => void;
}

const ProfileSyncContext = createContext<ProfileSyncContextType | undefined>(
  undefined
);

export function ProfileSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Following delta
  const [followingDelta, setFollowingDelta] = useState(0);
  // Post delta và new posts
  const [postDelta, setPostDelta] = useState(0);
  const [newPosts, setNewPosts] = useState<NewPost[]>([]);

  const incrementFollowing = useCallback(() => {
    setFollowingDelta((prev) => prev + 1);
  }, []);

  const decrementFollowing = useCallback(() => {
    setFollowingDelta((prev) => prev - 1);
  }, []);

  const addNewPost = useCallback((post: NewPost) => {
    setPostDelta((prev) => prev + 1);
    setNewPosts((prev) => [post, ...prev]); // Thêm vào đầu
  }, []);

  const removePost = useCallback((postId: number) => {
    setPostDelta((prev) => prev - 1);
    // Xóa khỏi newPosts nếu tồn tại
    setNewPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const resetAll = useCallback(() => {
    setFollowingDelta(0);
    setPostDelta(0);
    setNewPosts([]);
  }, []);

  return (
    <ProfileSyncContext.Provider
      value={{
        followingDelta,
        incrementFollowing,
        decrementFollowing,
        postDelta,
        newPosts,
        addNewPost,
        removePost,
        resetAll,
      }}
    >
      {children}
    </ProfileSyncContext.Provider>
  );
}

export function useProfileSync() {
  const context = useContext(ProfileSyncContext);
  if (!context) {
    throw new Error("useProfileSync must be used within ProfileSyncProvider");
  }
  return context;
}

// Backward compatibility - alias for existing code using useFollowContext
export const useFollowContext = useProfileSync;
