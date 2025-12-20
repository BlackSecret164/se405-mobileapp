import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { NotificationItem, NotificationItemData } from '../components/NotificationItem';
import { useNotificationContext } from '../contexts/NotificationContext';
import { fetchNotifications, markAllNotificationsRead, markNotificationsRead } from '../services/notificationApi';
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
  const { refreshUnreadCount } = useNotificationContext();

  const loadNotifications = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchNotifications();
      
      // Combine follows and aggregated into sections
      const followSection: NotificationSection = {
        title: 'Follows',
        data: response.follows,
      };
      
      const activitySection: NotificationSection = {
        title: 'Activity',
        data: response.aggregated,
      };
      
      setSections([followSection, activitySection].filter(section => section.data.length > 0));
    } catch (err) {
      setError('Failed to load notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      // Update local state to mark all as read
      setSections(prevSections =>
        prevSections.map(section => ({
          ...section,
          data: section.data.map(item => ({ ...item, is_read: true })),
        }))
      );
      refreshUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, [refreshUnreadCount]);

  const handleNotificationPress = useCallback(async (item: NotificationItemData) => {
    // Mark as read
    if ('id' in item && !item.is_read) {
      try {
        await markNotificationsRead([item.id]);
        // Update local state
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
        refreshUnreadCount();
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }

    // Navigate
    if ('actor' in item) {
      // Follow notification
      const notification = item as Notification;
      (router.push as any)(`/profile/${notification.actor_id}`);
    } else {
      // Aggregated notification
      const aggregated = item as AggregatedNotification;
      if (aggregated.post_id) {
        (router.push as any)(`/post/${aggregated.post_id}`);
      }
    }
  }, [router, refreshUnreadCount]);

  // Poll every 30 seconds
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Mark all as read when screen is focused
  useFocusEffect(
    useCallback(() => {
      markAllAsRead();
    }, [markAllAsRead])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  listContent: {
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default NotificationScreen;