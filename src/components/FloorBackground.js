import React from 'react';
import { Image, useImage } from '@shopify/react-native-skia';

const FloorBackground = ({ width, height, imagePath }) => {
  const image = useImage(imagePath);

  if (!image) {
    return null;
  }

  return (
    <Image
      x={0}
      y={0}
      width={width}
      height={height}
      image={image}
      fit="cover"
    />
  );
};

export default FloorBackground;
