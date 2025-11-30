// SimpleCharacter.tsx
import React from 'react';
import {
  Path,
  RoundedRect,
  Skia,
} from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

type Props = {
  x: any;          // SharedValue<number>
  y: any;          // SharedValue<number>
  walkCycle: any;  // SharedValue<number> (0..1..0..1)
};

const BODY_WIDTH = 30;
const BODY_HEIGHT = 40;
const LEG_LENGTH = 25;
const ARM_LENGTH = 20;

export const SimpleCharacter: React.FC<Props> = ({ x, y, walkCycle }) => {
  // Body top-left
  const bodyX = useDerivedValue(() => {
    'worklet';
    return x.value - BODY_WIDTH / 2;
  });

  const bodyY = useDerivedValue(() => {
    'worklet';
    return y.value - BODY_HEIGHT / 2;
  });

  // Convert walkCycle (0..1..0) to swing (-1..1..-1)
  const swing = useDerivedValue(() => {
    'worklet';
    const t = walkCycle.value;  // 0..1..0
    return (t * 2) - 1;         // -1..1..-1
  });

  // Legs: two curved paths using swing
  const leftLegPath = useDerivedValue(() => {
    'worklet';
    const path = Skia.Path.Make();

    const hipX = x.value - BODY_WIDTH / 4;
    const hipY = y.value + BODY_HEIGHT / 2;

    const footX = hipX - 4 * swing.value; // move left/right with swing
    const footY = hipY + LEG_LENGTH;

    path.moveTo(hipX, hipY);
    path.quadTo(hipX - 2, hipY + LEG_LENGTH / 2, footX, footY);

    return path;
  });

  const rightLegPath = useDerivedValue(() => {
    'worklet';
    const path = Skia.Path.Make();

    const hipX = x.value + BODY_WIDTH / 4;
    const hipY = y.value + BODY_HEIGHT / 2;

    const footX = hipX + 4 * swing.value; // opposite direction if you want
    const footY = hipY + LEG_LENGTH;

    path.moveTo(hipX, hipY);
    path.quadTo(hipX + 2, hipY + LEG_LENGTH / 2, footX, footY);

    return path;
  });

  // Arms: similarly use swing
  const leftArmPath = useDerivedValue(() => {
    'worklet';
    const path = Skia.Path.Make();

    const shoulderX = x.value - BODY_WIDTH / 2;
    const shoulderY = y.value - BODY_HEIGHT / 4;

    const handX = shoulderX - ARM_LENGTH * 0.6;
    const handY = shoulderY + ARM_LENGTH * 0.6 + 4 * swing.value;

    path.moveTo(shoulderX, shoulderY);
    path.quadTo(
      shoulderX - ARM_LENGTH / 2,
      shoulderY,
      handX,
      handY
    );

    return path;
  });

  const rightArmPath = useDerivedValue(() => {
    'worklet';
    const path = Skia.Path.Make();

    const shoulderX = x.value + BODY_WIDTH / 2;
    const shoulderY = y.value - BODY_HEIGHT / 4;

    const handX = shoulderX + ARM_LENGTH * 0.6;
    const handY = shoulderY + ARM_LENGTH * 0.6 - 4 * swing.value;

    path.moveTo(shoulderX, shoulderY);
    path.quadTo(
      shoulderX + ARM_LENGTH / 2,
      shoulderY,
      handX,
      handY
    );

    return path;
  });

  return (
    <>
      {/* Arms behind */}
      <Path path={leftArmPath} color="black" style="stroke" strokeWidth={3} />
      <Path path={rightArmPath} color="black" style="stroke" strokeWidth={3} />

      {/* Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={BODY_WIDTH}
        height={BODY_HEIGHT}
        r={4}
        color="#3498db"
      />

      {/* Legs */}
      <Path path={leftLegPath} color="black" style="stroke" strokeWidth={3} />
      <Path path={rightLegPath} color="black" style="stroke" strokeWidth={3} />
    </>
  );
};
