import { AuthStackParamList } from '@/navigation/AuthStack'
import axios from '@/services/api'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [avatar, setAvatar] =
    useState<ImagePicker.ImagePickerAsset | null>(null)

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    })

    if (!result.canceled) {
      setAvatar(result.assets[0])
    }
  }

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Thiếu thông tin')
    }

    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp')
    }

    const formData = new FormData()
    formData.append('username', username.trim())
    formData.append('password', password)
    formData.append('display_name', displayName)

    if (avatar) {
      formData.append('avatar', {
        uri: avatar.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any)
    }

    try {
      await axios.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      Alert.alert('Thành công', 'Đăng ký thành công')
      navigation.replace('Login')
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.error?.message)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.container}>
        <Text style={styles.title}>Instagram</Text>

        <TouchableOpacity style={styles.avatar} onPress={pickAvatar}>
          {avatar ? (
            <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
          ) : (
            <Text style={{ fontSize: 32 }}>+</Text>
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <TextInput
          placeholder="Display name"
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          placeholder="Confirm password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.loginText}>Do you already have an account? </Text>
          <Text style={styles.loginLink}>Log in.</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { textAlign: 'center', fontSize: 32, fontWeight: '700', marginBottom: 12 },
  avatar: {
    alignSelf: 'center',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
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
  },
  buttonText: { textAlign: 'center', color: '#fff', fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
  loginText: { color: '#666' },
  loginLink: { color: '#2b7bf6', fontWeight: '600' },
})
