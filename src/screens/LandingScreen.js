import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const { height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in animation on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (loginVisible || signupVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 40,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [loginVisible, signupVisible]);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          navigation.replace('Spaces');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, [navigation]);

  const handleLoginPress = () => {
    setLoginVisible(true);
  };

  const handleSignupPress = () => {
    setSignupVisible(true);
  };

  const handleLoginSuccess = () => {
    setLoginVisible(false);
    setTimeout(() => {
      navigation.replace('Spaces');
    }, 300);
  };

  const handleSignupSuccess = () => {
    setSignupVisible(false);
    setTimeout(() => {
      navigation.replace('Spaces');
    }, 300);
  };

  const closeModals = () => {
    setLoginVisible(false);
    setSignupVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Decorative subtle circle */}
        <View style={styles.decorativeCircle} />

        <View style={styles.centerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.appName}>MyApp</Text>
            <Text style={styles.tagline}>A space for gentle presence</Text>
          </View>
        </View>

        <View style={styles.bottomContent}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.subtleText}>
            Join a calm space to connect with friends
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleLoginPress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSignupPress}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Create account</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Take your time. No rush here.
          </Text>
        </View>
      </Animated.View>

      {/* Login Modal */}
      <Modal
        visible={loginVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModals}
      >
        <TouchableWithoutFeedback onPress={closeModals}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.handleBar} />
                <LoginForm onSuccess={handleLoginSuccess} />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Signup Modal */}
      <Modal
        visible={signupVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModals}
      >
        <TouchableWithoutFeedback onPress={closeModals}>
          <View style={styles.modalBackdrop}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.modalContent,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.handleBar} />
                <SignupForm onSuccess={handleSignupSuccess} />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#F0EDE8',
    opacity: 0.6,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 44,
    fontWeight: '300',
    color: '#2C2C2C',
    letterSpacing: 3,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 15,
    color: '#8A8A8A',
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  bottomContent: {
    paddingBottom: 60,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  subtleText: {
    fontSize: 15,
    color: '#7A7A7A',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: '#2C2C2C',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0DDD8',
  },
  secondaryButtonText: {
    color: '#5A5A5A',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 28,
    fontSize: 13,
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(44, 44, 44, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FAFAF9',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
});

export default LandingScreen;
