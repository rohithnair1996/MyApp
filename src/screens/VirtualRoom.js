import React from 'react';
import {Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';

export default function VirtualRoom() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <Text style={styles.text}>
        This is the Virtual haha1
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
