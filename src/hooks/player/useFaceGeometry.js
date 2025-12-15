import { vec } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { AVATAR } from '../../constants/playerConstants';

export const useFaceGeometry = ({
    bodyX,
    bodyTopY,
    scaleX,
    scaleY,
    isSad,
    isAngry,
    sharedValues,
}) => {
    const {
        blinkProgress,
        sadProgress,
        angryProgress,
    } = sharedValues;

    // ═══════════════════════════════════════════════════════════
    // FACE DIMENSIONS
    // ═══════════════════════════════════════════════════════════
    const scaledFaceWidth = useDerivedValue(() => {
        return (AVATAR.body.width - AVATAR.face.paddingX * 2) * scaleX.value;
    });

    const scaledFaceHeight = useDerivedValue(() => {
        return AVATAR.face.height * scaleY.value;
    });

    const faceX = useDerivedValue(() => {
        return bodyX.value - scaledFaceWidth.value / 2;
    });

    const faceY = useDerivedValue(() => {
        return bodyTopY.value + AVATAR.face.paddingY * scaleY.value;
    });

    // ═══════════════════════════════════════════════════════════
    // EYE POSITIONS
    // ═══════════════════════════════════════════════════════════
    const eyeScaleY = useDerivedValue(() => 1 - blinkProgress.value);
    const eyeSpacingScaled = useDerivedValue(() => AVATAR.face.eyeSpacing * scaleX.value);

    const eyeY = useDerivedValue(() => {
        return bodyTopY.value + (AVATAR.face.paddingY + AVATAR.face.eyeOffsetY) * scaleY.value;
    });

    const eyeHeight = useDerivedValue(() => {
        let height = AVATAR.face.eyeRadius * 2 * eyeScaleY.value * scaleY.value;
        if (isSad) height *= (1 - sadProgress.value * 0.3);
        return height;
    });

    const eyeWidth = useDerivedValue(() => AVATAR.face.eyeRadius * 2 * scaleX.value);

    const leftEyeX = useDerivedValue(() => bodyX.value - eyeSpacingScaled.value - eyeWidth.value / 2);
    const rightEyeX = useDerivedValue(() => bodyX.value + eyeSpacingScaled.value - eyeWidth.value / 2);
    const eyeRectY = useDerivedValue(() => eyeY.value - eyeHeight.value / 2);
    const eyeCornerRadius = useDerivedValue(() => Math.min(AVATAR.face.eyeRadius, eyeHeight.value / 2));

    // ═══════════════════════════════════════════════════════════
    // EYEBROW POSITIONS
    // ═══════════════════════════════════════════════════════════
    const leftEyebrowStart = useDerivedValue(() => {
        const baseX = bodyX.value - eyeSpacingScaled.value - 6;
        const baseY = eyeY.value - 8;
        return vec(baseX, baseY);
    });

    const leftEyebrowEnd = useDerivedValue(() => {
        const baseX = bodyX.value - eyeSpacingScaled.value + 6;
        let baseY = eyeY.value - 8;
        if (isSad) baseY += sadProgress.value * 4;
        if (isAngry) baseY -= angryProgress.value * 4;
        return vec(baseX, baseY);
    });

    const rightEyebrowStart = useDerivedValue(() => {
        const baseX = bodyX.value + eyeSpacingScaled.value - 6;
        let baseY = eyeY.value - 8;
        if (isSad) baseY += sadProgress.value * 4;
        if (isAngry) baseY -= angryProgress.value * 4;
        return vec(baseX, baseY);
    });

    const rightEyebrowEnd = useDerivedValue(() => {
        const baseX = bodyX.value + eyeSpacingScaled.value + 6;
        const baseY = eyeY.value - 8;
        return vec(baseX, baseY);
    });

    // ═══════════════════════════════════════════════════════════
    // TEAR POSITION
    // ═══════════════════════════════════════════════════════════
    const tearStartX = useDerivedValue(() => bodyX.value - eyeSpacingScaled.value);
    const tearStartY = useDerivedValue(() => eyeY.value + 5);

    const eyebrowOpacity = useDerivedValue(() => {
        return Math.max(sadProgress.value, angryProgress.value);
    });

    return {
        faceX,
        faceY,
        scaledFaceWidth,
        scaledFaceHeight,
        leftEyeX,
        rightEyeX,
        eyeRectY,
        eyeWidth,
        eyeHeight,
        eyeCornerRadius,
        leftEyebrowStart,
        leftEyebrowEnd,
        rightEyebrowStart,
        rightEyebrowEnd,
        tearStartX,
        tearStartY,
        eyebrowOpacity,
    };
};
