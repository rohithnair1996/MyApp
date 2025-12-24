import { useSharedValue } from 'react-native-reanimated';

export const usePlayerSharedValues = () => {
    const breathProgress = useSharedValue(0);
    const walkProgress = useSharedValue(0.5);
    const jumpProgress = useSharedValue(0);
    const danceProgress = useSharedValue(0);
    const waveProgress = useSharedValue(0);
    const waveArmRaise = useSharedValue(0);
    const blinkProgress = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const scaleY = useSharedValue(1);
    const clapProgress = useSharedValue(0);
    const clapArmRaise = useSharedValue(0);
    const dustProgress = useSharedValue(0);
    const showDust = useSharedValue(0);

    // Emotion shared values
    const sadProgress = useSharedValue(0);
    const sadSway = useSharedValue(0);
    const tearProgress = useSharedValue(0);
    const showTear = useSharedValue(0);
    const angryProgress = useSharedValue(0);
    const angryShake = useSharedValue(0);

    return {
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
    };
};
