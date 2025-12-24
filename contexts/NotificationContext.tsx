import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
// SỬA TẠI ĐÂY: Import đúng tên đối tượng notificationsAPI
import { notificationsAPI } from "../services/notificationApi";
// Import hàm getAccessToken để kiểm tra trạng thái đăng nhập
import { getAccessToken } from "../services/api";

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within NotificationProvider"
    );
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    // 1. Kiểm tra xem người dùng đã đăng nhập chưa
    const token = getAccessToken();

    // Nếu chưa có token trong bộ nhớ, thoát ra và không gọi API
    // Việc này ngăn chặn lỗi "No refresh token" hiện lên console
    if (!token) {
      return;
    }

    try {
      // 2. Gọi hàm thông qua đối tượng notificationsAPI mới
      const response = await notificationsAPI.fetchUnreadCount();

      // Đảm bảo truy cập đúng thuộc tính unread_count từ backend
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      // Chỉ log lỗi nếu thực sự có lỗi kết nối hoặc server
      console.error("Failed to fetch unread count", err);
    }
  };

  useEffect(() => {
    // Lần đầu mở app, thực hiện lấy số lượng thông báo
    refreshUnreadCount();

    // Tự động cập nhật số lượng thông báo chưa đọc mỗi 30 giây
    const interval = setInterval(refreshUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
