import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Cấu hình IP và URL
const LOCAL_IP = '192.168.0.101'; 
const HOST = LOCAL_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const BASE_URL = `http://${HOST}:8080`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

/* ===============================
    QUẢN LÝ ACCESS TOKEN
================================ */
let accessToken: string | null = null;
const accessTokenListeners = new Set<(token: string | null) => void>();

/**
 * Xuất hàm getAccessToken để các file khác (như NotificationContext) 
 * có thể kiểm tra trạng thái đăng nhập mà không gây lỗi TS2724.
 */
export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  accessTokenListeners.forEach(cb => {
    try { cb(token); } catch (err) { }
  });
};

/* ===============================
    HÀM KHỞI TẠO (QUAN TRỌNG)
================================ */
export const initAuth = async () => {
  try {
    const rt = await SecureStore.getItemAsync('refresh_token');
    if (!rt) return;
    await refreshToken(); 
  } catch (err) {
    await authAPI.logoutLocal();
  }
};

/* ===============================
    LOGIC REFRESH TOKEN (TỐI ƯU)
================================ */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const refreshToken = async (): Promise<string> => {
  const refresh_token = await SecureStore.getItemAsync('refresh_token');
  if (!refresh_token) throw new Error('No refresh token');

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Dùng axios trực tiếp để tránh vòng lặp interceptor
    const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token });
    const { access_token, refresh_token: newRefreshToken } = res.data;

    await SecureStore.setItemAsync('refresh_token', newRefreshToken);
    setAccessToken(access_token);
    
    processQueue(null, access_token);
    return access_token;
  } catch (err) {
    processQueue(err, null);
    await authAPI.logoutLocal();
    throw err;
  } finally {
    isRefreshing = false;
  }
};

/* ===============================
    INTERCEPTORS
================================ */
api.interceptors.request.use(async (config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry, tiến hành refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const token = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

/* ===============================
    CÁC ĐỐI TƯỢNG API
================================ */

export const authAPI = {
  login: async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password });
    const { access_token, refresh_token } = res.data;
    setAccessToken(access_token);
    await SecureStore.setItemAsync('refresh_token', refresh_token);
    return res.data;
  },
  logoutLocal: async () => {
    setAccessToken(null);
    await SecureStore.deleteItemAsync('refresh_token');
  },
  me: () => api.get('/me'),
};

export const usersAPI = {
  getProfile: (userId: number) => api.get(`/users/${userId}`),
  getFollowers: (userId: number, cursor?: string | null) => 
    api.get(`/users/${userId}/followers`, { params: { cursor, limit: 20 } }),
  getFollowing: (userId: number, cursor?: string | null) => 
    api.get(`/users/${userId}/following`, { params: { cursor, limit: 20 } }),
  follow: (userId: number) => api.post(`/users/${userId}/follow`),
  unfollow: (userId: number) => api.delete(`/users/${userId}/follow`),
};

export const postsAPI = {
  getUserPosts: (userId: number, cursor?: string | null) => 
    api.get(`/users/${userId}/posts`, { params: { cursor, limit: 12 } }),
  getPostDetail: (postId: number) => api.get(`/posts/${postId}`),
};

export default api;