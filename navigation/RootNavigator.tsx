// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import AppStack from './AppStack'
import AuthStack from './AuthStack'

export default function RootNavigator() {
  const { isLoggedIn } = useAuth()

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  )
}
