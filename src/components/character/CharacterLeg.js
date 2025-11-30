// CharacterLeg.js
import React from 'react';
import { Path, Skia } from '@shopify/react-native-skia';
import { BODY_SIZE } from './CharacterBody';

const { BODY_WIDTH, BODY_HEIGHT } = BODY_SIZE;

export const CharacterLeg = ({
  x,       // character center x
  y,       // character center y
  side,    // 'left' or 'right'
  color,
}) => {
  const path = Skia.Path.Make();

  // Hip position (bottom of body)
  const hipX = x + (side === 'left' ? -BODY_WIDTH / 4 : BODY_WIDTH / 4);
  const hipY = y + BODY_HEIGHT / 2;

  // Foot position
  const footX = hipX + (side === 'left' ? -5 : 5);
  const footY = hipY + 25;

  path.moveTo(hipX, hipY);
  path.quadTo(
    hipX, hipY+15,  // control point
    footX, footY
  );

  return (
    <Path
      path={path}
      color={color}
      style="stroke"
      strokeWidth={4}
    />
  );
};
