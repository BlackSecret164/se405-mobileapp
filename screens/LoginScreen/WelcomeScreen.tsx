import { router } from 'expo-router'
import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

// 👇 THÊM IMPORT NÀY
import { AuthStackParamList } from '@/navigation/AuthStack'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

// 👇 TYPE CHO SCREEN
type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>

export default function WelcomeScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/follow-first')
    }, 6000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎉 Chào mừng bạn đến với Instagram!</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 22, fontWeight: '600' },
})
