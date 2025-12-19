import { vec } from '@shopify/react-native-skia';
import { interpolate, useDerivedValue } from 'react-native-reanimated';
import { ANIMATION, AVATAR } from '../../constants/playerConstants';

const DEG_TO_RAD = Math.PI / 180;

export const useLegGeometry = ({
    x,
    y,
    bodyX,
    bodyXOffset,
    legTopY,
    scaleX,
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    sharedValues,
}) => {
    const {
        walkProgress,
        jumpProgress,
        danceProgress,
    } = sharedValues;

    // ═══════════════════════════════════════════════════════════
    // LEG ANGLES
    // ═══════════════════════════════════════════════════════════
    const leftLegAngle = useDerivedValue(() => {
        if (jumpProgress.value > 0) {
            return jumpProgress.value * ANIMATION.jumping.legTuck;
        }
        if (isDancing) {
            return interpolate(danceProgress.value, [0, 0.5, 1],
                [-ANIMATION.dancing.legBend, ANIMATION.dancing.legBend, -ANIMATION.dancing.legBend]);
        }
        const legSwing = isRunning ? ANIMATION.running.legSwing : ANIMATION.walking.legSwing;
        return interpolate(walkProgress.value, [0, 0.5, 1], [-legSwing, 0, legSwing]);
    });

    const rightLegAngle = useDerivedValue(() => {
        if (jumpProgress.value > 0) {
            return -jumpProgress.value * ANIMATION.jumping.legTuck;
        }
        return -leftLegAngle.value;
    });

    // ═══════════════════════════════════════════════════════════
    // LEG X POSITIONS (now derived from shared value)
    // ═══════════════════════════════════════════════════════════
    const leftLegX = useDerivedValue(() => x.value - AVATAR.leg.spacing);
    const rightLegX = useDerivedValue(() => x.value + AVATAR.leg.spacing);

    // ═══════════════════════════════════════════════════════════
    // FOOT Y
    // ═══════════════════════════════════════════════════════════
    const footY = useDerivedValue(() => y.value);

    // ═══════════════════════════════════════════════════════════
    // LEG POINTS
    // ═══════════════════════════════════════════════════════════
    const legSpacingScaled = useDerivedValue(() => AVATAR.leg.spacing * scaleX.value);

    const leftLegStartX = useDerivedValue(() => bodyX.value - legSpacingScaled.value + bodyXOffset.value);
    const leftLegStart = useDerivedValue(() => vec(leftLegStartX.value, legTopY.value));

    const leftLegEnd = useDerivedValue(() => {
        const angleRad = leftLegAngle.value * DEG_TO_RAD;
        const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;

        if (jumpProgress.value > 0) {
            const legEndX = leftLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
            const legEndY = legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
            return vec(legEndX, legEndY);
        }
        return vec(
            leftLegX.value + Math.sin(angleRad) * AVATAR.leg.height,
            footY.value - Math.abs(Math.sin(angleRad)) * footLift
        );
    });

    const leftFootX = useDerivedValue(() => {
        const angleRad = leftLegAngle.value * DEG_TO_RAD;
        if (jumpProgress.value > 0) {
            return leftLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
        }
        return leftLegX.value + Math.sin(angleRad) * AVATAR.leg.height;
    });

    const leftFootY = useDerivedValue(() => {
        const angleRad = leftLegAngle.value * DEG_TO_RAD;
        const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;
        if (jumpProgress.value > 0) {
            return legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
        }
        return footY.value - Math.abs(Math.sin(angleRad)) * footLift;
    });

    const rightLegStartX = useDerivedValue(() => bodyX.value + legSpacingScaled.value + bodyXOffset.value);
    const rightLegStart = useDerivedValue(() => vec(rightLegStartX.value, legTopY.value));

    const rightLegEnd = useDerivedValue(() => {
        const angleRad = rightLegAngle.value * DEG_TO_RAD;
        const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;

        if (jumpProgress.value > 0) {
            const legEndX = rightLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
            const legEndY = legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
            return vec(legEndX, legEndY);
        }
        return vec(
            rightLegX.value + Math.sin(angleRad) * AVATAR.leg.height,
            footY.value - Math.abs(Math.sin(angleRad)) * footLift
        );
    });

    const rightFootX = useDerivedValue(() => {
        const angleRad = rightLegAngle.value * DEG_TO_RAD;
        if (jumpProgress.value > 0) {
            return rightLegStartX.value + Math.sin(angleRad) * AVATAR.leg.height;
        }
        return rightLegX.value + Math.sin(angleRad) * AVATAR.leg.height;
    });

    const rightFootY = useDerivedValue(() => {
        const angleRad = rightLegAngle.value * DEG_TO_RAD;
        const footLift = isRunning ? ANIMATION.running.footLift : ANIMATION.walking.footLift;
        if (jumpProgress.value > 0) {
            return legTopY.value + Math.cos(angleRad) * AVATAR.leg.height;
        }
        return footY.value - Math.abs(Math.sin(angleRad)) * footLift;
    });

    return {
        leftLegStart,
        leftLegEnd,
        leftFootX,
        leftFootY,
        rightLegStart,
        rightLegEnd,
        rightFootX,
        rightFootY,
    };
};
