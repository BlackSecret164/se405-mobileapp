import axios from 'axios'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

// ⚠️ ĐỔI BASE_URL THEO BACKEND CỦA BẠN
// Backend in this project runs on :8080 by default.
// - Android emulator: use 10.0.2.2
// - iOS simulator / Expo Go: use localhost
// - Physical device (your phone): set LOCAL_IP to your machine IP from `ipconfig` (e.g. 172.20.10.8)
// If LOCAL_IP is empty, the code will auto-select the default for emulator/simulator.
const LOCAL_IP = '172.20.10.8' // <- SET THIS TO YOUR MACHINE IP WHEN TESTING ON A PHYSICAL DEVICE, or set to '' to auto-detect

const HOST = LOCAL_IP || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost')
const BASE_URL = `http://${HOST}:8080`

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* ===============================
   ACCESS TOKEN (memory)
================================ */
let accessToken: string | null = null

// Listeners for access token changes
const accessTokenListeners = new Set<(token: string | null) => void>()

export const setAccessToken = (token: string | null) => {
  accessToken = token
  // notify listeners
  accessTokenListeners.forEach(cb => {
    try {
      cb(token)
    } catch (err) {
      // ignore listener errors
    }
  })
}

// Getter for components to read current access token (in-memory)
export const getAccessToken = () => accessToken

// Subscribe to access token changes. Returns an unsubscribe function.
export const addAccessTokenListener = (cb: (token: string | null) => void) => {
  accessTokenListeners.add(cb)
  // immediately notify with current token
  cb(accessToken)
  return () => {
    accessTokenListeners.delete(cb)
  }
}

/* ===============================
   REQUEST INTERCEPTOR
================================ */
api.interceptors.request.use(
  config => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  error => Promise.reject(error)
)

/* ===============================
   REFRESH TOKEN LOGIC
================================ */
let isRefreshing = false

type FailedQueueEntry = {
  resolve: (value: string | PromiseLike<string>) => void
  reject: (reason?: any) => void
}

let failedQueue: FailedQueueEntry[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token as string)
  })
  failedQueue = []
}

// Token refresh timer and helpers
let refreshTimer: number | null = null
const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer as unknown as number)
    refreshTimer = null
  }
}

const scheduleRefresh = (expiresInMs: number) => {
  clearRefreshTimer()
  // refresh 60s before expiry (or immediately if expiry is small)
  const delay = Math.max(expiresInMs - 60_000, 0)
  refreshTimer = setTimeout(async () => {
    try {
      await refreshToken()
    } catch (err) {
      // ignore; failed refresh will be handled on next request
    }
  }, delay) as unknown as number
}

// Centralized refresh function. Uses direct axios to avoid interceptor recursion.
const refreshToken = async (): Promise<string> => {
  const refresh_token = await SecureStore.getItemAsync('refresh_token')
  if (!refresh_token) throw new Error('No refresh token')

  if (isRefreshing) {
    // If a refresh is already in progress, return a promise that resolves when it finishes
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject })
    }) as Promise<string>
  }

  isRefreshing = true

  try {
    // use raw axios to avoid interceptors
    const res = await axios.post(`${BASE_URL}/auth/refresh`, {
      refresh_token,
    })

    const { access_token, refresh_token: newRefreshToken, expires_in } = res.data

    await SecureStore.setItemAsync('refresh_token', newRefreshToken)
    setAccessToken(access_token)

    // schedule the next refresh if expires_in is provided (handle seconds or ms)
    if (typeof expires_in === 'number') {
      const expiresMs = expires_in < 10_000 ? expires_in * 1000 : expires_in
      scheduleRefresh(expiresMs)
    }

    processQueue(null, access_token)

    return access_token
  } catch (err) {
    processQueue(err, null)
    // on refresh failure clear stored tokens
    setAccessToken(null)
    await SecureStore.deleteItemAsync('refresh_token')
    throw err
  } finally {
    isRefreshing = false
  }
}

// Initialize auth state from stored refresh token. Call this at app start.
export const initAuth = async () => {
  const rt = await SecureStore.getItemAsync('refresh_token')
  if (!rt) return
  try {
    await refreshToken()
  } catch (err) {
    // failed to refresh; ensure tokens cleared
    await authAPI.logoutLocal()
  }
}

/* ===============================
   RESPONSE INTERCEPTOR
================================ */
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If not 401 or already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const token = await refreshToken()
      originalRequest.headers.Authorization = `Bearer ${token}`
      return api(originalRequest)
    } catch (err) {
      return Promise.reject(err)
    }
  }
)

export const authAPI = {
  login: async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    const { access_token, refresh_token, expires_in } = res.data

    setAccessToken(access_token)
    await SecureStore.setItemAsync('refresh_token', refresh_token)

    // schedule refresh if expires_in is provided (handles seconds vs ms)
    if (typeof expires_in === 'number') {
      const expiresMs = expires_in < 10_000 ? expires_in * 1000 : expires_in
      scheduleRefresh(expiresMs)
    }

    return res.data
  },

  register: async (formData: FormData | object) => {
    return api.post('/auth/register', formData)
  },

  logoutLocal: async () => {
    setAccessToken(null)
    clearRefreshTimer()
    await SecureStore.deleteItemAsync('refresh_token')
  },

  me: () => api.get('/me'),

  // Complete onboarding (requires Bearer token)
  completeOnboarding: () => api.patch('/me/onboarding'),
}

export const usersAPI = {
  // Search users by username prefix (q)
  search: (q: string, limit = 20) => {
    const params = new URLSearchParams()
    params.append('q', q)
    params.append('limit', String(limit))
    return api.get(`/users/search?${params.toString()}`)
  },

  // Get following list for a user
  getFollowing: (userId: number, cursor?: string | null, limit = 20) => {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor)
    params.append('limit', String(limit))
    return api.get(`/users/${userId}/following?${params.toString()}`)
  },

  // Follow a user
  follow: (userId: number) => api.post(`/users/${userId}/follow`),

  // Unfollow a user
  unfollow: (userId: number) => api.delete(`/users/${userId}/follow`),
}

export default api
