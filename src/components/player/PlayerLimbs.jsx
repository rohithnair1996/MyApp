import { Circle, Group, Line } from '@shopify/react-native-skia';
import React from 'react';
import { AVATAR } from '../../constants/playerConstants';

const PlayerLimbs = ({
    leftArmStart,
    leftArmEnd,
    leftHandX,
    leftHandY,
    rightArmStart,
    rightArmEnd,
    rightHandX,
    rightHandY,
    handRadius,
    leftLegStart,
    leftLegEnd,
    leftFootX,
    leftFootY,
    rightLegStart,
    rightLegEnd,
    rightFootX,
    rightFootY,
    colors,
}) => {
    const { arm, leg } = AVATAR;

    return (
        <Group>
            {/* LEFT ARM */}
            <Line p1={leftArmStart} p2={leftArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
            <Circle cx={leftHandX} cy={leftHandY} r={handRadius} color={colors.limbs} />

            {/* RIGHT ARM */}
            <Line p1={rightArmStart} p2={rightArmEnd} color={colors.limbs} style="stroke" strokeWidth={arm.width} />
            <Circle cx={rightHandX} cy={rightHandY} r={handRadius} color={colors.limbs} />

            {/* LEFT LEG */}
            <Line p1={leftLegStart} p2={leftLegEnd} color={colors.limbs} style="stroke" strokeWidth={leg.width} />
            <Circle cx={leftFootX} cy={leftFootY} r={leg.footRadius} color={colors.limbs} />

            {/* RIGHT LEG */}
            <Line p1={rightLegStart} p2={rightLegEnd} color={colors.limbs} style="stroke" strokeWidth={leg.width} />
            <Circle cx={rightFootX} cy={rightFootY} r={leg.footRadius} color={colors.limbs} />
        </Group>
    );
};

export default PlayerLimbs;
