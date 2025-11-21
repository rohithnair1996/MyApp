import React, { useEffect } from 'react';
import { RoundedRect, Path, Skia, Image, useImage, Group, rect, rrect } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { CHARACTER_DIMENSIONS } from '../constants/character';

const {
  BODY_WIDTH,
  BODY_HEIGHT,
  LEG_LENGTH,
  LEG_HORIZONTAL,
  ARM_LENGTH,
  ARM_HORIZONTAL,
} = CHARACTER_DIMENSIONS;

const User = ({ x, y, color, image }) => {
  // Load the image if provided
  const avatarImage = useImage(image);

  // Walk cycle animation value (0 to 4: 0=both down, 1=right up, 2=both down, 3=left up, 4=both down)
  const walkCycle = useSharedValue(0);
  const previousX = useSharedValue(x);
  const previousY = useSharedValue(y);
  const isMoving = useSharedValue(false);
  const movementDirection = useSharedValue({ x: 0, y: 0 }); // Track movement direction

  // Detect movement and control walk animation
  useEffect(() => {
    const checkMovement = setInterval(() => {
      const deltaX = x - previousX.value;
      const deltaY = y - previousY.value;
      const isCurrentlyMoving = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;

      if (isCurrentlyMoving && !isMoving.value) {
        // Store movement direction
        movementDirection.value = { x: deltaX, y: deltaY };

        // Determine which leg leads based on direction
        // For horizontal movement: right leg leads when moving right, left leg when moving left
        // For vertical movement: alternate (default to right leg leading)
        const shouldRightLegLead = Math.abs(deltaX) > Math.abs(deltaY)
          ? deltaX > 0  // Moving right
          : true;       // For vertical or diagonal, default to right leg first

        // Start walking animation
        isMoving.value = true;

        if (shouldRightLegLead) {
          // Right leg leads: 0 -> 1 (right up) -> 2 (both down) -> 3 (left up) -> 0 (both down)
          walkCycle.value = 0;
          walkCycle.value = withRepeat(
            withSequence(
              withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) }), // Right leg up
              withTiming(2, { duration: 200, easing: Easing.inOut(Easing.ease) }), // Right leg down
              withTiming(3, { duration: 200, easing: Easing.inOut(Easing.ease) }), // Left leg up
              withTiming(4, { duration: 200, easing: Easing.inOut(Easing.ease) })  // Left leg down (=0)
            ),
            -1, // Infinite repeat
            false
          );
        } else {
          // Left leg leads: 0 -> 3 (left up) -> 2 (both down) -> 1 (right up) -> 0 (both down)
          walkCycle.value = 2;
          walkCycle.value = withRepeat(
            withSequence(
              withTiming(3, { duration: 200, easing: Easing.inOut(Easing.ease) }), // Left leg up
              withTiming(4, { duration: 200, easing: Easing.inOut(Easing.ease) }), // Left leg down
              withTiming(1, { duration: 200, easing: Easing.inOut(Easing.ease) }), // Right leg up
              withTiming(2, { duration: 200, easing: Easing.inOut(Easing.ease) })  // Right leg down
            ),
            -1, // Infinite repeat
            false
          );
        }
      } else if (!isCurrentlyMoving && isMoving.value) {
        // Stop walking animation, return to neutral position
        isMoving.value = false;
        cancelAnimation(walkCycle);
        walkCycle.value = withTiming(0, { duration: 150 });
      }

      previousX.value = x;
      previousY.value = y;
    }, 50); // Check every 50ms

    return () => clearInterval(checkMovement);
  }, [x, y]);

  // Calculate positions relative to center point (x, y) with animation
  const bodyX = useDerivedValue(() => {
    'worklet';

    // Add slight horizontal sway based on which leg is lifted
    const cycle = walkCycle.value % 4;
    let sway = 0;

    if (cycle >= 0 && cycle < 2) {
      // Right leg is stepping - body leans slightly left
      const liftAmount = cycle < 1 ? cycle : 2 - cycle;
      sway = -liftAmount * 2.5; // More noticeable sway
    } else if (cycle >= 2 && cycle < 4) {
      // Left leg is stepping - body leans slightly right
      const liftAmount = cycle < 3 ? cycle - 2 : 4 - cycle;
      sway = liftAmount * 2.5; // More noticeable sway
    }

    return x - BODY_WIDTH / 2 + sway;
  }, [x, walkCycle]);

  const bodyY = useDerivedValue(() => {
    'worklet';

    // Add body bob - body rises when either leg is at peak lift
    const cycle = walkCycle.value % 4;
    let bob = 0;

    if (cycle >= 0 && cycle < 2) {
      // Right leg is stepping
      const liftAmount = cycle < 1 ? cycle : 2 - cycle;
      bob = -liftAmount * 4; // More pronounced bobbing
    } else if (cycle >= 2 && cycle < 4) {
      // Left leg is stepping
      const liftAmount = cycle < 3 ? cycle - 2 : 4 - cycle;
      bob = -liftAmount * 4; // More pronounced bobbing
    }

    return y - BODY_HEIGHT / 2 + bob;
  }, [y, walkCycle]);

  // Create all paths with useDerivedValue for animated legs
  const paths = useDerivedValue(() => {
    'worklet';

    const cycle = walkCycle.value % 4; // Normalize to 0-4 range

    // Determine if each leg is lifted (shortened)
    // cycle 0-1: right leg lifting, cycle 1-2: right leg lowering
    // cycle 2-3: left leg lifting, cycle 3-4(0): left leg lowering

    // Calculate lift amount for each leg (0 = on ground, 1 = fully lifted)
    let rightLegLift = 0;
    let leftLegLift = 0;

    if (cycle >= 0 && cycle < 2) {
      // Right leg is stepping
      if (cycle < 1) {
        rightLegLift = cycle; // 0 to 1 (lifting)
      } else {
        rightLegLift = 2 - cycle; // 1 to 0 (lowering)
      }
    } else if (cycle >= 2 && cycle < 4) {
      // Left leg is stepping
      if (cycle < 3) {
        leftLegLift = cycle - 2; // 0 to 1 (lifting)
      } else {
        leftLegLift = 4 - cycle; // 1 to 0 (lowering)
      }
    }

    // Calculate leg shortening (lifted legs are shorter)
    const rightLegShorten = rightLegLift * 4; // Max 4 pixels shorter
    const leftLegShorten = leftLegLift * 4; // Max 4 pixels shorter

    // Calculate forward/backward movement for the stepping leg
    const rightLegForward = rightLegLift * 5; // Step forward when lifting
    const leftLegForward = leftLegLift * 5; // Step forward when lifting

    // Left leg path (curvy) with walking animation
    const leftLeg = Skia.Path.Make();
    leftLeg.moveTo(x - BODY_WIDTH / 4, y + BODY_HEIGHT / 2);
    // Curve down with leg shortening when lifted
    const leftLegEndY = y + BODY_HEIGHT / 2 + LEG_LENGTH - leftLegShorten;
    leftLeg.quadTo(
      x - BODY_WIDTH / 4 - 3 + leftLegForward, y + BODY_HEIGHT / 2 + (LEG_LENGTH - leftLegShorten) / 2,
      x - BODY_WIDTH / 4 + leftLegForward * 0.8, leftLegEndY
    );
    // Curve to foot
    leftLeg.quadTo(
      x - BODY_WIDTH / 4 - LEG_HORIZONTAL / 2 + leftLegForward * 0.6, leftLegEndY + 2,
      x - BODY_WIDTH / 4 - LEG_HORIZONTAL + leftLegForward * 0.5, leftLegEndY
    );

    // Right leg path (curvy) with walking animation
    const rightLeg = Skia.Path.Make();
    rightLeg.moveTo(x + BODY_WIDTH / 4, y + BODY_HEIGHT / 2);
    // Curve down with leg shortening when lifted
    const rightLegEndY = y + BODY_HEIGHT / 2 + LEG_LENGTH - rightLegShorten;
    rightLeg.quadTo(
      x + BODY_WIDTH / 4 + 3 + rightLegForward, y + BODY_HEIGHT / 2 + (LEG_LENGTH - rightLegShorten) / 2,
      x + BODY_WIDTH / 4 + rightLegForward * 0.8, rightLegEndY
    );
    // Curve to foot
    rightLeg.quadTo(
      x + BODY_WIDTH / 4 + LEG_HORIZONTAL / 2 + rightLegForward * 0.6, rightLegEndY + 2,
      x + BODY_WIDTH / 4 + LEG_HORIZONTAL + rightLegForward * 0.5, rightLegEndY
    );

    // Left arm path (curvy)
    const leftArm = Skia.Path.Make();
    leftArm.moveTo(x - BODY_WIDTH / 2, y - BODY_HEIGHT / 4);
    // Curve outward
    leftArm.quadTo(
      x - BODY_WIDTH / 2 - ARM_LENGTH / 2, y - BODY_HEIGHT / 4 - 3,
      x - BODY_WIDTH / 2 - ARM_LENGTH, y - BODY_HEIGHT / 4
    );
    // Curve down to hand
    leftArm.quadTo(
      x - BODY_WIDTH / 2 - ARM_LENGTH - 2, y - BODY_HEIGHT / 4 + ARM_HORIZONTAL / 2,
      x - BODY_WIDTH / 2 - ARM_LENGTH, y - BODY_HEIGHT / 4 + ARM_HORIZONTAL
    );

    // Right arm path (curvy)
    const rightArm = Skia.Path.Make();
    rightArm.moveTo(x + BODY_WIDTH / 2, y - BODY_HEIGHT / 4);
    // Curve outward
    rightArm.quadTo(
      x + BODY_WIDTH / 2 + ARM_LENGTH / 2, y - BODY_HEIGHT / 4 - 3,
      x + BODY_WIDTH / 2 + ARM_LENGTH, y - BODY_HEIGHT / 4
    );
    // Curve down to hand
    rightArm.quadTo(
      x + BODY_WIDTH / 2 + ARM_LENGTH + 2, y - BODY_HEIGHT / 4 + ARM_HORIZONTAL / 2,
      x + BODY_WIDTH / 2 + ARM_LENGTH, y - BODY_HEIGHT / 4 + ARM_HORIZONTAL
    );

    return { leftLeg, rightLeg, leftArm, rightArm };
  }, [x, y, walkCycle]);

  // Create individual path derived values
  const leftArmPath = useDerivedValue(() => {
    'worklet';
    return paths.value.leftArm;
  }, [paths]);

  const rightArmPath = useDerivedValue(() => {
    'worklet';
    return paths.value.rightArm;
  }, [paths]);

  const leftLegPath = useDerivedValue(() => {
    'worklet';
    return paths.value.leftLeg;
  }, [paths]);

  const rightLegPath = useDerivedValue(() => {
    'worklet';
    return paths.value.rightLeg;
  }, [paths]);

  // Image dimensions with padding
  const padding = 2;
  const imageWidth = BODY_WIDTH - padding * 2;
  const imageHeight = BODY_HEIGHT - padding * 2;

  const imageX = useDerivedValue(() => {
    'worklet';
    return bodyX.value + padding;
  }, [bodyX]);

  const imageY = useDerivedValue(() => {
    'worklet';
    return bodyY.value + padding;
  }, [bodyY]);

  // Clip path for rounded image
  const imageClip = useDerivedValue(() => {
    'worklet';
    return rrect(
      rect(imageX.value, imageY.value, imageWidth, imageHeight),
      2, // Slightly smaller radius than body for better fit
      2
    );
  }, [imageX, imageY]);

  return (
    <>
      {/* Arms (behind body) */}
      <Path path={leftArmPath} color={color} style="stroke" strokeWidth={4} />
      <Path path={rightArmPath} color={color} style="stroke" strokeWidth={4} />

      {/* Body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={BODY_WIDTH}
        height={BODY_HEIGHT}
        r={4}
        color={color}
      />

      {/* Avatar Image on Body */}
      {avatarImage && (
        <Group clip={imageClip}>
          <Image
            image={avatarImage}
            x={imageX}
            y={imageY}
            width={imageWidth}
            height={imageHeight}
            fit="cover"
          />
        </Group>
      )}

      {/* Legs */}
      <Path path={leftLegPath} color={color} style="stroke" strokeWidth={4} />
      <Path path={rightLegPath} color={color} style="stroke" strokeWidth={4} />
    </>
  );
};

export default React.memo(User);
