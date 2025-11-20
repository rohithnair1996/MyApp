import React, { useState, useMemo, useCallback } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, Pressable, View, Text, TouchableOpacity } from 'react-native';
import FloorBackground from '../components/FloorBackground';
import UserList from '../components/UserList';
import Player from '../components/Player';
import Tomato from '../components/Tomato';
import BottomSheet from '../components/BottomSheet';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { CHARACTER_DIMENSIONS } from '../constants/character';
import { COLORS } from '../constants/colors';
import { formatPositionForAPI, parsePositionFromAPI } from '../utils/positionUtils';

const { BODY_WIDTH, BODY_HEIGHT } = CHARACTER_DIMENSIONS;

const Floor = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;

  // Player movement hook
  const { playerX, playerY, moveToPosition } = usePlayerMovement(width / 2, height / 2);

  // Other users on the floor (now in state so it can be updated)
  const [otherUsers, setOtherUsers] = useState([
    { id: '1', x: 100, y: 150, color: COLORS.USER_RED },
    { id: '2', x: 300, y: 400, color: COLORS.USER_CYAN },
    { id: '3', x: 250, y: 200, color: COLORS.USER_YELLOW },
  ]);

  // Bottom sheet state
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Tomato visibility and target state
  const [showTomato, setShowTomato] = useState(false);
  const [tomatoTarget, setTomatoTarget] = useState(null);

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

  /**
   * Send player position to API using percentage values
   * Call this function when you want to update player position on the server
   */
  const sendPositionToAPI = useCallback(async (x, y) => {
    const position = formatPositionForAPI(x, y, width, height);

    console.log('Sending position to API:', position);
    // Example: Replace with your actual API call
    // try {
    //   const response = await fetch('YOUR_API_ENDPOINT/player/position', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ x: position.x, y: position.y }),
    //   });
    //   const data = await response.json();
    //   return data;
    // } catch (error) {
    //   console.error('Error sending position:', error);
    // }

    return position;
  }, [width, height]);

  /**
   * Update other users' positions from API data (percentage values)
   * Call this function when you receive position updates from the server
   * @param {Array} apiUsers - Array of users with percentage-based positions
   * Example: [{ id: '1', x: 25.5, y: 30.2, color: '#FF6B6B' }]
   */
  const updateOtherUsersPosition = useCallback((apiUsers) => {
    if (!Array.isArray(apiUsers)) {
      console.error('updateOtherUsersPosition: apiUsers must be an array');
      return;
    }

    const updatedUsers = apiUsers.map(apiUser => {
      const { x, y } = parsePositionFromAPI(
        { x: apiUser.x, y: apiUser.y },
        width,
        height
      );

      return {
        ...apiUser,
        x,
        y,
      };
    });

    setOtherUsers(updatedUsers);
  }, [width, height]);

  /**
   * Move a specific user to a new position (using percentage values from API)
   * @param {string} userId - The ID of the user to move
   * @param {number} xPercent - X percentage (0-100)
   * @param {number} yPercent - Y percentage (0-100)
   */
  const moveOtherUser = useCallback((userId, xPercent, yPercent) => {
    const { x, y } = parsePositionFromAPI(
      { x: xPercent, y: yPercent },
      width,
      height
    );

    setOtherUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, x, y } : user
      )
    );
  }, [width, height]);

  // Handle touch events (memoized)
  const handlePress = useCallback(async (event) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log('Touch at:', locationX, locationY);

    // Check if user was clicked
    const clickedUser = checkUserClick(locationX, locationY);
    console.log('Clicked user:', clickedUser);
    if (clickedUser) {
      console.log('Opening bottom sheet for user:', clickedUser.id);
      setSelectedUser(clickedUser);
      setIsBottomSheetVisible(true);
      return;
    }

    // Move player to clicked position
    moveToPosition(locationX, locationY);

    // Send position to API with percentage values
    await sendPositionToAPI(locationX, locationY);
  }, [checkUserClick, moveToPosition, sendPositionToAPI]);

  return (
    <>
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

              {/* Tomato above player's head (only when thrown) */}
              {showTomato && tomatoTarget && (
                <Tomato
                  startX={playerX}
                  startY={playerY}
                  targetX={tomatoTarget.x}
                  targetY={tomatoTarget.y}
                  onAnimationComplete={() => setShowTomato(false)}
                />
              )}
            </>
          )}
        </Canvas>
      </Pressable>

      {/* Bottom Sheet for Player Actions */}
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        height={250}
      >
        {selectedUser && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Player Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('Throwing tomato at user:', selectedUser.id);
                setTomatoTarget({ x: selectedUser.x, y: selectedUser.y });
                setShowTomato(true);
                setIsBottomSheetVisible(false);
              }}
            >
              <Text style={styles.actionButtonText}>🍅 Throw a tomato</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    paddingVertical: 20,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
});

export default Floor;