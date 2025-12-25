import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ToastStack from './src/components/ToastStack';
import HomeScreen from './src/screens/HomeScreen';
import Floor from './src/screens/Floor';
import LandingScreen from './src/screens/LandingScreen';
import SpacesScreen from './src/screens/SpacesScreen';
import DummyScreen from './src/screens/DummyScreen';
import CreateSpaceScreen from './src/screens/CreateSpaceScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Landing">
          <Stack.Screen
            name="Landing"
            component={LandingScreen}
            options={{
              headerShown: false,
              statusBarColor: '#F8F7FF',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="Dummy"
            component={DummyScreen}
            options={{
              headerShown: false,
              statusBarColor: '#F8F7FF',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="Spaces"
            component={SpacesScreen}
            options={{
              headerShown: false,
              statusBarColor: '#F8F7FF',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="CreateSpace"
            component={CreateSpaceScreen}
            options={{
              headerShown: false,
              statusBarColor: '#F8F7FF',
              statusBarTranslucent: true,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              headerShown: false,
              statusBarColor: '#F8F7FF',
              statusBarTranslucent: true,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Floor"
            component={Floor}
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
      <ToastStack />
    </SafeAreaProvider>
  );
}

