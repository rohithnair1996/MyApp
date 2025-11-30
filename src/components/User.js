import React, { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import AnimatedCharacter from './oldCharacter/AnimatedCharacter';
import { WALKING_SPEED } from '../constants/character';

/**
 * User component - represents other players
 * Receives regular number positions from WebSocket and smoothly animates to them
 */
const User = ({ x, y, color, image }) => {
  // Animated position values for smooth transitions
  const animatedX = useSharedValue(x);
  const animatedY = useSharedValue(y);

  // Animate to new position when props change
  useEffect(() => {
    const deltaX = x - animatedX.value;
    const deltaY = y - animatedY.value;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only animate if there's a meaningful change
    if (distance > 0.5) {
      // Calculate duration based on distance (same as player movement)
      const duration = (distance / WALKING_SPEED) * 1000;

      animatedX.value = withTiming(x, { duration });
      animatedY.value = withTiming(y, { duration });
    }
  }, [x, y]);

  return <AnimatedCharacter x={animatedX} y={animatedY} color={color} image={image} />;
};

export default React.memo(User);
