import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AggregatedNotification, Notification } from '../types/notification';

export type NotificationItemData = Notification | AggregatedNotification;

const formatNotificationText = (item: NotificationItemData) => {
  const isFollow = 'actor' in item;

  if (isFollow) {
    // 1. Follow Notification (Individual)
    const notification = item as Notification;
    return {
      username: notification.actor?.username || 'Someone',
      content: 'started following you.',
      time: notification.created_at,
      avatar: notification.actor?.avatar_url || '',
    };
  } else {
    // 2. Aggregated Notification (Like/Comment)
    const aggregated = item as AggregatedNotification;
    const actors = aggregated.actors || [];
    const firstActor = actors[0];
    const uniqueActorsCount = actors.length; 
    const totalCount = aggregated.total_count || 1; 
    const action = aggregated.type === 'like' ? 'liked' : 'commented on';

    let contentText = '';

    // English Logic for Aggregation
    if (uniqueActorsCount > 1) {
      // Case: Multiple different people
      contentText = `and ${uniqueActorsCount - 1} other${uniqueActorsCount - 1 > 1 ? 's' : ''} ${action} your post.`;
    } else if (totalCount > 1) {
      // Case: One person acting multiple times
      contentText = `${action} your post ${totalCount} times.`;
    } else {
      // Case: One person acting once
      contentText = `${action} your post.`;
    }

    return {
      username: firstActor?.username || 'Someone',
      content: contentText,
      time: aggregated.latest_at,
      avatar: firstActor?.avatar_url || '',
    };
  }
};

export const NotificationItem = ({ item, onPress }: { item: NotificationItemData; onPress: () => void }) => {
  const { username, content, time, avatar } = formatNotificationText(item);
  const isRead = 'is_read' in item ? item.is_read : false;

  return (
    <TouchableOpacity 
      style={[styles.container, !isRead && styles.unreadContainer]} 
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        {/* User Avatar */}
        <Image 
          source={{ uri: avatar || 'https://via.placeholder.com/150' }} 
          style={styles.avatar} 
        />
        <View style={styles.textWrapper}>
          <Text style={styles.textContent}>
            {/* Bold Username rendered separately to avoid duplication */}
            <Text style={styles.username}>{username} </Text>
            <Text style={styles.bodyText}>{content}</Text>
            {/* Locale changed to English */}
            <Text style={styles.timeText}> {new Date(time).toLocaleDateString('en-US')}</Text>
          </Text>
        </View>
      </View>
      {/* Unread Indicator */}
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  unreadContainer: {
    backgroundColor: '#f0f7ff',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  textContent: {
    fontSize: 14,
    lineHeight: 18,
  },
  username: {
    fontWeight: 'bold',
    color: '#000',
  },
  bodyText: {
    color: '#262626',
  },
  timeText: {
    color: '#8e8e8e',
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0095f6',
    marginLeft: 8,
  },
});