import React from 'react';
import { Stack } from 'expo-router';
import EditProfileScreen from '../screens/EditProfileScreen';

export default function EditProfileRoute() {
  return (
    <>
      <Stack.Screen 
        options={{ 
            headerShown: false, 
            presentation: 'modal',
            animation: 'slide_from_bottom' 
        }} 
      />
      <EditProfileScreen />
    </>
  );
}