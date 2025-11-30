import React, { useEffect } from 'react';
import { SimpleCharacter } from './character/SimpleCharacter';
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

  // Update walker when player position changes from server
  useEffect(() => {
    const newPos = parsePositionFromAPI(
      { x: player.x, y: player.y },
      width,
      height
    );

    walkTo(newPos.x, newPos.y);
  }, [player.x, player.y, width, height, walkTo]);

  return <SimpleCharacter x={x} y={y} walkCycle={walkCycle} image={image} />;
};

export default React.memo(RemotePlayer);
