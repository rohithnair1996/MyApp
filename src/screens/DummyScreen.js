import React, { useState } from 'react';
import { Canvas, useImage } from '@shopify/react-native-skia';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import PlayerFigure from '../components/PlayerFigure';

const DummyScreen = () => {
  const [isWalking, setIsWalking] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [isClapping, setIsClapping] = useState(false);
  const [isSad, setIsSad] = useState(false);
  const [isAngry, setIsAngry] = useState(false);
  const [isRomance, setIsRomance] = useState(false);

  // Load face image
  const faceImage = useImage(require('../assets/a1.png'));

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
      setTimeout(() => setIsClapping(false), 1500);
    }
  };

  const clearMovement = () => {
    setIsWalking(false);
    setIsRunning(false);
    setIsDancing(false);
  };

  const clearEmotions = () => {
    setIsSad(false);
    setIsAngry(false);
    setIsRomance(false);
  };

  return (
    <View style={styles.container}>
      {/* Buttons Row 1 - Movement */}
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

      {/* Buttons Row 2 - Actions */}
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

      {/* Buttons Row 3 - Emotions */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.button, styles.sadButton, isSad && styles.buttonActive]}
          onPress={() => { clearEmotions(); setIsSad(!isSad); }}
        >
          <Text style={styles.buttonText}>😢</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.angryButton, isAngry && styles.buttonActive]}
          onPress={() => { clearEmotions(); setIsAngry(!isAngry); }}
        >
          <Text style={styles.buttonText}>😠</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.romanceButton, isRomance && styles.buttonActive]}
          onPress={() => { clearEmotions(); setIsRomance(!isRomance); }}
        >
          <Text style={styles.buttonText}>🥰</Text>
        </TouchableOpacity>
      </View>

      {/* Skia Canvas */}
      <Canvas style={styles.canvas}>
        <PlayerFigure 
          x={200}
          y={400}
          playerName="Alex" 
          color="#4A90E2"
          faceImage={faceImage}  
          isWalking={isWalking}
          isRunning={isRunning}
          isJumping={isJumping}
          isDancing={isDancing}
          isWaving={isWaving}
          isClapping={isClapping}
          isSad={isSad}
          isAngry={isAngry}
          isRomance={isRomance}
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
    paddingVertical: 8,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 50,
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
  sadButton: {
    backgroundColor: '#5DADE2',
  },
  angryButton: {
    backgroundColor: '#C0392B',
  },
  romanceButton: {
    backgroundColor: '#FF69B4',
  },
  buttonActive: {
    backgroundColor: '#2C3E50',
  },
  buttonText: {
    fontSize: 22,
  },
});

export default DummyScreen;