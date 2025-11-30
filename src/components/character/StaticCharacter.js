// StaticCharacter.js
import React from 'react';
import { Canvas,Group } from '@shopify/react-native-skia';
import { CharacterBody } from './CharacterBody';
import { CharacterArm } from './CharacterArm';
import { CharacterLeg } from './CharacterLeg';

export const StaticCharacter = () => {
  const centerX = 350;
  const centerY = 150;
  const color = '#3498db';

  return (
    <Group>
      {/* Arms behind body */}
      <CharacterArm x={centerX} y={centerY} side="left" color={color} />
      <CharacterArm x={centerX} y={centerY} side="right" color={color} />

      {/* Body */}
      <CharacterBody x={centerX} y={centerY} color={color} />

      {/* Legs in front */}
      <CharacterLeg x={centerX} y={centerY} side="left" color={color} />
      <CharacterLeg x={centerX} y={centerY} side="right" color={color} />
    </Group>
  );
};
