import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { NotificationItem, NotificationItemData } from '../components/NotificationItem';
// Sử dụng notificationsAPI thay vì apiService cũ
import { notificationsAPI } from '../services/notificationApi'; 
import { AggregatedNotification, Notification } from '../types/notification';

/**
 * Định nghĩa Interface cho Section để tránh lỗi implicit 'any'
 */
interface NotificationSection {
  title: string;
  data: NotificationItemData[];
}

const NotificationScreen = () => {
  const [sections, setSections] = useState<NotificationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * Tải danh sách thông báo từ API
   */
  const loadNotifications = useCallback(async () => {
    try {
      const response = await notificationsAPI.fetchNotifications(20); 
      
      const newSections: NotificationSection[] = [
        { title: 'Follows', data: response.follows || [] },
        { title: 'Activity', data: response.aggregated || [] }
      ].filter(section => section.data.length > 0);

      setSections(newSections);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đánh dấu tất cả thông báo là đã đọc khi vào màn hình
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsAPI.markAllNotificationsRead();
      
      setSections(prevSections =>
        prevSections.map((section: NotificationSection) => ({
          ...section,
          data: section.data.map((item: NotificationItemData) => ({ ...item, is_read: true })),
        }))
      );
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, []);

  /**
   * Xử lý nhấn vào thông báo: Đánh dấu đã đọc và điều hướng
   */
  const handleNotificationPress = useCallback(async (item: NotificationItemData) => {
    // 1. Đánh dấu đã đọc cục bộ và gửi API
    if (!item.is_read) {
      try {
        // Chắc chắn item có id thông qua ép kiểu hoặc đảm bảo trong types
        await notificationsAPI.markNotificationsRead([item.id]); 
        
        setSections(prevSections =>
          prevSections.map((section: NotificationSection) => ({
            ...section,
            data: section.data.map((notification: NotificationItemData) =>
              notification.id === item.id ? { ...notification, is_read: true } : notification
            ),
          }))
        );
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }

    // 2. Điều hướng dựa trên loại thông báo (Type Guard)
    if (item.type === 'follow') {
      const followItem = item as Notification;
      router.push(`/profile/${followItem.actor_id}` as any);
    } else {
      const activityItem = item as AggregatedNotification;
      if (activityItem.post_id) {
        router.push(`/post/${activityItem.post_id}` as any);
      }
    }
  }, [router]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Tự động làm mới mỗi 30s
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.headerContainer}><Text style={styles.headerTitle}>Notifications</Text></View>

      <SectionList
        sections={sections}
        // keyExtractor an toàn: Fallback về index nếu id undefined
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => handleNotificationPress(item)} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text></View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No notifications yet</Text></View>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  sectionHeader: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  listContent: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

export default NotificationScreen;