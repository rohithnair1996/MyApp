import React, { useMemo } from 'react';
import { RoundedRect, Path, Skia } from '@shopify/react-native-skia';
import { CHARACTER_DIMENSIONS } from '../constants/character';

const {
  BODY_WIDTH,
  BODY_HEIGHT,
  LEG_LENGTH,
  LEG_HORIZONTAL,
  ARM_LENGTH,
  ARM_HORIZONTAL,
} = CHARACTER_DIMENSIONS;

const User = ({ x, y, color }) => {
  // Calculate positions relative to center point (x, y) - memoized
  const bodyX = useMemo(() => x - BODY_WIDTH / 2, [x]);
  const bodyY = useMemo(() => y - BODY_HEIGHT / 2, [y]);

  // Create all paths with useMemo to avoid recreation on every render
  const paths = useMemo(() => {
    // Left leg path (L-shaped)
    const leftLeg = Skia.Path.Make();
    leftLeg.moveTo(x - BODY_WIDTH / 4, y + BODY_HEIGHT / 2);
    leftLeg.lineTo(x - BODY_WIDTH / 4, y + BODY_HEIGHT / 2 + LEG_LENGTH);
    leftLeg.lineTo(x - BODY_WIDTH / 4 - LEG_HORIZONTAL, y + BODY_HEIGHT / 2 + LEG_LENGTH);

    // Right leg path (L-shaped)
    const rightLeg = Skia.Path.Make();
    rightLeg.moveTo(x + BODY_WIDTH / 4, y + BODY_HEIGHT / 2);
    rightLeg.lineTo(x + BODY_WIDTH / 4, y + BODY_HEIGHT / 2 + LEG_LENGTH);
    rightLeg.lineTo(x + BODY_WIDTH / 4 + LEG_HORIZONTAL, y + BODY_HEIGHT / 2 + LEG_LENGTH);

    // Left arm path (L-shaped)
    const leftArm = Skia.Path.Make();
    leftArm.moveTo(x - BODY_WIDTH / 2, y - BODY_HEIGHT / 4);
    leftArm.lineTo(x - BODY_WIDTH / 2 - ARM_LENGTH, y - BODY_HEIGHT / 4);
    leftArm.lineTo(x - BODY_WIDTH / 2 - ARM_LENGTH, y - BODY_HEIGHT / 4 + ARM_HORIZONTAL);

    // Right arm path (L-shaped)
    const rightArm = Skia.Path.Make();
    rightArm.moveTo(x + BODY_WIDTH / 2, y - BODY_HEIGHT / 4);
    rightArm.lineTo(x + BODY_WIDTH / 2 + ARM_LENGTH, y - BODY_HEIGHT / 4);
    rightArm.lineTo(x + BODY_WIDTH / 2 + ARM_LENGTH, y - BODY_HEIGHT / 4 + ARM_HORIZONTAL);

    return { leftLeg, rightLeg, leftArm, rightArm };
  }, [x, y]);

  return (
    <>
      {/* Arms (behind body) */}
      <Path path={paths.leftArm} color={color} style="stroke" strokeWidth={2} />
      <Path path={paths.rightArm} color={color} style="stroke" strokeWidth={2} />

      {/* Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={BODY_WIDTH}
        height={BODY_HEIGHT}
        r={4}
        color={color}
      />

      {/* Legs */}
      <Path path={paths.leftLeg} color={color} style="stroke" strokeWidth={2} />
      <Path path={paths.rightLeg} color={color} style="stroke" strokeWidth={2} />
    </>
  );
};

export default React.memo(User);
