import React from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { useWindowDimensions, StyleSheet, Pressable } from 'react-native';
import FloorBackground from '../components/FloorBackground';
import UserList from '../components/UserList';
import Player from '../components/Player';
import { usePlayerMovement } from '../hooks/usePlayerMovement';

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

  // Handle touch events
  const handlePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
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
        <UserList users={otherUsers} radius={25} opacity={0.8} />

        {/* Current player (you) */}
        <Player x={playerX} y={playerY} radius={25} color="#00FF00" opacity={0.9} />
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