import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width: screenWidth } = Dimensions.get('window');
const videoHeight = (screenWidth * 9) / 16; // 16:9 aspect ratio

export default function VideoContainer() {
  return (
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
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    overflow: 'hidden',
  },
});

