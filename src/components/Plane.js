import React, { useEffect } from 'react';
import { useSharedValue, useDerivedValue, withTiming, runOnJS, Easing } from 'react-native-reanimated';
import { Path, Skia } from '@shopify/react-native-skia';
import { CHARACTER_DIMENSIONS } from '../constants/character';

const ANIMATION_DURATION = 1000; // milliseconds - slightly longer for message
const ARC_HEIGHT = 60; // Flatter arc for plane

const Plane = ({ startX, startY, targetX, targetY, onAnimationComplete }) => {
  // Animation progress (0 to 1)
  const progress = useSharedValue(0);

  useEffect(() => {
    // Start the animation when component mounts
    progress.value = withTiming(1, {
      duration: ANIMATION_DURATION,
      easing: Easing.inOut(Easing.cubic),
    }, (finished) => {
      if (finished && onAnimationComplete) {
        runOnJS(onAnimationComplete)();
      }
    });
  }, []);

  // Extract start position values
  const startXVal = useDerivedValue(() => {
    'worklet';
    return typeof startX?.value === 'number' ? startX.value : startX;
  }, [startX]);

  const startYVal = useDerivedValue(() => {
    'worklet';
    return typeof startY?.value === 'number' ? startY.value : startY;
  }, [startY]);

  // Calculate plane position with arc trajectory
  const planeX = useDerivedValue(() => {
    'worklet';
    // Linear interpolation for X
    return startXVal.value + (targetX - startXVal.value) * progress.value;
  }, [startXVal, targetX, progress]);

  const planeY = useDerivedValue(() => {
    'worklet';
    const offsetStartY = startYVal.value - CHARACTER_DIMENSIONS.BODY_HEIGHT / 2 - 20;

    // Linear interpolation for Y
    const linearY = offsetStartY + (targetY - offsetStartY) * progress.value;

    // Add gentler parabolic arc for plane
    const arcOffset = -ARC_HEIGHT * Math.sin(progress.value * Math.PI);

    return linearY + arcOffset;
  }, [startYVal, targetY, progress]);

  // Calculate rotation based on direction of flight
  const rotation = useDerivedValue(() => {
    'worklet';
    const deltaX = targetX - startXVal.value;
    const deltaY = targetY - startYVal.value;

    // Calculate angle in radians, then convert to degrees
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Add tilt based on arc (nose up at beginning, nose down at end)
    const arcTilt = -30 * Math.sin(progress.value * Math.PI);

    return angle + arcTilt;
  }, [startXVal, targetX, targetY, progress]);

  // Create paper plane path (Entypo paper-plane icon approximation)
  const planePath = useDerivedValue(() => {
    'worklet';
    const x = planeX.value;
    const y = planeY.value;
    const angle = (rotation.value * Math.PI) / 180;
    const size = 20; // Plane size

    const path = Skia.Path.Make();

    // Define plane shape points (paper plane outline)
    const points = [
      { x: size, y: 0 },      // Nose (front)
      { x: -size * 0.3, y: size * 0.6 },  // Bottom wing
      { x: -size * 0.1, y: 0 }, // Center back
      { x: -size * 0.3, y: -size * 0.6 }, // Top wing
    ];

    // Rotate and translate points
    const rotatedPoints = points.map(p => {
      const rotX = p.x * Math.cos(angle) - p.y * Math.sin(angle);
      const rotY = p.x * Math.sin(angle) + p.y * Math.cos(angle);
      return { x: x + rotX, y: y + rotY };
    });

    // Draw the plane
    path.moveTo(rotatedPoints[0].x, rotatedPoints[0].y);
    for (let i = 1; i < rotatedPoints.length; i++) {
      path.lineTo(rotatedPoints[i].x, rotatedPoints[i].y);
    }
    path.close();

    return path;
  }, [planeX, planeY, rotation]);

  // Create trail path for motion effect
  const trailPath = useDerivedValue(() => {
    'worklet';
    const x = planeX.value;
    const y = planeY.value;
    const angle = (rotation.value * Math.PI) / 180;

    const path = Skia.Path.Make();

    // Trail lines behind the plane
    const trailLength = 15;
    const backX = x - trailLength * Math.cos(angle);
    const backY = y - trailLength * Math.sin(angle);

    path.moveTo(backX, backY);
    path.lineTo(x, y);

    return path;
  }, [planeX, planeY, rotation]);

  return (
    <>
      {/* Motion trail */}
      <Path
        path={trailPath}
        color="rgba(100, 149, 237, 0.4)"
        style="stroke"
        strokeWidth={2}
        strokeCap="round"
      />

      {/* Paper plane body */}
      <Path
        path={planePath}
        color="#4A90E2"
        style="fill"
      />

      {/* Plane outline */}
      <Path
        path={planePath}
        color="#2E5C8A"
        style="stroke"
        strokeWidth={1.5}
      />
    </>
  );
};

export default React.memo(Plane);
