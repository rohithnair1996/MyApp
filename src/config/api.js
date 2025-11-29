// API Configuration - loaded from .env file
import { API_BASE_URL as ENV_API_URL } from '@env';

export const API_BASE_URL = ENV_API_URL;

// Helper function to make authenticated requests
export const authFetch = async (endpoint, options = {}) => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const token = await AsyncStorage.getItem('authToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};
