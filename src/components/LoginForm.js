import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import Input from './Input';
import Button from './Button';

const LoginForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Oops!', 'Please enter your email or username');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Oops!', 'Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Login API URL:', `${API_BASE_URL}/signin`);
      console.log('Login API payload:', { username: email.trim() });

      const response = await axios.post(`${API_BASE_URL}/signin`, {
        username: email.trim(),
        password: password,
      });
      console.log('Login API response:', response);

      const data = response.data;

      if (data.success) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        onSuccess();
      } else {
        Alert.alert('Login Failed', data.error || 'Please try again');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error details:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response) {
        Alert.alert('Login Error', error.response.data?.error || 'Invalid credentials');
      } else if (error.request) {
        Alert.alert('Connection Error', `Could not connect to server at ${API_BASE_URL}`);
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <View style={styles.form}>
        <Input
          placeholder="Email or Username"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          style={styles.input}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button
          title="Sign In"
          onPress={handleLogin}
          variant="filled"
          loading={isLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },
});

export default LoginForm;
