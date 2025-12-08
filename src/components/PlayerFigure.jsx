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
  withSequence,
  withDelay,
  Easing,
  useDerivedValue,
  cancelAnimation,
  interpolate,
  runOnJS,
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
    bodyBob: 3,
    stepDuration: 400,
  },
  jumping: {
    crouchAmount: 10,
    jumpHeight: 60,
    crouchDuration: 150,
    launchDuration: 200,
    airDuration: 100,
    landDuration: 150,
    armRaise: 70,
  },
  dancing: {
    bounce: 8,
    wiggle: 10,
    armWave: 60,
    legBend: 15,
    beatDuration: 300,
  },
  waving: {
    armRaise: 80,
    waveSwing: 25,
    waveDuration: 200,
    waveCount: 3,
  },
  blinking: {
    closeDuration: 50,    // How fast eyes close
    openDuration: 50,     // How fast eyes open
    closedDuration: 80,   // How long eyes stay closed
    minInterval: 2000,    // Minimum time between blinks
    maxInterval: 5000,    // Maximum time between blinks
  },
};

const DEG_TO_RAD = Math.PI / 180;

// ═══════════════════════════════════════════════════════════
// PLAYER FIGURE COMPONENT
// ═══════════════════════════════════════════════════════════
const PlayerFigure = ({ 
  x, 
  y, 
  playerName, 
  color = '#4A90E2', 
  isWalking = false,
  isJumping = false,
  isDancing = false,
  isWaving = false,
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
  const blinkProgress = useSharedValue(0);  // NEW! 0=open, 1=closed

  // ═══════════════════════════════════════════════════════════
  // BLINK ANIMATION (NEW!)
  // ═══════════════════════════════════════════════════════════
  const triggerBlink = () => {
    const { closeDuration, openDuration, closedDuration } = ANIMATION.blinking;
    
    // Blink sequence: open → closed → open
    blinkProgress.value = withSequence(
      withTiming(1, { duration: closeDuration }),  // Close eyes
      withTiming(1, { duration: closedDuration }), // Keep closed
      withTiming(0, { duration: openDuration })    // Open eyes
    );
  };

  const scheduleNextBlink = () => {
    const { minInterval, maxInterval } = ANIMATION.blinking;
    const randomDelay = minInterval + Math.random() * (maxInterval - minInterval);
    
    setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();  // Schedule next blink
    }, randomDelay);
  };

  // Start blinking when component mounts
  useEffect(() => {
    // Initial delay before first blink
    const initialDelay = 1000 + Math.random() * 2000;
    const timeoutId = setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();
    }, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // EYE HEIGHT (for blink) (NEW!)
  // ═══════════════════════════════════════════════════════════
  const eyeScaleY = useDerivedValue(() => {
    // 1 = fully open, 0 = fully closed
    return 1 - blinkProgress.value;
  });

  // ═══════════════════════════════════════════════════════════
  // BREATHING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isWalking && !isJumping && !isDancing && !isWaving) {
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
  }, [isWalking, isJumping, isDancing, isWaving]);

  // ═══════════════════════════════════════════════════════════
  // WALKING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isWalking && !isJumping && !isDancing && !isWaving) {
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
  }, [isWalking, isJumping, isDancing, isWaving]);

  // ═══════════════════════════════════════════════════════════
  // JUMP ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isJumping) {
      const { crouchDuration, launchDuration, airDuration, landDuration } = ANIMATION.jumping;
      
      jumpProgress.value = withSequence(
        withTiming(-0.2, { duration: crouchDuration, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: launchDuration, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: airDuration }),
        withTiming(0, { duration: landDuration, easing: Easing.in(Easing.quad) })
      );
    } else {
      jumpProgress.value = withTiming(0, { duration: 100 });
    }
  }, [isJumping]);

  // ═══════════════════════════════════════════════════════════
  // DANCE ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isDancing) {
      danceProgress.value = withRepeat(
        withTiming(1, { 
          duration: ANIMATION.dancing.beatDuration, 
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(danceProgress);
      danceProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isDancing]);

  // ═══════════════════════════════════════════════════════════
  // WAVE ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isWaving) {
      const { waveDuration, waveCount } = ANIMATION.waving;
      
      waveArmRaise.value = withTiming(1, { 
        duration: 200, 
        easing: Easing.out(Easing.quad) 
      });
      
      waveProgress.value = withRepeat(
        withTiming(1, { 
          duration: waveDuration, 
          easing: Easing.inOut(Easing.sin),
        }),
        waveCount * 2,
        true
      );
    } else {
      cancelAnimation(waveProgress);
      waveProgress.value = withTiming(0.5, { duration: 100 });
      waveArmRaise.value = withTiming(0, { duration: 200 });
    }
  }, [isWaving]);

  // ═══════════════════════════════════════════════════════════
  // WAVE ARM ANGLE
  // ═══════════════════════════════════════════════════════════
  const waveAngle = useDerivedValue(() => {
    const { armRaise, waveSwing } = ANIMATION.waving;
    const raise = waveArmRaise.value * armRaise;
    const swing = interpolate(
      waveProgress.value,
      [0, 0.5, 1],
      [-waveSwing, 0, waveSwing]
    );
    return raise + (waveArmRaise.value * swing);
  });

  // ═══════════════════════════════════════════════════════════
  // DANCE DERIVED VALUES
  // ═══════════════════════════════════════════════════════════
  const danceBounce = useDerivedValue(() => {
    const bounceCycle = Math.abs(Math.sin(danceProgress.value * Math.PI * 2));
    return bounceCycle * ANIMATION.dancing.bounce;
  });

  const danceWiggle = useDerivedValue(() => {
    return Math.sin(danceProgress.value * Math.PI * 2) * ANIMATION.dancing.wiggle;
  });

  const danceLeftArmAngle = useDerivedValue(() => {
    return interpolate(
      danceProgress.value,
      [0, 0.5, 1],
      [ANIMATION.dancing.armWave, 20, ANIMATION.dancing.armWave]
    );
  });

  const danceRightArmAngle = useDerivedValue(() => {
    return interpolate(
      danceProgress.value,
      [0, 0.5, 1],
      [20, ANIMATION.dancing.armWave, 20]
    );
  });

  // ═══════════════════════════════════════════════════════════
  // JUMP OFFSET
  // ═══════════════════════════════════════════════════════════
  const jumpOffset = useDerivedValue(() => {
    const { crouchAmount, jumpHeight } = ANIMATION.jumping;
    
    if (jumpProgress.value < 0) {
      return jumpProgress.value * crouchAmount * 5;
    } else {
      return jumpProgress.value * jumpHeight;
    }
  });

  // ═══════════════════════════════════════════════════════════
  // WALK BOB
  // ═══════════════════════════════════════════════════════════
  const walkBob = useDerivedValue(() => {
    const bobCycle = Math.abs(Math.sin(walkProgress.value * Math.PI * 2));
    return bobCycle * ANIMATION.walking.bodyBob;
  });

  // ═══════════════════════════════════════════════════════════
  // COMBINED BODY OFFSET
  // ═══════════════════════════════════════════════════════════
  const bodyOffset = useDerivedValue(() => {
    if (jumpProgress.value !== 0) {
      return jumpOffset.value;
    }
    if (isDancing) {
      return danceBounce.value;
    }
    if (isWalking) {
      return walkBob.value;
    }
    return breathProgress.value * ANIMATION.breathing.amount;
  });

  // ═══════════════════════════════════════════════════════════
  // BODY X OFFSET
  // ═══════════════════════════════════════════════════════════
  const bodyXOffset = useDerivedValue(() => {
    if (isDancing) {
      return danceWiggle.value;
    }
    return 0;
  });

  // ═══════════════════════════════════════════════════════════
  // BODY POSITIONS
  // ═══════════════════════════════════════════════════════════
  const bodyTopY = useDerivedValue(() => {
    const normalY = y - AVATAR.body.height - AVATAR.leg.height;
    return normalY - bodyOffset.value;
  });

  const bodyX = useDerivedValue(() => {
    return x + bodyXOffset.value;
  });

  const bodyLeftX = useDerivedValue(() => {
    return bodyX.value - AVATAR.body.width / 2;
  });

  const bodyRightX = useDerivedValue(() => {
    return bodyX.value + AVATAR.body.width / 2;
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
  // ARM ANGLES
  // ═══════════════════════════════════════════════════════════
  const jumpArmRaise = useDerivedValue(() => {
    if (jumpProgress.value > 0) {
      return jumpProgress.value * ANIMATION.jumping.armRaise;
    }
    return 0;
  });

  const leftArmAngle = useDerivedValue(() => {
    if (isDancing) {
      return danceLeftArmAngle.value;
    }
    const walkSwing = interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [ANIMATION.walking.armSwing, 0, -ANIMATION.walking.armSwing]
    );
    return walkSwing + jumpArmRaise.value;
  });

  const rightArmAngle = useDerivedValue(() => {
    if (isWaving) {
      return waveAngle.value;
    }
    if (isDancing) {
      return danceRightArmAngle.value;
    }
    const walkSwing = interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [-ANIMATION.walking.armSwing, 0, ANIMATION.walking.armSwing]
    );
    return walkSwing + jumpArmRaise.value;
  });

  // ═══════════════════════════════════════════════════════════
  // LEG ANGLES
  // ═══════════════════════════════════════════════════════════
  const leftLegAngle = useDerivedValue(() => {
    if (isDancing) {
      return interpolate(
        danceProgress.value,
        [0, 0.5, 1],
        [-ANIMATION.dancing.legBend, ANIMATION.dancing.legBend, -ANIMATION.dancing.legBend]
      );
    }
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
  // STATIC POSITIONS
  // ═══════════════════════════════════════════════════════════
  const leftLegX = x - AVATAR.leg.spacing;
  const rightLegX = x + AVATAR.leg.spacing;

  // ═══════════════════════════════════════════════════════════
  // ARM POINTS
  // ═══════════════════════════════════════════════════════════
  const leftArmStart = useDerivedValue(() => vec(bodyLeftX.value, armY.value));
  const leftArmEnd = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    const endX = bodyLeftX.value - Math.cos(angleRad) * AVATAR.arm.length;
    const endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
    return vec(endX, endY);
  });
  const leftHandX = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    return bodyLeftX.value - Math.cos(angleRad) * AVATAR.arm.length;
  });
  const leftHandY = useDerivedValue(() => {
    const angleRad = leftArmAngle.value * DEG_TO_RAD;
    return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
  });

  const rightArmStart = useDerivedValue(() => vec(bodyRightX.value, armY.value));
  const rightArmEnd = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    const endX = bodyRightX.value + Math.cos(angleRad) * AVATAR.arm.length;
    const endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
    return vec(endX, endY);
  });
  const rightHandX = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    return bodyRightX.value + Math.cos(angleRad) * AVATAR.arm.length;
  });
  const rightHandY = useDerivedValue(() => {
    const angleRad = rightArmAngle.value * DEG_TO_RAD;
    return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
  });

  // ═══════════════════════════════════════════════════════════
  // FOOT Y
  // ═══════════════════════════════════════════════════════════
  const footY = useDerivedValue(() => {
    if (jumpProgress.value > 0) {
      return y - jumpOffset.value;
    }
    return y;
  });

  // ═══════════════════════════════════════════════════════════
  // LEG POINTS
  // ═══════════════════════════════════════════════════════════
  const leftLegStartX = useDerivedValue(() => leftLegX + bodyXOffset.value);
  const leftLegStart = useDerivedValue(() => vec(leftLegStartX.value, legTopY.value));
  const leftLegEnd = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    const footXOffset = Math.sin(angleRad) * AVATAR.leg.height;
    const footYOffset = Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
    return vec(leftLegX + footXOffset, footY.value - footYOffset);
  });
  const leftFootX = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    return leftLegX + Math.sin(angleRad) * AVATAR.leg.height;
  });
  const leftFootY = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    return footY.value - Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
  });

  const rightLegStartX = useDerivedValue(() => rightLegX + bodyXOffset.value);
  const rightLegStart = useDerivedValue(() => vec(rightLegStartX.value, legTopY.value));
  const rightLegEnd = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    const footXOffset = Math.sin(angleRad) * AVATAR.leg.height;
    const footYOffset = Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
    return vec(rightLegX + footXOffset, footY.value - footYOffset);
  });
  const rightFootX = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    return rightLegX + Math.sin(angleRad) * AVATAR.leg.height;
  });
  const rightFootY = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    return footY.value - Math.abs(Math.sin(angleRad)) * ANIMATION.walking.footLift;
  });

  // ═══════════════════════════════════════════════════════════
  // EYE DIMENSIONS (for blink) (NEW!)
  // ═══════════════════════════════════════════════════════════
  const eyeHeight = useDerivedValue(() => {
    // When blinking, eye becomes a thin line
    return AVATAR.face.eyeRadius * 2 * eyeScaleY.value;
  });

  const eyeWidth = AVATAR.face.eyeRadius * 2;

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

  // Eye positions for RoundedRect (top-left corner)
  const leftEyeX = useDerivedValue(() => bodyX.value - face.eyeSpacing - face.eyeRadius);
  const rightEyeX = useDerivedValue(() => bodyX.value + face.eyeSpacing - face.eyeRadius);
  const eyeRectY = useDerivedValue(() => eyeY.value - eyeHeight.value / 2);

  return (
    <Group>
      {/* BODY */}
      <RoundedRect
        x={bodyLeftX}
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
        x={useDerivedValue(() => bodyLeftX.value + face.paddingX)}
        y={faceY}
        width={body.width - (face.paddingX * 2)}
        height={face.height}
        r={face.radius}
        color={colors.face}
        opacity={colors.faceOpacity}
      />

      {/* EYES (NOW WITH BLINK!) */}
      {/* Using RoundedRect for eyes so they can squish vertically */}
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

      {/* NAME PLATE */}
      <RoundedRect
        x={useDerivedValue(() => bodyLeftX.value + namePlate.paddingX)}
        y={namePlateY}
        width={body.width - (namePlate.paddingX * 2)}
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
    </Group>
  );
};

export default PlayerFigure;