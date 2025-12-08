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
  withSpring,
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
    bodyBob: 3,
    stepDuration: 400,
  },
  running: {
    armSwing: 35,
    legSwing: 40,
    footLift: 12,
    bodyBob: 8,
    stepDuration: 180,
  },
  jumping: {
    crouchAmount: 10,
    jumpHeight: 60,
    crouchDuration: 150,
    launchDuration: 200,
    airDuration: 100,
    landDuration: 150,
    armRaise: 70,
    legTuck: 25,
    stretchY: 1.15,
    stretchX: 0.9,
    squashY: 0.75,
    squashX: 1.2,
    squashDuration: 100,
    recoverDuration: 300,
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
    closeDuration: 50,
    openDuration: 50,
    closedDuration: 80,
    minInterval: 2000,
    maxInterval: 5000,
  },
  clapping: {
    armRaise: 45,
    clapDistance: 5,
    clapDuration: 150,
    clapCount: 4,
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
  isRunning = false,
  isJumping = false,
  isDancing = false,
  isWaving = false,
  isClapping = false,
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

  // ═══════════════════════════════════════════════════════════
  // BLINK ANIMATION
  // ═══════════════════════════════════════════════════════════
  const triggerBlink = () => {
    const { closeDuration, openDuration, closedDuration } = ANIMATION.blinking;
    blinkProgress.value = withSequence(
      withTiming(1, { duration: closeDuration }),
      withTiming(1, { duration: closedDuration }),
      withTiming(0, { duration: openDuration })
    );
  };

  const scheduleNextBlink = () => {
    const { minInterval, maxInterval } = ANIMATION.blinking;
    const randomDelay = minInterval + Math.random() * (maxInterval - minInterval);
    setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();
    }, randomDelay);
  };

  useEffect(() => {
    const initialDelay = 1000 + Math.random() * 2000;
    const timeoutId = setTimeout(() => {
      triggerBlink();
      scheduleNextBlink();
    }, initialDelay);
    return () => clearTimeout(timeoutId);
  }, []);

  const eyeScaleY = useDerivedValue(() => 1 - blinkProgress.value);

  // ═══════════════════════════════════════════════════════════
  // BREATHING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isWalking && !isRunning && !isJumping && !isDancing && !isWaving && !isClapping) {
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
  }, [isWalking, isRunning, isJumping, isDancing, isWaving, isClapping]);

  // ═══════════════════════════════════════════════════════════
  // WALKING / RUNNING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if ((isWalking || isRunning) && !isJumping && !isDancing && !isWaving && !isClapping) {
      const stepDuration = isRunning
        ? ANIMATION.running.stepDuration
        : ANIMATION.walking.stepDuration;

      walkProgress.value = withRepeat(
        withTiming(1, {
          duration: stepDuration,
          easing: Easing.linear,
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(walkProgress);
      walkProgress.value = withTiming(0.5, { duration: 200 });
    }
  }, [isWalking, isRunning, isJumping, isDancing, isWaving, isClapping]);

  // ═══════════════════════════════════════════════════════════
  // JUMP ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isJumping) {
      const {
        crouchDuration, launchDuration, airDuration, landDuration,
        stretchX, stretchY, squashX, squashY, squashDuration,
      } = ANIMATION.jumping;

      jumpProgress.value = withSequence(
        withTiming(-0.2, { duration: crouchDuration, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: launchDuration, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: airDuration }),
        withTiming(0, { duration: landDuration, easing: Easing.in(Easing.quad) })
      );

      scaleX.value = withSequence(
        withTiming(squashX, { duration: crouchDuration }),
        withTiming(stretchX, { duration: launchDuration }),
        withTiming(1, { duration: airDuration }),
        withTiming(squashX, { duration: squashDuration }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );

      scaleY.value = withSequence(
        withTiming(squashY, { duration: crouchDuration }),
        withTiming(stretchY, { duration: launchDuration }),
        withTiming(1, { duration: airDuration }),
        withTiming(squashY, { duration: squashDuration }),
        withSpring(1, { damping: 8, stiffness: 200 })
      );
    } else {
      jumpProgress.value = withTiming(0, { duration: 100 });
      scaleX.value = withTiming(1, { duration: 100 });
      scaleY.value = withTiming(1, { duration: 100 });
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
      waveArmRaise.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
      waveProgress.value = withRepeat(
        withTiming(1, { duration: waveDuration, easing: Easing.inOut(Easing.sin) }),
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
  // CLAP ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isClapping) {
      const { clapDuration, clapCount } = ANIMATION.clapping;

      clapArmRaise.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad)
      });

      clapProgress.value = withRepeat(
        withSequence(
          withTiming(1, { duration: clapDuration, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: clapDuration, easing: Easing.out(Easing.quad) })
        ),
        clapCount,
        false
      );
    } else {
      cancelAnimation(clapProgress);
      clapProgress.value = withTiming(0, { duration: 100 });
      clapArmRaise.value = withTiming(0, { duration: 200 });
    }
  }, [isClapping]);

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
    if (jumpProgress.value !== 0) return jumpOffset.value;
    if (isDancing) return danceBounce.value;
    if (isWalking || isRunning) return walkBob.value;
    return breathProgress.value * ANIMATION.breathing.amount;
  });

  // ═══════════════════════════════════════════════════════════
  // BODY X OFFSET
  // ═══════════════════════════════════════════════════════════
  const bodyXOffset = useDerivedValue(() => {
    if (isDancing) return danceWiggle.value;
    return 0;
  });

  // ═══════════════════════════════════════════════════════════
  // SCALED BODY DIMENSIONS
  // ═══════════════════════════════════════════════════════════
  const scaledBodyWidth = useDerivedValue(() => AVATAR.body.width * scaleX.value);
  const scaledBodyHeight = useDerivedValue(() => AVATAR.body.height * scaleY.value);

  // ═══════════════════════════════════════════════════════════
  // BODY POSITIONS
  // ═══════════════════════════════════════════════════════════
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
    return AVATAR.face.eyeRadius * 2 * eyeScaleY.value * scaleY.value;
  });

  const eyeWidth = useDerivedValue(() => AVATAR.face.eyeRadius * 2 * scaleX.value);

  const leftEyeX = useDerivedValue(() => bodyX.value - eyeSpacingScaled.value - eyeWidth.value / 2);
  const rightEyeX = useDerivedValue(() => bodyX.value + eyeSpacingScaled.value - eyeWidth.value / 2);
  const eyeRectY = useDerivedValue(() => eyeY.value - eyeHeight.value / 2);

  // ═══════════════════════════════════════════════════════════
  // NAME PLATE
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
    if (isClapping) {
      return clapAngle.value;
    }

    if (isDancing) return danceLeftArmAngle.value;

    const armSwing = isRunning
      ? ANIMATION.running.armSwing
      : ANIMATION.walking.armSwing;

    const walkSwing = interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [armSwing, 0, -armSwing]
    );
    return walkSwing + jumpArmRaise.value;
  });

  const rightArmAngle = useDerivedValue(() => {
    if (isClapping) {
      return clapAngle.value;
    }

    if (isWaving) return waveAngle.value;
    if (isDancing) return danceRightArmAngle.value;

    const armSwing = isRunning
      ? ANIMATION.running.armSwing
      : ANIMATION.walking.armSwing;

    const walkSwing = interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [-armSwing, 0, armSwing]
    );
    return walkSwing + jumpArmRaise.value;
  });

  // ═══════════════════════════════════════════════════════════
  // LEG ANGLES (with jump tuck)
  // ═══════════════════════════════════════════════════════════
  const leftLegAngle = useDerivedValue(() => {
    if (jumpProgress.value > 0) {
      const tuckAmount = jumpProgress.value * ANIMATION.jumping.legTuck;
      return tuckAmount;
    }

    if (isDancing) {
      return interpolate(
        danceProgress.value,
        [0, 0.5, 1],
        [-ANIMATION.dancing.legBend, ANIMATION.dancing.legBend, -ANIMATION.dancing.legBend]
      );
    }

    const legSwing = isRunning
      ? ANIMATION.running.legSwing
      : ANIMATION.walking.legSwing;

    return interpolate(
      walkProgress.value,
      [0, 0.5, 1],
      [-legSwing, 0, legSwing]
    );
  });

  const rightLegAngle = useDerivedValue(() => {
    if (jumpProgress.value > 0) {
      const tuckAmount = jumpProgress.value * ANIMATION.jumping.legTuck;
      return -tuckAmount;
    }

    return -leftLegAngle.value;
  });

  // ═══════════════════════════════════════════════════════════
  // STATIC LEG X POSITIONS
  // ═══════════════════════════════════════════════════════════
  const leftLegX = x - AVATAR.leg.spacing;
  const rightLegX = x + AVATAR.leg.spacing;

  // ═══════════════════════════════════════════════════════════
  // ARM POINTS (with clap support)
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

  // ═══════════════════════════════════════════════════════════
  // FOOT Y (for ground-based movement)
  // ═══════════════════════════════════════════════════════════
  const footY = useDerivedValue(() => y);

  // ═══════════════════════════════════════════════════════════
  // LEG POINTS (with jump handling)
  // ═══════════════════════════════════════════════════════════
  const legSpacingScaled = useDerivedValue(() => AVATAR.leg.spacing * scaleX.value);

  const leftLegStartX = useDerivedValue(() => bodyX.value - legSpacingScaled.value + bodyXOffset.value);
  const leftLegStart = useDerivedValue(() => vec(leftLegStartX.value, legTopY.value));

  const leftLegEnd = useDerivedValue(() => {
    const angleRad = leftLegAngle.value * DEG_TO_RAD;
    const footLift = isRunning
      ? ANIMATION.running.footLift
      : ANIMATION.walking.footLift;

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
    const footLift = isRunning
      ? ANIMATION.running.footLift
      : ANIMATION.walking.footLift;

    if (jumpProgress.value > 0) {
      return legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
    }

    return footY.value - Math.abs(Math.sin(angleRad)) * footLift;
  });

  const rightLegStartX = useDerivedValue(() => bodyX.value + legSpacingScaled.value + bodyXOffset.value);
  const rightLegStart = useDerivedValue(() => vec(rightLegStartX.value, legTopY.value));

  const rightLegEnd = useDerivedValue(() => {
    const angleRad = rightLegAngle.value * DEG_TO_RAD;
    const footLift = isRunning
      ? ANIMATION.running.footLift
      : ANIMATION.walking.footLift;

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
    const footLift = isRunning
      ? ANIMATION.running.footLift
      : ANIMATION.walking.footLift;

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

  return (
    <Group>
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
      <Circle cx={leftHandX} cy={leftHandY} r={arm.handRadius} color={colors.limbs} />

      {/* RIGHT ARM */}
      <Line p1={rightArmStart} p2={rightArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
      <Circle cx={rightHandX} cy={rightHandY} r={arm.handRadius} color={colors.limbs} />

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
    </Group>
  );
};

export default PlayerFigure;