import { useAuth } from '@/contexts/AuthContext'
import { AppStackParamList } from '@/navigation/AppStack'
import api, { addAccessTokenListener, setAccessToken } from '@/services/api'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as SecureStore from 'expo-secure-store'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'


type Props = NativeStackScreenProps<AppStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
    const { logout } = useAuth()
  // Tạm thời mock user
  const user = {
    username: 'nguyenvana',
    displayName: 'Nguyễn Văn A',
    avatar:
      'https://i.pravatar.cc/150?img=3', // avatar demo
  }

  const [accessToken, setAccessTokenState] = useState<string | null>(null)

  useEffect(() => {
    // subscribe to token changes and set current value
    const unsubscribe = addAccessTokenListener(setAccessTokenState)
    return unsubscribe
  }, [])

  const handleLogout = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token')

      if (refreshToken) {
        await api.post('/auth/logout', {
          refresh_token: refreshToken,
        })
      }
    } catch (error) {
      // ignore error
    } finally {
      await SecureStore.deleteItemAsync('refresh_token')
      // remove header from api defaults and clear in-memory token
      try { delete (api as any).defaults.headers.common.Authorization } catch (_) {}
      setAccessToken(null)

      logout()
    }
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.avatar }} style={styles.avatar} />

      <Text style={styles.displayName}>{user.displayName}</Text>
      <Text style={styles.username}>@{user.username}</Text>

      {accessToken ? (
        <Text style={styles.token} numberOfLines={2} ellipsizeMode="middle">
          {accessToken}
        </Text>
      ) : (
        <Text style={[styles.token, { color: '#999' }]}>No access token</Text>
      )} 

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() =>
          Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Huỷ' },
            { text: 'OK', onPress: handleLogout },
          ])
        }
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginBottom: 32,
  },
  token: {
    fontSize: 12,
    color: '#444',
    marginBottom: 16,
    maxWidth: '90%',
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
})
