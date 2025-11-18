import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function VideoContainer({ videoId = 'tXRuaacO-ZU' }) {
  const [playing, setPlaying] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate video height based on actual container width (16:9 aspect ratio)
  const videoHeight = (containerWidth * 9) / 16;

  // Measure actual container width
  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Autoplay when videoId changes
  useEffect(() => {
    setPlaying(true);
  }, [videoId]);

  const onStateChange = useCallback((state) => {
    // When video ends, restart it
    if (state === 'ended') {
      setPlaying(true);
    }
  }, []);

  return (
    <View style={styles.videoContainer} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <YoutubePlayer
          height={videoHeight}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
          playerParams={{
            controls: 0,          // hide YouTube controls
            modestbranding: 1,    // reduce branding
            rel: 0,
            showinfo: 0,
            playsinline: 1,
            loop: 1,              // enable loop
            playlist: videoId,    // required for loop to work
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    overflow: 'hidden',
  },
});

