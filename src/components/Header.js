import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { COLORS, ICON_SIZES } from '../constants/colors';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.circleView}>
        <Ionicons name="arrow-back" size={ICON_SIZES.LARGE} color={COLORS.WHITE} />
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.iconWithText}>
          <FontAwesome5 name="user-friends" size={ICON_SIZES.MEDIUM} color={COLORS.ACCENT_CYAN} />
          <Text style={styles.count}>5</Text>
        </View>
        <View style={styles.iconWithText}>
          <FontAwesome5 name="user-plus" size={ICON_SIZES.MEDIUM} color={COLORS.WHITE} />
          <Text style={styles.text}>Invite</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: COLORS.PRIMARY_DARK,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleView: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.SECONDARY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWithText: {
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.SECONDARY_DARK,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  count: {
    color: COLORS.ACCENT_CYAN,
    fontSize: 15,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});

export default React.memo(Header);

