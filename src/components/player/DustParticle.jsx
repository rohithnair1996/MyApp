import { Circle } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { ANIMATION, AVATAR } from '../../constants/playerConstants';

const DustParticle = ({ baseX, baseY, index, progress, visible }) => {
    const { particleCount, minSize, maxSize, spreadX, riseY } = ANIMATION.dust;

    const side = index % 2 === 0 ? -1 : 1;
    const spreadFactor = (Math.floor(index / 2) + 1) / (particleCount / 2);
    const seed = ((index + 1) * 0.37) % 1;

    const particleX = useDerivedValue(() => {
        const baseSpreadX = side * spreadX * spreadFactor * (0.5 + seed * 0.5);
        return baseX.value + baseSpreadX * progress.value;
    });

    const particleY = useDerivedValue(() => {
        const riseAmount = riseY * Math.sin(progress.value * Math.PI);
        return baseY.value - riseAmount;
    });

    const particleSize = useDerivedValue(() => {
        return maxSize - (maxSize - minSize) * progress.value;
    });

    const particleOpacity = useDerivedValue(() => {
        if (visible.value === 0) return 0;
        return (1 - progress.value) * 0.7;
    });

    return (
        <Circle
            cx={particleX}
            cy={particleY}
            r={particleSize}
            color={AVATAR.colors.dust}
            opacity={particleOpacity}
        />
    );
};

export default DustParticle;
