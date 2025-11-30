// CharacterArm.js
import React from 'react';
import { Path, Skia } from '@shopify/react-native-skia';
import { BODY_SIZE } from './CharacterBody';

const { BODY_WIDTH, BODY_HEIGHT } = BODY_SIZE;

export const CharacterArm = ({
  x,       // character center x
  y,       // character center y
  side,    // 'left' or 'right'
  color,
}) => {
  const path = Skia.Path.Make();

  // Shoulder position (relative to body)
  const shoulderX = x + (side === 'left' ? -BODY_WIDTH / 2 : BODY_WIDTH / 2);
  const shoulderY = y - BODY_HEIGHT / 4;

  // Hand position (a bit outward and down)
  const handX = shoulderX + (side === 'left' ? -15 : 15);
  const handY = shoulderY + 20;

  path.moveTo(shoulderX, shoulderY);
  path.quadTo(
    shoulderX, shoulderY - 10,  // control point
    handX, handY                // end point (hand)
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
