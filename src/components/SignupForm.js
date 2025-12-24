import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import Input from './Input';
import Button from './Button';
import { configureGoogleSignIn, signInWithGoogle } from '../utils/googleSignIn';

const SignupForm = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        onSuccess();
      } else {
        Alert.alert('Google Sign-In Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong with Google Sign-In');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!username.trim()) {
      Alert.alert('Oops!', 'Please enter a username');
      return;
    }
    if (username.trim().length < 3) {
      Alert.alert('Oops!', 'Username must be at least 3 characters');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Oops!', 'Please enter a password');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Oops!', 'Password must be at least 6 characters');
      return;
    }
    if (!confirmPassword.trim()) {
      Alert.alert('Oops!', 'Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Oops!', 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/signup', {
        username: username.trim(),
        password: password,
      });

      const data = response.data;

      if (data.success) {
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        onSuccess();
      } else {
        Alert.alert('Signup Failed', data.error || 'Please try again');
      }
    } catch (error) {
      if (error.response) {
        Alert.alert('Signup Error', error.response.data?.error || 'Could not create account');
      } else if (error.request) {
        Alert.alert('Connection Error', 'Could not connect to server. Please check your connection.');
      } else {
        Alert.alert('Error', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join us today</Text>

      <View style={styles.form}>
        <Input
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        {confirmPassword.length > 0 && (
          <View style={styles.matchIndicator}>
            <Text style={styles.matchIcon}>
              {password === confirmPassword ? '✅' : '❌'}
            </Text>
            <Text
              style={[
                styles.matchText,
                { color: password === confirmPassword ? '#4CAF50' : '#FF3B30' },
              ]}
            >
              {password === confirmPassword
                ? 'Passwords match'
                : 'Passwords do not match'}
            </Text>
          </View>
        )}

        <Button
          title="Create Account"
          onPress={handleSignup}
          variant="filled"
          loading={isLoading}
          style={styles.button}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={isGoogleLoading}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>
            {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
          </Text>
        </TouchableOpacity>
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
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
  },
  matchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C4043',
  },
});

export default SignupForm;
