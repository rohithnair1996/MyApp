import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

const SignupScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSignup = () => {
    if (!username.trim()) {
      triggerShake();
      Alert.alert('Oops!', 'Pick a cool username, friend!');
      return;
    }
    if (!password.trim()) {
      triggerShake();
      Alert.alert('Oops!', 'Create a secret password!');
      return;
    }
    if (password.length < 6) {
      triggerShake();
      Alert.alert('Hmm...', 'Make your password at least 6 characters strong!');
      return;
    }
    if (!confirmPassword.trim()) {
      triggerShake();
      Alert.alert('Oops!', 'Please confirm your secret password!');
      return;
    }
    if (password !== confirmPassword) {
      triggerShake();
      Alert.alert('Uh oh!', 'Your passwords don\'t match! Try again!');
      return;
    }

    // Success animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.15,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Alert.alert(
        'Awesome!',
        `Welcome to the crew, ${username}!`,
        [
          {
            text: 'Let\'s Login!',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          {/* Fun Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🎉</Text>
            </View>
            <Text style={styles.title}>Join the Fun!</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Pick a cool username..."
                placeholderTextColor="#B8956E"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a secret password..."
                placeholderTextColor="#B8956E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password..."
                placeholderTextColor="#B8956E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Password Match Indicator */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Text style={styles.matchIcon}>
                  {password === confirmPassword ? '✅' : '❌'}
                </Text>
                <Text
                  style={[
                    styles.matchText,
                    { color: password === confirmPassword ? '#4CAF50' : '#E74C3C' },
                  ]}
                >
                  {password === confirmPassword
                    ? 'Passwords match!'
                    : 'Passwords don\'t match yet'}
                </Text>
              </View>
            )}

            {/* Signup Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignup}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>Sign Me Up! ✨</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorationContainer}>
            <View style={[styles.star, styles.star1]}>
              <Text style={styles.starEmoji}>⭐</Text>
            </View>
            <View style={[styles.star, styles.star2]}>
              <Text style={styles.starEmoji}>🌟</Text>
            </View>
            <View style={[styles.star, styles.star3]}>
              <Text style={styles.starEmoji}>✨</Text>
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Login!</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E3C2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C47F3E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  iconEmoji: {
    fontSize: 45,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B5A2B',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#A67B4C',
    marginTop: 8,
    fontStyle: 'italic',
  },
  formContainer: {
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EE',
    borderRadius: 25,
    marginBottom: 14,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#D4A574',
    shadowColor: '#8B5A2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  inputIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: '500',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: -5,
  },
  matchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  matchText: {
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#8B5A2B',
    borderRadius: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#5C3D1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#6B4423',
  },
  buttonText: {
    color: '#FFF8EE',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  decorationContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  star: {
    position: 'absolute',
  },
  star1: {
    top: 60,
    left: 10,
  },
  star2: {
    top: 120,
    right: 20,
  },
  star3: {
    bottom: 100,
    left: 40,
  },
  starEmoji: {
    fontSize: 24,
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  footerText: {
    fontSize: 16,
    color: '#A67B4C',
  },
  linkText: {
    fontSize: 16,
    color: '#8B5A2B',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
