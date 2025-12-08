import React, { useState } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import PlayerFigure from '../components/PlayerFigure';

const DummyScreen = () => {
  const [isWalking, setIsWalking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isClapping, setIsClapping] = useState(false);

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      setTimeout(() => setIsJumping(false), 600);
    }
  };

  const handleWave = () => {
    if (!isWaving) {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 1500);
    }
  };

  const handleClap = () => {
    if (!isClapping) {
      setIsClapping(true);
      // Auto-stop after claps complete (4 claps * 300ms + raise/lower time)
      setTimeout(() => setIsClapping(false), 1500);
    }
  };

  const clearMovement = () => {
    setIsWalking(false);
    setIsRunning(false);
    setIsDancing(false);
  };

  return (
    <View style={styles.container}>
      {/* Buttons Row 1 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, isWalking && styles.buttonActive]}
          onPress={() => { clearMovement(); setIsWalking(!isWalking); }}
        >
          <Text style={styles.buttonText}>🚶</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.runButton, isRunning && styles.buttonActive]}
          onPress={() => { clearMovement(); setIsRunning(!isRunning); }}
        >
          <Text style={styles.buttonText}>🏃</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.jumpButton]}
          onPress={handleJump}
        >
          <Text style={styles.buttonText}>🦘</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.danceButton, isDancing && styles.buttonActive]}
          onPress={() => { clearMovement(); setIsDancing(!isDancing); }}
        >
          <Text style={styles.buttonText}>💃</Text>
        </TouchableOpacity>
      </View>

      {/* Buttons Row 2 */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.waveButton, isWaving && styles.buttonActive]}
          onPress={handleWave}
        >
          <Text style={styles.buttonText}>👋</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clapButton, isClapping && styles.buttonActive]}
          onPress={handleClap}
        >
          <Text style={styles.buttonText}>👏</Text>
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
          isRunning={isRunning}
          isJumping={isJumping}
          isDancing={isDancing}
          isWaving={isWaving}
          isClapping={isClapping}
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
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 55,
  },
  runButton: {
    backgroundColor: '#E74C3C',
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
  clapButton: {
    backgroundColor: '#3498DB',
  },
  buttonActive: {
    backgroundColor: '#2C3E50',
  },
  buttonText: {
    fontSize: 24,
  },
});

export default DummyScreen;