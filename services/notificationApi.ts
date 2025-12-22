import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
// Import instance api dùng chung từ file cấu hình API mới của bạn
import api from './userApi'; 
import { NotificationListResponse } from '../types/notification';

/**
 * 1. Cấu hình hiển thị thông báo khi app đang mở (Foreground)
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * 2. Đối tượng notificationsAPI theo cấu trúc mới
 * Sử dụng instance 'api' chung để tự động hưởng cơ chế đính kèm Bearer Token
 * và tự động Refresh Token khi gặp lỗi 401.
 */
export const notificationsAPI = {
    /**
     * Đăng ký Device Token (Expo Push Token) lên backend
     */
    registerDeviceToken: async (token: string) => {
        return api.post('/devices/token', {
            token: token,
            platform: 'expo',
        });
    },

    /**
     * Lấy danh sách thông báo (phân loại Follows và Activity)
     */
    fetchNotifications: async (limit: number = 20): Promise<NotificationListResponse> => {
        const response = await api.get(`/notifications`, { params: { limit } });
        return response.data;
    },

    /**
     * Đánh dấu danh sách thông báo đã đọc
     */
    markNotificationsRead: async (notificationIds: number[]): Promise<void> => {
        await api.patch(`/notifications/read`, { notification_ids: notificationIds });
    },

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    markAllNotificationsRead: async (): Promise<void> => {
        await api.post(`/notifications/read-all`);
    },

    /**
     * Lấy số lượng thông báo chưa đọc (unread count) để hiển thị Badge
     */
    fetchUnreadCount: async () => {
        const response = await api.get(`/notifications/unread-count`);
        return response.data;
    },
};

/**
 * 3. Hàm thiết lập Push Notification (Setup)
 */
export const setupPushNotifications = async () => {
    // Chỉ chạy trên thiết bị thật
    if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return;
    }

    // Lấy Project ID từ EAS (Expo Application Services)
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

    if (!projectId) {
        console.error('Project ID not found in app.json. Check expo.extra.eas.projectId');
        return;
    }

    // Xin quyền người dùng
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.warn('Failed to get push token permissions');
        return;
    }

    try {
        // Lấy Expo Push Token
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
        });
        const token = tokenData.data;
        console.log('Expo Push Token:', token);

        // Đăng ký token lên backend thông qua đối tượng notificationsAPI mới
        await notificationsAPI.registerDeviceToken(token);

    } catch (error) {
        console.error('Error getting push token:', error);
    }

    // Cấu hình Channel cho Android
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }
};