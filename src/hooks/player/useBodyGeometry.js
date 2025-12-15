import { interpolate, useDerivedValue } from 'react-native-reanimated';
import { ANIMATION, AVATAR } from '../../constants/playerConstants';

export const useBodyGeometry = ({
    x,
    y,
    scaleX,
    scaleY,
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isSad,
    isAngry,
    sharedValues,
}) => {
    const {
        breathProgress,
        walkProgress,
        jumpProgress,
        danceProgress,
        sadProgress,
        sadSway,
        angryProgress,
        angryShake,
    } = sharedValues;

    // ═══════════════════════════════════════════════════════════
    // DANCE DERIVED VALUES
    // ═══════════════════════════════════════════════════════════
    const danceBounce = useDerivedValue(() => {
        return Math.abs(Math.sin(danceProgress.value * Math.PI * 2)) * ANIMATION.dancing.bounce;
    });

    const danceWiggle = useDerivedValue(() => {
        return Math.sin(danceProgress.value * Math.PI * 2) * ANIMATION.dancing.wiggle;
    });

    // ═══════════════════════════════════════════════════════════
    // EMOTION DERIVED VALUES
    // ═══════════════════════════════════════════════════════════
    const emotionSlouch = useDerivedValue(() => {
        return sadProgress.value * ANIMATION.sad.slouch;
    });

    const emotionSway = useDerivedValue(() => {
        return interpolate(sadSway.value, [0, 1], [-ANIMATION.sad.swayAmount, ANIMATION.sad.swayAmount]);
    });

    const emotionShake = useDerivedValue(() => {
        return angryShake.value * ANIMATION.angry.shake * angryProgress.value;
    });

    // ═══════════════════════════════════════════════════════════
    // JUMP OFFSET
    // ═══════════════════════════════════════════════════════════
    const jumpOffset = useDerivedValue(() => {
        const { crouchAmount, jumpHeight } = ANIMATION.jumping;
        if (jumpProgress.value < 0) {
            return jumpProgress.value * crouchAmount * 5;
        }
        return jumpProgress.value * jumpHeight;
    });

    // ═══════════════════════════════════════════════════════════
    // WALK / RUN BOB
    // ═══════════════════════════════════════════════════════════
    const walkBob = useDerivedValue(() => {
        const bobAmount = isRunning
            ? ANIMATION.running.bodyBob
            : ANIMATION.walking.bodyBob;
        return Math.abs(Math.sin(walkProgress.value * Math.PI * 2)) * bobAmount;
    });

    // ═══════════════════════════════════════════════════════════
    // COMBINED BODY OFFSET
    // ═══════════════════════════════════════════════════════════
    const bodyOffset = useDerivedValue(() => {
        let offset = 0;

        if (jumpProgress.value !== 0) {
            offset = jumpOffset.value;
        } else if (isDancing) {
            offset = danceBounce.value;
        } else if (isWalking || isRunning) {
            offset = walkBob.value;
        } else {
            offset = breathProgress.value * ANIMATION.breathing.amount;
        }

        offset -= emotionSlouch.value;
        offset += angryProgress.value * ANIMATION.angry.tense;

        return offset;
    });

    // ═══════════════════════════════════════════════════════════
    // BODY X OFFSET
    // ═══════════════════════════════════════════════════════════
    const bodyXOffset = useDerivedValue(() => {
        let offset = 0;
        if (isDancing) offset = danceWiggle.value;
        offset += emotionSway.value;
        offset += emotionShake.value;
        return offset;
    });

    // ═══════════════════════════════════════════════════════════
    // SCALED BODY DIMENSIONS
    // ═══════════════════════════════════════════════════════════
    const scaledBodyWidth = useDerivedValue(() => AVATAR.body.width * scaleX.value);
    const scaledBodyHeight = useDerivedValue(() => AVATAR.body.height * scaleY.value);

    // ═══════════════════════════════════════════════════════════
    // BODY POSITIONS
    // ═══════════════════════════════════════════════════════════
    const bodyX = useDerivedValue(() => x + bodyXOffset.value);
    const bodyLeftX = useDerivedValue(() => bodyX.value - scaledBodyWidth.value / 2);
    const bodyRightX = useDerivedValue(() => bodyX.value + scaledBodyWidth.value / 2);

    const bodyTopY = useDerivedValue(() => {
        const normalY = y - AVATAR.body.height - AVATAR.leg.height;
        const scaleOffset = (AVATAR.body.height - scaledBodyHeight.value);
        return normalY - bodyOffset.value + scaleOffset;
    });

    const armY = useDerivedValue(() => {
        return bodyTopY.value + (scaledBodyHeight.value / 2);
    });

    const legTopY = useDerivedValue(() => {
        return bodyTopY.value + scaledBodyHeight.value;
    });

    return {
        bodyX,
        bodyTopY,
        bodyLeftX,
        bodyRightX,
        scaledBodyWidth,
        scaledBodyHeight,
        bodyOffset,
        bodyXOffset,
        armY,
        legTopY,
        danceBounce,
        danceWiggle,
        emotionSlouch,
        emotionSway,
        emotionShake,
        jumpOffset,
        walkBob,
    };
};
