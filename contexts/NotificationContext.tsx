import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
// SỬA TẠI ĐÂY: Import apiService thay vì hàm rời
import { apiService } from '../services/notificationApi';

interface NotificationContextType {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = async () => {
    try {
      // SỬA TẠI ĐÂY: Gọi hàm thông qua đối tượng apiService
      const response = await apiService.fetchUnreadCount();
      // Đảm bảo truy cập đúng thuộc tính unread_count từ backend
      setUnreadCount(response.unread_count);
    } catch (err) {
      // Lỗi bạn nhìn thấy trong console xuất phát từ dòng này khi fetchUnreadCount bị undefined
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    // Tự động cập nhật số lượng thông báo chưa đọc mỗi 30 giây
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};