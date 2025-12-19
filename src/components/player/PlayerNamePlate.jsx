import { Group, RoundedRect, Text } from '@shopify/react-native-skia';
import React, { useMemo, useEffect } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import { AVATAR } from '../../constants/playerConstants';

const PlayerNamePlate = ({
    x,
    y,
    bodyX,
    bodyOffset,
    scaleX,
    playerName,
    font,
    colors,
}) => {
    const { namePlate } = AVATAR;

    const scaledNamePlateWidth = useDerivedValue(() => {
        return (AVATAR.body.width - AVATAR.namePlate.paddingX * 2) * scaleX.value;
    });

    const namePlateX = useDerivedValue(() => {
        return bodyX.value - scaledNamePlateWidth.value / 2;
    });

    const namePlateY = useDerivedValue(() => {
        const normalY = y.value - AVATAR.leg.height - AVATAR.namePlate.offsetY;
        return normalY - bodyOffset.value;
    });

    const nameTextY = useDerivedValue(() => namePlateY.value + 9);

    // Calculate text width outside of worklet (font methods can't be called in worklets)
    const { nameText, textHalfWidth } = useMemo(() => {
        if (!font) return { nameText: playerName, textHalfWidth: 0 };

        const maxWidth = AVATAR.body.width - (AVATAR.namePlate.paddingX * 2) - (AVATAR.namePlate.textPadding * 2);
        let text = playerName;
        let textWidth = font.getTextWidth(text);
        while (text.length > 0 && textWidth > maxWidth) {
            text = text.slice(0, -1);
            textWidth = font.getTextWidth(text);
        }
        return { nameText: text, textHalfWidth: textWidth / 2 };
    }, [font, playerName]);

    // Use shared value for text half width so it's reactive in worklet
    const textHalfWidthSV = useSharedValue(textHalfWidth);

    // Update shared value when textHalfWidth changes
    useEffect(() => {
        textHalfWidthSV.value = textHalfWidth;
    }, [textHalfWidth, textHalfWidthSV]);

    // Use the shared value in the worklet
    const nameXOffset = useDerivedValue(() => {
        return bodyX.value - textHalfWidthSV.value;
    });

    return (
        <Group>
            <RoundedRect
                x={namePlateX}
                y={namePlateY}
                width={scaledNamePlateWidth}
                height={namePlate.height}
                r={namePlate.radius}
                color={colors.namePlate}
                opacity={colors.namePlateOpacity}
            />

            {font && (
                <Text x={nameXOffset} y={nameTextY} text={nameText} font={font} color={colors.nameText} />
            )}
        </Group>
    );
};

export default PlayerNamePlate;
