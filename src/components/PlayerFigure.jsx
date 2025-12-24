import { Group, RoundedRect, useFont, Skia } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
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
  isSleeping = false,
}) => {
  const font = useFont(require('../../assets/fonts/Fredoka-Medium.ttf'), 12);
  const sharedValues = usePlayerSharedValues();
  const { scaleX, scaleY, dustProgress, showDust, tearProgress, showTear } = sharedValues;

  // Sleep animation - 3D flip forward on X-axis (Z-depth rotation)
  const sleepProgress = useSharedValue(0);

  React.useEffect(() => {
    sleepProgress.value = withTiming(isSleeping ? 1 : 0, {
      duration: 600,
      easing: Easing.out(Easing.back(1.2)),
    });
  }, [isSleeping]);

  // Transform matrix for sleeping (3D rotation around X-axis using perspective)
  const sleepTransform = useDerivedValue(() => {
    if (sleepProgress.value === 0) {
      return Skia.Matrix();
    }

    const centerX = x.value;
    const feetY = y.value;
    const playerHeight = AVATAR.body.height + AVATAR.leg.height;

    // Rotation angle (0 to 150 degrees = 0 to 5*PI/6)
    const angle = sleepProgress.value * (Math.PI * 5 / 6);

    // 3D perspective simulation
    // As we rotate around X-axis, the top moves away (gets smaller) and bottom stays anchored
    // After 90 degrees, cosAngle becomes negative which flips/mirrors the character (shows backside)
    const cosAngle = Math.cos(angle);
    const scaleY = cosAngle; // Allow negative values to show mirrored backside

    // Perspective skew - top moves back, creates depth illusion
    const perspective = Math.sin(angle) * 0.002;

    const matrix = Skia.Matrix();

    // Move origin to feet (bottom of character)
    matrix.translate(centerX, feetY);

    // Apply 3D-like transform using skew and scale
    // This creates the illusion of rotating forward
    matrix.skew(0, perspective);
    matrix.scale(1, scaleY);

    // Move back
    matrix.translate(-centerX, -feetY);

    // Offset Y position when sleeping - move character down to ground level
    const yOffset = sleepProgress.value * (playerHeight * 0.5);
    matrix.translate(0, yOffset);

    return matrix;
  });

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

      {/* Player body group with sleep rotation */}
      <Group matrix={sleepTransform}>
        <RoundedRect
          x={bodyGeo.bodyLeftX}
          y={bodyGeo.bodyTopY}
          width={bodyGeo.scaledBodyWidth}
          height={bodyGeo.scaledBodyHeight}
          r={body.radius}
          color={color}
        />

        {/* Hide limbs when sleeping - show as flat card */}
        {!isSleeping && (
          <PlayerLimbs
            {...armGeo}
            {...legGeo}
            colors={colors}
          />
        )}

        <PlayerFace
          {...faceGeo}
          tearProgress={tearProgress}
          showTear={showTear}
          isSad={isSad}
          isSleeping={isSleeping}
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
      </Group>

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