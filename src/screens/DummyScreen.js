import { Canvas, useImage } from '@shopify/react-native-skia';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import PlayerFigure from '../components/PlayerFigure';
import { usePlayerState } from '../hooks/usePlayerState';
import { styles } from '../styles/DummyScreenStyles';

const DummyScreen = () => {
  const {
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isWaving,
    isClapping,
    isSad,
    isAngry,
    isRomance,
    handleJump,
    handleWave,
    handleClap,
    toggleWalking,
    toggleRunning,
    toggleDancing,
    toggleSad,
    toggleAngry,
    toggleRomance,
  } = usePlayerState();

  // Load face image
  const faceImage = useImage(require('../assets/a1.png'));

  return (
    <View style={styles.container}>
      {/* Buttons Row 1 - Movement */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, isWalking && styles.buttonActive]}
          onPress={toggleWalking}
        >
          <Text style={styles.buttonText}>🚶</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.runButton, isRunning && styles.buttonActive]}
          onPress={toggleRunning}
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
          onPress={toggleDancing}
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
          onPress={toggleSad}
        >
          <Text style={styles.buttonText}>😢</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.angryButton, isAngry && styles.buttonActive]}
          onPress={toggleAngry}
        >
          <Text style={styles.buttonText}>😠</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.romanceButton, isRomance && styles.buttonActive]}
          onPress={toggleRomance}
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


export default DummyScreen;