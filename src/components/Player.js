import React, { useMemo } from 'react';
import { RoundedRect, Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { CHARACTER_DIMENSIONS } from '../constants/character';
import { COLORS } from '../constants/colors';

const {
  BODY_WIDTH,
  BODY_HEIGHT,
  LEG_LENGTH,
  LEG_HORIZONTAL,
  ARM_LENGTH,
  ARM_HORIZONTAL,
} = CHARACTER_DIMENSIONS;

const Player = ({ x, y, color = COLORS.PLAYER_GREEN }) => {
  // Create all paths in a single useDerivedValue for better performance
  const paths = useDerivedValue(() => {
    'worklet';
    // Extract value from SharedValue or regular number
    const xVal = typeof x?.value === 'number' ? x.value : x;
    const yVal = typeof y?.value === 'number' ? y.value : y;

    // Left leg path
    const leftLeg = Skia.Path.Make();
    leftLeg.moveTo(xVal - BODY_WIDTH / 4, yVal + BODY_HEIGHT / 2);
    leftLeg.lineTo(xVal - BODY_WIDTH / 4, yVal + BODY_HEIGHT / 2 + LEG_LENGTH);
    leftLeg.lineTo(xVal - BODY_WIDTH / 4 - LEG_HORIZONTAL, yVal + BODY_HEIGHT / 2 + LEG_LENGTH);

    // Right leg path
    const rightLeg = Skia.Path.Make();
    rightLeg.moveTo(xVal + BODY_WIDTH / 4, yVal + BODY_HEIGHT / 2);
    rightLeg.lineTo(xVal + BODY_WIDTH / 4, yVal + BODY_HEIGHT / 2 + LEG_LENGTH);
    rightLeg.lineTo(xVal + BODY_WIDTH / 4 + LEG_HORIZONTAL, yVal + BODY_HEIGHT / 2 + LEG_LENGTH);

    // Left arm path
    const leftArm = Skia.Path.Make();
    leftArm.moveTo(xVal - BODY_WIDTH / 2, yVal - BODY_HEIGHT / 4);
    leftArm.lineTo(xVal - BODY_WIDTH / 2 - ARM_LENGTH, yVal - BODY_HEIGHT / 4);
    leftArm.lineTo(xVal - BODY_WIDTH / 2 - ARM_LENGTH, yVal - BODY_HEIGHT / 4 + ARM_HORIZONTAL);

    // Right arm path
    const rightArm = Skia.Path.Make();
    rightArm.moveTo(xVal + BODY_WIDTH / 2, yVal - BODY_HEIGHT / 4);
    rightArm.lineTo(xVal + BODY_WIDTH / 2 + ARM_LENGTH, yVal - BODY_HEIGHT / 4);
    rightArm.lineTo(xVal + BODY_WIDTH / 2 + ARM_LENGTH, yVal - BODY_HEIGHT / 4 + ARM_HORIZONTAL);

    return { leftLeg, rightLeg, leftArm, rightArm };
  }, [x, y]);

  const bodyX = useDerivedValue(() => {
    'worklet';
    const xVal = typeof x?.value === 'number' ? x.value : x;
    return xVal - BODY_WIDTH / 2;
  }, [x]);

  const bodyY = useDerivedValue(() => {
    'worklet';
    const yVal = typeof y?.value === 'number' ? y.value : y;
    return yVal - BODY_HEIGHT / 2;
  }, [y]);

  // Create individual path derived values
  const leftArmPath = useDerivedValue(() => {
    'worklet';
    return paths.value.leftArm;
  }, [paths]);

  const rightArmPath = useDerivedValue(() => {
    'worklet';
    return paths.value.rightArm;
  }, [paths]);

  const leftLegPath = useDerivedValue(() => {
    'worklet';
    return paths.value.leftLeg;
  }, [paths]);

  const rightLegPath = useDerivedValue(() => {
    'worklet';
    return paths.value.rightLeg;
  }, [paths]);

  return (
    <>
      {/* Arms (behind body) */}
      <Path path={leftArmPath} color={color} style="stroke" strokeWidth={2} />
      <Path path={rightArmPath} color={color} style="stroke" strokeWidth={2} />

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
      <Path path={leftLegPath} color={color} style="stroke" strokeWidth={2} />
      <Path path={rightLegPath} color={color} style="stroke" strokeWidth={2} />
    </>
  );
};

export default React.memo(Player);
