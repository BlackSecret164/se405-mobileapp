import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
// Import instance api dùng chung từ file cấu hình API chính với dynamic IP và token interceptors
import { NotificationListResponse } from "../types/notification";
import api from "./api";

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
    return api.post("/devices/token", {
      token: token,
      platform: "expo",
    });
  },

  /**
   * Lấy danh sách thông báo (phân loại Follows và Activity)
   */
  fetchNotifications: async (
    limit: number = 20
  ): Promise<NotificationListResponse> => {
    const response = await api.get(`/notifications`, { params: { limit } });
    return response.data;
  },

  /**
   * Đánh dấu danh sách thông báo đã đọc
   */
  markNotificationsRead: async (notificationIds: number[]): Promise<void> => {
    await api.patch(`/notifications/read`, {
      notification_ids: notificationIds,
    });
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
 * 3. Setup push notification permissions and Android channel
 * This can be called on app start regardless of auth state
 */
export const setupPushNotifications = async () => {
  // Only run on physical devices
  if (!Device.isDevice) {
    console.warn("Push notifications only work on physical devices");
    return;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Failed to get push token permissions");
    return;
  }

  // Configure Android channel
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
};

/**
 * 4. Register device push token with backend
 * This should ONLY be called after user is successfully logged in
 */
export const registerPushToken = async () => {
  // Only run on physical devices
  if (!Device.isDevice) {
    console.warn("Push notifications only work on physical devices");
    return;
  }

  // Get Project ID from EAS
  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ??
    Constants?.easConfig?.projectId;

  if (!projectId) {
    console.error(
      "Project ID not found in app.json. Check expo.extra.eas.projectId"
    );
    return;
  }

  // Check permissions first
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    console.warn(
      "Push notifications not permitted, skipping token registration"
    );
    return;
  }

  try {
    // Get Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    const token = tokenData.data;
    console.log("Expo Push Token:", token);

    // Register token with backend (requires auth)
    await notificationsAPI.registerDeviceToken(token);
    console.log("Device token registered with backend");
  } catch (error) {
    console.error("Error registering push token:", error);
  }
};
