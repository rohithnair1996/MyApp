import { Circle } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { AVATAR } from '../../constants/playerConstants';

const TearDrop = ({ startX, startY, progress, visible }) => {
    const tearY = useDerivedValue(() => {
        return startY + progress.value * 25;
    });

    const tearOpacity = useDerivedValue(() => {
        if (visible.value === 0) return 0;
        if (progress.value < 0.2) return progress.value * 5;
        if (progress.value > 0.8) return (1 - progress.value) * 5;
        return 1;
    });

    const tearSize = useDerivedValue(() => {
        return 2 + Math.sin(progress.value * Math.PI) * 1;
    });

    return (
        <Circle
            cx={startX}
            cy={tearY}
            r={tearSize}
            color={AVATAR.colors.tear}
            opacity={tearOpacity}
        />
    );
};

export default TearDrop;
