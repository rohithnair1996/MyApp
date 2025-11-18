// SkiaPlaygroundReanimated.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import {
  Canvas,
  Circle,
  Rect,
  Group,
  RRect,
  Oval,
  Line,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withRepeat,
} from "react-native-reanimated";

/*
  Modern Skia + Reanimated example:
  - Uses Reanimated shared values for animation
  - Passes shared values directly into Skia props
  - No useValue or runTiming from Skia
*/

export default function SkiaPlaygroundReanimated() {
  const [size, setSize] = useState({ width: 340, height: 220 });

  // Reanimated shared value (runs on UI thread)
  const radius = useSharedValue(10); // numeric shared value
  const angle = useSharedValue(0);

  // Example derived value (just show how to create one)
  // Note: useDerivedValue returns a reanimated derived value. We can pass it too.
  const half = useDerivedValue(() => size.width / 2);

  useEffect(() => {
    // grow radius from 10 -> 60, repeat back-and-forth forever
    radius.value = withRepeat(withTiming(60, { duration: 1200 }), -1, true);

    // tilt from 0 -> 30 degrees and back
    angle.value = withRepeat(withTiming(30, { duration: 1000 }), -1, true);
  }, [radius, angle]);

  const cx = size.width / 2;
  const cy = size.height / 2;

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Skia + Reanimated Playground</Text>

      <Canvas
        style={styles.canvas}
        onSize={(s) => setSize({ width: s.width, height: s.height })}
      >
        {/* Background */}
        <Rect x={0} y={0} width={size.width} height={size.height} color="#fafafa" />

        {/* LEFT: moved box */}
        <Group translateX={20} translateY={20}>
          <Rect x={0} y={0} width={120} height={80} color="#6fb98f" />
          <Rect x={10} y={30} width={80} height={14} color="#ffffff" opacity={0.6} />
        </Group>

        {/* MIDDLE: animated circle using Reanimated shared value */}
        {/* Pass the shared value directly as r and cx/cy if desired */}
        <Group translateX={cx - 70} translateY={20} scale={1.0}>
          <Oval x={10} y={80} width={120} height={40} color="#dfe7fd" />
          {/* NOTE: r, cx, cy accept Reanimated shared values directly */}
          <Circle cx={70} cy={60} r={radius} color="#7b61ff" />
        </Group>

        {/* RIGHT: rotated rounded rectangle using Reanimated angle */}
        <Group translateX={size.width - 160} translateY={20} rotate={angle} origin={{ x: 60, y: 40 }}>
          <RRect x={0} y={0} width={120} height={80} r={12} color="#ffb86b" />
          <Line p1={{ x: 12, y: 10 }} p2={{ x: 108, y: 70 }} strokeWidth={3} color="#8a4fff" />
        </Group>

        {/* center guide */}
        <Group>
          <Line p1={{ x: cx, y: 0 }} p2={{ x: cx, y: size.height }} strokeWidth={1} color="#eeeeee" />
          <Line p1={{ x: 0, y: cy }} p2={{ x: size.width, y: cy }} strokeWidth={1} color="#eeeeee" />
        </Group>
      </Canvas>

      <Text style={styles.hint}>
        Canvas: {Math.round(size.width)} × {Math.round(size.height)}
      </Text>
      <Text style={styles.hintSmall}>Uses react-native-reanimated shared values (UI thread).</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingTop: 48, alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 16, marginBottom: 12, fontWeight: "600" },
  canvas: { width: 340, height: 220, borderRadius: 8, overflow: "hidden" },
  hint: { marginTop: 12, fontSize: 12, color: "#444" },
  hintSmall: { marginTop: 4, fontSize: 11, color: "#777" },
});
