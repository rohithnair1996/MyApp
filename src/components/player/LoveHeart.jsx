import { Path } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';
import { ANIMATION } from '../../constants/playerConstants';

const LoveHeart = ({ baseX, baseY, progress, color, seed }) => {
    const { minSize, maxSize, horizontalDrift, riseHeight } = ANIMATION.romance;

    // Horizontal drift using sine wave
    const heartX = useDerivedValue(() => {
        const drift = Math.sin(progress.value * Math.PI * 3 + seed * Math.PI * 2) * horizontalDrift;
        const offsetX = (seed - 0.5) * 40; // Random starting offset
        return baseX + drift + offsetX;
    });

    // Rise up from name plate
    const heartY = useDerivedValue(() => {
        return baseY - progress.value * riseHeight;
    });

    // Size grows as it rises, then shrinks at burst
    const heartSize = useDerivedValue(() => {
        if (progress.value < 0.7) {
            // Grow from minSize to maxSize
            return minSize + (maxSize - minSize) * (progress.value / 0.7);
        } else {
            // Burst effect - quick grow then shrink
            const burstProgress = (progress.value - 0.7) / 0.3;
            const burstSize = maxSize * (1 + burstProgress * 0.3);
            return burstSize * (1 - burstProgress * 0.5);
        }
    });

    // Opacity - fade in, stay, then fade out
    const heartOpacity = useDerivedValue(() => {
        if (progress.value < 0.1) {
            return progress.value * 10; // Fade in
        } else if (progress.value > 0.75) {
            return (1 - progress.value) * 4; // Fade out
        }
        return 0.9;
    });

    // Create heart path
    const heartPath = useDerivedValue(() => {
        const size = heartSize.value;
        const cx = heartX.value;
        const cy = heartY.value;

        // Heart shape path
        const s = size * 0.5;
        return `M ${cx} ${cy + s * 0.3}
            C ${cx} ${cy - s * 0.5}, ${cx - s} ${cy - s * 0.5}, ${cx - s} ${cy + s * 0.2}
            C ${cx - s} ${cy + s * 0.8}, ${cx} ${cy + s * 1.2}, ${cx} ${cy + s * 1.2}
            C ${cx} ${cy + s * 1.2}, ${cx + s} ${cy + s * 0.8}, ${cx + s} ${cy + s * 0.2}
            C ${cx + s} ${cy - s * 0.5}, ${cx} ${cy - s * 0.5}, ${cx} ${cy + s * 0.3}
            Z`;
    });

    return (
        <Path
            path={heartPath}
            color={color}
            opacity={heartOpacity}
        />
    );
};

export default LoveHeart;
