import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const router = useRouter();

  const [name, setName] = useState('Jacob West');
  const [username, setUsername] = useState('jacob_w');
  const [birthday, setBirthday] = useState('10/10/2004');
  const [bio, setBio] = useState('Digital goodies designer @pixsellz\nEverything is designed.');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.titleText}>Edit Profile</Text>
        
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?u=jacob_w' }}
            style={styles.avatar}
          />
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          
          <View style={styles.formRow}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.formRow}>
             <Text style={styles.label}>Birthday</Text>
             <TextInput
                value={birthday}
                onChangeText={setBirthday}
                style={styles.input}
                placeholder="DD/MM/YYYY"
             />
          </View>

          <View style={styles.formRowLast}>
            <Text style={[styles.label, { marginTop: 4 }]}>Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              style={[styles.input, styles.bioInput]}
              textAlignVertical="top"
            />
          </View>

        </View>
        
        <View style={styles.footerInfo}>
            <Text style={styles.personalInfoText}>Personal information settings</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#f9fafb', 
  },
  cancelText: {
    color: '#000',
    fontSize: 16,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  doneText: {
    color: '#3b82f6', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  changePhotoText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  formRowLast: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  label: {
    width: 112,
    fontSize: 16,
    color: '#000',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    padding: 0,
  },
  bioInput: {
    minHeight: 60,
  },
  footerInfo: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  personalInfoText: {
    color: '#3b82f6',
    fontSize: 14,
  },
});