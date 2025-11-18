import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

const DEFAULT_VIDEO_ID = 'tXRuaacO-ZU';

const VideoContainer = ({ videoId = DEFAULT_VIDEO_ID }) => {
  const [playing, setPlaying] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate video height based on actual container width (16:9 aspect ratio) - memoized
  const videoHeight = useMemo(() => (containerWidth * 9) / 16, [containerWidth]);

  // Measure actual container width (memoized)
  const handleLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

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

export default React.memo(VideoContainer);

