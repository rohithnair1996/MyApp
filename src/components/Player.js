import React from 'react';
import { RoundedRect, Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

const Player = ({ x, y, color = '#00FF00' }) => {
  // Dimensions for the human figure (larger body for easier thumb interaction)
  const bodyWidth = 24;
  const bodyHeight = 30;
  const legLength = 12;
  const legHorizontal = 6;
  const armLength = 10;
  const armHorizontal = 5;

  // Convert SharedValues to regular values for calculations
  const leftLegPath = useDerivedValue(() => {
    const xVal = typeof x.value === 'number' ? x.value : x;
    const yVal = typeof y.value === 'number' ? y.value : y;

    const path = Skia.Path.Make();
    path.moveTo(xVal - bodyWidth / 4, yVal + bodyHeight / 2);
    path.lineTo(xVal - bodyWidth / 4, yVal + bodyHeight / 2 + legLength);
    path.lineTo(xVal - bodyWidth / 4 - legHorizontal, yVal + bodyHeight / 2 + legLength);
    return path;
  }, [x, y]);

  const rightLegPath = useDerivedValue(() => {
    const xVal = typeof x.value === 'number' ? x.value : x;
    const yVal = typeof y.value === 'number' ? y.value : y;

    const path = Skia.Path.Make();
    path.moveTo(xVal + bodyWidth / 4, yVal + bodyHeight / 2);
    path.lineTo(xVal + bodyWidth / 4, yVal + bodyHeight / 2 + legLength);
    path.lineTo(xVal + bodyWidth / 4 + legHorizontal, yVal + bodyHeight / 2 + legLength);
    return path;
  }, [x, y]);

  const leftArmPath = useDerivedValue(() => {
    const xVal = typeof x.value === 'number' ? x.value : x;
    const yVal = typeof y.value === 'number' ? y.value : y;

    const path = Skia.Path.Make();
    path.moveTo(xVal - bodyWidth / 2, yVal - bodyHeight / 4);
    path.lineTo(xVal - bodyWidth / 2 - armLength, yVal - bodyHeight / 4);
    path.lineTo(xVal - bodyWidth / 2 - armLength, yVal - bodyHeight / 4 + armHorizontal);
    return path;
  }, [x, y]);

  const rightArmPath = useDerivedValue(() => {
    const xVal = typeof x.value === 'number' ? x.value : x;
    const yVal = typeof y.value === 'number' ? y.value : y;

    const path = Skia.Path.Make();
    path.moveTo(xVal + bodyWidth / 2, yVal - bodyHeight / 4);
    path.lineTo(xVal + bodyWidth / 2 + armLength, yVal - bodyHeight / 4);
    path.lineTo(xVal + bodyWidth / 2 + armLength, yVal - bodyHeight / 4 + armHorizontal);
    return path;
  }, [x, y]);

  const bodyX = useDerivedValue(() => {
    const xVal = typeof x.value === 'number' ? x.value : x;
    return xVal - bodyWidth / 2;
  }, [x]);

  const bodyY = useDerivedValue(() => {
    const yVal = typeof y.value === 'number' ? y.value : y;
    return yVal - bodyHeight / 2;
  }, [y]);

  return (
    <>
      {/* Arms (behind body) */}
      <Path path={leftArmPath} color={color} style="stroke" strokeWidth={2} />
      <Path path={rightArmPath} color={color} style="stroke" strokeWidth={2} />

      {/* Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={bodyWidth}
        height={bodyHeight}
        r={4}
        color={color}
      />

      {/* Legs */}
      <Path path={leftLegPath} color={color} style="stroke" strokeWidth={2} />
      <Path path={rightLegPath} color={color} style="stroke" strokeWidth={2} />
    </>
  );
};

export default Player;
