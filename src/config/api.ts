import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL as ENV_API_URL } from '@env';

export const API_BASE_URL = ENV_API_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Get auth token from storage
    const token = await AsyncStorage.getItem('authToken');

    // Add auth token to headers if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (__DEV__) {
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    if (__DEV__) {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (__DEV__) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Log error in development
    if (__DEV__) {
      console.error('API Error:', {
        status: error.response?.status,
        url: originalRequest?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear stored auth data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');

      // You can emit an event here to trigger logout/redirect to login
      // For example: EventEmitter.emit('UNAUTHORIZED');
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('Access forbidden - insufficient permissions');
    }

    // Handle 500 Internal Server Error
    if (error.response?.status === 500) {
      console.error('Server error - please try again later');
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error - please check your connection');
    }

    return Promise.reject(error);
  }
);

export default api;
