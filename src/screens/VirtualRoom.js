// VirtualRoom.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Header from '../components/Header';
import VideoContainer from '../components/VideoContainer';
import Floor from './Floor';


export default function VirtualRoom({ navigation }) {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
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
