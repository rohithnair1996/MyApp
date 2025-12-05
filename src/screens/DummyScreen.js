import React, { useState } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import PlayerFigure from '../components/PlayerFigure';

const DummyScreen = () => {
  const [isWalking, setIsWalking] = useState(false);

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <TouchableOpacity 
        style={[styles.button, isWalking && styles.buttonActive]}
        onPress={() => setIsWalking(!isWalking)}
      >
        <Text style={styles.buttonText}>
          {isWalking ? '🚶 Walking...' : '🧍 Idle (Tap to Walk)'}
        </Text>
      </TouchableOpacity>

      {/* Skia Canvas */}
      <Canvas style={styles.canvas}>
        <PlayerFigure 
          x={150}
          y={350}
          playerName="Alex" 
          color="#4A90E2"
          isWalking={isWalking}
        />

        <PlayerFigure 
          x={250} 
          y={350} 
          playerName="Sam" 
          color="#E94B3C"
          isWalking={!isWalking}  // Opposite state for fun!
        />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  canvas: {
    flex: 1,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#E94B3C',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DummyScreen;