import { useEffect, useState } from 'react';
import {
    Easing,
    cancelAnimation,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { ANIMATION } from '../constants/playerConstants';

export const usePlayerAnimations = ({
    isWalking,
    isRunning,
    isJumping,
    isDancing,
    isWaving,
    isClapping,
    isSad,
    isAngry,
    isRomance,
    sharedValues,
}) => {
    const {
        breathProgress,
        walkProgress,
        jumpProgress,
        danceProgress,
        waveProgress,
        waveArmRaise,
        blinkProgress,
        scaleX,
        scaleY,
        clapProgress,
        clapArmRaise,
        dustProgress,
        showDust,
        sadProgress,
        sadSway,
        tearProgress,
        showTear,
        angryProgress,
        angryShake,
    } = sharedValues;

    const [hearts, setHearts] = useState([]);

    // ═══════════════════════════════════════════════════════════
    // BLINK ANIMATION
    // ═══════════════════════════════════════════════════════════
    const triggerBlink = () => {
        const { closeDuration, openDuration, closedDuration } = ANIMATION.blinking;
        blinkProgress.value = withSequence(
            withTiming(1, { duration: closeDuration }),
            withTiming(1, { duration: closedDuration }),
            withTiming(0, { duration: openDuration })
        );
    };

    const scheduleNextBlink = () => {
        const { minInterval, maxInterval } = ANIMATION.blinking;
        const randomDelay = minInterval + Math.random() * (maxInterval - minInterval);
        setTimeout(() => {
            triggerBlink();
            scheduleNextBlink();
        }, randomDelay);
    };

    useEffect(() => {
        const initialDelay = 1000 + Math.random() * 2000;
        const timeoutId = setTimeout(() => {
            triggerBlink();
            scheduleNextBlink();
        }, initialDelay);
        return () => clearTimeout(timeoutId);
    }, []);

    // ═══════════════════════════════════════════════════════════
    // ROMANCE ANIMATION - Simple state-based heart management
    // Each heart manages its own animation internally
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isRomance) {
            const { spawnInterval, colors } = ANIMATION.romance;

            const spawnHeart = () => {
                const newHeart = {
                    id: Date.now() + Math.random(),
                    seed: Math.random(),
                    color: colors[Math.floor(Math.random() * colors.length)],
                    startTime: Date.now(),
                };

                // Keep max 12 hearts to prevent memory issues
                setHearts(prev => [...prev.slice(-11), newHeart]);
            };

            // Spawn initial heart
            spawnHeart();

            // Continue spawning hearts at interval
            const intervalId = setInterval(spawnHeart, spawnInterval);

            return () => {
                clearInterval(intervalId);
                setHearts([]);
            };
        } else {
            // Clear hearts when romance ends
            setHearts([]);
        }
    }, [isRomance]);

    // ═══════════════════════════════════════════════════════════
    // SAD ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isSad) {
            sadProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) });

            sadSway.value = withRepeat(
                withTiming(1, { duration: ANIMATION.sad.swayDuration, easing: Easing.inOut(Easing.sin) }),
                -1,
                true
            );

            const triggerTear = () => {
                showTear.value = 1;
                tearProgress.value = 0;
                tearProgress.value = withTiming(1, { duration: ANIMATION.sad.tearDuration });
                setTimeout(() => {
                    showTear.value = 0;
                }, ANIMATION.sad.tearDuration);
            };

            triggerTear();
            const tearIntervalId = setInterval(triggerTear, ANIMATION.sad.tearInterval);

            return () => clearInterval(tearIntervalId);
        } else {
            sadProgress.value = withTiming(0, { duration: 300 });
            cancelAnimation(sadSway);
            sadSway.value = withTiming(0, { duration: 200 });
            showTear.value = 0;
        }
    }, [isSad]);

    // ═══════════════════════════════════════════════════════════
    // ANGRY ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isAngry) {
            angryProgress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });

            angryShake.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: ANIMATION.angry.shakeDuration }),
                    withTiming(-1, { duration: ANIMATION.angry.shakeDuration }),
                    withTiming(0, { duration: ANIMATION.angry.shakeDuration })
                ),
                -1,
                false
            );
        } else {
            angryProgress.value = withTiming(0, { duration: 300 });
            cancelAnimation(angryShake);
            angryShake.value = withTiming(0, { duration: 100 });
        }
    }, [isAngry]);

    // ═══════════════════════════════════════════════════════════
    // BREATHING ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (!isWalking && !isRunning && !isJumping && !isDancing && !isWaving && !isClapping) {
            let duration = ANIMATION.breathing.duration;
            if (isSad) duration = ANIMATION.sad.breathingSpeed;
            if (isAngry) duration = ANIMATION.angry.breathingSpeed;

            breathProgress.value = withRepeat(
                withTiming(1, {
                    duration: duration,
                    easing: Easing.inOut(Easing.sin),
                }),
                -1,
                true
            );
        } else {
            cancelAnimation(breathProgress);
            breathProgress.value = withTiming(0, { duration: 200 });
        }
    }, [isWalking, isRunning, isJumping, isDancing, isWaving, isClapping, isSad, isAngry]);

    // ═══════════════════════════════════════════════════════════
    // WALKING / RUNNING ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if ((isWalking || isRunning) && !isJumping && !isDancing && !isWaving && !isClapping) {
            const stepDuration = isRunning
                ? ANIMATION.running.stepDuration
                : ANIMATION.walking.stepDuration;

            walkProgress.value = withRepeat(
                withTiming(1, {
                    duration: stepDuration,
                    easing: Easing.linear,
                }),
                -1,
                true
            );
        } else {
            cancelAnimation(walkProgress);
            walkProgress.value = withTiming(0.5, { duration: 200 });
        }
    }, [isWalking, isRunning, isJumping, isDancing, isWaving, isClapping]);

    // ═══════════════════════════════════════════════════════════
    // JUMP ANIMATION (with dust trigger)
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isJumping) {
            const {
                crouchDuration, launchDuration, airDuration, landDuration,
                stretchX, stretchY, squashX, squashY, squashDuration,
            } = ANIMATION.jumping;

            jumpProgress.value = withSequence(
                withTiming(-0.2, { duration: crouchDuration, easing: Easing.out(Easing.quad) }),
                withTiming(1, { duration: launchDuration, easing: Easing.out(Easing.quad) }),
                withTiming(1, { duration: airDuration }),
                withTiming(0, { duration: landDuration, easing: Easing.in(Easing.quad) })
            );

            scaleX.value = withSequence(
                withTiming(squashX, { duration: crouchDuration }),
                withTiming(stretchX, { duration: launchDuration }),
                withTiming(1, { duration: airDuration }),
                withTiming(squashX, { duration: squashDuration }),
                withSpring(1, { damping: 8, stiffness: 200 })
            );

            scaleY.value = withSequence(
                withTiming(squashY, { duration: crouchDuration }),
                withTiming(stretchY, { duration: launchDuration }),
                withTiming(1, { duration: airDuration }),
                withTiming(squashY, { duration: squashDuration }),
                withSpring(1, { damping: 8, stiffness: 200 })
            );

            const totalJumpTime = crouchDuration + launchDuration + airDuration + landDuration;
            setTimeout(() => {
                showDust.value = 1;
                dustProgress.value = 0;
                dustProgress.value = withTiming(1, {
                    duration: ANIMATION.dust.duration,
                    easing: Easing.out(Easing.quad)
                });
                setTimeout(() => {
                    showDust.value = 0;
                }, ANIMATION.dust.duration);
            }, totalJumpTime - 50);

        } else {
            jumpProgress.value = withTiming(0, { duration: 100 });
            scaleX.value = withTiming(1, { duration: 100 });
            scaleY.value = withTiming(1, { duration: 100 });
        }
    }, [isJumping]);

    // ═══════════════════════════════════════════════════════════
    // DANCE ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isDancing) {
            danceProgress.value = withRepeat(
                withTiming(1, {
                    duration: ANIMATION.dancing.beatDuration,
                    easing: Easing.inOut(Easing.sin),
                }),
                -1,
                true
            );
        } else {
            cancelAnimation(danceProgress);
            danceProgress.value = withTiming(0, { duration: 200 });
        }
    }, [isDancing]);

    // ═══════════════════════════════════════════════════════════
    // WAVE ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isWaving) {
            const { waveDuration, waveCount } = ANIMATION.waving;
            waveArmRaise.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) });
            waveProgress.value = withRepeat(
                withTiming(1, { duration: waveDuration, easing: Easing.inOut(Easing.sin) }),
                waveCount * 2,
                true
            );
        } else {
            cancelAnimation(waveProgress);
            waveProgress.value = withTiming(0.5, { duration: 100 });
            waveArmRaise.value = withTiming(0, { duration: 200 });
        }
    }, [isWaving]);

    // ═══════════════════════════════════════════════════════════
    // CLAP ANIMATION
    // ═══════════════════════════════════════════════════════════
    useEffect(() => {
        if (isClapping) {
            const { clapDuration, clapCount } = ANIMATION.clapping;

            clapArmRaise.value = withTiming(1, {
                duration: 200,
                easing: Easing.out(Easing.quad)
            });

            clapProgress.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: clapDuration, easing: Easing.in(Easing.quad) }),
                    withTiming(0, { duration: clapDuration, easing: Easing.out(Easing.quad) })
                ),
                clapCount,
                false
            );
        } else {
            cancelAnimation(clapProgress);
            clapProgress.value = withTiming(0, { duration: 100 });
            clapArmRaise.value = withTiming(0, { duration: 200 });
        }
    }, [isClapping]);

    return { hearts };
};
