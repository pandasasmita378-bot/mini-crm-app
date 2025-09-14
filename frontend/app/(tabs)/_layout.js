import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { FontAwesome } from '@expo/vector-icons'; 

export default function EmployeeTabLayout() {
  const { authenticated, user } = useAuth();

  if (!authenticated) {
    return <Redirect href="/login" />;
  }

  if (user?.role === 'admin') {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007BFF', 
        tabBarInactiveTintColor: 'gray',   
      }}
    >
      <Tabs.Screen
        name="index" 
        options={{
          title: 'Dashboard',
          headerShown: false, 
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile" 
        options={{
          title: 'Profile',
          headerShown: false,
          
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

