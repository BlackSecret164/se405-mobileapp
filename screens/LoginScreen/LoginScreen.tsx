import { useAuth } from '@/contexts/AuthContext'
import api, { setAccessToken } from '@/services/api'
import { router } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import React, { useState } from 'react'
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

// 👇 THÊM IMPORT NÀY
import { AuthStackParamList } from '@/navigation/AuthStack'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

// 👇 TYPE CHO SCREEN
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleLogin = async () => {
    if (!username || !password) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin')
    }

    try {
      setLoading(true)
      const res = await api.post('/auth/login', {
        username: username.trim(),
        password,
      })

      const { user, access_token, refresh_token } = res.data

      await SecureStore.setItemAsync('refresh_token', refresh_token)
      setAccessToken(access_token)

      if (user.is_new_user) {
        router.replace('/welcome')
      } else {
        router.replace('/(tabs)/home')
      }
      login()
    } catch (err: any) {
      Alert.alert('Đăng nhập thất bại', err.response?.data?.error?.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.logo}>Instagram</Text>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Log in'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => router.push('/register')}>
          Don’t have an account? Sign up
        </Text>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#9ad0f5',
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', marginTop: 24, color: '#3797ef' },
})
