import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';
import { NotificationItem, NotificationItemData } from '../components/NotificationItem';

interface NotificationSection {
  title: string;
  data: NotificationItemData[];
}

const NOTIFICATIONS_DATA: NotificationSection[] = [
  { title: 'Last 7 days', data: [{ id: '1', type: 'suggestion', username: 'trg_dhuy11', content: '', subContent: '. You have 3 mutuals.', time: '5d', avatar: 'https://i.pravatar.cc/150?u=trg_dhuy11', isFollowing: false }] },
  { title: 'Last 30 days', data: [{ id: '2', type: 'follow_alert', username: 'ben15anthony', content: 'started following you.', time: 'Nov 29', avatar: 'https://i.pravatar.cc/150?u=ben15', isFollowing: true }] },
];

const NotificationScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <SectionList
        sections={NOTIFICATIONS_DATA}
        keyExtractor={(item: { id: any; }) => item.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }: { item: NotificationItemData }) => <NotificationItem item={item} />}
        renderSectionHeader={({ section: { title } }: { section: NotificationSection }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
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
});

export default NotificationScreen;