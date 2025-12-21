import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { NotificationItem, NotificationItemData } from '../components/NotificationItem';
// Đã xóa import NotificationContext
import { apiService } from '../services/notificationApi'; 
import { AggregatedNotification, Notification } from '../types/notification';

interface NotificationSection {
  title: string;
  data: NotificationItemData[];
}

const NotificationScreen = () => {
  const [sections, setSections] = useState<NotificationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Hàm tải danh sách thông báo
  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      // Gọi API lấy thông báo qua apiService
      const response = await apiService.fetchNotifications(20); 
      
      const followSection: NotificationSection = {
        title: 'Follows',
        data: response.follows,
      };
      
      const activitySection: NotificationSection = {
        title: 'Activity',
        data: response.aggregated,
      };
      
      // Lọc bỏ các section trống
      setSections([followSection, activitySection].filter(section => section.data.length > 0));
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Hàm đánh dấu tất cả là đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsRead(); //
      
      // Cập nhật trạng thái hiển thị tại chỗ
      setSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          data: section.data.map(item => ({ ...item, is_read: true })),
        }))
      );
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, []);

  // Xử lý khi nhấn vào một thông báo cụ thể
  const handleNotificationPress = useCallback(async (item: NotificationItemData) => {
    // 1. Đánh dấu đã đọc nếu tin nhắn chưa đọc
    if ('id' in item && !item.is_read) {
      try {
        await apiService.markNotificationsRead([item.id]); //
        
        setSections(prevSections =>
          prevSections.map(section => ({
            ...section,
            data: section.data.map(notification =>
              'id' in notification && notification.id === item.id
                ? { ...notification, is_read: true }
                : notification
            ),
          }))
        );
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }

    // 2. Điều hướng dựa trên loại thông báo
    if ('actor' in item) {
      // Thông báo Follow -> Dẫn đến Profile người đó
      const notification = item as Notification;
      router.push(`/profile/${notification.actor_id}` as any);
    } else {
      // Thông báo Like/Comment -> Dẫn đến chi tiết bài viết
      const aggregated = item as AggregatedNotification;
      if (aggregated.post_id) {
        router.push(`/post/${aggregated.post_id}` as any);
      }
    }
  }, [router]);

  // Tự động làm mới danh sách mỗi 30 giây (Polling)
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Đánh dấu tất cả đã đọc khi người dùng vào màn hình này
  useFocusEffect(
    useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => 'id' in item ? item.id.toString() : `${item.post_id}-${item.type}`}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => handleNotificationPress(item)} />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', 
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  sectionHeader: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  listContent: { paddingBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

export default NotificationScreen;