import React, { useEffect, useState } from 'react';
import { useImage } from '@shopify/react-native-skia';
import PlayerFigure from './PlayerFigure';
import { useWalker } from './character/useWalker';
import { parsePositionFromAPI } from '../utils/positionUtils';

/**
 * RemotePlayer component - represents another user with their own walking animation
 */
const RemotePlayer = ({ player, width, height, image }) => {
  const initialPos = parsePositionFromAPI(
    { x: player.x || 50, y: player.y || 50 },
    width,
    height
  );

  const { x, y, walkCycle, walkTo } = useWalker(initialPos.x, initialPos.y);
  const faceImage = useImage(image);
  const [isWalking, setIsWalking] = useState(false);

  // Update walker when player position changes from server
  useEffect(() => {
    const newPos = parsePositionFromAPI(
      { x: player.x, y: player.y },
      width,
      height
    );

    // Calculate distance and duration for walking animation
    const dx = newPos.x - x.value;
    const dy = newPos.y - y.value;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 1) {
      const speed = 100; // pixels per second (same as useWalker)
      const duration = (distance / speed) * 1000;

      // Start walking animation
      setIsWalking(true);

      walkTo(newPos.x, newPos.y);

      // Stop walking after animation completes
      setTimeout(() => {
        setIsWalking(false);
      }, duration);
    }
  }, [player.x, player.y, width, height, walkTo, x, y]);

  return (
    <PlayerFigure
      x={x}
      y={y}
      playerName={player.username || 'Player'}
      color="#E24A4A"
      faceImage={faceImage}
      isWalking={isWalking}
    />
  );
};

export default React.memo(RemotePlayer);
