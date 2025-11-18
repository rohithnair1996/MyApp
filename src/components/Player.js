import React from 'react';
import { Circle } from '@shopify/react-native-skia';

const Player = ({ x, y, radius = 25, color = '#00FF00', opacity = 0.9 }) => {
  return (
    <Circle
      cx={x}
      cy={y}
      r={radius}
      color={color}
      opacity={opacity}
    />
  );
};

export default Player;
