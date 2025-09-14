
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { authenticated, user } = useAuth();

  if (authenticated === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!authenticated) return <Redirect href="/login" />;
  if (user?.role === 'admin') return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(tabs)" />;
}
