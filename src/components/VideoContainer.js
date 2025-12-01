import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import tableLampImage from '../images/table_lamp.png';
import speakerImage from '../images/speaker.png';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';

const DEFAULT_VIDEO_ID = '8yAanFW2FsY';

const VideoContainer = ({ videoId = DEFAULT_VIDEO_ID, onOpenPlaylist }) => {
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
    <View style={styles.videoContainer}>
      <View style={styles.videoContainerLeft}>
        <View style={styles.playListIcon}>
          <TouchableOpacity onPress={onOpenPlaylist}>
            <MaterialIcons name="local-movies" size={40} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.tableLamp}>
          <Image source={tableLampImage} style={styles.tableLampImage} resizeMode="contain" />
        </View>
      </View>
      <View style={styles.mediaContainer} onLayout={handleLayout}>
        {containerWidth > 0 && (
          <YoutubePlayer
            height={videoHeight}
            videoId={videoId}
            play={playing}
            onChangeState={onStateChange}
            playerParams={{
              controls: 0,  // Hide player controls
              autoplay: 1,  // Enable autoplay
            }}
          />
        )}
      </View>
      <View style={styles.videoContainerRight}>
        <View style={styles.playListIcon}>
          <Entypo name="controller-next" size={40} color="white" />
        </View>
        <View style={styles.tableLamp}>
          <Image source={speakerImage} style={styles.tableLampImage} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    width: '100%',
    backgroundColor: '#A8A8A8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  mediaContainer: {
    flex: 1,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 2)',
    minHeight: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  videoContainerLeft: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'rgba(255, 255, 255, 2)',
    backgroundColor: '#686868'
  },
  videoContainerRight: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'rgba(255, 255, 255, 2)',
    backgroundColor: '#686868'
  },
  tableLamp: {
  },
  tableLampImage: {
    width: 40,
    height: 80,
  },
  playListIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default React.memo(VideoContainer);

