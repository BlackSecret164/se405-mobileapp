import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AggregatedNotification, Notification } from '../types/notification';

export type NotificationItemData = Notification | AggregatedNotification;

const formatNotificationText = (item: NotificationItemData): { username: string; content: string; subContent: string; time: string; avatar: string } => {
  if ('actor' in item) {
    // Individual Notification (follow)
    const notification = item as Notification;
    const actor = notification.actor;
    return {
      username: actor?.username || '',
      content: notification.type === 'follow' ? 'started following you.' : '',
      subContent: '',
      time: new Date(notification.created_at).toLocaleDateString(),
      avatar: actor?.avatar_url || '',
    };
  } else {
    // AggregatedNotification
    const aggregated = item as AggregatedNotification;
    const firstActor = aggregated.actors[0];
    const othersCount = aggregated.total_count - 1;
    const action = aggregated.type === 'like' ? 'liked' : 'commented on';
    const content = othersCount > 0
      ? `${firstActor.username} and ${othersCount} others ${action} your post`
      : `${firstActor.username} ${action} your post`;
    return {
      username: firstActor.username,
      content,
      subContent: '',
      time: new Date(aggregated.latest_at).toLocaleDateString(),
      avatar: firstActor.avatar_url || '',
    };
  }
};

export const NotificationItem = ({ item, onPress }: { item: NotificationItemData; onPress: () => void }) => {
  const isSystem = false; // No system notifications in new structure
  const { username, content, subContent, time, avatar } = formatNotificationText(item);
  const isRead = 'is_read' in item ? item.is_read : false;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftContent}>
        {isSystem ? (
            <View style={styles.systemIconContainer}>
                 <Ionicons name="logo-instagram" size={24} color="black" />
            </View>
        ) : (
            <Image 
                source={{ uri: avatar }} 
                style={styles.avatar} 
            />
        )}
        <View style={styles.textWrapper}>
          <Text style={[styles.textContent, !isRead && styles.unreadText]}>
            <Text style={styles.username}>{username} </Text>
            <Text>{content}</Text>
            {subContent && <Text style={styles.subContent}>{subContent}</Text>}
            <Text style={styles.timeText}> {time}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb', 
  },
  systemIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  textContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  username: {
    fontWeight: 'bold',
  },
  subContent: {
    color: '#6b7280', 
  },
  timeText: {
    color: '#9ca3af', 
    fontSize: 12,
  },
});