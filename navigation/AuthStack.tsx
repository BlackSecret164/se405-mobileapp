// src/navigation/AuthStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import FollowFirstScreen from '../screens/LoginScreen/FollowFirstScreen'
import LoginScreen from '../screens/LoginScreen/LoginScreen'
import WelcomeScreen from '../screens/LoginScreen/WelcomeScreen'
import RegisterScreen from '../screens/RegisterScreen/RegisterScreen'

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  Welcome: undefined
  FollowFirst: undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>()

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="FollowFirst" component={FollowFirstScreen} />
    </Stack.Navigator>
  )
}
