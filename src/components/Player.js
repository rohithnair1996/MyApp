import React from 'react';
import { Circle } from '@shopify/react-native-skia';

const Player = ({ x, y, radius = 25, color = '#00FF00' }) => {
  return (
    <Circle
      cx={x}
      cy={y}
      r={radius}
      color={color}
    />
  );
};

export default Player;
