import React from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { useWindowDimensions, StyleSheet, Pressable, Alert } from 'react-native';
import FloorBackground from '../components/FloorBackground';
import UserList from '../components/UserList';
import Player from '../components/Player';
import { usePlayerMovement } from '../hooks/usePlayerMovement';

const USER_RADIUS = 10;

const Floor = () => {
  const { width, height } = useWindowDimensions();

  // Player movement hook
  const { playerX, playerY, moveToPosition } = usePlayerMovement(width / 2, height / 2);

  // Other users on the floor (example data - replace with real data from your backend)
  const otherUsers = [
    { id: '1', x: 100, y: 150, color: '#FF6B6B' },
    { id: '2', x: 300, y: 400, color: '#4ECDC4' },
    { id: '3', x: 250, y: 200, color: '#FFE66D' },
  ];

  // Check if touch point is within a user's circle
  const checkUserClick = (touchX, touchY) => {
    for (const user of otherUsers) {
      const distance = Math.sqrt(
        Math.pow(touchX - user.x, 2) + Math.pow(touchY - user.y, 2)
      );
      if (distance <= USER_RADIUS) {
        return user;
      }
    }
    return null;
  };

  // Handle touch events
  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    // Check if user was clicked
    const clickedUser = checkUserClick(locationX, locationY);
    if (clickedUser) {
      Alert.alert('User Clicked', `User ID: ${clickedUser.id}`);
      return;
    }

    // Otherwise, move player to clicked position
    moveToPosition(locationX, locationY);
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Canvas style={styles.canvas}>
        {/* Floor background image */}
        <FloorBackground
          width={width}
          height={height}
          imagePath={require('../images/floor.jpeg')}
        />

        {/* Other users */}
        <UserList users={otherUsers} radius={USER_RADIUS} />

        {/* Current player (you) */}
        <Player x={playerX} y={playerY} radius={USER_RADIUS} color="#00FF00" opacity={0.9} />
      </Canvas>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default Floor;