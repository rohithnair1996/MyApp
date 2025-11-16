import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.circleView}>
        <Ionicons name="chevron-back" size={28} color="#ffffff" />
      </View>
      <View style={styles.childView}>
        <Text style={styles.text}>v2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#1d283a',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  circleView: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#141c29',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

