import React, { useState } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, Pressable, Alert } from 'react-native';
import FloorBackground from '../components/FloorBackground';
import UserList from '../components/UserList';
import Player from '../components/Player';
import { usePlayerMovement } from '../hooks/usePlayerMovement';

const Floor = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;

  // Player movement hook
  const { playerX, playerY, moveToPosition } = usePlayerMovement(width / 2, height / 2);

  // User dimensions (same as in User component)
  const bodyWidth = 24;
  const bodyHeight = 30;

  // Other users on the floor (example data - replace with real data from your backend)
  const otherUsers = [
    { id: '1', x: 100, y: 150, color: '#FF6B6B' },
    { id: '2', x: 300, y: 400, color: '#4ECDC4' },
    { id: '3', x: 250, y: 200, color: '#FFE66D' },
  ];

  // Check if touch point is within a user's rectangular body
  const checkUserClick = (touchX, touchY) => {
    for (const user of otherUsers) {
      // Calculate user's rectangular bounds
      const left = user.x - bodyWidth / 2;
      const right = user.x + bodyWidth / 2;
      const top = user.y - bodyHeight / 2;
      const bottom = user.y + bodyHeight / 2;

      // Check if touch point is within the rectangle
      if (touchX >= left && touchX <= right && touchY >= top && touchY <= bottom) {
        return user;
      }
    }
    return null;
  };

  // Handle layout changes to measure actual component dimensions
  const handleLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
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
    <Pressable style={styles.container} onPress={handlePress} onLayout={handleLayout}>
      <Canvas style={styles.canvas}>
        {width > 0 && height > 0 && (
          <>
            {/* Floor background image */}
            <FloorBackground
              width={width}
              height={height}
              imagePath={require('../images/floor.jpeg')}
            />

            {/* Other users */}
            <UserList users={otherUsers} />

            {/* Current player (you) */}
            <Player x={playerX} y={playerY} color="#00FF00" />
          </>
        )}
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