import React from 'react';
import AnimatedCharacter from './oldCharacter/AnimatedCharacter';

/**
 * Player component - represents the current user
 * Receives SharedValue positions from usePlayerMovement hook
 */
const Player = ({ x, y, image }) => {
  return <AnimatedCharacter x={x} y={y} image={image} />;
};

export default React.memo(Player);
