import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import VirtualRoom from './src/screens/VirtualRoom';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
              statusBarColor: 'transparent',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{
              headerShown: false,
              statusBarColor: 'transparent',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="VirtualRoom"
            component={VirtualRoom}
            options={{
              headerShown: false,
              statusBarColor: 'transparent',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

