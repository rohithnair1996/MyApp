// VirtualRoom.js
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from '../components/Header';
import VideoContainer from '../components/VideoContainer';
import DanceFloor from '../components/DanceFloor'; // adjust path if needed
import HelloWorld from '../components/HelloWorld';
import SimpleUser from "../components/SimpleUser";   // update path if needed


export default function VirtualRoom() {
  return (
    <View style={styles.container}>
      <Header />
      <VideoContainer />
      {/* <View style={styles.floorContainer}>
        <DanceFloor
        source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200' }}
        style={styles.floor}
        // optional props:
        // initialPosition={{ x: 100, y: 120 }}
        // animationDuration={400}
        />
        </View> */}
      {/* <HelloWorld /> */}
      <SimpleUser />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floorContainer: {
    flex: 1,
  },
  floor: {
    flex: 1,
    width: '100%',
  },
});
