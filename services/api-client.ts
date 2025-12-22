/**
 * API Client Configuration
 * Central place for API configuration and base fetch wrapper
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// Get IP dynamically from Expo dev server
function getLocalIP(): string {
  // expo-constants provides the dev server's host URI (e.g., "192.168.1.100:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    if (ip) return ip;
  }
  // Fallback for when hostUri is not available
  return "localhost";
}

// Determine the correct base URL based on platform
function getBaseUrl(): string {
  // TODO: Move to environment variables for production

  if (__DEV__) {
    // Development mode
    const localIP = getLocalIP();

    if (Platform.OS === "android") {
      // Android emulator uses 10.0.2.2 to access host machine's localhost
      // Physical device needs the computer's local IP
      return `http://${localIP}:8080`;
    } else if (Platform.OS === "ios") {
      // iOS simulator can use localhost directly
      // Physical device needs the computer's local IP
      return `http://${localIP}:8080`;
    } else {
      // Web or other platforms
      return "http://localhost:8080";
    }
  }

  // Production URL (update this when deploying)
  return "https://api.example.com/v1";
}

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
};

import { getAccessToken } from "./api";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Base API fetch wrapper with authentication
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  // Add Authorization header if not skipped and token exists
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  console.log(`[API] ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...restOptions,
    headers,
    credentials: "include", // For cookie-based auth (future)
  });

  // Parse JSON response
  const data = await response.json();

  // Handle error responses
  if (!response.ok) {
    console.error(`[API Error] ${response.status}:`, data);

    // Throw error with API error structure if available
    if (data.error) {
      const error = new Error(data.error.message) as Error & {
        code: string;
        status: number;
      };
      error.code = data.error.code;
      error.status = response.status;
      throw error;
    }

    throw new Error(`API Error: ${response.status}`);
  }

  console.log(`[API] Response:`, data);
  return data;
}
