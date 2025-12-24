import { Canvas, useImage } from '@shopify/react-native-skia';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import PlayerFigure from '../components/PlayerFigure';
import { ANIMATION } from '../constants/playerConstants';
import { usePlayerState } from '../hooks/usePlayerState';
import { styles } from '../styles/DummyScreenStyles';

// Static array moved outside component to prevent recreation
const SPEECH_PHRASES = ['Nice to meet you!', 'Hello there!', 'How are you?'];

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

  // Position shared values
  const x = useSharedValue(200);
  const y = useSharedValue(400);

  // Speech bubble state with auto-disappear
  const [speechText, setSpeechText] = useState(null);
  const [speechIndex, setSpeechIndex] = useState(0);
  const speechTimerRef = useRef(null);

  const showSpeech = useCallback(() => {
    // Clear any existing timer
    if (speechTimerRef.current) {
      clearTimeout(speechTimerRef.current);
    }

    // Set the speech text
    setSpeechIndex((prev) => {
      const newText = SPEECH_PHRASES[prev];
      setSpeechText(newText);
      return (prev + 1) % SPEECH_PHRASES.length;
    });

    // Auto-disappear after duration
    speechTimerRef.current = setTimeout(() => {
      setSpeechText(null);
    }, ANIMATION.speechBubble.displayDuration);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (speechTimerRef.current) {
        clearTimeout(speechTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Character Preview</Text>
        <Text style={styles.headerSubtitle}>Explore movements and expressions</Text>
      </View>

      {/* Skia Canvas */}
      <Canvas style={styles.canvas}>
        <PlayerFigure
          x={x}
          y={y}
          playerName="Alex"
          color="#7A8B99"
          faceImage={faceImage}
          speechText={speechText}
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

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Movement */}
        <Text style={styles.sectionLabel}>Movement</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, isWalking && styles.buttonActive]}
            onPress={toggleWalking}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>🚶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.runButton, isRunning && styles.buttonActive]}
            onPress={toggleRunning}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>🏃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.jumpButton]}
            onPress={handleJump}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>🦘</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.danceButton, isDancing && styles.buttonActive]}
            onPress={toggleDancing}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>💃</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.waveButton, isWaving && styles.buttonActive]}
            onPress={handleWave}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>👋</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clapButton, isClapping && styles.buttonActive]}
            onPress={handleClap}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>👏</Text>
          </TouchableOpacity>
        </View>

        {/* Expressions */}
        <Text style={styles.sectionLabel}>Expressions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.sadButton, isSad && styles.buttonActive]}
            onPress={toggleSad}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>😢</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.angryButton, isAngry && styles.buttonActive]}
            onPress={toggleAngry}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>😠</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.romanceButton, isRomance && styles.buttonActive]}
            onPress={toggleRomance}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>🥰</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.speechButton, speechText && styles.buttonActive]}
            onPress={showSpeech}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DummyScreen;