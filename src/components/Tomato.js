import React, { useEffect } from 'react';
import { Circle, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withTiming, runOnJS, Easing } from 'react-native-reanimated';
import { CHARACTER_DIMENSIONS } from '../constants/character';

const TOMATO_RADIUS = 25;
const ANIMATION_DURATION = 800; // milliseconds
const ARC_HEIGHT = 80; // Height of the arc for the throw

const Tomato = ({ startX, startY, targetX, targetY, onAnimationComplete }) => {
  // Animation progress (0 to 1)
  const progress = useSharedValue(0);

  useEffect(() => {
    // Start the animation when component mounts
    progress.value = withTiming(1, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.quad),
    }, (finished) => {
      if (finished && onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, []);

  // Calculate tomato position with arc trajectory
  const tomatoX = useDerivedValue(() => {
    'worklet';
    const startXVal = typeof startX?.value === 'number' ? startX.value : startX;

    // Linear interpolation for X
    return startXVal + (targetX - startXVal) * progress.value;
  }, [startX, targetX, progress]);

  const tomatoY = useDerivedValue(() => {
    'worklet';
    const startYVal = typeof startY?.value === 'number' ? startY.value : startY;
    const offsetStartY = startYVal - CHARACTER_DIMENSIONS.BODY_HEIGHT / 2 - 20;

    // Linear interpolation for Y
    const linearY = offsetStartY + (targetY - offsetStartY) * progress.value;

    // Add parabolic arc (peaks at progress = 0.5)
    const arcOffset = -ARC_HEIGHT * Math.sin(progress.value * Math.PI);

    return linearY + arcOffset;
  }, [startY, targetY, progress]);

  // Create stem path (small leaves on top)
  const stemPath = useDerivedValue(() => {
    'worklet';
    const xVal = tomatoX.value;
    const yVal = tomatoY.value;

    const path = Skia.Path.Make();

    // Left leaf
    path.moveTo(xVal - 6, yVal - TOMATO_RADIUS);
    path.quadTo(xVal - 8, yVal - TOMATO_RADIUS - 4, xVal - 4, yVal - TOMATO_RADIUS - 6);

    // Center stem
    path.moveTo(xVal, yVal - TOMATO_RADIUS);
    path.lineTo(xVal, yVal - TOMATO_RADIUS - 8);

    // Right leaf
    path.moveTo(xVal + 6, yVal - TOMATO_RADIUS);
    path.quadTo(xVal + 8, yVal - TOMATO_RADIUS - 4, xVal + 4, yVal - TOMATO_RADIUS - 6);

    return path;
  }, [tomatoX, tomatoY]);

  // Highlight position
  const highlightX = useDerivedValue(() => {
    'worklet';
    return tomatoX.value - 3;
  }, [tomatoX]);

  const highlightY = useDerivedValue(() => {
    'worklet';
    return tomatoY.value - 3;
  }, [tomatoY]);

  return (
    <>
      {/* Tomato body */}
      <Circle cx={tomatoX} cy={tomatoY} r={TOMATO_RADIUS} color="#FF6347" />

      {/* Highlight for 3D effect */}
      <Circle cx={tomatoX} cy={tomatoY} r={TOMATO_RADIUS} color="rgba(255, 99, 71, 0.3)" />
      <Circle
        cx={highlightX}
        cy={highlightY}
        r={4}
        color="rgba(255, 255, 255, 0.5)"
      />

      {/* Green stem and leaves */}
      <Path path={stemPath} color="#228B22" style="stroke" strokeWidth={2} strokeCap="round" />
    </>
  );
};

export default React.memo(Tomato);
