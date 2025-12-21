import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { NotificationListResponse } from '../types/notification';

// 1. Cấu hình IP và Access Token set cứng
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjYzNDgwNzEsImlhdCI6MTc2NjM0NzE3MSwidXNlcl9pZCI6MX0.VeiEQO2wy3L3mPkxcn3lbZaIatHvagp3BA4IFoahZZA";
const LOCAL_IP = '192.168.0.101';
const HOST = LOCAL_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const BASE_URL = `http://${HOST}:8080`;

// 2. Cấu hình hiển thị thông báo (Banner thả xuống)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// 3. Khởi tạo instance của Axios
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 4. Axios Interceptor: Tự động đính kèm Token cứng
api.interceptors.request.use(
    async (config) => {
        config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// --- ĐỐI TƯỢNG apiService CHỨA TẤT CẢ CÁC HÀM ---

export const apiService = {
    /**
     * Đăng ký Device Token lên server
     */
    registerDeviceToken: async (token: string) => {
        return api.post('/devices/token', {
            token: token,
            platform: 'expo',
        });
    },

    // Lấy danh sách thông báo
    fetchNotifications: async (limit: number = 20): Promise<NotificationListResponse> => {
        const response = await api.get(`/notifications`, { params: { limit } });
        return response.data;
    },

    // Đánh dấu đã đọc
    markNotificationsRead: async (notificationIds: number[]): Promise<void> => {
        await api.patch(`/notifications/read`, { notification_ids: notificationIds });
    },

    // Đọc tất cả
    markAllNotificationsRead: async (): Promise<void> => {
        await api.post(`/notifications/read-all`);
    },

    // Lấy số lượng chưa đọc (HÀM GÂY LỖI NẾU THIẾU)
    fetchUnreadCount: async () => {
        const response = await api.get(`/notifications/unread-count`);
        return response.data;
    },

    /**
     * Lấy chi tiết 1 bài post để điều hướng
     */
    fetchPostDetail: async (postId: number) => {
        const response = await api.get(`/posts/${postId}`);
        return response.data;
    },

    /**
     * Lấy thông tin profile người dùng để điều hướng
     */
    fetchUserProfile: async (userId: number) => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },

    /**
     * Lấy danh sách bài đăng của người dùng
     */
    fetchUserPosts: async (userId: number) => {
        const response = await api.get(`/users/${userId}/posts`);
        return response.data.posts;
    }
};

// --- HÀM THIẾT LẬP PUSH NOTIFICATION ---

export const setupPushNotifications = async () => {
    // 1. Kiểm tra thiết bị thật vì Push Notification không chạy trên simulator
    if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return;
    }

    // 2. Lấy Project ID từ cấu hình EAS
    const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

    if (!projectId) {
        console.error('Project ID not found in app.json. Please check expo.extra.eas.projectId');
        return;
    }

    // 3. Xin quyền thông báo
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
        // 4. Lấy Expo Push Token bằng Project ID
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId,
        });
        const token = tokenData.data;
        console.log('Expo Push Token:', token);

        // 5. Đăng ký token lên backend của bạn
        await apiService.registerDeviceToken(token);

    } catch (error) {
        console.error('Error getting push token:', error);
    }

    // Cấu hình Android Channel (giữ nguyên)
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
        });
    }
};