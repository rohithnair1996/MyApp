import React from 'react';
import { Image, useImage } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { CHARACTER_DIMENSIONS } from '../../constants/character';

const {
  BODY_WIDTH,
  BODY_HEIGHT,
} = CHARACTER_DIMENSIONS;

const AnimatedCharacter = ({ x, y, image }) => {
  const avatarImage = useImage(image);

  // Create derived values that react to SharedValue changes
  const bodyX = useDerivedValue(() => {
    'worklet';
    const xVal = typeof x?.value === 'number' ? x.value : x;
    return xVal - BODY_WIDTH / 2;
  }, [x]);

  const bodyY = useDerivedValue(() => {
    'worklet';
    const yVal = typeof y?.value === 'number' ? y.value : y;
    return yVal - BODY_HEIGHT / 2;
  }, [y]);

  const imageWidth = BODY_WIDTH;
  const imageHeight = BODY_HEIGHT;

  return (
    <>
      {avatarImage && (
        <Image
          image={avatarImage}
          x={bodyX}
          y={bodyY}
          width={imageWidth}
          height={imageHeight}
          fit="cover"
        />
      )}
    </>
  );
};

export default React.memo(AnimatedCharacter);
