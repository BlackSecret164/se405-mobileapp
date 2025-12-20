import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface NotificationItemData {
  id: string;
  type: 'suggestion' | 'follow_alert' | 'system';
  username?: string;
  content: string;
  subContent?: string;
  time: string;
  avatar?: string;
  isFollowing?: boolean;
}

const ActionButton = ({ isFollowing }: { isFollowing?: boolean }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isFollowing ? styles.buttonFollowing : styles.buttonFollow
      ]}
    >
      <Text style={[
        styles.buttonText, 
        isFollowing ? styles.buttonTextFollowing : styles.buttonTextFollow
      ]}>
        {isFollowing ? 'Following' : 'Follow'}
      </Text>
    </TouchableOpacity>
  );
};

export const NotificationItem = ({ item }: { item: NotificationItemData }) => {
  const isSystem = item.type === 'system';

  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        {isSystem ? (
            <View style={styles.systemIconContainer}>
                 <Ionicons name="logo-instagram" size={24} color="black" />
            </View>
        ) : (
            <Image 
                source={{ uri: item.avatar }} 
                style={styles.avatar} 
            />
        )}
        <View style={styles.textWrapper}>
          <Text style={styles.textContent}>
            {!isSystem && item.type === 'suggestion' && 'New follow suggestion: '}
            {item.username && <Text style={styles.username}>{item.username} </Text>}
            <Text>{item.content}</Text>
            {item.subContent && <Text style={styles.subContent}>{item.subContent}</Text>}
            <Text style={styles.timeText}> {item.time}</Text>
          </Text>
        </View>
      </View>
      {!isSystem && <ActionButton isFollowing={item.isFollowing} />}
    </View>
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
  button: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonFollow: {
    backgroundColor: '#3b82f6', 
  },
  buttonFollowing: {
    backgroundColor: '#e5e7eb', 
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextFollow: {
    color: '#fff',
  },
  buttonTextFollowing: {
    color: '#000',
  },
});