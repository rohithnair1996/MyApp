import React from "react";
import { 
  Canvas,
  RoundedRect,
  Line,
  ClipRRect,
  Image,
  useImage
} from "@shopify/react-native-skia";

export default function SimpleHumanWithImage() {
  const img = useImage(require("../assets/user.png")); // <- your image

  // Body configuration
  const x = 70;
  const y = 60;
  const bodyWidth = 60;
  const bodyHeight = 120;
  const radius = 20;
  const padding = 8;

  return (
    <Canvas style={{ width: 200, height: 300 }}>

      {/* Body (Rounded Rectangle) */}
      <RoundedRect
        x={x}
        y={y}
        width={bodyWidth}
        height={bodyHeight}
        r={radius}
        color="#000"
      />

      {/* Image clipped inside the rounded rectangle (with padding) */}
      {img && (
        <ClipRRect
          x={x + padding}
          y={y + padding}
          width={bodyWidth - padding * 2}
          height={bodyHeight - padding * 2}
          r={radius - padding}
        >
          <Image
            image={img}
            x={x + padding}
            y={y + padding}
            width={bodyWidth - padding * 2}
            height={bodyHeight - padding * 2}
          />
        </ClipRRect>
      )}

      {/* Left Hand */}
      <Line
        p1={{ x: x, y: y + 30 }}
        p2={{ x: x - 30, y: y + 80 }}
        color="#000"
        strokeWidth={6}
      />

      {/* Right Hand */}
      <Line
        p1={{ x: x + bodyWidth, y: y + 30 }}
        p2={{ x: x + bodyWidth + 30, y: y + 80 }}
        color="#000"
        strokeWidth={6}
      />

      {/* Left Leg (L-shape) */}
      <Line
        p1={{ x: x + 15, y: y + bodyHeight }}
        p2={{ x: x + 15, y: y + bodyHeight + 50 }}
        color="#000"
        strokeWidth={6}
      />
      <Line
        p1={{ x: x + 15, y: y + bodyHeight + 50 }}
        p2={{ x: x - 5, y: y + bodyHeight + 50 }}
        color="#000"
        strokeWidth={6}
      />

      {/* Right Leg (L-shape) */}
      <Line
        p1={{ x: x + bodyWidth - 15, y: y + bodyHeight }}
        p2={{ x: x + bodyWidth - 15, y: y + bodyHeight + 50 }}
        color="#000"
        strokeWidth={6}
      />
      <Line
        p1={{ x: x + bodyWidth - 15, y: y + bodyHeight + 50 }}
        p2={{ x: x + bodyWidth + 5, y: y + bodyHeight + 50 }}
        color="#000"
        strokeWidth={6}
      />

    </Canvas>
  );
}
