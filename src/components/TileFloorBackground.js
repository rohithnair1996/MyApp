// src/components/TileFloorBackground.js
import React, { useMemo } from "react";
import { Path, Skia, Line } from "@shopify/react-native-skia";

const lerp = (a, b, t) => a + (b - a) * t; // helper

const TileFloorBackground = ({ width, height }) => {
  // --- 1. Define floor shape (trapezoid) ---
  const floorPath = useMemo(() => {
    const p = Skia.Path.Make();

    // tune these numbers if you want
    const topY = height * 0.5;    // where floor starts (horizon)
    const bottomY = height;       // bottom of screen

    const topLeftX = width * 0.15;
    const topRightX = width * 0.85;

    const bottomLeftX = 0;
    const bottomRightX = width;

    // Trapezoid: bottom-left → bottom-right → top-right → top-left
    p.moveTo(bottomLeftX, bottomY);
    p.lineTo(bottomRightX, bottomY);
    p.lineTo(topRightX, topY);
    p.lineTo(topLeftX, topY);
    p.close();

    return { p, topY, bottomY, topLeftX, topRightX, bottomLeftX, bottomRightX };
  }, [width, height]);

  const {
    p,
    topY,
    bottomY,
    topLeftX,
    topRightX,
    bottomLeftX,
    bottomRightX,
  } = floorPath;

  // --- 2. Generate vertical lines (towards horizon) ---
  const verticalLines = useMemo(() => {
    const lines = [];
    const columns = 8; // how many "columns" of tiles

    for (let i = 1; i < columns; i++) {
      const t = i / columns; // between 0 and 1

      // bottom x between bottomLeftX and bottomRightX
      const bx = lerp(bottomLeftX, bottomRightX, t);
      // top x between topLeftX and topRightX
      const tx = lerp(topLeftX, topRightX, t);

      lines.push({
        x1: bx,
        y1: bottomY,
        x2: tx,
        y2: topY,
      });
    }

    return lines;
  }, [topY, bottomY, topLeftX, topRightX, bottomLeftX, bottomRightX]);

  // --- 3. Generate horizontal lines (rows) ---
  const horizontalLines = useMemo(() => {
    const lines = [];
    const rows = 7;

    for (let i = 1; i < rows; i++) {
      // use t² so lines get closer near top (perspective effect)
      const t = i / rows;
      const tt = t * t;

      const y = lerp(bottomY, topY, tt);

      // for this y, left and right x shrink linearly from bottom → top
      const lx = lerp(bottomLeftX, topLeftX, tt);
      const rx = lerp(bottomRightX, topRightX, tt);

      lines.push({
        x1: lx,
        y1: y,
        x2: rx,
        y2: y,
      });
    }

    return lines;
  }, [topY, bottomY, topLeftX, topRightX, bottomLeftX, bottomRightX]);

  return (
    <>
      {/* Floor shape */}
      <Path path={p} color="#262626" />

      {/* Vertical grid lines */}
      {verticalLines.map((l, index) => (
        <Line
          key={`v-${index}`}
          p1={{ x: l.x1, y: l.y1 }}
          p2={{ x: l.x2, y: l.y2 }}
          strokeWidth={1}
          color="#3b3b3b"
        />
      ))}

      {/* Horizontal grid lines */}
      {horizontalLines.map((l, index) => (
        <Line
          key={`h-${index}`}
          p1={{ x: l.x1, y: l.y1 }}
          p2={{ x: l.x2, y: l.y2 }}
          strokeWidth={1}
          color="#333333"
        />
      ))}
    </>
  );
};

export default TileFloorBackground;
