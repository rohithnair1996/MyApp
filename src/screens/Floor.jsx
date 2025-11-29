import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, Pressable, View, Text, TouchableOpacity, Alert, Vibration } from 'react-native';
import FloorBackground from '../components/FloorBackground';
import Header from '../components/Header';
import VideoContainer from '../components/VideoContainer';
import UserList from '../components/UserList';
import Player from '../components/Player';
import Tomato from '../components/Tomato';
import Plane from '../components/Plane';
import BottomSheet from '../components/BottomSheet';
import MessagePopup from '../components/MessagePopup';
import { usePlayerMovement } from '../hooks/usePlayerMovement';
import { useGameSocket } from '../hooks/useGameSocket';
import { CHARACTER_DIMENSIONS } from '../constants/character';
import { COLORS } from '../constants/colors';
import { formatPositionForAPI, parsePositionFromAPI } from '../utils/positionUtils';


const { BODY_WIDTH, BODY_HEIGHT } = CHARACTER_DIMENSIONS;


const Floor = ({ navigation }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;

  // WebSocket connection for multiplayer
  const { isConnected, players, myUserId, movePlayer, throwTomato, throwPlane, sendMessage, pokeUser, incomingTomatoThrows, incomingPlaneThrows, incomingMessages, incomingPokes, clearTomatoThrow, clearPlaneThrow, clearMessage, clearPoke } = useGameSocket();

  // Player movement hook
  const { playerX, playerY, moveToPosition } = usePlayerMovement(width / 2, height / 2);

  // Convert server players (percentage) to pixel positions for display
  const otherUsers = useMemo(() => {
    if (width === 0 || height === 0) return [];

    return players
      .filter(player => player.userId !== myUserId) // Don't show yourself as another player
      .map(player => {
        const { x, y } = parsePositionFromAPI(
          { x: player.x, y: player.y },
          width,
          height
        );
        return {
          id: player.userId,
          x,
          y,
          color: COLORS.USER_RED, // You can randomize or assign colors based on userId
          image: require('../assets/a1.png'), // You can assign different avatars
          username: player.username,
        };
      });
  }, [players, myUserId, width, height]);

  // Bottom sheet state
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Message popup state
  const [isMessagePopupVisible, setIsMessagePopupVisible] = useState(false);

  // Incoming tomato throws (tomatoes thrown at you or others)
  const [activeTomatoThrows, setActiveTomatoThrows] = useState([]);

  // Incoming plane throws (planes thrown at you or others)
  const [activePlaneThrows, setActivePlaneThrows] = useState([]);


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

  // Handle incoming tomato throws from WebSocket
  useEffect(() => {
    if (width === 0 || height === 0) return;

    // Process new incoming tomato throws
    incomingTomatoThrows.forEach((tomatoThrow) => {
      // Convert percentage position to pixel position
      const targetPosition = parsePositionFromAPI(
        { x: tomatoThrow.targetX, y: tomatoThrow.targetY },
        width,
        height
      );

      // Find the thrower's current position
      const thrower = players.find(p => p.userId === tomatoThrow.fromUserId);
      let startX, startY;

      if (thrower) {
        // If thrower is another player
        const throwerPosition = parsePositionFromAPI(
          { x: thrower.x, y: thrower.y },
          width,
          height
        );
        startX = throwerPosition.x;
        startY = throwerPosition.y;
      } else if (tomatoThrow.fromUserId === myUserId) {
        // If you threw it
        startX = playerX.value;
        startY = playerY.value;
      } else {
        // Thrower not found, skip this throw
        clearTomatoThrow(tomatoThrow.id);
        return;
      }

      // Add to active throws to be displayed
      setActiveTomatoThrows((prev) => [
        ...prev,
        {
          id: tomatoThrow.id,
          startX,
          startY,
          targetX: targetPosition.x,
          targetY: targetPosition.y,
          fromUserId: tomatoThrow.fromUserId,
          targetUserId: tomatoThrow.targetUserId,
        }
      ]);

      // Clear from incoming list
      clearTomatoThrow(tomatoThrow.id);
    });
  }, [incomingTomatoThrows, players, myUserId, width, height, playerX, playerY, clearTomatoThrow]);

  // Handle incoming plane throws from WebSocket
  useEffect(() => {
    if (width === 0 || height === 0) return;

    // Process new incoming plane throws
    incomingPlaneThrows.forEach((planeThrow) => {
      // Convert percentage position to pixel position
      const targetPosition = parsePositionFromAPI(
        { x: planeThrow.targetX, y: planeThrow.targetY },
        width,
        height
      );

      // Find the thrower's current position
      const thrower = players.find(p => p.userId === planeThrow.fromUserId);
      let startX, startY;

      if (thrower) {
        // If thrower is another player
        const throwerPosition = parsePositionFromAPI(
          { x: thrower.x, y: thrower.y },
          width,
          height
        );
        startX = throwerPosition.x;
        startY = throwerPosition.y;
      } else if (planeThrow.fromUserId === myUserId) {
        // If you threw it
        startX = playerX.value;
        startY = playerY.value;
      } else {
        // Thrower not found, skip this throw
        clearPlaneThrow(planeThrow.id);
        return;
      }

      // Add to active throws to be displayed
      setActivePlaneThrows((prev) => [
        ...prev,
        {
          id: planeThrow.id,
          startX,
          startY,
          targetX: targetPosition.x,
          targetY: targetPosition.y,
          fromUserId: planeThrow.fromUserId,
          targetUserId: planeThrow.targetUserId,
        }
      ]);

      // Clear from incoming list
      clearPlaneThrow(planeThrow.id);
    });
  }, [incomingPlaneThrows, players, myUserId, width, height, playerX, playerY, clearPlaneThrow]);

  // Handle incoming messages from WebSocket
  useEffect(() => {
    // Process new incoming messages
    incomingMessages.forEach((incomingMessage) => {
      // Find the sender's username
      const sender = players.find(p => p.userId === incomingMessage.fromUserId);
      const senderName = sender ? sender.username : 'Someone';

      // Vibrate with pattern: [wait, vibrate, wait, vibrate, ...]
      // Pattern: vibrate for 200ms, pause 100ms, repeat 3 times (~1 second total)
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);

      // Show alert with the message
      Alert.alert(
        `Message from ${senderName}`,
        incomingMessage.message,
        [{ text: 'OK' }]
      );

      // Clear from incoming list
      clearMessage(incomingMessage.id);
    });
  }, [incomingMessages, players, clearMessage]);

  // Handle incoming pokes from WebSocket
  useEffect(() => {
    // Process new incoming pokes
    incomingPokes.forEach((incomingPoke) => {
      // Find the sender's username
      const sender = players.find(p => p.userId === incomingPoke.fromUserId);
      const senderName = sender ? sender.username : 'Someone';

      // Vibrate with pattern: single short vibration
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);

      // Show alert with the poke notification
      Alert.alert(
        `👉 Poke!`,
        `${senderName} poked you!`,
        [{ text: 'OK' }]
      );

      // Clear from incoming list
      clearPoke(incomingPoke.id);
    });
  }, [incomingPokes, players, clearPoke]);

  // Handle long press events (memoized)
  const handleLongPress = useCallback((event) => {
    const { locationX, locationY } = event.nativeEvent;

    // Check if user was long pressed
    const longPressedUser = checkUserClick(locationX, locationY);
    if (longPressedUser) {
      console.log('Username:', longPressedUser.username);
    }
  }, [checkUserClick]);

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

    // Move player to clicked position locally
    moveToPosition(locationX, locationY);

    // Send position to server via WebSocket (convert to percentage)
    const position = formatPositionForAPI(locationX, locationY, width, height);
    movePlayer(position.x, position.y);
  }, [checkUserClick, moveToPosition, movePlayer, width, height]);

  return (
    <>
      {/* Connection Status Indicator */}
      <View style={styles.connectionIndicator}>
        <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </Text>
        <Text style={styles.playerCount}>Players: {players.length}</Text>
      </View>
      <Header navigation={navigation} playersLength={players.length} isConnected={isConnected} />
      <VideoContainer />
      <Pressable style={styles.container} onPress={handlePress} onLongPress={handleLongPress} onLayout={handleLayout}>
        <Canvas style={styles.canvas}>
          {width > 0 && height > 0 && (
            <>
              {/* Floor background image */}
              <FloorBackground
                width={width}
                height={height}
                imagePath={require('../images/floor3.png')}
              />

              {/* Other users */}
              <UserList users={otherUsers} />

              {/* Current player (you) */}
              <Player x={playerX} y={playerY} color="#00FF00" image={require('../assets/a4.png')} />

              {/* Active tomato throws (from any player to any player) */}
              {activeTomatoThrows.map((tomatoThrow) => (
                <Tomato
                  key={tomatoThrow.id}
                  startX={tomatoThrow.startX}
                  startY={tomatoThrow.startY}
                  targetX={tomatoThrow.targetX}
                  targetY={tomatoThrow.targetY}
                  onAnimationComplete={() => {
                    setActiveTomatoThrows((prev) => prev.filter(t => t.id !== tomatoThrow.id));
                  }}
                />
              ))}

              {/* Active plane throws (from any player to any player) */}
              {activePlaneThrows.map((planeThrow) => (
                <Plane
                  key={planeThrow.id}
                  startX={planeThrow.startX}
                  startY={planeThrow.startY}
                  targetX={planeThrow.targetX}
                  targetY={planeThrow.targetY}
                  onAnimationComplete={() => {
                    setActivePlaneThrows((prev) => prev.filter(p => p.id !== planeThrow.id));
                  }}
                />
              ))}
            </>
          )}
        </Canvas>
      </Pressable>

      {/* Bottom Sheet for Player Actions */}
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        height={300}
      >
        {selectedUser && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Player Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('Poking user:', selectedUser.username);
                // Send poke to the target user via WebSocket
                pokeUser(selectedUser.id);
                // Close bottom sheet
                setIsBottomSheetVisible(false);
              }}
            >
              <Text style={styles.actionButtonText}>👉 Poke</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSpacing]}
              onPress={() => {
                console.log('Throwing tomato at user:', selectedUser.id);

                // Convert pixel position to percentage for API
                const position = formatPositionForAPI(selectedUser.x, selectedUser.y, width, height);

                // Emit throw event via WebSocket
                throwTomato(selectedUser.id, position.x, position.y);

                // Close bottom sheet
                setIsBottomSheetVisible(false);
              }}
            >
              <Text style={styles.actionButtonText}>🍅 Throw a tomato</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSpacing]}
              onPress={() => {
                console.log('Opening message popup for user:', selectedUser.id);
                // Close bottom sheet and open message popup
                setIsBottomSheetVisible(false);
                setIsMessagePopupVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>✈️ Send a Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>

      {/* Message Popup */}
      <MessagePopup
        visible={isMessagePopupVisible}
        onClose={() => setIsMessagePopupVisible(false)}
        targetUsername={selectedUser?.username}
        onSend={(message) => {
          if (selectedUser) {
            // Convert pixel position to percentage for API
            const position = formatPositionForAPI(selectedUser.x, selectedUser.y, width, height);

            // Emit throw event via WebSocket with message
            throwPlane(selectedUser.id, position.x, position.y);
            console.log('Sending message to user:', selectedUser.id, 'message:', message);
            // Send message to the target user via WebSocket
            sendMessage(selectedUser.id, message);
          }
        }}
      />
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
  actionButtonSpacing: {
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
});

export default Floor;