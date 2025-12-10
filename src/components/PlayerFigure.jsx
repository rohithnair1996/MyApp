import React, { useEffect, useState } from 'react';
import {
  Group,
  RoundedRect,
  Circle,
  Line,
  vec,
  Text,
  useFont,
  Path,
  Image,  // 👈 Add this
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
  colors: {
    limbs: '#333',
    face: 'white',
    faceOpacity: 0.9,
    namePlate: '#333',
    namePlateOpacity: 0.8,
    nameText: 'white',
    eyes: 'black',
    dust: '#A0896C',
    eyebrows: '#333',
    tear: '#6BB5FF',
  },
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
  dust: {
    particleCount: 6,
    minSize: 3,
    maxSize: 8,
    spreadX: 40,
    riseY: 15,
    duration: 400,
  },
  sad: {
    slouch: 8,
    headTilt: 5,
    armDroop: 20,
    breathingSpeed: 3000,
    swayAmount: 2,
    swayDuration: 2500,
    tearInterval: 2000,
    tearDuration: 1000,
  },
  angry: {
    tense: 3,
    shake: 2,
    shakeDuration: 100,
    stompDuration: 300,
    fistClench: true,
    breathingSpeed: 800,
  },
  romance: {
    bubbleCount: 12,
    minSize: 10,      // Was 6, now 10
    maxSize: 28,      // Was 18, now 28
    riseDuration: 1500,
    spawnInterval: 200,
    horizontalDrift: 35,  // Slightly more drift for bigger hearts
    riseHeight: 120,      // Rise a bit higher
    colors: ['#FF69B4', '#FF4458', '#FFB6C1', '#FF7F7F', '#FF1493', '#E91E63'],
  },
};

const DEG_TO_RAD = Math.PI / 180;

// ═══════════════════════════════════════════════════════════
// DUST PARTICLE COMPONENT
// ═══════════════════════════════════════════════════════════
const DustParticle = ({ baseX, baseY, index, progress, visible }) => {
  const { particleCount, minSize, maxSize, spreadX, riseY } = ANIMATION.dust;

  const side = index % 2 === 0 ? -1 : 1;
  const spreadFactor = (Math.floor(index / 2) + 1) / (particleCount / 2);
  const seed = ((index + 1) * 0.37) % 1;

  const particleX = useDerivedValue(() => {
    const baseSpreadX = side * spreadX * spreadFactor * (0.5 + seed * 0.5);
    return baseX + baseSpreadX * progress.value;
  });

  const particleY = useDerivedValue(() => {
    const riseAmount = riseY * Math.sin(progress.value * Math.PI);
    return baseY - riseAmount;
  });

  const particleSize = useDerivedValue(() => {
    return maxSize - (maxSize - minSize) * progress.value;
  });

  const particleOpacity = useDerivedValue(() => {
    if (visible.value === 0) return 0;
    return (1 - progress.value) * 0.7;
  });

  return (
    <Circle
      cx={particleX}
      cy={particleY}
      r={particleSize}
      color={AVATAR.colors.dust}
      opacity={particleOpacity}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// TEAR DROP COMPONENT
// ═══════════════════════════════════════════════════════════
const TearDrop = ({ startX, startY, progress, visible }) => {
  const tearY = useDerivedValue(() => {
    return startY + progress.value * 25;
  });

  const tearOpacity = useDerivedValue(() => {
    if (visible.value === 0) return 0;
    if (progress.value < 0.2) return progress.value * 5;
    if (progress.value > 0.8) return (1 - progress.value) * 5;
    return 1;
  });

  const tearSize = useDerivedValue(() => {
    return 2 + Math.sin(progress.value * Math.PI) * 1;
  });

  return (
    <Circle
      cx={startX}
      cy={tearY}
      r={tearSize}
      color={AVATAR.colors.tear}
      opacity={tearOpacity}
    />
  );
};

// ═══════════════════════════════════════════════════════════
// LOVE HEART BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════
const LoveHeart = ({ baseX, baseY, progress, color, seed }) => {
  const { minSize, maxSize, horizontalDrift, riseHeight } = ANIMATION.romance;

  // Horizontal drift using sine wave
  const heartX = useDerivedValue(() => {
    const drift = Math.sin(progress.value * Math.PI * 3 + seed * Math.PI * 2) * horizontalDrift;
    const offsetX = (seed - 0.5) * 40; // Random starting offset
    return baseX + drift + offsetX;
  });

  // Rise up from name plate
  const heartY = useDerivedValue(() => {
    return baseY - progress.value * riseHeight;
  });

  // Size grows as it rises, then shrinks at burst
  const heartSize = useDerivedValue(() => {
    if (progress.value < 0.7) {
      // Grow from minSize to maxSize
      return minSize + (maxSize - minSize) * (progress.value / 0.7);
    } else {
      // Burst effect - quick grow then shrink
      const burstProgress = (progress.value - 0.7) / 0.3;
      const burstSize = maxSize * (1 + burstProgress * 0.3);
      return burstSize * (1 - burstProgress * 0.5);
    }
  });

  // Opacity - fade in, stay, then fade out
  const heartOpacity = useDerivedValue(() => {
    if (progress.value < 0.1) {
      return progress.value * 10; // Fade in
    } else if (progress.value > 0.75) {
      return (1 - progress.value) * 4; // Fade out
    }
    return 0.9;
  });

  // Create heart path
  const heartPath = useDerivedValue(() => {
    const size = heartSize.value;
    const cx = heartX.value;
    const cy = heartY.value;

    // Heart shape path
    const s = size * 0.5;
    return `M ${cx} ${cy + s * 0.3}
            C ${cx} ${cy - s * 0.5}, ${cx - s} ${cy - s * 0.5}, ${cx - s} ${cy + s * 0.2}
            C ${cx - s} ${cy + s * 0.8}, ${cx} ${cy + s * 1.2}, ${cx} ${cy + s * 1.2}
            C ${cx} ${cy + s * 1.2}, ${cx + s} ${cy + s * 0.8}, ${cx + s} ${cy + s * 0.2}
            C ${cx + s} ${cy - s * 0.5}, ${cx} ${cy - s * 0.5}, ${cx} ${cy + s * 0.3}
            Z`;
  });

  return (
    <Path
      path={heartPath}
      color={color}
      opacity={heartOpacity}
    />
  );
};

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
  const [hearts, setHearts] = useState([]);
  const heartProgressValues = Array.from({ length: ANIMATION.romance.bubbleCount }, () => useSharedValue(0));

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
  // ROMANCE ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isRomance) {
      const { bubbleCount, riseDuration, spawnInterval, colors } = ANIMATION.romance;
      let heartIndex = 0;

      const spawnHeart = () => {
        const currentIndex = heartIndex % bubbleCount;
        const seed = Math.random();
        const colorIndex = Math.floor(Math.random() * colors.length);

        // Update hearts state
        setHearts(prev => {
          const newHearts = [...prev];
          newHearts[currentIndex] = {
            id: Date.now() + currentIndex,
            seed: seed,
            color: colors[colorIndex],
          };
          return newHearts;
        });

        // Animate this heart
        heartProgressValues[currentIndex].value = 0;
        heartProgressValues[currentIndex].value = withTiming(1, {
          duration: riseDuration,
          easing: Easing.out(Easing.quad),
        });

        heartIndex++;
      };

      // Spawn initial batch
      for (let i = 0; i < 5; i++) {
        setTimeout(() => spawnHeart(), i * 100);
      }

      // Continue spawning
      const intervalId = setInterval(spawnHeart, spawnInterval);

      return () => {
        clearInterval(intervalId);
      };
    } else {
      // Clear hearts when romance ends
      setHearts([]);
      heartProgressValues.forEach(progress => {
        progress.value = 0;
      });
    }
  }, [isRomance]);

  // ═══════════════════════════════════════════════════════════
  // SAD ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isSad) {
      sadProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });

      sadSway.value = withRepeat(
        withTiming(1, { duration: ANIMATION.sad.swayDuration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );

      const triggerTear = () => {
        showTear.value = 1;
        tearProgress.value = 0;
        tearProgress.value = withTiming(1, { duration: ANIMATION.sad.tearDuration });
        setTimeout(() => {
          showTear.value = 0;
        }, ANIMATION.sad.tearDuration);
      };

      triggerTear();
      const tearIntervalId = setInterval(triggerTear, ANIMATION.sad.tearInterval);

      return () => clearInterval(tearIntervalId);
    } else {
      sadProgress.value = withTiming(0, { duration: 300 });
      cancelAnimation(sadSway);
      sadSway.value = withTiming(0, { duration: 200 });
      showTear.value = 0;
    }
  }, [isSad]);

  // ═══════════════════════════════════════════════════════════
  // ANGRY ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (isAngry) {
      angryProgress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });

      angryShake.value = withRepeat(
        withSequence(
          withTiming(1, { duration: ANIMATION.angry.shakeDuration }),
          withTiming(-1, { duration: ANIMATION.angry.shakeDuration }),
          withTiming(0, { duration: ANIMATION.angry.shakeDuration })
        ),
        -1,
        false
      );
    } else {
      angryProgress.value = withTiming(0, { duration: 300 });
      cancelAnimation(angryShake);
      angryShake.value = withTiming(0, { duration: 100 });
    }
  }, [isAngry]);

  // ═══════════════════════════════════════════════════════════
  // BREATHING ANIMATION
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!isWalking && !isRunning && !isJumping && !isDancing && !isWaving && !isClapping) {
      let duration = ANIMATION.breathing.duration;
      if (isSad) duration = ANIMATION.sad.breathingSpeed;
      if (isAngry) duration = ANIMATION.angry.breathingSpeed;

      breathProgress.value = withRepeat(
        withTiming(1, {
          duration: duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true
      );
    } else {
      cancelAnimation(breathProgress);
      breathProgress.value = withTiming(0, { duration: 200 });
    }
  }, [isWalking, isRunning, isJumping, isDancing, isWaving, isClapping, isSad, isAngry]);

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
  // JUMP ANIMATION (with dust trigger)
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

      const totalJumpTime = crouchDuration + launchDuration + airDuration + landDuration;
      setTimeout(() => {
        showDust.value = 1;
        dustProgress.value = 0;
        dustProgress.value = withTiming(1, {
          duration: ANIMATION.dust.duration,
          easing: Easing.out(Easing.quad)
        });
        setTimeout(() => {
          showDust.value = 0;
        }, ANIMATION.dust.duration);
      }, totalJumpTime - 50);

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