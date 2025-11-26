import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import VirtualRoom from './src/screens/VirtualRoom';
import LandingScreen from './src/screens/LandingScreen';
import SpacesScreen from './src/screens/SpacesScreen';

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
              statusBarColor: '#000000',
              statusBarTranslucent: true,
            }}
          />
          <Stack.Screen
            name="Spaces"
            component={SpacesScreen}
            options={{
              headerShown: false,
              statusBarColor: '#000000',
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

