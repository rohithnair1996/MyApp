// src/components/UserSimple.jsx
import React from "react";
import {
  Group,
  RoundedRect,
  ClipRRect,
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";

/*
  Simple visual for a user:
  - draws a RoundedRect at local origin (0,0)
  - optionally clips an image inside the rounded rect
  Props:
    width, height: size of body
    color: fill color
    padding: inner padding for the image
    imageSource: require(...) or {uri: "..."} or undefined
*/
export default function UserSimple({
  width = 80,
  height = 120,
  color = "dodgerblue",
  radius = 18,
  padding = 6,
  imageSource,
}) {
  // load image into Skia (returns null until loaded)
  const img = useImage(imageSource);

  // body drawn at (0,0) so parent can position via Group transforms
  const bodyX = 0;
  const bodyY = 0;
  const bodyW = width;
  const bodyH = height;

  return (
    <Group>
      {/* body */}
      <RoundedRect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        r={radius}
        color={color}
      />

      {/* if image loaded, draw it clipped inside the rounded rect with padding */}
      {img && (
        <ClipRRect
          x={bodyX + padding}
          y={bodyY + padding}
          width={bodyW - padding * 2}
          height={bodyH - padding * 2}
          r={Math.max(0, radius - padding)}
        >
          <SkiaImage
            image={img}
            x={bodyX + padding}
            y={bodyY + padding}
            width={bodyW - padding * 2}
            height={bodyH - padding * 2}
          />
        </ClipRRect>
      )}
    </Group>
  );
}
