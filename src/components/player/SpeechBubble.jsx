import {
  Group,
  Path,
  Rect,
  RoundedRect,
  Skia,
  Text,
} from '@shopify/react-native-skia';
import React, { memo, useMemo } from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { ANIMATION } from '../../constants/playerConstants';

// Separate component for each speech line to properly use hooks
const SpeechLine = memo(({ x, bubbleY, line, index, font, paddingY, lineHeight, textColor }) => {
  const lineWidth = useMemo(() => font.getTextWidth(line), [font, line]);

  const lineX = useDerivedValue(() => x.value - lineWidth / 2);
  const lineY = useDerivedValue(() => bubbleY.value + paddingY + (index + 1) * lineHeight - 3);

  return (
    <Text
      x={lineX}
      y={lineY}
      text={line}
      font={font}
      color={textColor}
    />
  );
});

const SpeechBubble = ({ x, y, text, font }) => {
  const {
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    textColor,
    fontSize,
    lineHeight,
    paddingX,
    paddingY,
    pointerWidth,
    pointerHeight,
    offsetY,
    maxWidth,
    minWidth,
  } = ANIMATION.speechBubble;

  // Calculate text lines and bubble dimensions
  const { lines, bubbleWidth, bubbleHeight } = useMemo(() => {
    if (!font || !text) {
      return { lines: [], bubbleWidth: minWidth, bubbleHeight: paddingY * 2 };
    }

    const maxTextWidth = maxWidth - paddingX * 2;
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    // Word wrap algorithm
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.getTextWidth(testLine);

      if (testWidth > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Calculate bubble dimensions
    let maxLineWidth = 0;
    for (const line of lines) {
      const lineWidth = font.getTextWidth(line);
      if (lineWidth > maxLineWidth) {
        maxLineWidth = lineWidth;
      }
    }

    const bubbleWidth = Math.max(minWidth, Math.min(maxWidth, maxLineWidth + paddingX * 2));
    const bubbleHeight = paddingY * 2 + lines.length * lineHeight;

    return { lines, bubbleWidth, bubbleHeight };
  }, [font, text, maxWidth, minWidth, paddingX, paddingY, lineHeight]);

  // Bubble position (centered above player)
  const bubbleX = useDerivedValue(() => x.value - bubbleWidth / 2);
  const bubbleY = useDerivedValue(() => y.value - offsetY - bubbleHeight - pointerHeight);

  // Pointer triangle path - starts well inside the bubble to ensure seamless connection
  const pointerPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const pointerX = x.value;
    const overlapAmount = 4; // How far into the bubble the triangle extends
    const pointerTopY = bubbleY.value + bubbleHeight - overlapAmount;
    const pointerBottomY = bubbleY.value + bubbleHeight + pointerHeight;

    path.moveTo(pointerX - pointerWidth / 2 - 2, pointerTopY);
    path.lineTo(pointerX, pointerBottomY);
    path.lineTo(pointerX + pointerWidth / 2 + 2, pointerTopY);
    path.close();

    return path;
  });

  // Pointer border path (only the two angled edges going to the tip)
  const pointerBorderPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const pointerX = x.value;
    const pointerStartY = bubbleY.value + bubbleHeight - borderWidth / 2;
    const pointerBottomY = bubbleY.value + bubbleHeight + pointerHeight;

    path.moveTo(pointerX - pointerWidth / 2, pointerStartY);
    path.lineTo(pointerX, pointerBottomY);
    path.lineTo(pointerX + pointerWidth / 2, pointerStartY);

    return path;
  });

  // Cover rect position (moved out of JSX)
  const coverRectX = useDerivedValue(() => x.value - pointerWidth / 2 - 1);
  const coverRectY = useDerivedValue(() => bubbleY.value + bubbleHeight - borderWidth - 1);

  // Don't render if no text
  if (!text || text.trim() === '' || !font || lines.length === 0) {
    return null;
  }

  return (
    <Group>
      {/* Bubble background */}
      <RoundedRect
        x={bubbleX}
        y={bubbleY}
        width={bubbleWidth}
        height={bubbleHeight}
        r={borderRadius}
        color={backgroundColor}
      />
      {/* Bubble border */}
      <RoundedRect
        x={bubbleX}
        y={bubbleY}
        width={bubbleWidth}
        height={bubbleHeight}
        r={borderRadius}
        color={borderColor}
        style="stroke"
        strokeWidth={borderWidth}
      />
      {/* Pointer triangle fill - drawn first to sit behind */}
      <Path path={pointerPath} color={backgroundColor} />
      {/* Cover the bubble border where pointer connects */}
      <Rect
        x={coverRectX}
        y={coverRectY}
        width={pointerWidth + 2}
        height={borderWidth + 3}
        color={backgroundColor}
      />
      {/* Pointer triangle border (only the two angled edges) */}
      <Path
        path={pointerBorderPath}
        color={borderColor}
        style="stroke"
        strokeWidth={borderWidth}
        strokeJoin="round"
      />
      {/* Speech text lines */}
      {lines.map((line, index) => (
        <SpeechLine
          key={index}
          x={x}
          bubbleY={bubbleY}
          line={line}
          index={index}
          font={font}
          paddingY={paddingY}
          lineHeight={lineHeight}
          textColor={textColor}
        />
      ))}
    </Group>
  );
};

export default SpeechBubble;
