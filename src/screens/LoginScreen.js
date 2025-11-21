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

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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

  const handleLogin = () => {
    if (!username.trim()) {
      Alert.alert('Oops!', 'Please enter your username, friend!');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Oops!', 'Don\'t forget your secret password!');
      return;
    }

    // Bounce animation on success
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Alert.alert('Hooray!', `Welcome back, ${username}!`);
      // Navigate to main app after successful login
      // navigation.replace('VirtualRoom');
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
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Fun Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🎮</Text>
            </View>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Ready to play?</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Your username..."
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
                placeholder="Secret password..."
                placeholderTextColor="#B8956E"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>Let's Go! 🚀</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorationContainer}>
            <View style={[styles.bubble, styles.bubble1]} />
            <View style={[styles.bubble, styles.bubble2]} />
            <View style={[styles.bubble, styles.bubble3]} />
          </View>

          {/* Signup Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>New around here? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.linkText}>Create Account!</Text>
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
    marginBottom: 40,
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
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EE',
    borderRadius: 25,
    marginBottom: 16,
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
  bubble: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.3,
  },
  bubble1: {
    width: 80,
    height: 80,
    backgroundColor: '#C47F3E',
    top: 50,
    left: -20,
  },
  bubble2: {
    width: 60,
    height: 60,
    backgroundColor: '#D4A574',
    top: 100,
    right: -10,
  },
  bubble3: {
    width: 40,
    height: 40,
    backgroundColor: '#8B5A2B',
    bottom: 80,
    left: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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

export default LoginScreen;
