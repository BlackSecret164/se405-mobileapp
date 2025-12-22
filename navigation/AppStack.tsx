// src/navigation/AppStack.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import HomeScreen from '../screens/HomeScreen/HomeScreen'

export type AppStackParamList = {
  Home: undefined
}

const Stack = createNativeStackNavigator<AppStackParamList>()

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  )
}
