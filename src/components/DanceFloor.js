// DanceFloor.js
import React, { useRef, useState } from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  Platform,
} from 'react-native';

const AVATAR_SIZE = 40; // body square size
const HEAD_SIZE = 18;
const LIMB_WIDTH = 6;
const LIMB_LENGTH = 18;

export default function DanceFloor({
  source,
  style,
  initialPosition = null, // { x, y } center coords
  animationDuration = 1200, // slower by default
}) {
  const [layout, setLayout] = useState(null);

  // animated values for top-left position of avatar (we store top-left so Animated.View can use left/top)
  const posX = useRef(new Animated.Value(0)).current;
  const posY = useRef(new Animated.Value(0)).current;

  // limb swing value: -1 .. 1, used for interpolation to rotation
  const swing = useRef(new Animated.Value(0)).current;
  const swingLoopRef = useRef(null);
  const moveAnimRef = useRef(null);

  const initialized = useRef(false);

  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });

    if (!initialized.current) {
      initialized.current = true;
      const startX =
        initialPosition && typeof initialPosition.x === 'number'
          ? clamp(initialPosition.x, AVATAR_SIZE / 2, width - AVATAR_SIZE / 2)
          : width / 2;
      const startY =
        initialPosition && typeof initialPosition.y === 'number'
          ? clamp(initialPosition.y, AVATAR_SIZE / 2, height - AVATAR_SIZE / 2)
          : height / 2;

      posX.setValue(startX - AVATAR_SIZE / 2);
      posY.setValue(startY - AVATAR_SIZE / 2);
    }
  };

  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(v, hi));
  }

  // Start continuous swinging animation
  const startSwing = () => {
    // If there's already a loop running, don't start another
    if (swingLoopRef.current) return;

    // reset swing to 0 then loop between -1 and 1
    swing.setValue(0);
    const seq = Animated.sequence([
      Animated.timing(swing, {
        toValue: 1,
        duration: 220,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(swing, {
        toValue: -1,
        duration: 220,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);
    const loop = Animated.loop(seq);
    swingLoopRef.current = loop;
    loop.start();
  };

  // Stop swinging smoothly (ease swing back to 0)
  const stopSwing = () => {
    if (swingLoopRef.current) {
      try {
        swingLoopRef.current.stop();
      } catch (e) {
        /* ignore */
      }
      swingLoopRef.current = null;
    }
    Animated.timing(swing, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  const onPress = (evt) => {
    if (!layout) return;
    const { locationX, locationY } = evt.nativeEvent;

    const targetCenterX = clamp(locationX, AVATAR_SIZE / 2, layout.width - AVATAR_SIZE / 2);
    const targetCenterY = clamp(locationY, AVATAR_SIZE / 2, layout.height - AVATAR_SIZE / 2);

    // Stop any previous movement
    if (moveAnimRef.current) {
      try {
        moveAnimRef.current.stop();
      } catch (e) {}
      moveAnimRef.current = null;
    }

    // Start swinging while moving
    startSwing();

    // animate to new position (top-left coords)
    const toX = targetCenterX - AVATAR_SIZE / 2;
    const toY = targetCenterY - AVATAR_SIZE / 2;

    const dx = Animated.subtract(new Animated.Value(toX), posX); // not used for duration but could be
    // start movement animation
    const anim = Animated.parallel([
      Animated.timing(posX, {
        toValue: toX,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(posY, {
        toValue: toY,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]);

    moveAnimRef.current = anim;
    anim.start(() => {
      // movement finished
      moveAnimRef.current = null;
      stopSwing();
    });
  };

  // Interpolations for limb rotations based on swing value (-1..1)
  // arms swing opposite to legs: arm rotation = swing * angle, other arm = -swing * angle
  const ARM_ANGLE = 30; // degrees
  const LEG_ANGLE = 40;

  const leftArmRotate = swing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`${ARM_ANGLE}deg`, '0deg', `-${ARM_ANGLE}deg`],
  });
  const rightArmRotate = swing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`-${ARM_ANGLE}deg`, '0deg', `${ARM_ANGLE}deg`],
  });
  const leftLegRotate = swing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`-${LEG_ANGLE}deg`, '0deg', `${LEG_ANGLE}deg`],
  });
  const rightLegRotate = swing.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [`${LEG_ANGLE}deg`, '0deg', `-${LEG_ANGLE}deg`],
  });

  return (
    <Pressable onPress={onPress} style={[styles.wrapper, style]} onLayout={onLayout}>
      <ImageBackground source={require('../images/floor.jpeg')} style={styles.image} resizeMode="cover">
        <View style={styles.overlay} pointerEvents="none">
          {/* Avatar container positioned using Animated.View */}
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                left: posX,
                top: posY,
              },
            ]}
          >
            {/* Head */}
            <View style={styles.head} />

            {/* Body and limbs container */}
            <View style={styles.torsoRow}>
              {/* Left arm */}
              <Animated.View
                style={[
                  styles.arm,
                  styles.leftArm,
                  {
                    transform: [
                      { translateY: 4 },
                      { rotate: leftArmRotate }, // swing rotation
                      { translateY: -4 },
                    ],
                  },
                ]}
              />
              {/* Body */}
              <View style={styles.body} />
              {/* Right arm */}
              <Animated.View
                style={[
                  styles.arm,
                  styles.rightArm,
                  {
                    transform: [
                      { translateY: 4 },
                      { rotate: rightArmRotate },
                      { translateY: -4 },
                    ],
                  },
                ]}
              />
            </View>

            {/* Legs row */}
            <View style={styles.legsRow}>
              <Animated.View
                style={[
                  styles.leg,
                  styles.leftLeg,
                  {
                    transform: [
                      { translateY: -2 },
                      { rotate: leftLegRotate },
                      { translateY: 2 },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.leg,
                  styles.rightLeg,
                  {
                    transform: [
                      { translateY: -2 },
                      { rotate: rightLegRotate },
                      { translateY: 2 },
                    ],
                  },
                ]}
              />
            </View>
          </Animated.View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },

  avatarContainer: {
    position: 'absolute',
    width: AVATAR_SIZE,
    // height will be computed by children
    alignItems: 'center',
  },

  head: {
    width: HEAD_SIZE,
    height: HEAD_SIZE,
    borderRadius: HEAD_SIZE / 2,
    backgroundColor: '#ffd7b5',
    marginBottom: 2,
    // small border to pop
    borderColor: '#e6a97b',
    borderWidth: 1,
  },

  torsoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 6,
    backgroundColor: '#0ea5a4', // teal body
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
  },

  arm: {
    width: LIMB_WIDTH,
    height: LIMB_LENGTH,
    backgroundColor: '#ffd7b5',
    borderRadius: LIMB_WIDTH / 2,
    position: 'relative',
  },
  leftArm: {
    marginRight: -8,
    transform: [{ translateX: -2 }],
  },
  rightArm: {
    marginLeft: -8,
    transform: [{ translateX: 2 }],
  },

  legsRow: {
    marginTop: 4,
    width: AVATAR_SIZE,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  leg: {
    width: LIMB_WIDTH,
    height: LIMB_LENGTH,
    backgroundColor: '#6b7280', // darker pant color
    borderRadius: LIMB_WIDTH / 2,
  },
  leftLeg: {
    transform: [{ translateX: -6 }],
  },
  rightLeg: {
    transform: [{ translateX: 6 }],
  },
});
