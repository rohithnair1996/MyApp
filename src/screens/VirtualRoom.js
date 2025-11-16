import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import YoutubePlayer from 'react-native-youtube-iframe';
import Header from '../components/Header';

const { width: screenWidth } = Dimensions.get('window');
const videoHeight = (screenWidth * 9) / 16; // 16:9 aspect ratio

export default function VirtualRoom() {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.videoContainer}>
        <YoutubePlayer
          height={videoHeight}
          videoId="dQw4w9WgXcQ"
          playerParams={{
            controls: 0,          // hide YouTube controls
            modestbranding: 1,    // reduce branding
            rel: 0,
            showinfo: 0,
            playsinline: 1,
          }}
        />
      </View>
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
  videoContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
