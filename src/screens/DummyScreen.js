import React, { useState } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import PlayerFigure from '../components/PlayerFigure';

const DummyScreen = () => {
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }
  };

  const handleWave = () => {
    if (!isWaving) {
      setIsWaving(true);
      // Auto-stop after waves complete (3 waves * 400ms + raise/lower time)
      setTimeout(() => setIsWaving(false), 1500);
    }
  };

  const clearOtherAnimations = (except) => {
    if (except !== 'walk') setIsWalking(false);
    if (except !== 'dance') setIsDancing(false);
  };

  return (
    <View style={styles.container}>
      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, isWalking && styles.buttonActive]}
          onPress={() => { 
            clearOtherAnimations('walk');
            setIsWalking(!isWalking); 
          }}
        >
          <Text style={styles.buttonText}>🚶</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.jumpButton]}
          onPress={handleJump}
        >
          <Text style={styles.buttonText}>🦘</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.danceButton, isDancing && styles.buttonActive]}
          onPress={() => { 
            clearOtherAnimations('dance');
            setIsDancing(!isDancing); 
          }}
        >
          <Text style={styles.buttonText}>💃</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.waveButton, isWaving && styles.buttonActive]}
          onPress={handleWave}
        >
          <Text style={styles.buttonText}>👋</Text>
        </TouchableOpacity>
      </View>

      {/* Skia Canvas */}
      <Canvas style={styles.canvas}>
        <PlayerFigure 
          x={200}
          y={400}
          playerName="Alex" 
          color="#4A90E2"
          isWalking={isWalking}
          isJumping={isJumping}
          isDancing={isDancing}
          isWaving={isWaving}
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    padding: 20,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  jumpButton: {
    backgroundColor: '#9B59B6',
  },
  danceButton: {
    backgroundColor: '#E67E22',
  },
  waveButton: {
    backgroundColor: '#27AE60',
  },
  buttonActive: {
    backgroundColor: '#E94B3C',
  },
  buttonText: {
    fontSize: 24,
  },
});

export default DummyScreen;