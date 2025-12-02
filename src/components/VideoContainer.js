import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import YoutubePlayer from 'react-native-youtube-iframe';
import DanceIcon from '../assets/svg/dance.svg';
import speakerImage from '../images/speaker.png';
import tableLampImage from '../images/table_lamp.png';

const DEFAULT_VIDEO_ID = '8yAanFW2FsY';

const VideoContainer = forwardRef(({ videoId = DEFAULT_VIDEO_ID, onOpenPlaylist, onOpenInfo, onPlayerStateChange, isLoading = false }, ref) => {
  const [playing, setPlaying] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const playerRef = useRef(null);

  // Calculate video height based on actual container width (16:9 aspect ratio) - memoized
  const videoHeight = useMemo(() => (containerWidth * 9) / 16, [containerWidth]);

  // Measure actual container width (memoized)
  const handleLayout = useCallback((event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    play: () => setPlaying(true),
    pause: () => setPlaying(false),
    seekTo: async (seconds) => {
      if (playerRef.current) {
        await playerRef.current.seekTo(seconds);
      }
    },
    getCurrentTime: async () => {
      if (playerRef.current) {
        return await playerRef.current.getCurrentTime();
      }
      return 0;
    },
    getDuration: async () => {
      if (playerRef.current) {
        return await playerRef.current.getDuration();
      }
      return 0;
    },
  }));

  // Autoplay when videoId changes
  useEffect(() => {
    setPlaying(true);
  }, [videoId]);

  const onStateChange = useCallback((state) => {
    // When video ends, restart it
    if (state === 'ended') {
      setPlaying(true);
    }

    // Notify parent of state changes
    if (onPlayerStateChange) {
      onPlayerStateChange(state, playing);
    }
  }, [playing, onPlayerStateChange]);

  return (
    <View style={styles.videoContainer}>
      <View style={styles.videoContainerLeft}>
        <View style={styles.playListIcon}>
          <TouchableOpacity onPress={onOpenInfo}>
            <MaterialIcons name="settings-remote" size={40} color="white" />
          </TouchableOpacity>
        </View>
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
        {containerWidth > 0 && (<>
          {isLoading && <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loaderText}>Loading media...</Text>
          </View>}
          <View style={styles.youtubePlayerContainer} pointerEvents="none">
            <YoutubePlayer
              ref={playerRef}
              height={videoHeight}
              videoId={videoId}
              play={playing}
              onChangeState={onStateChange}
              playerParams={{
                controls: 0,  // Hide player controls
                autoplay: 1,  // Enable autoplay
                showinfo: 0,
                autohide: 1,
              }}
            />
          </View>
        </>
        )}
      </View>
      <View style={styles.videoContainerRight}>
        <View style={styles.playListIcon}>
          <DanceIcon width={40} height={40} />
        </View>
        <View style={styles.tableLamp}>
          <Image source={speakerImage} style={styles.tableLampImage} resizeMode="contain" />
        </View>
      </View>
    </View>
  );
});

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
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2C2C2C',
  },
  loaderText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
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

export default VideoContainer;
