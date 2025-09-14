
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Add New Customer' }} />
        <Stack.Screen name="customer/[id]/index" options={{ title: 'Customer Details' }} />
        <Stack.Screen name="customer/[id]/edit" options={{ presentation: 'modal', title: 'Edit Customer' }} />
        <Stack.Screen name="customer/[id]/add-lead" options={{ presentation: 'modal', title: 'Add New Lead' }} />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

