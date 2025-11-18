import React from 'react';
import { Circle } from '@shopify/react-native-skia';

const User = ({ x, y, radius = 25, color, opacity = 0.8 }) => {
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

export default User;
