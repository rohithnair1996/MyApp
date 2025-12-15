import { Group, Image, Line, RoundedRect } from '@shopify/react-native-skia';
import React from 'react';
import { AVATAR } from '../../constants/playerConstants';
import TearDrop from './TearDrop';

const PlayerFace = ({
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
    eyebrowOpacity,
    tearStartX,
    tearStartY,
    tearProgress,
    showTear,
    isSad,
    faceImage,
    colors,
}) => {
    const { face } = AVATAR;

    return (
        <Group>
            {/* FACE PANEL */}
            <RoundedRect
                x={faceX}
                y={faceY}
                width={scaledFaceWidth}
                height={scaledFaceHeight}
                r={face.radius}
                color={colors.face}
                opacity={colors.faceOpacity}
            />

            {/* EYEBROWS */}
            <Line
                p1={leftEyebrowStart}
                p2={leftEyebrowEnd}
                color={colors.eyebrows}
                style="stroke"
                strokeWidth={2}
                opacity={eyebrowOpacity}
            />
            <Line
                p1={rightEyebrowStart}
                p2={rightEyebrowEnd}
                color={colors.eyebrows}
                style="stroke"
                strokeWidth={2}
                opacity={eyebrowOpacity}
            />

            {/* FACE IMAGE OVERLAY */}
            {face && faceImage && (
                <Image
                    image={faceImage}
                    x={faceX}
                    y={faceY}
                    width={scaledFaceWidth}
                    height={scaledFaceHeight}
                    fit="cover"
                />
            )}

            {/* EYES */}
            <RoundedRect
                x={leftEyeX}
                y={eyeRectY}
                width={eyeWidth}
                height={eyeHeight}
                r={eyeCornerRadius}
                color={colors.eyes}
            />
            <RoundedRect
                x={rightEyeX}
                y={eyeRectY}
                width={eyeWidth}
                height={eyeHeight}
                r={eyeCornerRadius}
                color={colors.eyes}
            />

            {/* TEAR */}
            {isSad && (
                <TearDrop
                    startX={tearStartX.value} // Note: TearDrop expects raw values or shared values? 
                    // Checking TearDrop.jsx... it likely expects shared values or numbers.
                    // In PlayerFigure it was passed tearStartX.value.
                    // Wait, if I pass shared values to PlayerFace, I should pass them directly.
                    // But useFaceGeometry returns derived values.
                    // Skia components usually accept derived values directly for x, y etc.
                    // But TearDrop is a custom component. Let's check TearDrop.jsx.
                    startY={tearStartY.value}
                    progress={tearProgress}
                    visible={showTear}
                />
            )}
        </Group>
    );
};

export default PlayerFace;
