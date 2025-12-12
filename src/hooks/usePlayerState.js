import { useState } from 'react';

export const usePlayerState = () => {
    const [isWalking, setIsWalking] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [isJumping, setIsJumping] = useState(false);
    const [isDancing, setIsDancing] = useState(false);
    const [isWaving, setIsWaving] = useState(false);
    const [isClapping, setIsClapping] = useState(false);
    const [isSad, setIsSad] = useState(false);
    const [isAngry, setIsAngry] = useState(false);
    const [isRomance, setIsRomance] = useState(false);

    const handleJump = () => {
        if (!isJumping) {
            setIsJumping(true);
            setTimeout(() => setIsJumping(false), 600);
        }
    };

    const handleWave = () => {
        if (!isWaving) {
            setIsWaving(true);
            setTimeout(() => setIsWaving(false), 1500);
        }
    };

    const handleClap = () => {
        if (!isClapping) {
            setIsClapping(true);
            setTimeout(() => setIsClapping(false), 1500);
        }
    };

    const clearMovement = () => {
        setIsWalking(false);
        setIsRunning(false);
        setIsDancing(false);
    };

    const clearEmotions = () => {
        setIsSad(false);
        setIsAngry(false);
        setIsRomance(false);
    };

    const toggleWalking = () => {
        clearMovement();
        setIsWalking(!isWalking);
    };

    const toggleRunning = () => {
        clearMovement();
        setIsRunning(!isRunning);
    };

    const toggleDancing = () => {
        clearMovement();
        setIsDancing(!isDancing);
    };

    const toggleSad = () => {
        clearEmotions();
        setIsSad(!isSad);
    };

    const toggleAngry = () => {
        clearEmotions();
        setIsAngry(!isAngry);
    };

    const toggleRomance = () => {
        clearEmotions();
        setIsRomance(!isRomance);
    };

    return {
        isWalking,
        isRunning,
        isJumping,
        isDancing,
        isWaving,
        isClapping,
        isSad,
        isAngry,
        isRomance,
        handleJump,
        handleWave,
        handleClap,
        toggleWalking,
        toggleRunning,
        toggleDancing,
        toggleSad,
        toggleAngry,
        toggleRomance,
    };
};
