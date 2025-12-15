import { Group, RoundedRect, Text } from '@shopify/react-native-skia';
import React from 'react';
import { useDerivedValue } from 'react-native-reanimated';
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
        const normalY = y - AVATAR.leg.height - AVATAR.namePlate.offsetY;
        return normalY - bodyOffset.value;
    });

    const nameTextY = useDerivedValue(() => namePlateY.value + 9);

    let nameText = playerName;
    const nameXOffset = useDerivedValue(() => {
        if (!font) return x;
        const maxWidth = AVATAR.body.width - (AVATAR.namePlate.paddingX * 2) - (AVATAR.namePlate.textPadding * 2);
        let text = playerName;
        let textWidth = font.getTextWidth(text);
        while (text.length > 0 && textWidth > maxWidth) {
            text = text.slice(0, -1);
            textWidth = font.getTextWidth(text);
        }
        return bodyX.value - (textWidth / 2);
    });

    if (font) {
        const maxWidth = AVATAR.body.width - (AVATAR.namePlate.paddingX * 2) - (AVATAR.namePlate.textPadding * 2);
        let textWidth = font.getTextWidth(nameText);
        while (nameText.length > 0 && textWidth > maxWidth) {
            nameText = nameText.slice(0, -1);
            textWidth = font.getTextWidth(nameText);
        }
    }

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
