import React from 'react';
import { Circle, Path, Skia, Group } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

const TOMATO_RADIUS = 15;
const OFFSET_ABOVE_HEAD = 35; // Distance above the player's head

const Tomato = ({ x, y }) => {
  // Calculate tomato position - ensure we handle SharedValues properly
  const tomatoX = useDerivedValue(() => {
    'worklet';
    if (!x) return 0;
    const xVal = typeof x?.value === 'number' ? x.value : x;
    return xVal;
  }, [x]);

  const tomatoY = useDerivedValue(() => {
    'worklet';
    if (!y) return 0;
    const yVal = typeof y?.value === 'number' ? y.value : y;
    // Subtract to position above (lower y = higher position on screen)
    return yVal - OFFSET_ABOVE_HEAD;
  }, [y]);

  // Create stem path (small leaves on top)
  const stemPath = useDerivedValue(() => {
    'worklet';
    const xVal = typeof x?.value === 'number' ? x.value : x;
    const yVal = typeof y?.value === 'number' ? y.value : y;
    const adjustedY = yVal - OFFSET_ABOVE_HEAD;

    const path = Skia.Path.Make();

    // Left leaf
    path.moveTo(xVal - 6, adjustedY - TOMATO_RADIUS);
    path.quadTo(xVal - 8, adjustedY - TOMATO_RADIUS - 4, xVal - 4, adjustedY - TOMATO_RADIUS - 6);

    // Center stem
    path.moveTo(xVal, adjustedY - TOMATO_RADIUS);
    path.lineTo(xVal, adjustedY - TOMATO_RADIUS - 8);

    // Right leaf
    path.moveTo(xVal + 6, adjustedY - TOMATO_RADIUS);
    path.quadTo(xVal + 8, adjustedY - TOMATO_RADIUS - 4, xVal + 4, adjustedY - TOMATO_RADIUS - 6);

    return path;
  }, [x, y]);

  return (
    <>
      {/* Tomato body */}
      <Circle cx={tomatoX} cy={tomatoY} r={TOMATO_RADIUS} color="#FF6347" />

      {/* Highlight for 3D effect */}
      <Circle cx={tomatoX} cy={tomatoY} r={TOMATO_RADIUS} color="rgba(255, 99, 71, 0.3)" />
      <Circle
        cx={useDerivedValue(() => {
          'worklet';
          const xVal = typeof x?.value === 'number' ? x.value : x;
          return xVal - 3;
        }, [x])}
        cy={useDerivedValue(() => {
          'worklet';
          const yVal = typeof y?.value === 'number' ? y.value : y;
          return yVal - OFFSET_ABOVE_HEAD - 3;
        }, [y])}
        r={4}
        color="rgba(255, 255, 255, 0.5)"
      />

      {/* Green stem and leaves */}
      <Path path={stemPath} color="#228B22" style="stroke" strokeWidth={2} strokeCap="round" />
    </>
  );
};

export default React.memo(Tomato);
