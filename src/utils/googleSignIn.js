import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// 966771549284-h3q9qf1gqtm5svefogp5eqv4hlt7ccl9.apps.googleusercontent.com

// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Get this from Google Cloud Console -> Credentials -> Web Client ID
    webClientId: '966771549284-ls8gl2l2m4rsnr19oomii2q69o30lf6r.apps.googleusercontent.com',
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

export const signInWithGoogle = async () => {
  try {
    // Check if Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Sign in and get user info
    const response = await GoogleSignin.signIn();
    const userInfo = response.data;

    console.log('Google Sign-In success:', userInfo);

    // Send the ID token to your backend for verification
    const backendResponse = await axios.post(`${API_BASE_URL}/auth/google`, {
      idToken: userInfo.idToken,
      user: {
        email: userInfo.user.email,
        name: userInfo.user.name,
        photo: userInfo.user.photo,
        googleId: userInfo.user.id,
      },
    });

    const data = backendResponse.data;

    if (data.success) {
      // Store the auth token and user data
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, error: data.error || 'Authentication failed' };
    }
  } catch (error) {
    console.error('Google Sign-In error:', error);

    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, error: 'Sign in was cancelled' };
    } else if (error.code === statusCodes.IN_PROGRESS) {
      return { success: false, error: 'Sign in is already in progress' };
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return { success: false, error: 'Play Services not available' };
    } else {
      return { success: false, error: error.message || 'Something went wrong' };
    }
  }
};

export const signOutGoogle = async () => {
  try {
    await GoogleSignin.signOut();
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    return { success: true };
  } catch (error) {
    console.error('Google Sign-Out error:', error);
    return { success: false, error: error.message };
  }
};

export const isGoogleSignedIn = async () => {
  const isSignedIn = await GoogleSignin.isSignedIn();
  return isSignedIn;
};
