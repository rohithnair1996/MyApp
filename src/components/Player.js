import React from 'react';
import AnimatedCharacter from './AnimatedCharacter';
import { COLORS } from '../constants/colors';

/**
 * Player component - represents the current user
 * Receives SharedValue positions from usePlayerMovement hook
 */
const Player = ({ x, y, color = COLORS.PLAYER_GREEN, image }) => {
  return <AnimatedCharacter x={x} y={y} color={color} image={image} />;
};

export default React.memo(Player);
