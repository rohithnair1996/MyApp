// VirtualRoom.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import VideoContainer from '../components/VideoContainer';
import Floor from './Floor';


export default function VirtualRoom() {
  return (
    <View style={styles.container}>
      <Header />
      <VideoContainer />
      <Floor />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
