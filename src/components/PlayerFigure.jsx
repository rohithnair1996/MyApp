import { Group, RoundedRect, useFont } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { ANIMATION, AVATAR } from '../constants/playerConstants';
import { useArmGeometry } from '../hooks/player/useArmGeometry';
import { useBodyGeometry } from '../hooks/player/useBodyGeometry';
import { useFaceGeometry } from '../hooks/player/useFaceGeometry';
import { useLegGeometry } from '../hooks/player/useLegGeometry';
import { usePlayerSharedValues } from '../hooks/player/usePlayerSharedValues';
import { usePlayerAnimations } from '../hooks/usePlayerAnimations';
import DustParticle from './player/DustParticle';
import LoveHeart from './player/LoveHeart';
import PlayerFace from './player/PlayerFace';
import PlayerLimbs from './player/PlayerLimbs';
import PlayerNamePlate from './player/PlayerNamePlate';
import SpeechBubble from './player/SpeechBubble';

const DUST_PARTICLE_INDICES = Array.from({ length: ANIMATION.dust.particleCount }, (_, i) => i);

const PlayerFigure = ({
  x,
  y,
  playerName,
  color = '#4A90E2',
  faceImage = null,
  speechText = null,
  isWalking = false,
  isRunning = false,
  isJumping = false,
  isDancing = false,
  isWaving = false,
  isClapping = false,
  isSad = false,
  isAngry = false,
  isRomance = false,
}) => {
  const font = useFont(require('../../assets/fonts/Fredoka-Medium.ttf'), 12);
  const sharedValues = usePlayerSharedValues();
  const { scaleX, scaleY, dustProgress, showDust, tearProgress, showTear } = sharedValues;

  const { hearts } = usePlayerAnimations({
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isWaving,
    isClapping,
    isSad,
    isAngry,
    isRomance,
    sharedValues,
  });

  const bodyGeo = useBodyGeometry({
    x,
    y,
    scaleX,
    scaleY,
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isSad,
    isAngry,
    sharedValues,
  });

  const faceGeo = useFaceGeometry({
    bodyX: bodyGeo.bodyX,
    bodyTopY: bodyGeo.bodyTopY,
    scaleX,
    scaleY,
    isSad,
    isAngry,
    sharedValues,
  });

  const armGeo = useArmGeometry({
    bodyLeftX: bodyGeo.bodyLeftX,
    bodyRightX: bodyGeo.bodyRightX,
    armY: bodyGeo.armY,
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isWaving,
    isClapping,
    isSad,
    isAngry,
    sharedValues,
  });

  const legGeo = useLegGeometry({
    x,
    y,
    bodyX: bodyGeo.bodyX,
    bodyXOffset: bodyGeo.bodyXOffset,
    legTopY: bodyGeo.legTopY,
    scaleX,
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    sharedValues,
  });

  // Heart spawn position (derived from shared value y)
  const heartSpawnY = useDerivedValue(() => y.value - AVATAR.leg.height - AVATAR.body.height * 0.3);

  const { body, colors } = AVATAR;

  return (
    <Group>
      {DUST_PARTICLE_INDICES.map((index) => (
        <DustParticle
          key={`dust-${index}`}
          baseX={x}
          baseY={y}
          index={index}
          progress={dustProgress}
          visible={showDust}
        />
      ))}

      <RoundedRect
        x={bodyGeo.bodyLeftX}
        y={bodyGeo.bodyTopY}
        width={bodyGeo.scaledBodyWidth}
        height={bodyGeo.scaledBodyHeight}
        r={body.radius}
        color={color}
      />

      <PlayerLimbs
        {...armGeo}
        {...legGeo}
        colors={colors}
      />

      <PlayerFace
        {...faceGeo}
        tearProgress={tearProgress}
        showTear={showTear}
        isSad={isSad}
        faceImage={faceImage}
        colors={colors}
      />

      <PlayerNamePlate
        x={x}
        y={y}
        bodyX={bodyGeo.bodyX}
        bodyOffset={bodyGeo.bodyOffset}
        scaleX={scaleX}
        playerName={playerName}
        font={font}
        colors={colors}
      />

      {isRomance && hearts.map((heart) => (
        <LoveHeart
          key={heart.id}
          baseX={x}
          baseY={heartSpawnY}
          color={heart.color}
          seed={heart.seed}
        />
      ))}

      {speechText && (
        <SpeechBubble
          x={bodyGeo.bodyX}
          y={bodyGeo.bodyTopY}
          text={speechText}
          font={font}
        />
      )}
    </Group>
  );
};

export default PlayerFigure;