import React from 'react';
import { View, Text, Image, FlatList, Dimensions, SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ProfileHeader } from '../components/ProfileHeader';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3;

const POSTS = Array.from({ length: 12 }).map((_, i) => ({
  id: i.toString(),
  image: `https://picsum.photos/400/400?random=${i + 10}`,
}));

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
          <Text style={styles.headerText}>jacob_w</Text>
      </View>

      <FlatList
        data={POSTS}
        keyExtractor={(item: { id: any; }) => item.id}
        numColumns={3}
        ListHeaderComponent={ProfileHeader} 
        renderItem={({ item }: { item: { id: string; image: string } }) => (
          <View style={{ width: IMAGE_SIZE, height: IMAGE_SIZE, borderWidth: 1, borderColor: '#fff' }}>
             <Image 
                source={{ uri: item.image }} 
                style={styles.gridImage}
                resizeMode="cover"
             />
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});

export default ProfileScreen;