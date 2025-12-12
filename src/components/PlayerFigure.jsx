import {
  Circle,
  Group,
  Image,
  Line,
  RoundedRect,
  Text,
  useFont,
  vec
} from '@shopify/react-native-skia';
import React from 'react';
import {
  interpolate,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';
import { ANIMATION, AVATAR } from '../constants/playerConstants';
import { usePlayerAnimations } from '../hooks/usePlayerAnimations';
import DustParticle from './player/DustParticle';
import LoveHeart from './player/LoveHeart';
import TearDrop from './player/TearDrop';

const DEG_TO_RAD = Math.PI / 180;



// ═══════════════════════════════════════════════════════════
// PLAYER FIGURE COMPONENT
// ═══════════════════════════════════════════════════════════
const PlayerFigure = ({
  x,
  y,
  playerName,
  color = '#4A90E2',
  faceImage = null,  // 👈 Add this
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

  // ═══════════════════════════════════════════════════════════
  // ANIMATION SHARED VALUES
  // ═══════════════════════════════════════════════════════════
  const breathProgress = useSharedValue(0);
  const walkProgress = useSharedValue(0.5);
  const jumpProgress = useSharedValue(0);
  const danceProgress = useSharedValue(0);
  const waveProgress = useSharedValue(0);
  const waveArmRaise = useSharedValue(0);
  const blinkProgress = useSharedValue(0);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const clapProgress = useSharedValue(0);
  const clapArmRaise = useSharedValue(0);
  const dustProgress = useSharedValue(0);
  const showDust = useSharedValue(0);

  // Emotion shared values
  const sadProgress = useSharedValue(0);
  const sadSway = useSharedValue(0);
  const tearProgress = useSharedValue(0);
  const showTear = useSharedValue(0);
  const angryProgress = useSharedValue(0);
  const angryShake = useSharedValue(0);

  // Romance heart bubbles
  const heartProgressValues = Array.from({ length: ANIMATION.romance.bubbleCount }, () => useSharedValue(0));

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
    sharedValues: {
      breathProgress,
      walkProgress,
      jumpProgress,
      danceProgress,
      waveProgress,
      waveArmRaise,
      blinkProgress,
      scaleX,
      scaleY,
      clapProgress,
      clapArmRaise,
      dustProgress,
      showDust,
      sadProgress,
      sadSway,
      tearProgress,
      showTear,
      angryProgress,
      angryShake,
      heartProgressValues,
    },
  });

  // ═══════════════════════════════════════════════════════════
  // WAVE ANGLE
  // ═══════════════════════════════════════════════════════════
  const waveAngle = useDerivedValue(() => {
    const { armRaise, waveSwing } = ANIMATION.waving;
    const raise = waveArmRaise.value * armRaise;
    const swing = interpolate(waveProgress.value, [0, 0.5, 1], [-waveSwing, 0, waveSwing]);
    return raise + (waveArmRaise.value * swing);
  });

  // ═══════════════════════════════════════════════════════════
  // CLAP ANGLES
  // ═══════════════════════════════════════════════════════════
  const clapAngle = useDerivedValue(() => {
    const { armRaise } = ANIMATION.clapping;
    return clapArmRaise.value * armRaise;
  });

  const clapTogether = useDerivedValue(() => {
    return clapProgress.value;
  });

  // ═══════════════════════════════════════════════════════════
  // DANCE DERIVED VALUES
  // ═══════════════════════════════════════════════════════════
  const danceBounce = useDerivedValue(() => {
    return Math.abs(Math.sin(danceProgress.value * Math.PI * 2)) * ANIMATION.dancing.bounce;
  });

  const danceWiggle = useDerivedValue(() => {
    return Math.sin(danceProgress.value * Math.PI * 2) * ANIMATION.dancing.wiggle;
  });

  const danceLeftArmAngle = useDerivedValue(() => {
    return interpolate(danceProgress.value, [0, 0.5, 1], [ANIMATION.dancing.armWave, 20, ANIMATION.dancing.armWave]);
  });

  const danceRightArmAngle = useDerivedValue(() => {
    return interpolate(danceProgress.value, [0, 0.5, 1], [20, ANIMATION.dancing.armWave, 20]);
  });

  // ═══════════════════════════════════════════════════════════
  // EMOTION DERIVED VALUES
  // ═══════════════════════════════════════════════════════════
  const emotionSlouch = useDerivedValue(() => {
    return sadProgress.value * ANIMATION.sad.slouch;
  });

  const emotionSway = useDerivedValue(() => {
    return interpolate(sadSway.value, [0, 1], [-ANIMATION.sad.swayAmount, ANIMATION.sad.swayAmount]);
  });

  const emotionShake = useDerivedValue(() => {
    return angryShake.value * ANIMATION.angry.shake * angryProgress.value;
  });

  // ═══════════════════════════════════════════════════════════
  // JUMP OFFSET
  // ═══════════════════════════════════════════════════════════
  const jumpOffset = useDerivedValue(() => {
    const { crouchAmount, jumpHeight } = ANIMATION.jumping;
    if (jumpProgress.value < 0) {
      return jumpProgress.value * crouchAmount * 5;
    }
    return jumpProgress.value * jumpHeight;
  });

  // ═══════════════════════════════════════════════════════════
  // WALK / RUN BOB
  // ═══════════════════════════════════════════════════════════
  const walkBob = useDerivedValue(() => {
    const bobAmount = isRunning
      ? ANIMATION.running.bodyBob
      : ANIMATION.walking.bodyBob;
    return Math.abs(Math.sin(walkProgress.value * Math.PI * 2)) * bobAmount;
  });

  // ═══════════════════════════════════════════════════════════
  // COMBINED BODY OFFSET
  // ═══════════════════════════════════════════════════════════
  const bodyOffset = useDerivedValue(() => {
    let offset = 0;

    if (jumpProgress.value !== 0) {
      offset = jumpOffset.value;
    } else if (isDancing) {
      offset = danceBounce.value;
    } else if (isWalking || isRunning) {
      offset = walkBob.value;
    } else {
      offset = breathProgress.value * ANIMATION.breathing.amount;
    }

    offset -= emotionSlouch.value;
    offset += angryProgress.value * ANIMATION.angry.tense;

    return offset;
  });

  // ═══════════════════════════════════════════════════════════
  // BODY X OFFSET
  // ═══════════════════════════════════════════════════════════
  const bodyXOffset = useDerivedValue(() => {
    let offset = 0;
    if (isDancing) offset = danceWiggle.value;
    offset += emotionSway.value;
    offset += emotionShake.value;
    return offset;
  });

  // ═══════════════════════════════════════════════════════════
  // SCALED BODY DIMENSIONS
  // ═══════════════════════════════════════════════════════════
  const scaledBodyWidth = useDerivedValue(() => AVATAR.body.width * scaleX.value);
  const scaledBodyHeight = useDerivedValue(() => AVATAR.body.height * scaleY.value);

  // ═══════════════════════════════════════════════════════════
  // BODY POSITIONS
  // ═══════════════════════════════════════════════════════════
  const eyeScaleY = useDerivedValue(() => 1 - blinkProgress.value);
  const bodyX = useDerivedValue(() => x + bodyXOffset.value);
  const bodyLeftX = useDerivedValue(() => bodyX.value - scaledBodyWidth.value / 2);
  const bodyRightX = useDerivedValue(() => bodyX.value + scaledBodyWidth.value / 2);

  const bodyTopY = useDerivedValue(() => {
    const normalY = y - AVATAR.body.height - AVATAR.leg.height;
    const scaleOffset = (AVATAR.body.height - scaledBodyHeight.value);
    return normalY - bodyOffset.value + scaleOffset;
  });

  const armY = useDerivedValue(() => {
    return bodyTopY.value + (scaledBodyHeight.value / 2);
  });

  // ═══════════════════════════════════════════════════════════
  // FACE DIMENSIONS
  // ═══════════════════════════════════════════════════════════
  const scaledFaceWidth = useDerivedValue(() => {
    return (AVATAR.body.width - AVATAR.face.paddingX * 2) * scaleX.value;
  });

  const scaledFaceHeight = useDerivedValue(() => {
    return AVATAR.face.height * scaleY.value;
  });

  const faceX = useDerivedValue(() => {
    return bodyX.value - scaledFaceWidth.value / 2;
  });

  const faceY = useDerivedValue(() => {
    return bodyTopY.value + AVATAR.face.paddingY * scaleY.value;
  });

  // ═══════════════════════════════════════════════════════════
  // EYE POSITIONS
  // ═══════════════════════════════════════════════════════════
  const eyeSpacingScaled = useDerivedValue(() => AVATAR.face.eyeSpacing * scaleX.value);

  const eyeY = useDerivedValue(() => {
    return bodyTopY.value + (AVATAR.face.paddingY + AVATAR.face.eyeOffsetY) * scaleY.value;
  });

  const eyeHeight = useDerivedValue(() => {
    let height = AVATAR.face.eyeRadius * 2 * eyeScaleY.value * scaleY.value;
    if (isSad) height *= (1 - sadProgress.value * 0.3);
    return height;
  });

  const eyeWidth = useDerivedValue(() => AVATAR.face.eyeRadius * 2 * scaleX.value);

  const leftEyeX = useDerivedValue(() => bodyX.value - eyeSpacingScaled.value - eyeWidth.value / 2);
  const rightEyeX = useDerivedValue(() => bodyX.value + eyeSpacingScaled.value - eyeWidth.value / 2);
  const eyeRectY = useDerivedValue(() => eyeY.value - eyeHeight.value / 2);

  // ═══════════════════════════════════════════════════════════
  // EYEBROW POSITIONS
  // ═══════════════════════════════════════════════════════════
  const leftEyebrowStart = useDerivedValue(() => {
    const baseX = bodyX.value - eyeSpacingScaled.value - 6;
    const baseY = eyeY.value - 8;
    return vec(baseX, baseY);
  });

  const leftEyebrowEnd = useDerivedValue(() => {
    const baseX = bodyX.value - eyeSpacingScaled.value + 6;
    let baseY = eyeY.value - 8;
    if (isSad) baseY += sadProgress.value * 4;
    if (isAngry) baseY -= angryProgress.value * 4;
    return vec(baseX, baseY);
  });

  const rightEyebrowStart = useDerivedValue(() => {
    const baseX = bodyX.value + eyeSpacingScaled.value - 6;
    let baseY = eyeY.value - 8;
    if (isSad) baseY += sadProgress.value * 4;
    if (isAngry) baseY -= angryProgress.value * 4;
    return vec(baseX, baseY);
  });

  const rightEyebrowEnd = useDerivedValue(() => {
    const baseX = bodyX.value + eyeSpacingScaled.value + 6;
    const baseY = eyeY.value - 8;
    return vec(baseX, baseY);
  });

  // ═══════════════════════════════════════════════════════════
  // TEAR POSITION
  // ═══════════════════════════════════════════════════════════
  const tearStartX = useDerivedValue(() => bodyX.value - eyeSpacingScaled.value);
  const tearStartY = useDerivedValue(() => eyeY.value + 5);

  // ═══════════════════════════════════════════════════════════
  // NAME PLATE (Hearts spawn from here)
  // ═══════════════════════════════════════════════════════════
  const scaledNamePlateWidth = useDerivedValue(() => {
    return (AVATAR.body.width - AVATAR.namePlate.paddingX * 2) * scaleX.value;
  });

  const namePlateX = useDerivedValue(() => {
    return bodyX.value - scaledNamePlateWidth.value / 2;
  });

  const namePlateY = useDerivedValue(() => {
    const normalY = y - AVATAR.leg.height - AVATAR.namePlate.offsetY;
    return normalY - bodyOffset.value;
  });

  const nameTextY = useDerivedValue(() => namePlateY.value + 9);

  // Heart spawn position (from name plate / upper body)
  const heartSpawnY = y - AVATAR.leg.height - AVATAR.body.height * 0.3;

  // ═══════════════════════════════════════════════════════════
  // LEG TOP
  // ═══════════════════════════════════════════════════════════
  const legTopY = useDerivedValue(() => {
    return bodyTopY.value + scaledBodyHeight.value;
  });

  // ═══════════════════════════════════════════════════════════
  // ARM ANGLES
  // ═══════════════════════════════════════════════════════════
  const jumpArmRaise = useDerivedValue(() => {
    if (jumpProgress.value > 0) return jumpProgress.value * ANIMATION.jumping.armRaise;
    return 0;
  });

  const leftArmAngle = useDerivedValue(() => {
    if (isClapping) return clapAngle.value;
    if (isDancing) return danceLeftArmAngle.value;

    const armSwing = isRunning ? ANIMATION.running.armSwing : ANIMATION.walking.armSwing;
    let walkSwing = interpolate(walkProgress.value, [0, 0.5, 1], [armSwing, 0, -armSwing]);
    const sadDroop = sadProgress.value * ANIMATION.sad.armDroop;
    return walkSwing + jumpArmRaise.value - sadDroop;
  });

  const rightArmAngle = useDerivedValue(() => {
    if (isClapping) return clapAngle.value;
    if (isWaving) return waveAngle.value;
    if (isDancing) return danceRightArmAngle.value;

    const armSwing = isRunning ? ANIMATION.running.armSwing : ANIMATION.walking.armSwing;
    let walkSwing = interpolate(walkProgress.value, [0, 0.5, 1], [-armSwing, 0, armSwing]);
    const sadDroop = sadProgress.value * ANIMATION.sad.armDroop;
    return walkSwing + jumpArmRaise.value - sadDroop;
  });

  // ═══════════════════════════════════════════════════════════
  // LEG ANGLES
  // ═══════════════════════════════════════════════════════════
  const leftLegAngle = useDerivedValue(() => {
    if (jumpProgress.value > 0) {
      return jumpProgress.value * ANIMATION.jumping.legTuck;
    }
    if (isDancing) {
      return interpolate(danceProgress.value, [0, 0.5, 1],
        [-ANIMATION.dancing.legBend, ANIMATION.dancing.legBend, -ANIMATION.dancing.legBend]);
    }
    const legSwing = isRunning ? ANIMATION.running.legSwing : ANIMATION.walking.legSwing;
    return interpolate(walkProgress.value, [0, 0.5, 1], [-legSwing, 0, legSwing]);
  });

  const rightLegAngle = useDerivedValue(() => {
    if (jumpProgress.value > 0) {
      return -jumpProgress.value * ANIMATION.jumping.legTuck;
    }
    return -leftLegAngle.value;
  });

  // ═══════════════════════════════════════════════════════════
  // STATIC LEG X POSITIONS
  // ═══════════════════════════════════════════════════════════
  const leftLegX = x - AVATAR.leg.spacing;
  const rightLegX = x + AVATAR.leg.spacing;

  // ═══════════════════════════════════════════════════════════
  // ARM POINTS
  // ═══════════════════════════════════════════════════════════
  const leftArmStart = useDerivedValue(() => vec(bodyLeftX.value, armY.value));

  const leftArmEnd = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    let endX = bodyLeftX.value - Math.cos(angleRad) * AVATAR.arm.length;
    let endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;

    if (isClapping && clapArmRaise.value > 0) {
      const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
      endX = endX + clapOffset;
      endY = armY.value - AVATAR.arm.length * 0.7;
    }
    return vec(endX, endY);
  });

  const leftHandX = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    let handX = bodyLeftX.value - Math.cos(angleRad) * AVATAR.arm.length;
    if (isClapping && clapArmRaise.value > 0) {
      const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
      handX = handX + clapOffset;
    }
    return handX;
  });

  const leftHandY = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    if (isClapping && clapArmRaise.value > 0) {
      return armY.value - AVATAR.arm.length * 0.7;
    }
    return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
  });

  const rightArmStart = useDerivedValue(() => vec(bodyRightX.value, armY.value));

  const rightArmEnd = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    let endX = bodyRightX.value + Math.cos(angleRad) * AVATAR.arm.length;
    let endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;

    if (isClapping && clapArmRaise.value > 0) {
      const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
      endX = endX - clapOffset;
      endY = armY.value - AVATAR.arm.length * 0.7;
    }
    return vec(endX, endY);
  });

  const rightHandX = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    let handX = bodyRightX.value + Math.cos(angleRad) * AVATAR.arm.length;
    if (isClapping && clapArmRaise.value > 0) {
      const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
      handX = handX - clapOffset;
    }
    return handX;
  });

  const rightHandY = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    if (isClapping && clapArmRaise.value > 0) {
      return armY.value - AVATAR.arm.length * 0.7;
    }
    return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
  });

  const handRadius = useDerivedValue(() => {
    if (isAngry) return AVATAR.arm.handRadius * (1 - angryProgress.value * 0.3);
    return AVATAR.arm.handRadius;
  });

  // ═══════════════════════════════════════════════════════════
  // FOOT Y
  // ═══════════════════════════════════════════════════════════
  const footY = useDerivedValue(() => y);

  // ═══════════════════════════════════════════════════════════
  // LEG POINTS
  // ═══════════════════════════════════════════════════════════
  const legSpacingScaled = useDerivedValue(() => AVATAR.leg.spacing * scaleX.value);

  const leftLegStartX = useDerivedValue(() => bodyX.value - legSpacingScaled.value + bodyXOffset.value);
  const leftLegStart = useDerivedValue(() => vec(leftLegStartX.value, legTopY.value));

  const leftLegEnd = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;

    if (jumpProgress.value > 0) {
      const legEndX = leftLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
      const legEndY = legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
      return vec(legEndX, legEndY);
    }
    return vec(
      leftLegX + Math.sin(angleRad) * AVATAR.leg.height,
      footY.value - Math.abs(Math.sin(angleRad)) * footLift
    );
  });

  const leftFootX = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    if (jumpProgress.value > 0) {
      return leftLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
    }
    return leftLegX + Math.sin(angleRad) * AVATAR.leg.height;
  });

  const leftFootY = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;
    if (jumpProgress.value > 0) {
      return legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
    }
    return footY.value - Math.abs(Math.sin(angleRad)) * footLift;
  });

  const rightLegStartX = useDerivedValue(() => bodyX.value + legSpacingScaled.value + bodyXOffset.value);
  const rightLegStart = useDerivedValue(() => vec(rightLegStartX.value, legTopY.value));

  const rightLegEnd = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;

    if (jumpProgress.value > 0) {
      const legEndX = rightLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
      const legEndY = legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
      return vec(legEndX, legEndY);
    }
    return vec(
      rightLegX + Math.sin(angleRad) * AVATAR.leg.height,
      footY.value - Math.abs(Math.sin(angleRad)) * footLift
    );
  });

  const rightFootX = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    if (jumpProgress.value > 0) {
      return rightLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
    }
    return rightLegX + Math.sin(angleRad) * AVATAR.leg.height;
  });

  const rightFootY = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;
    if (jumpProgress.value > 0) {
      return legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
    }
    return footY.value - Math.abs(Math.sin(angleRad)) * footLift;
  });

  // ═══════════════════════════════════════════════════════════
  // NAME TEXT
  // ═══════════════════════════════════════════════════════════
  let nameText = playerName;
  const nameXOffset = useDerivedValue(() => {
    if (!font) return x;
    const maxWidth = AVATAR.body.width - (AVATAR.namePlate.paddingX * 2) - (AVATAR.namePlate.textPadding * 2);
    let text = playerName;
    let textWidth = font.getTextWidth(text);
    while (text.length > 0 && textWidth > maxWidth) {
      text = text.slice(0, -1);
      textWidth = font.getTextWidth(text);
    }
    return bodyX.value - (textWidth / 2);
  });

  if (font) {
    const maxWidth = AVATAR.body.width - (AVATAR.namePlate.paddingX * 2) - (AVATAR.namePlate.textPadding * 2);
    let textWidth = font.getTextWidth(nameText);
    while (nameText.length > 0 && textWidth > maxWidth) {
      nameText = nameText.slice(0, -1);
      textWidth = font.getTextWidth(nameText);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  const { body, arm, leg, face, namePlate, colors } = AVATAR;

  const dustParticleIndices = Array.from({ length: ANIMATION.dust.particleCount }, (_, i) => i);

  const eyebrowOpacity = useDerivedValue(() => {
    return Math.max(sadProgress.value, angryProgress.value);
  });

  return (
    <Group>
      {/* DUST PARTICLES */}
      {dustParticleIndices.map((index) => (
        <DustParticle
          key={`dust-${index}`}
          baseX={x}
          baseY={y}
          index={index}
          progress={dustProgress}
          visible={showDust}
        />
      ))}


      {/* BODY */}
      <RoundedRect
        x={bodyLeftX}
        y={bodyTopY}
        width={scaledBodyWidth}
        height={scaledBodyHeight}
        r={body.radius}
        color={color}
      />

      {/* LEFT ARM */}
      <Line p1={leftArmStart} p2={leftArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
      <Circle cx={leftHandX} cy={leftHandY} r={handRadius} color={colors.limbs} />

      {/* RIGHT ARM */}
      <Line p1={rightArmStart} p2={rightArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
      <Circle cx={rightHandX} cy={rightHandY} r={handRadius} color={colors.limbs} />

      {/* FACE PANEL */}
      <RoundedRect
        x={faceX}
        y={faceY}
        width={scaledFaceWidth}
        height={scaledFaceHeight}
        r={face.radius}
        color={colors.face}
        opacity={colors.faceOpacity}
      />

      {/* EYEBROWS */}
      <Line
        p1={leftEyebrowStart}
        p2={leftEyebrowEnd}
        color={colors.eyebrows}
        style="stroke"
        strokeWidth={2}
        opacity={eyebrowOpacity}
      />
      <Line
        p1={rightEyebrowStart}
        p2={rightEyebrowEnd}
        color={colors.eyebrows}
        style="stroke"
        strokeWidth={2}
        opacity={eyebrowOpacity}
      />
      {/* FACE IMAGE OVERLAY */}
      {faceImage && (
        <Image
          image={faceImage}
          x={faceX}
          y={faceY}
          width={scaledFaceWidth}
          height={scaledFaceHeight}
          fit="cover"
        />
      )}
      {/* EYES */}
      <RoundedRect
        x={leftEyeX}
        y={eyeRectY}
        width={eyeWidth}
        height={eyeHeight}
        r={useDerivedValue(() => Math.min(face.eyeRadius, eyeHeight.value / 2))}
        color={colors.eyes}
      />
      <RoundedRect
        x={rightEyeX}
        y={eyeRectY}
        width={eyeWidth}
        height={eyeHeight}
        r={useDerivedValue(() => Math.min(face.eyeRadius, eyeHeight.value / 2))}
        color={colors.eyes}
      />
      {/* TEAR */}
      {isSad && (
        <TearDrop
          startX={tearStartX.value}
          startY={tearStartY.value}
          progress={tearProgress}
          visible={showTear}
        />
      )}

      {/* NAME PLATE */}
      <RoundedRect
        x={namePlateX}
        y={namePlateY}
        width={scaledNamePlateWidth}
        height={namePlate.height}
        r={namePlate.radius}
        color={colors.namePlate}
        opacity={colors.namePlateOpacity}
      />

      {font && (
        <Text x={nameXOffset} y={nameTextY} text={nameText} font={font} color={colors.nameText} />
      )}

      {/* LEFT LEG */}
      <Line p1={leftLegStart} p2={leftLegEnd} color={colors.limbs} style="stroke" strokeWidth={leg.width} />
      <Circle cx={leftFootX} cy={leftFootY} r={leg.footRadius} color={colors.limbs} />

      {/* RIGHT LEG */}
      <Line p1={rightLegStart} p2={rightLegEnd} color={colors.limbs} style="stroke" strokeWidth={leg.width} />
      <Circle cx={rightFootX} cy={rightFootY} r={leg.footRadius} color={colors.limbs} />


      {/* LOVE HEART BUBBLES */}
      {isRomance && hearts.map((heart, index) => (
        heart && (
          <LoveHeart
            key={`heart-${heart.id}`}
            baseX={x}
            baseY={heartSpawnY}
            progress={heartProgressValues[index]}
            color={heart.color}
            seed={heart.seed}
          />
        )
      ))}
    </Group>
  );
};

export default PlayerFigure;