import React, { useEffect } from 'react';
import { 
  Group, 
  RoundedRect, 
  Circle, 
  Line, 
  vec, 
  Text,
  useFont,
} from '@shopify/react-native-skia';
import { 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  Easing,
  useDerivedValue,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const AVATAR = {
  body: { width: 60, height: 80, radius: 12 },
  leg: { height: 30, width: 4, spacing: 15, footRadius: 6 },
  arm: { length: 35, width: 4, handRadius: 5, dropY: 10 },
  face: { paddingX: 8, paddingY: 10, height: 50, radius: 8, eyeRadius: 3, eyeSpacing: 12, eyeOffsetY: 18 },
  namePlate: { paddingX: 5, height: 12, radius: 4, textPadding: 3, offsetY: 15 },
  colors: { limbs: '#333', face: 'white', faceOpacity: 0.9, namePlate: '#333', namePlateOpacity: 0.8, nameText: 'white', eyes: 'black' },
};

const ANIMATION = {
  breathing: { amount: 3, duration: 2000 },
  walking: { 
    armSwing: 15,
    legSwing: 20,
    footLift: 5,
    bodyBob: 3,        // NEW! Pixels to bob up/down
    stepDuration: 400,
  },
};

const DEG_TO_RAD = Math.PI / 180;

// ═══════════════════════════════════════════════════════════
// PLAYER FIGURE COMPONENT
// ═══════════════════════════════════════════════════════════
const PlayerFigure = ({ x, y, playerName, color = '#4A90E2', isWalking = false }) => {
  
  const font = useFont(require('../../assets/fonts/Fredoka-Medium.ttf'), 12);

  // ═══════════════════════════════════════════════════════════
  // ANIMATION SHARED VALUES
  // ═══════════════════════════════════════════════════════════
  const breathProgress = useSharedValue(0);
  const walkProgress = useSharedValue(0.5);

  // ═══════════════════════════════════════════════════════════
  // BREATHING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isWalking) {
      breathProgress.value = withRepeat(
        withTiming(1, { 
          duration: ANIMATION.breathing.duration, 
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(breathProgress);
      breathProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isWalking]);

  // ═══════════════════════════════════════════════════════════
  // WALKING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isWalking) {
      walkProgress.value = withRepeat(
        withTiming(1, { 
          duration: ANIMATION.walking.stepDuration, 
          easing: Easing.linear,
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(walkProgress);
      walkProgress.value = withTiming(0.5, { duration: 200 });
    }
  }, [isWalking]);

  // ═══════════════════════════════════════════════════════════
  // BODY BOB (NEW!)
  // Bobs TWICE per walk cycle using sine wave
  // ═══════════════════════════════════════════════════════════
  const walkBob = useDerivedValue(() => {
    // Math.sin with 2*PI creates one full wave
    // We multiply by 2 to get TWO bobs per cycle
    // Math.abs makes it always positive (bob UP only)
    const bobCycle = Math.abs(Math.sin(walkProgress.value * Math.PI * 2));
    return bobCycle * ANIMATION.walking.bodyBob;
  });

  // ═══════════════════════════════════════════════════════════
  // COMBINED BODY OFFSET (breathing OR walking bob)
  // ═══════════════════════════════════════════════════════════
  const bodyOffset = useDerivedValue(() => {
    if (isWalking) {
      return walkBob.value;
    }
    return breathProgress.value * ANIMATION.breathing.amount;
  });

  // ═══════════════════════════════════════════════════════════
  // BODY POSITION (uses combined offset now)
  // ═══════════════════════════════════════════════════════════
  const bodyTopY = useDerivedValue(() => {
    const normalY = y - AVATAR.body.height - AVATAR.leg.height;
    return normalY - bodyOffset.value;
  });

  const armY = useDerivedValue(() => {
    return bodyTopY.value + (AVATAR.body.height / 2);
  });

  const faceY = useDerivedValue(() => {
    return bodyTopY.value + AVATAR.face.paddingY;
  });

  const eyeY = useDerivedValue(() => {
    return bodyTopY.value + AVATAR.face.paddingY + AVATAR.face.eyeOffsetY;
  });

  const namePlateY = useDerivedValue(() => {
    const normalY = y - AVATAR.leg.height - AVATAR.namePlate.offsetY;
    return normalY - bodyOffset.value;
  });

  const nameTextY = useDerivedValue(() => {
    return namePlateY.value + 9;
  });

  const legTopY = useDerivedValue(() => {
    return y - AVATAR.leg.height - bodyOffset.value;
  });

  // ═══════════════════════════════════════════════════════════
  // ARM SWING ANGLES
  // ═══════════════════════════════════════════════════════════
  const leftArmAngle = useDerivedValue(() => {
    return interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [ANIMATION.walking.armSwing, 0, -ANIMATION.walking.armSwing]
    );
  });

  const rightArmAngle = useDerivedValue(() => {
    return -leftArmAngle.value;
  });

  // ═══════════════════════════════════════════════════════════
  // LEG SWING ANGLES
  // ═══════════════════════════════════════════════════════════
  const leftLegAngle = useDerivedValue(() => {
    return interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [-ANIMATION.walking.legSwing, 0, ANIMATION.walking.legSwing]
    );
  });

  const rightLegAngle = useDerivedValue(() => {
    return -leftLegAngle.value;
  });

  // ═══════════════════════════════════════════════════════════
  // STATIC X POSITIONS
  // ═══════════════════════════════════════════════════════════
  const bodyLeft = x - AVATAR.body.width / 2;
  const bodyRight = x + AVATAR.body.width / 2;
  const leftLegX = x - AVATAR.leg.spacing;
  const rightLegX = x + AVATAR.leg.spacing;

  // ═══════════════════════════════════════════════════════════
  // LEFT ARM POINTS
  // ═══════════════════════════════════════════════════════════
  const leftArmStart = useDerivedValue(() => vec(bodyLeft, armY.value));
  
  const leftArmEnd = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    const endX = bodyLeft - Math.cos(angleRad) * AVATAR.arm.length;
    const endY = armY.value + Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
    return vec(endX, endY);
  });

  const leftHandX = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    return bodyLeft - Math.cos(angleRad) * AVATAR.arm.length;
  });

  const leftHandY = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    return armY.value + Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
  });

  // ═══════════════════════════════════════════════════════════
  // RIGHT ARM POINTS
  // ═══════════════════════════════════════════════════════════
  const rightArmStart = useDerivedValue(() => vec(bodyRight, armY.value));
  
  const rightArmEnd = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    const endX = bodyRight + Math.cos(angleRad) * AVATAR.arm.length;
    const endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
    return vec(endX, endY);
  });

  const rightHandX = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    return bodyRight + Math.cos(angleRad) * AVATAR.arm.length;
  });

  const rightHandY = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
  });

  // ═══════════════════════════════════════════════════════════
  // LEFT LEG POINTS
  // ═══════════════════════════════════════════════════════════
  const leftLegStart = useDerivedValue(() => vec(leftLegX, legTopY.value));
  
  const leftLegEnd = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    const footX = leftLegX + Math.sin(angleRad) * AVATAR.leg.height;
    const footY = y - Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
    return vec(footX, footY);
  });

  const leftFootX = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    return leftLegX + Math.sin(angleRad) * AVATAR.leg.height;
  });

  const leftFootY = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    return y - Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
  });

  // ═══════════════════════════════════════════════════════════
  // RIGHT LEG POINTS
  // ═══════════════════════════════════════════════════════════
  const rightLegStart = useDerivedValue(() => vec(rightLegX, legTopY.value));
  
  const rightLegEnd = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    const footX = rightLegX + Math.sin(angleRad) * AVATAR.leg.height;
    const footY = y - Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
    return vec(footX, footY);
  });

  const rightFootX = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    return rightLegX + Math.sin(angleRad) * AVATAR.leg.height;
  });

  const rightFootY = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    return y - Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
  });

  // ═══════════════════════════════════════════════════════════
  // NAME TEXT
  // ═══════════════════════════════════════════════════════════
  let nameText = playerName;
  let nameX = x;

  if (font) {
    const maxWidth = AVATAR.body.width - (AVATAR.namePlate.paddingX * 2) - (AVATAR.namePlate.textPadding * 2);
    let textWidth = font.getTextWidth(nameText);
    while (nameText.length > 0 && textWidth > maxWidth) {
      nameText = nameText.slice(0, -1);
      textWidth = font.getTextWidth(nameText);
    }
    nameX = x - (textWidth / 2);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  const { body, arm, leg, face, namePlate, colors } = AVATAR;

  return (
    <Group>
      {/* BODY */}
      <RoundedRect
        x={bodyLeft}
        y={bodyTopY}
        width={body.width}
        height={body.height}
        r={body.radius}
        color={color}
      />

      {/* LEFT ARM */}
      <Line p1={leftArmStart} p2={leftArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
      <Circle cx={leftHandX} cy={leftHandY} r={arm.handRadius} color={colors.limbs} />

      {/* RIGHT ARM */}
      <Line p1={rightArmStart} p2={rightArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
      <Circle cx={rightHandX} cy={rightHandY} r={arm.handRadius} color={colors.limbs} />

      {/* FACE PANEL */}
      <RoundedRect
        x={bodyLeft + face.paddingX}
        y={faceY}
        width={body.width - (face.paddingX * 2)}
        height={face.height}
        r={face.radius}
        color={colors.face}
        opacity={colors.faceOpacity}
      />

      {/* EYES */}
      <Circle cx={x - face.eyeSpacing} cy={eyeY} r={face.eyeRadius} color={colors.eyes} />
      <Circle cx={x + face.eyeSpacing} cy={eyeY} r={face.eyeRadius} color={colors.eyes} />

      {/* NAME PLATE */}
      <RoundedRect
        x={bodyLeft + namePlate.paddingX}
        y={namePlateY}
        width={body.width - (namePlate.paddingX * 2)}
        height={namePlate.height}
        r={namePlate.radius}
        color={colors.namePlate}
        opacity={colors.namePlateOpacity}
      />

      {font && (
        <Text x={nameX} y={nameTextY} text={nameText} font={font} color={colors.nameText} />
      )}

      {/* LEFT LEG */}
      <Line p1={leftLegStart} p2={leftLegEnd} color={colors.limbs} style="stroke" strokeWidth={leg.width} />
      <Circle cx={leftFootX} cy={leftFootY} r={leg.footRadius} color={colors.limbs} />

      {/* RIGHT LEG */}
      <Line p1={rightLegStart} p2={rightLegEnd} color={colors.limbs} style="stroke" strokeWidth={leg.width} />
      <Circle cx={rightFootX} cy={rightFootY} r={leg.footRadius} color={colors.limbs} />
    </Group>
  );
};

export default PlayerFigure;