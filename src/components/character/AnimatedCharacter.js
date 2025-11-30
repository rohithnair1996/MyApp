// AnimatedCharacter.js
import React, { useEffect } from 'react';
import { Canvas, Group } from '@shopify/react-native-skia';
import { useSharedValue, withTiming, withRepeat } from 'react-native-reanimated';
import { CharacterBody } from './CharacterBody';
import { CharacterArm } from './CharacterArm';
import { CharacterLeg } from './CharacterLeg';

export const AnimatedCharacter = () => {
  const centerX = 100;
  const centerY = 100;
  const color = '#e67e22';

  // This value will go -1 ↔ 1 repeatedly
  const swing = useSharedValue(0);

  useEffect(() => {
    swing.value = withRepeat(
      withTiming(1, { duration: 400 }), // 0 → 1
      -1,    // infinite
      true   // reverse: 1 → 0 → -1 → 0 → 1...
    );
  }, []);

  return (
    <Group>
      {/* Arms */}
      <CharacterArmAnimated
        x={centerX}
        y={centerY}
        side="left"
        color={color}
        swing={swing}
      />
      <CharacterArmAnimated
        x={centerX}
        y={centerY}
        side="right"
        color={color}
        swing={swing}
      />

      {/* Body */}
      <CharacterBody x={centerX} y={centerY} color={color} />

      {/* Legs */}
      <CharacterLegAnimated
        x={centerX}
        y={centerY}
        side="left"
        color={color}
        swing={swing}
      />
      <CharacterLegAnimated
        x={centerX}
        y={centerY}
        side="right"
        color={color}
        swing={swing}
      />
    </Group>
  );
};

import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { BODY_SIZE } from './CharacterBody';

const { BODY_WIDTH, BODY_HEIGHT } = BODY_SIZE;

// ---- Animated Arm ----
const CharacterArmAnimated = ({ x, y, side, color, swing }) => {
  const pathValue = useDerivedValue(() => {
    'worklet';

    const path = Skia.Path.Make();

    const shoulderX = x + (side === 'left' ? -BODY_WIDTH / 2 : BODY_WIDTH / 2);
    const shoulderY = y - BODY_HEIGHT / 4;

    // swing.value is between -1 and 1
    const swingAmount = swing.value * 10; // max 10 px forward/back

    const handX = shoulderX + (side === 'left' ? -15 : 15) + swingAmount;
    const handY = shoulderY + 20;

    path.moveTo(shoulderX, shoulderY);
    path.quadTo(
      shoulderX, shoulderY + 10,
      handX, handY
    );

    return path;
  });

  return (
    <Path
      path={pathValue}
      color={color}
      style="stroke"
      strokeWidth={4}
    />
  );
};

// ---- Animated Leg ----
const CharacterLegAnimated = ({ x, y, side, color, swing }) => {
  const pathValue = useDerivedValue(() => {
    'worklet';

    const path = Skia.Path.Make();

    const hipX = x + (side === 'left' ? -BODY_WIDTH / 4 : BODY_WIDTH / 4);
    const hipY = y + BODY_HEIGHT / 2;

    const swingAmount = swing.value * 8 * (side === 'left' ? 1 : -1);

    const footX = hipX + (side === 'left' ? -10 : 10) + swingAmount;
    const footY = hipY + 25;

    path.moveTo(hipX, hipY);
    path.quadTo(
      hipX, hipY + 15,
      footX, footY
    );

    return path;
  });

  return (
    <Path
      path={pathValue}
      color={color}
      style="stroke"
      strokeWidth={4}
    />
  );
};
