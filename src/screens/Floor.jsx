import React, { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, Pressable, Alert } from 'react-native';
import FloorBackground from '../components/FloorBackground';
import UserList from '../components/UserList';
import Player from '../components/Player';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { CHARACTER_DIMENSIONS } from '../constants/character';
import { COLORS } from '../constants/colors';

const { BODY_WIDTH, BODY_HEIGHT } = CHARACTER_DIMENSIONS;

const Floor = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;

  // Player movement hook
  const { playerX, playerY, moveToPosition } = usePlayerMovement(width / 2, height / 2);

  // Other users on the floor (memoized to prevent recreation on every render)
  const otherUsers = useMemo(() => [
    { id: '1', x: 100, y: 150, color: COLORS.USER_RED },
    { id: '2', x: 300, y: 400, color: COLORS.USER_CYAN },
    { id: '3', x: 250, y: 200, color: COLORS.USER_YELLOW },
  ], []);

  // Check if touch point is within a user's rectangular body (memoized)
  const checkUserClick = useCallback((touchX, touchY) => {
    // Input validation
    if (typeof touchX !== 'number' || typeof touchY !== 'number') {
      return null;
    }

    for (const user of otherUsers) {
      // Calculate user's rectangular bounds
      const left = user.x - BODY_WIDTH / 2;
      const right = user.x + BODY_WIDTH / 2;
      const top = user.y - BODY_HEIGHT / 2;
      const bottom = user.y + BODY_HEIGHT / 2;

      // Check if touch point is within the rectangle
      if (touchX >= left && touchX <= right && touchY >= top && touchY <= bottom) {
        return user;
      }
    }
    return null;
  }, [otherUsers]);

  // Handle layout changes to measure actual component dimensions (memoized)
  const handleLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  // Handle touch events (memoized)
  const handlePress = useCallback((event) => {
    const { locationX, locationY } = event.nativeEvent;

    // Check if user was clicked
    const clickedUser = checkUserClick(locationX, locationY);
    if (clickedUser) {
      Alert.alert('User Clicked', `User ID: ${clickedUser.id}`);
      return;
    }

    // Otherwise, move player to clicked position
    moveToPosition(locationX, locationY);
  }, [checkUserClick, moveToPosition]);

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