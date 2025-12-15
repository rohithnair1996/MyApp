import { vec } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';
import { ANIMATION, AVATAR } from '../../constants/playerConstants';

const DEG_TO_RAD = Math.PI / 180;

export const useArmGeometry = ({
    bodyLeftX,
    bodyRightX,
    armY,
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isWaving,
    isClapping,
    isSad,
    isAngry,
    sharedValues,
}) => {
    const {
        walkProgress,
        jumpProgress,
        danceProgress,
        waveProgress,
        waveArmRaise,
        clapProgress,
        clapArmRaise,
        sadProgress,
        angryProgress,
    } = sharedValues;

    // ═══════════════════════════════════════════════════════════
    // WAVE ANGLE
    // ═══════════════════════════════════════════════════════════
    const waveAngle = useDerivedValue(() => {
        const { armRaise, waveSwing } = ANIMATION.waving;
        const raise = waveArmRaise.value * armRaise;
        const swing = interpolate(waveProgress.value, [0, 0.5, 1], [-waveSwing, 0, waveSwing]);
        return raise + (waveArmRaise.value * swing);
    });

    // ═══════════════════════════════════════════════════════════
    // CLAP ANGLES
    // ═══════════════════════════════════════════════════════════
    const clapAngle = useDerivedValue(() => {
        const { armRaise } = ANIMATION.clapping;
        return clapArmRaise.value * armRaise;
    });

    const clapTogether = useDerivedValue(() => {
        return clapProgress.value;
    });

    // ═══════════════════════════════════════════════════════════
    // DANCE ARM ANGLES
    // ═══════════════════════════════════════════════════════════
    const danceLeftArmAngle = useDerivedValue(() => {
        return interpolate(danceProgress.value, [0, 0.5, 1], [ANIMATION.dancing.armWave, 20, ANIMATION.dancing.armWave]);
    });

    const danceRightArmAngle = useDerivedValue(() => {
        return interpolate(danceProgress.value, [0, 0.5, 1], [20, ANIMATION.dancing.armWave, 20]);
    });

    // ═══════════════════════════════════════════════════════════
    // ARM ANGLES
    // ═══════════════════════════════════════════════════════════
    const jumpArmRaise = useDerivedValue(() => {
        if (jumpProgress.value > 0) return jumpProgress.value * ANIMATION.jumping.armRaise;
        return 0;
    });

    const leftArmAngle = useDerivedValue(() => {
        if (isClapping) return clapAngle.value;
        if (isDancing) return danceLeftArmAngle.value;

        const armSwing = isRunning ? ANIMATION.running.armSwing : ANIMATION.walking.armSwing;
        let walkSwing = interpolate(walkProgress.value, [0, 0.5, 1], [armSwing, 0, -armSwing]);
        const sadDroop = sadProgress.value * ANIMATION.sad.armDroop;
        return walkSwing + jumpArmRaise.value - sadDroop;
    });

    const rightArmAngle = useDerivedValue(() => {
        if (isClapping) return clapAngle.value;
        if (isWaving) return waveAngle.value;
        if (isDancing) return danceRightArmAngle.value;

        const armSwing = isRunning ? ANIMATION.running.armSwing : ANIMATION.walking.armSwing;
        let walkSwing = interpolate(walkProgress.value, [0, 0.5, 1], [-armSwing, 0, armSwing]);
        const sadDroop = sadProgress.value * ANIMATION.sad.armDroop;
        return walkSwing + jumpArmRaise.value - sadDroop;
    });

    // ═══════════════════════════════════════════════════════════
    // ARM POINTS
    // ═══════════════════════════════════════════════════════════
    const leftArmStart = useDerivedValue(() => vec(bodyLeftX.value, armY.value));

    const leftArmEnd = useDerivedValue(() => {
        const angleRad = leftArmAngle.value * DEG_TO_RAD;
        let endX = bodyLeftX.value - Math.cos(angleRad) * AVATAR.arm.length;
        let endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;

        if (isClapping && clapArmRaise.value > 0) {
            const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
            endX = endX + clapOffset;
            endY = armY.value - AVATAR.arm.length * 0.7;
        }
        return vec(endX, endY);
    });

    const leftHandX = useDerivedValue(() => {
        const angleRad = leftArmAngle.value * DEG_TO_RAD;
        let handX = bodyLeftX.value - Math.cos(angleRad) * AVATAR.arm.length;
        if (isClapping && clapArmRaise.value > 0) {
            const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
            handX = handX + clapOffset;
        }
        return handX;
    });

    const leftHandY = useDerivedValue(() => {
        const angleRad = leftArmAngle.value * DEG_TO_RAD;
        if (isClapping && clapArmRaise.value > 0) {
            return armY.value - AVATAR.arm.length * 0.7;
        }
        return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
    });

    const rightArmStart = useDerivedValue(() => vec(bodyRightX.value, armY.value));

    const rightArmEnd = useDerivedValue(() => {
        const angleRad = rightArmAngle.value * DEG_TO_RAD;
        let endX = bodyRightX.value + Math.cos(angleRad) * AVATAR.arm.length;
        let endY = armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;

        if (isClapping && clapArmRaise.value > 0) {
            const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
            endX = endX - clapOffset;
            endY = armY.value - AVATAR.arm.length * 0.7;
        }
        return vec(endX, endY);
    });

    const rightHandX = useDerivedValue(() => {
        const angleRad = rightArmAngle.value * DEG_TO_RAD;
        let handX = bodyRightX.value + Math.cos(angleRad) * AVATAR.arm.length;
        if (isClapping && clapArmRaise.value > 0) {
            const clapOffset = clapTogether.value * (AVATAR.body.width / 2 - ANIMATION.clapping.clapDistance);
            handX = handX - clapOffset;
        }
        return handX;
    });

    const rightHandY = useDerivedValue(() => {
        const angleRad = rightArmAngle.value * DEG_TO_RAD;
        if (isClapping && clapArmRaise.value > 0) {
            return armY.value - AVATAR.arm.length * 0.7;
        }
        return armY.value - Math.sin(angleRad) * AVATAR.arm.length + AVATAR.arm.dropY;
    });

    const handRadius = useDerivedValue(() => {
        if (isAngry) return AVATAR.arm.handRadius * (1 - angryProgress.value * 0.3);
        return AVATAR.arm.handRadius;
    });

    return {
        leftArmStart,
        leftArmEnd,
        leftHandX,
        leftHandY,
        rightArmStart,
        rightArmEnd,
        rightHandX,
        rightHandY,
        handRadius,
    };
};
