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
import Button from '../components/Button';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const { height } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  const [loginVisible, setLoginVisible] = useState(false);
  const [signupVisible, setSignupVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (loginVisible || signupVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
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
          navigation.replace('VirtualRoom');
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
      navigation.replace('VirtualRoom');
    }, 300);
  };

  const handleSignupSuccess = () => {
    setSignupVisible(false);
    setTimeout(() => {
      navigation.replace('VirtualRoom');
    }, 300);
  };

  const closeModals = () => {
    setLoginVisible(false);
    setSignupVisible(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.appName}>MyApp</Text>
          <Text style={styles.tagline}>Your gaming companion</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            onPress={handleLoginPress}
            variant="filled"
            style={styles.button}
          />
          <Button
            title="Create Account"
            onPress={handleSignupPress}
            variant="outlined"
            style={styles.button}
          />
        </View>
      </View>

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
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 80,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    width: '100%',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.75,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});

export default LandingScreen;
