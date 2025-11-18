import { useSharedValue, withTiming } from 'react-native-reanimated';

const WALKING_SPEED = 150; // pixels per second

export const usePlayerMovement = (initialX, initialY) => {
  const playerX = useSharedValue(initialX);
  const playerY = useSharedValue(initialY);

  const moveToPosition = (targetX, targetY) => {
    // Calculate distance from current position to target
    const currentX = playerX.value;
    const currentY = playerY.value;
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Calculate duration based on constant walking speed
    const duration = (distance / WALKING_SPEED) * 1000; // Convert to milliseconds

    // Animate player movement to touched position with constant speed
    playerX.value = withTiming(targetX, { duration });
    playerY.value = withTiming(targetY, { duration });
  };

  return {
    playerX,
    playerY,
    moveToPosition,
  };
};
