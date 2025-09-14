import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { authenticated, user, authLoading } = useAuth();


  if (authLoading) {
    return null; 
  }

  if (!authenticated) {
    return <Redirect href="/login" />;
  }
  

  if (user?.role !== 'admin') {
    return <Redirect href="/" />; 
  }

  
  return (
    <Stack
      
      screenOptions={{
       
        headerShown: false,
      }}
    />
  );
}

