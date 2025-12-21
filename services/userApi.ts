import axios from 'axios';
import { Platform } from 'react-native';

const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjYzNDgwNzEsImlhdCI6MTc2NjM0NzE3MSwidXNlcl9pZCI6MX0.VeiEQO2wy3L3mPkxcn3lbZaIatHvagp3BA4IFoahZZA"; 
const LOCAL_IP = '192.168.0.101'; 
const HOST = LOCAL_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const BASE_URL = `http://${HOST}:8080`;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  return config;
});

export const fetchUserProfile = async (userId: number) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

/**
 * Lấy danh sách thumbnail bài đăng có phân trang bằng cursor
 * Endpoint: GET /users/:id/posts?cursor=<cursor>&limit=<limit>
 */
export const fetchUserPosts = async (userId: number, cursor: string | null = null, limit: number = 12) => {
  try {
    // Xây dựng query string với cursor và limit
    const params = new URLSearchParams({
      limit: limit.toString(),
    });
    if (cursor) params.append('cursor', cursor);

    const response = await api.get(`/users/${userId}/posts?${params.toString()}`);
    
    // Trả về toàn bộ object gồm posts, next_cursor, has_more
    return response.data; 
  } catch (error) {
    console.warn("Lỗi tải bài đăng, trả về dữ liệu rỗng để tránh lỗi giao diện");
    return {
      posts: [],
      has_more: false,
      next_cursor: null
    };
  }
};

/**
 * Lấy danh sách Followers (người theo dõi)
 * Endpoint: GET /users/:id/followers
 */
export const fetchFollowers = async (userId: number, cursor: string | null = null) => {
  const params = new URLSearchParams({ limit: '20' });
  if (cursor) params.append('cursor', cursor);
  
  const response = await api.get(`/users/${userId}/followers?${params.toString()}`);
  return response.data; // Trả về { users, cursor, has_more }
};

/**
 * Lấy danh sách Following (đang theo dõi)
 * Endpoint: GET /users/:id/following
 */
export const fetchFollowing = async (userId: number, cursor: string | null = null) => {
  const params = new URLSearchParams({ limit: '20' });
  if (cursor) params.append('cursor', cursor);

  const response = await api.get(`/users/${userId}/following?${params.toString()}`);
  return response.data; // Trả về { users, cursor, has_more }
};