
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import { NotificationListResponse } from '../types/notification';

// 1. Cấu hình IP và Host theo hình ảnh của bạn
const LOCAL_IP = '192.168.0.101'; // <- IP của bạn đã thay đổi
const HOST = LOCAL_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const BASE_URL = `http://${HOST}:8080`;

// 2. Khởi tạo instance của Axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Hàm lấy Token thực tế từ AsyncStorage
const getAuthToken = async (): Promise<string | null> => {
  return await AsyncStorage.getItem('userToken'); // Key này phải khớp với lúc bạn lưu token
};

// 4. Axios Interceptor: Tự động đính kèm Token vào mọi request
api.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    console.log('[notificationApi] Token from AsyncStorage:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[notificationApi] Authorization header set:', config.headers.Authorization);
    } else {
      console.warn('[notificationApi] No token found in AsyncStorage!');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- CÁC HÀM API ---

export const fetchNotifications = async (limit: number = 20): Promise<NotificationListResponse> => {
  // Sử dụng api.get của axios, đường dẫn sẽ tự nối với BASE_URL
  const response = await api.get(`/notifications`, {
    params: { limit },
  });
  return response.data;
};

export const markNotificationsRead = async (notificationIds: number[]): Promise<void> => {
  await api.patch(`/notifications/read`, {
    notification_ids: notificationIds,
  });
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.post(`/notifications/read-all`);
};

export const fetchUnreadCount = async (): Promise<{ unread_count: number }> => {
  const response = await api.get(`/notifications/unread-count`);
  return response.data;
};