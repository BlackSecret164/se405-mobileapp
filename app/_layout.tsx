import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { NotificationProvider } from '../contexts/NotificationContext';
// Đảm bảo đường dẫn này chính xác với cấu trúc file của bạn
import { setupPushNotifications } from '../services/notificationApi';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // 1. Khởi tạo quyền, lấy Device Token và gửi lên Server
    setupPushNotifications();

    // 2. Lắng nghe hành động khi người dùng NHẤP vào thông báo (Deep Linking)
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      console.log('Thông báo được nhấn với dữ liệu:', data);

      // 1. Xử lý cho thông báo Follow
      if (data.type === 'follow' && data.actor_id) {
        // Chuyển ID về dạng string để thỏa mãn yêu cầu của tham số route
        const userId = data.actor_id.toString();

        router.push({
          pathname: '/profile/[id]' as any,
          params: { id: userId } // Bây giờ 'id' chắc chắn là string
        });
      }

      // 2. Xử lý cho thông báo Post (Like/Comment)
      else if (data.post_id) {
        // Đảm bảo post_id không phải là một object trống
        const postId = data.post_id.toString();

        router.push({
          pathname: '/post/[id]' as any,
          params: { id: postId }
        });
      }
    });

    // Cleanup: Hủy lắng nghe khi component bị unmount
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationProvider>
        <Stack>
          {/* Màn hình chính chứa các Tabs */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Màn hình Modal */}
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

          {/* Route động cho trang cá nhân */}
          <Stack.Screen name="profile/[id]" options={{ title: 'Trang cá nhân' }} />

          {/* Route động cho chi tiết bài viết */}
          <Stack.Screen name="post/[id]" options={{ title: 'Bài viết' }} />

          {/* Route cho chỉnh sửa profile cá nhân */}
          <Stack.Screen name="edit-profile" options={{ title: 'Chỉnh sửa hồ sơ' }} />
        </Stack>
        <StatusBar style="auto" />
      </NotificationProvider>
    </ThemeProvider>
  );
}