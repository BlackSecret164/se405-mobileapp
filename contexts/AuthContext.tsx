import { authAPI, getAccessToken, initAuth } from "@/services/api";
import { registerPushToken } from "@/services/notificationApi";
import { router } from "expo-router";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// User type matching backend response
export interface User {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  is_new_user?: boolean;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
}

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLoggedIn = currentUser !== null;

  // Initialize auth on app start - check if we have a valid session
  useEffect(() => {
    const init = async () => {
      try {
        // Try to restore session from stored refresh token
        await initAuth();

        // If we have a token after initAuth, fetch user info
        const token = getAccessToken();
        if (token) {
          const res = await authAPI.me();
          setCurrentUser(res.data);

          // Register push token after session is restored (user is authenticated)
          await registerPushToken();
        }
      } catch (error) {
        // No valid session, user needs to login
        console.log("No valid session found");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const setUser = (user: User | null) => {
    setCurrentUser(user);
  };

  // For backward compatibility with existing code
  const login = () => {
    // This is handled by setUser now
  };

  const logout = async () => {
    console.log("[AuthContext] Logout started");
    try {
      await authAPI.logoutLocal();
      console.log("[AuthContext] logoutLocal completed");
    } catch (err) {
      console.error("[AuthContext] Logout error:", err);
    } finally {
      setCurrentUser(null);
      console.log("[AuthContext] User set to null");
      // Navigate to login screen
      router.replace("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isLoading,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
