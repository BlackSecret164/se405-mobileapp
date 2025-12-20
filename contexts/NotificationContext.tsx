import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { fetchUnreadCount } from '../services/notificationApi';

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
      const response = await fetchUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  useEffect(() => {
    refreshUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};