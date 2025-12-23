import "../global.css";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { initAuth } from "@/services/api";
import { setupPushNotifications } from "@/services/notificationApi";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // 1. Initialize Auth: Restore session from SecureStore
    initAuth();

    // 2. Setup push notifications
    setupPushNotifications();

    // 3. Listen for notification received (for debugging - to verify notifications arrive)
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Notification received:", notification);
        console.log("📋 Notification content:", notification.request.content);
      }
    );

    // 4. Listen for notification tap (Deep Linking)
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification tapped:", data);

        if (data.type === "follow" && data.actor_id) {
          router.push({
            pathname: "/profile/[id]" as any,
            params: { id: data.actor_id.toString() },
          });
        } else if (data.post_id) {
          router.push({
            pathname: "/post/[id]" as any,
            params: { id: data.post_id.toString() },
          });
        }
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <NotificationProvider>
              <Stack screenOptions={{ headerShown: false }}>
                {/* Root index - handles initial routing */}
                <Stack.Screen name="index" />

                {/* Auth screens */}
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="welcome" />
                <Stack.Screen name="follow-first" />

                {/* Main tabs */}
                <Stack.Screen name="(tabs)" />

                {/* Dynamic routes for Profile/Post/Follow List */}
                <Stack.Screen
                  name="profile/[id]"
                  options={{ headerShown: true, title: "Profile" }}
                />
                <Stack.Screen
                  name="post/[id]"
                  options={{ headerShown: true, title: "Post" }}
                />
                <Stack.Screen
                  name="follow-list/[id]"
                  options={{ headerShown: true, title: "Follow List" }}
                />

                {/* Modal and edit screens */}
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="edit-profile"
                  options={{ headerShown: true, title: "Edit Profile" }}
                />

                {/* Search screen */}
                <Stack.Screen name="search" />
              </Stack>
              <StatusBar style="auto" />
            </NotificationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
