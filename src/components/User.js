import React from 'react';
import { RoundedRect, Path, Skia } from '@shopify/react-native-skia';

const User = ({ x, y, color }) => {
  // Dimensions for the human figure (same as Player)
  const bodyWidth = 24;
  const bodyHeight = 30;
  const legLength = 12;
  const legHorizontal = 6;
  const armLength = 10;
  const armHorizontal = 5;

  // Calculate positions relative to center point (x, y)
  const bodyX = x - bodyWidth / 2;
  const bodyY = y - bodyHeight / 2;

  // Left leg path (L-shaped)
  const leftLegPath = Skia.Path.Make();
  leftLegPath.moveTo(x - bodyWidth / 4, y + bodyHeight / 2);
  leftLegPath.lineTo(x - bodyWidth / 4, y + bodyHeight / 2 + legLength);
  leftLegPath.lineTo(x - bodyWidth / 4 - legHorizontal, y + bodyHeight / 2 + legLength);

  // Right leg path (L-shaped)
  const rightLegPath = Skia.Path.Make();
  rightLegPath.moveTo(x + bodyWidth / 4, y + bodyHeight / 2);
  rightLegPath.lineTo(x + bodyWidth / 4, y + bodyHeight / 2 + legLength);
  rightLegPath.lineTo(x + bodyWidth / 4 + legHorizontal, y + bodyHeight / 2 + legLength);

  // Left arm path (L-shaped)
  const leftArmPath = Skia.Path.Make();
  leftArmPath.moveTo(x - bodyWidth / 2, y - bodyHeight / 4);
  leftArmPath.lineTo(x - bodyWidth / 2 - armLength, y - bodyHeight / 4);
  leftArmPath.lineTo(x - bodyWidth / 2 - armLength, y - bodyHeight / 4 + armHorizontal);

  // Right arm path (L-shaped)
  const rightArmPath = Skia.Path.Make();
  rightArmPath.moveTo(x + bodyWidth / 2, y - bodyHeight / 4);
  rightArmPath.lineTo(x + bodyWidth / 2 + armLength, y - bodyHeight / 4);
  rightArmPath.lineTo(x + bodyWidth / 2 + armLength, y - bodyHeight / 4 + armHorizontal);

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

export default User;
