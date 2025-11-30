// CharacterBody.js
import React from 'react';
import { RoundedRect } from '@shopify/react-native-skia';

const BODY_WIDTH = 40;
const BODY_HEIGHT = 50;
const BODY_RADIUS = 6;

export const CharacterBody = ({ x, y, color }) => {
  // x, y = center of body
  const left = x - BODY_WIDTH / 2;
  const top = y - BODY_HEIGHT / 2;

  return (
    <RoundedRect
      x={left}
      y={top}
      width={BODY_WIDTH}
      height={BODY_HEIGHT}
      r={BODY_RADIUS}
      color={color}
    />
  );
};

export const BODY_SIZE = { BODY_WIDTH, BODY_HEIGHT };
