import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.circleView}>
        <Ionicons name="arrow-back" size={28} color="#ffffff" />
      </View>
      <View style={styles.rightContainer}>
        <View style={styles.iconWithText}>
          <FontAwesome5 name="user-friends" size={15} color="#ffffff" />
          <Text style={styles.text}>5</Text>
        </View>
        <View style={styles.iconWithText}>
        <FontAwesome5 name="user-plus" size={15} color="#ffffff" />
          <Text style={styles.text}>Invite</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1d283a',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleView: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#141c29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWithText: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#141c29',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});

