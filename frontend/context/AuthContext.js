import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'https://smruti-crm-backend.onrender.com/api';
const TOKEN_KEY = 'my-jwt';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const storage = {
  async getToken() {
    if (Platform.OS === 'web') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async setToken(token) {
    if (Platform.OS === 'web') {
      return localStorage.setItem(TOKEN_KEY, token);
    }
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clearToken() {
    if (Platform.OS === 'web') {
      return localStorage.removeItem(TOKEN_KEY);
    }
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};


export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    authenticated: null, 
    user: null,
  });

  useEffect(() => {
    const loadToken = async () => {
      const token = await storage.getToken();
      if (token) {
        try {
          const decoded = jwtDecode(token);
        
          if (decoded.exp * 1000 < Date.now()) {
            await storage.clearToken();
            setAuthState({ token: null, authenticated: false, user: null });
          } else {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setAuthState({ token, authenticated: true, user: decoded.user });
          }
        } catch (e) {
          
          await storage.clearToken();
          setAuthState({ token: null, authenticated: false, user: null });
        }
      } else {
        setAuthState({ token: null, authenticated: false, user: null });
      }
    };
    loadToken();
  }, []);

  const handleAuthSuccess = async (token) => {
    await storage.setToken(token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const decoded = jwtDecode(token);
    setAuthState({ token, authenticated: true, user: decoded.user });
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/users/register', { name, email, password });
      await handleAuthSuccess(response.data.token);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.response?.data?.msg || 'Registration failed.' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      await handleAuthSuccess(response.data.token);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.response?.data?.msg || 'Invalid credentials.' };
    }
  };

  const loginAsAdmin = async (adminName, adminKey) => {
    try {
      const response = await api.post('/users/admin/login', { adminName, adminKey });
      await handleAuthSuccess(response.data.token);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.response?.data?.msg || 'Invalid admin credentials.' };
    }
  };

  const logout = async () => {
    await storage.clearToken();
    delete api.defaults.headers.common['Authorization'];
    setAuthState({ token: null, authenticated: false, user: null });
  };

  const value = {
    ...authState,
    register,
    login,
    loginAsAdmin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

