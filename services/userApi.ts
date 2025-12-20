import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Cấu hình IP và Host động
const LOCAL_IP = '192.168.0.101'; 
const HOST = LOCAL_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const BASE_URL = `http://${HOST}:8080`;

// 2. Khởi tạo Axios Instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Request Interceptor: Tự động đính kèm Token cho mọi yêu cầu
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken'); // Key này phải khớp với lúc bạn Save Token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- CÁC HÀM API ---

/**
 * Lấy thông tin chi tiết người dùng
 */
export const fetchUserProfile = async (userId: number) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Lấy danh sách bài đăng của người dùng
 */
export const fetchUserPosts = async (userId: number) => {
  // Chuyển từ mock data sang gọi API thật
  try {
    const response = await api.get(`/users/${userId}/posts`);
    return response.data;
  } catch (error) {
    console.warn("Chưa có API thật, đang trả về dữ liệu mẫu (Mock Data)");
    // Dự phòng: Trả về mock data nếu backend chưa có endpoint này
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i.toString(),
      image: `https://picsum.photos/400/400?random=${i + 10}`,
    }));
  }
};