import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

// Import các Context và Service
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setupPushNotifications } from '../services/notificationApi';
import { initAuth } from '../services/userApi'; // Hàm khởi tạo Auth từ SecureStore

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    /**
     * 1. Khởi tạo Auth: Phục hồi session từ SecureStore
     * Việc này giúp ứng dụng lấy lại token và tự động đăng nhập khi mở app.
     */
    initAuth();

    // 2. Thiết lập thông báo đẩy (Push Notifications)
    setupPushNotifications();

    // 3. Lắng nghe hành động khi người dùng nhấp vào thông báo (Deep Linking)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Thông báo được nhấn:', data);

      if (data.type === 'follow' && data.actor_id) {
        router.push({
          pathname: '/profile/[id]' as any,
          params: { id: data.actor_id.toString() }
        });
      } else if (data.post_id) {
        router.push({
          pathname: '/post/[id]' as any,
          params: { id: data.post_id.toString() }
        });
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    /**
     * BẮT BUỘC: AuthProvider phải là lớp ngoài cùng nhất 
     * để mọi component bên trong (bao gồm NotificationProvider) có thể sử dụng useAuth.
     */
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <NotificationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Màn hình chính chứa các Tabs */}
            <Stack.Screen name="(tabs)" />

            {/* Các màn hình Profile/Post/Follow List (Route động) */}
            <Stack.Screen 
              name="profile/[id]" 
              options={{ headerShown: true, title: 'Trang cá nhân' }} 
            />
            <Stack.Screen 
              name="post/[id]" 
              options={{ headerShown: true, title: 'Bài viết' }} 
            />
            <Stack.Screen 
              name="follow-list/[id]" 
              options={{ headerShown: true, title: 'Danh sách' }} 
            />

            {/* Các màn hình Auth (Login/Register) */}
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />

            {/* Màn hình Modal hoặc Edit Profile */}
            <Stack.Screen 
              name="modal" 
              options={{ presentation: 'modal', title: 'Modal' }} 
            />
            <Stack.Screen 
              name="edit-profile" 
              options={{ headerShown: true, title: 'Chỉnh sửa hồ sơ' }} 
            />
          </Stack>
          <StatusBar style="auto" />
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}