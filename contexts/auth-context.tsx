import React, { createContext, ReactNode, useContext } from "react";

// Temporary hardcoded user for development (alice)
// TODO: Replace with real auth flow later
const TEMP_CURRENT_USER = {
  id: 1,
  username: "alice",
  display_name: "Alice Wonder",
  avatar_url: "https://i.pravatar.cc/150?u=alice",
};

interface CurrentUser {
  id: number;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        currentUser: TEMP_CURRENT_USER,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
