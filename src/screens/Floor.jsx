import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@shopify/react-native-skia';
import { StyleSheet, Pressable, View, Text, TouchableOpacity, Vibration, Image, TextInput, ScrollView, BackHandler } from 'react-native';
import Slider from '@react-native-community/slider';
import familyImage from '../images/family.png';
import { showToast } from '../components/ToastStack';
import FloorBackground from '../components/FloorBackground';
import Header from '../components/Header';
import VideoContainer from '../components/VideoContainer';
import Tomato from '../components/Tomato';
import Plane from '../components/Plane';
import { SimpleCharacter } from '../components/character/SimpleCharacter';
import { useWalker } from '../components/character/useWalker';
import RemotePlayer from '../components/RemotePlayer';

import BottomSheet from '../components/BottomSheet';
import MessagePopup from '../components/MessagePopup';
import ExitConfirmationModal from '../components/ExitConfirmationModal';
import { useGameSocket } from '../hooks/useGameSocket';
import { CHARACTER_DIMENSIONS } from '../constants/character';
import { formatPositionForAPI, parsePositionFromAPI } from '../utils/positionUtils';
import Ionicons from 'react-native-vector-icons/Ionicons';
import speakerImage from '../images/speaker.png';


const { BODY_WIDTH, BODY_HEIGHT } = CHARACTER_DIMENSIONS;

// Helper function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const Floor = ({ navigation, route }) => {
  // Get space info from navigation params
  const { spaceId, spaceName } = route?.params || {};

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;
  const { x, y, walkCycle, walkTo } = useWalker(50, 100);

  // WebSocket connection for multiplayer (space-scoped)
  const { isConnected, isInSpace, players, myUserId, movePlayer, throwTomato, throwPlane, sendMessage, pokeUser, incomingTomatoThrows, incomingPlaneThrows, incomingMessages, incomingPokes, clearTomatoThrow, clearPlaneThrow, clearMessage, clearPoke } = useGameSocket(spaceId);

  // Video player ref
  const videoPlayerRef = useRef(null);

  // Bottom sheet state
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Video playlist bottom sheet state
  const [isVideoPlaylistVisible, setIsVideoPlaylistVisible] = useState(false);

  // Info bottom sheet state
  const [isInfoBottomSheetVisible, setIsInfoBottomSheetVisible] = useState(false);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [videoLoader, setVideoLoader] = useState(true);

  const [playlist, setPlaylist] = useState([
    { id: '1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
    { id: '2', url: 'https://www.youtube.com/watch?v=9bZkp7q19f0', title: 'Gangnam Style' },
    { id: '3', url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', title: 'Despacito' },
    { id: '4', url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', title: 'Bohemian Rhapsody' },
    { id: '5', url: 'https://www.youtube.com/watch?v=CevxZvSJLk8', title: 'Kala Chashma' },
    { id: '6', url: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs', title: 'Happy' },
    { id: '7', url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk' },
    { id: '8', url: 'https://www.youtube.com/watch?v=hT_nvWreIhg', title: 'See You Again' },
    { id: '9', url: 'https://www.youtube.com/watch?v=60ItHLz5WEA', title: 'Faded' },
    { id: '10', url: 'https://www.youtube.com/watch?v=pAgnJDJN4VA', title: 'Alone' },
  ]);
  const [urlInput, setUrlInput] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [lastPlayTime, setLastPlayTime] = useState(0);

  // Message popup state
  const [isMessagePopupVisible, setIsMessagePopupVisible] = useState(false);

  // Exit confirmation popup state
  const [showExitPopup, setShowExitPopup] = useState(false);

  // Incoming tomato throws (tomatoes thrown at you or others)
  const [activeTomatoThrows, setActiveTomatoThrows] = useState([]);

  // Incoming plane throws (planes thrown at you or others)
  const [activePlaneThrows, setActivePlaneThrows] = useState([]);


  // Check if touch point is within a user's rectangular body (memoized)
  const checkUserClick = useCallback((touchX, touchY) => {
    // Input validation
    if (typeof touchX !== 'number' || typeof touchY !== 'number') {
      return null;
    }

    for (const player of players) {
      if (player.userId === myUserId) continue; // Skip self

      // Parse player position from server
      const playerPos = parsePositionFromAPI(
        { x: player.x, y: player.y },
        width,
        height
      );

      // Calculate user's rectangular bounds
      const left = playerPos.x - BODY_WIDTH / 2;
      const right = playerPos.x + BODY_WIDTH / 2;
      const top = playerPos.y - BODY_HEIGHT / 2;
      const bottom = playerPos.y + BODY_HEIGHT / 2;

      // Check if touch point is within the rectangle
      if (touchX >= left && touchX <= right && touchY >= top && touchY <= bottom) {
        return {
          id: player.userId,
          username: player.username,
          x: playerPos.x,
          y: playerPos.y,
        };
      }
    }
    return null;
  }, [players, myUserId, width, height]);

  // Handle layout changes to measure actual component dimensions (memoized)
  const handleLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  // Handle incoming tomato throws from WebSocket
  useEffect(() => {
    if (width === 0 || height === 0) return;

    // Process new incoming tomato throws
    incomingTomatoThrows.forEach((tomatoThrow) => {
      // Convert percentage position to pixel position
      const targetPosition = parsePositionFromAPI(
        { x: tomatoThrow.targetX, y: tomatoThrow.targetY },
        width,
        height
      );

      // Find the thrower's current position
      const thrower = players.find(p => p.userId === tomatoThrow.fromUserId);
      let startX, startY;

      if (thrower) {
        // If thrower is another player
        const throwerPosition = parsePositionFromAPI(
          { x: thrower.x, y: thrower.y },
          width,
          height
        );
        startX = throwerPosition.x;
        startY = throwerPosition.y;
      } else if (tomatoThrow.fromUserId === myUserId) {
        // If you threw it
        startX = x.value;
        startY = y.value;
      } else {
        // Thrower not found, skip this throw
        clearTomatoThrow(tomatoThrow.id);
        return;
      }

      // Add to active throws to be displayed
      setActiveTomatoThrows((prev) => [
        ...prev,
        {
          id: tomatoThrow.id,
          startX,
          startY,
          targetX: targetPosition.x,
          targetY: targetPosition.y,
          fromUserId: tomatoThrow.fromUserId,
          targetUserId: tomatoThrow.targetUserId,
        }
      ]);

      // Clear from incoming list
      clearTomatoThrow(tomatoThrow.id);
    });
  }, [incomingTomatoThrows, players, myUserId, width, height, x, y, clearTomatoThrow]);

  // Handle incoming plane throws from WebSocket
  useEffect(() => {
    if (width === 0 || height === 0) return;

    // Process new incoming plane throws
    incomingPlaneThrows.forEach((planeThrow) => {
      // Convert percentage position to pixel position
      const targetPosition = parsePositionFromAPI(
        { x: planeThrow.targetX, y: planeThrow.targetY },
        width,
        height
      );

      // Find the thrower's current position
      const thrower = players.find(p => p.userId === planeThrow.fromUserId);
      let startX, startY;

      if (thrower) {
        // If thrower is another player
        const throwerPosition = parsePositionFromAPI(
          { x: thrower.x, y: thrower.y },
          width,
          height
        );
        startX = throwerPosition.x;
        startY = throwerPosition.y;
      } else if (planeThrow.fromUserId === myUserId) {
        // If you threw it
        startX = x.value;
        startY = y.value;
      } else {
        // Thrower not found, skip this throw
        clearPlaneThrow(planeThrow.id);
        return;
      }

      // Add to active throws to be displayed
      setActivePlaneThrows((prev) => [
        ...prev,
        {
          id: planeThrow.id,
          startX,
          startY,
          targetX: targetPosition.x,
          targetY: targetPosition.y,
          fromUserId: planeThrow.fromUserId,
          targetUserId: planeThrow.targetUserId,
        }
      ]);

      // Clear from incoming list
      clearPlaneThrow(planeThrow.id);
    });
  }, [incomingPlaneThrows, players, myUserId, width, height, x, y, clearPlaneThrow]);

  // Handle incoming messages from WebSocket
  useEffect(() => {
    // Process new incoming messages
    incomingMessages.forEach((incomingMessage) => {
      // Find the sender's username
      const sender = players.find(p => p.userId === incomingMessage.fromUserId);
      const senderName = sender ? sender.username : 'Someone';

      // Vibrate with pattern: [wait, vibrate, wait, vibrate, ...]
      // Pattern: vibrate for 200ms, pause 100ms, repeat 3 times (~1 second total)
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);

      // Show toast with the message
      showToast({
        type: 'info',
        text1: `Message from ${senderName}`,
        text2: incomingMessage.message,
      });

      // Clear from incoming list
      clearMessage(incomingMessage.id);
    });
  }, [incomingMessages, players, clearMessage]);

  // Handle incoming pokes from WebSocket
  useEffect(() => {
    // Process new incoming pokes
    incomingPokes.forEach((incomingPoke) => {
      // Find the sender's username
      const sender = players.find(p => p.userId === incomingPoke.fromUserId);
      const senderName = sender ? sender.username : 'Someone';

      // Vibrate with pattern: single short vibration
      Vibration.vibrate([0, 200, 100, 200, 100, 200]);

      // Show toast with the poke notification
      showToast({
        type: 'success',
        text1: '👉 Poke!',
        text2: `${senderName} poked you!`,
      });

      // Clear from incoming list
      clearPoke(incomingPoke.id);
    });
  }, [incomingPokes, players, clearPoke]);

  // Handle long press events (memoized)
  const handleLongPress = useCallback((event) => {
    const { locationX, locationY } = event.nativeEvent;

    // Check if user was long pressed
    const longPressedUser = checkUserClick(locationX, locationY);
    if (longPressedUser) {
      console.log('Username:', longPressedUser.username);
    }
  }, [checkUserClick]);

  // Handle touch events (memoized)
  const handlePress = useCallback(async (event) => {
    const { locationX, locationY } = event.nativeEvent;
    console.log('Touch at:', locationX, locationY);

    // Check if user was clicked
    const clickedUser = checkUserClick(locationX, locationY);
    console.log('Clicked user:', clickedUser);
    if (clickedUser) {
      console.log('Opening bottom sheet for user:', clickedUser.id);
      setSelectedUser(clickedUser);
      setIsBottomSheetVisible(true);
      return;
    }

    // Move player to clicked position locally
    walkTo(locationX, locationY);

    // Send position to server via WebSocket (convert to percentage)
    const position = formatPositionForAPI(locationX, locationY, width, height);
    movePlayer(position.x, position.y);
  }, [checkUserClick, walkTo, width, height, movePlayer]);

  // Handle opening video playlist bottom sheet
  const handleOpenVideoPlaylist = useCallback(() => {
    setIsVideoPlaylistVisible(true);
  }, []);

  // Handle opening info bottom sheet
  const handleOpenInfo = useCallback(() => {
    setIsInfoBottomSheetVisible(true);
  }, []);

  // Update video progress periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoPlayerRef.current && !isSeeking && isPlaying) {
        try {
          const time = await videoPlayerRef.current.getCurrentTime();
          const dur = await videoPlayerRef.current.getDuration();
          setCurrentTime(time);
          setDuration(dur);
        } catch (error) {
          // Ignore errors from player
        }
      }
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, [isSeeking, isPlaying]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        videoPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  // Handle seek
  const handleSeek = useCallback((value) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.seekTo(value);
      setCurrentTime(value);
    }
  }, []);

  // Handle next video
  const handleNextVideo = useCallback(() => {
    const currentIndex = playlist.findIndex((item) => {
      const videoId = extractYouTubeVideoId(item.url);
      return videoId === currentVideoId;
    });

    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      const nextVideo = playlist[currentIndex + 1];
      const videoId = extractYouTubeVideoId(nextVideo.url);
      if (videoId) {
        setVideoLoader(true);
        setCurrentVideoId(videoId);
        setIsPlaying(true);
        showToast({
          type: 'success',
          text1: 'Now Playing',
          text2: nextVideo.title,
        });
      }
    } else {
      showToast({
        type: 'info',
        text1: 'End of playlist',
        text2: 'No more videos',
      });
    }
  }, [playlist, currentVideoId]);

  // Get current video name
  const getCurrentVideoName = useCallback(() => {
    const currentVideo = playlist.find((item) => {
      const videoId = extractYouTubeVideoId(item.url);
      return videoId === currentVideoId;
    });
    return currentVideo ? currentVideo.title : 'Unknown Video';
  }, [playlist, currentVideoId]);

  // Handle adding video/song to playlist
  const handleAddToPlaylist = useCallback(async () => {
    if (urlInput.trim()) {
      const videoId = extractYouTubeVideoId(urlInput.trim());

      if (!videoId) {
        showToast({
          type: 'error',
          text1: 'Invalid URL',
          text2: 'Please enter a valid YouTube URL',
        });
        return;
      }

      // Fetch video title from YouTube oEmbed API
      let videoTitle = 'YouTube Video';
      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oEmbedUrl);

        if (response.ok) {
          const data = await response.json();
          videoTitle = data.title || 'YouTube Video';
        }
      } catch (error) {
        console.log('Failed to fetch video title:', error);
        // Continue with default title if fetch fails
      }

      const newItem = {
        id: Date.now().toString(),
        url: urlInput.trim(),
        title: videoTitle,
      };
      setPlaylist((prev) => [...prev, newItem]);
      setUrlInput('');
      showToast({
        type: 'success',
        text1: 'Added to playlist',
        text2: 'Video added successfully',
      });
    }
  }, [urlInput]);

  // Handle deleting video/song from playlist
  const handleDeleteFromPlaylist = useCallback((id) => {
    setPlaylist((prev) => prev.filter((item) => item.id !== id));
    showToast({
      type: 'info',
      text1: 'Removed from playlist',
      text2: 'Video/Song removed successfully',
    });
  }, []);

  // Handle playing video with cooldown check
  const handlePlayVideo = useCallback((url) => {
    const currentTime = Date.now();
    const timeSinceLastPlay = (currentTime - lastPlayTime) / 1000; // Convert to seconds

    if (timeSinceLastPlay < 10 && lastPlayTime !== 0) {
      const remainingTime = Math.ceil(10 - timeSinceLastPlay);
      showToast({
        type: 'error',
        text1: 'Please wait',
        text2: `You can play another video in ${remainingTime} seconds`,
      });
      return;
    }

    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      // Find video title from playlist
      const video = playlist.find((item) => {
        const itemVideoId = extractYouTubeVideoId(item.url);
        return itemVideoId === videoId;
      });
      const videoTitle = video ? video.title : 'Unknown Video';

      setVideoLoader(true);
      setCurrentVideoId(videoId);
      setLastPlayTime(currentTime);
      setIsVideoPlaylistVisible(false);
      showToast({
        type: 'success',
        text1: 'Now Playing',
        text2: videoTitle,
      });
    }
  }, [lastPlayTime, playlist]);

  // Auto-play first video from playlist on mount
  useEffect(() => {
    const timer1 = setTimeout(() => {
      if (playlist.length > 0) {
        handlePlayVideo(playlist[0].url);
      }
    }, 100);

    const timer2 = setTimeout(() => {
      setVideoLoader(false);
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Handle Android hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowExitPopup(true);
      return true; // Prevent default back action
    });

    return () => backHandler.remove();
  }, []);

  // Handle exit popup actions
  const handleJoinBackSoon = useCallback(() => {
    setShowExitPopup(false);
    if (navigation) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleJoinLater = useCallback(() => {
    setShowExitPopup(false);
    if (navigation) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleCancelExit = useCallback(() => {
    setShowExitPopup(false);
  }, []);

  return (
    <>
      <Header navigation={navigation} playersLength={players.length} isConnected={isConnected && isInSpace} spaceName={spaceName} />
      <VideoContainer
        ref={videoPlayerRef}
        videoId={currentVideoId}
        onOpenPlaylist={handleOpenVideoPlaylist}
        onOpenInfo={handleOpenInfo}
        isLoading={videoLoader}
        onPlayerStateChange={(state, playing) => {
          setIsPlaying(playing);
          // Hide loader when video starts playing
          if (state === 'playing') {
            setVideoLoader(false);
          }
          // Auto-play next song when current song ends
          if (state === 'ended') {
            handleNextVideo();
          }
        }}
      />
      <Pressable style={styles.container} onPress={handlePress} onLongPress={handleLongPress} onLayout={handleLayout}>
        <Canvas style={styles.canvas}>
          {width > 0 && height > 0 && (
            <>
              <FloorBackground
                width={width}
                height={height}
                imagePath={require('../images/floor4.jpg')}
              />
              <SimpleCharacter x={x} y={y} walkCycle={walkCycle} image={require('../assets/a4.png')} />

              {/* Other users */}
              {players
                .filter(player => player.userId !== myUserId)
                .map(player => (
                  <RemotePlayer
                    key={player.userId}
                    player={player}
                    width={width}
                    height={height}
                    image={require('../assets/a1.png')}
                  />
                ))}


              {activeTomatoThrows.map((tomatoThrow) => (
                <Tomato
                  key={tomatoThrow.id}
                  startX={tomatoThrow.startX}
                  startY={tomatoThrow.startY}
                  targetX={tomatoThrow.targetX}
                  targetY={tomatoThrow.targetY}
                  onAnimationComplete={() => {
                    setActiveTomatoThrows((prev) => prev.filter(t => t.id !== tomatoThrow.id));
                  }}
                />
              ))}

              {activePlaneThrows.map((planeThrow) => (
                <Plane
                  key={planeThrow.id}
                  startX={planeThrow.startX}
                  startY={planeThrow.startY}
                  targetX={planeThrow.targetX}
                  targetY={planeThrow.targetY}
                  onAnimationComplete={() => {
                    setActivePlaneThrows((prev) => prev.filter(p => p.id !== planeThrow.id));
                  }}
                />
              ))}
            </>
          )}
        </Canvas>
      </Pressable>

      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={() => setIsBottomSheetVisible(false)}
        height={300}
      >
        {selectedUser && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Player Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('Poking user:', selectedUser.username);
                pokeUser(selectedUser.id);
                setIsBottomSheetVisible(false);
              }}
            >
              <Text style={styles.actionButtonText}>👉 Poke</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSpacing]}
              onPress={() => {
                console.log('Throwing tomato at user:', selectedUser.id);

                const position = formatPositionForAPI(selectedUser.x, selectedUser.y, width, height);

                throwTomato(selectedUser.id, position.x, position.y);

                setIsBottomSheetVisible(false);
              }}
            >
              <Text style={styles.actionButtonText}>🍅 Throw a tomato</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSpacing]}
              onPress={() => {
                console.log('Opening message popup for user:', selectedUser.id);
                setIsBottomSheetVisible(false);
                setIsMessagePopupVisible(true);
              }}
            >
              <Text style={styles.actionButtonText}>✈️ Send a Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>

      {/* Video Playlist Bottom Sheet */}
      <BottomSheet
        visible={isVideoPlaylistVisible}
        onClose={() => setIsVideoPlaylistVisible(false)}
        height={500}
      >
        <View style={styles.playlistContainer}>
          <Text style={styles.bottomSheetTitle}>Video Playlist</Text>

          {/* Add URL Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.urlInput}
              placeholder="Enter video/song URL"
              placeholderTextColor="#999"
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddToPlaylist}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Playlist Items */}
          <View style={styles.playlistSection}>
            <Text style={styles.playlistSectionTitle}>
              Current Playlist ({playlist.length})
            </Text>
            <ScrollView style={styles.playlistScroll}>
              {playlist.length === 0 ? (
                <Text style={styles.emptyPlaylistText}>No videos/songs in playlist yet</Text>
              ) : (
                playlist.map((item) => {
                  const videoId = extractYouTubeVideoId(item.url);
                  const thumbnailUrl = videoId
                    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
                    : null;

                  return (
                    <View key={item.id} style={styles.playlistItem}>
                      {thumbnailUrl && (
                        <Image
                          source={{ uri: thumbnailUrl }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                        />
                      )}
                      <View style={styles.playlistItemContent}>
                        <Text style={styles.playlistItemTitle} numberOfLines={2}>
                          {item.title || 'YouTube Video'}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handlePlayVideo(item.url)}
                      >
                        <Ionicons name="play-circle" size={32} color="#4CAF50" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteFromPlaylist(item.id)}
                      >
                        <Ionicons name="trash-outline" size={28} color="#ff4444" />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </BottomSheet>

      {/* Info Bottom Sheet */}
      <BottomSheet
        visible={isInfoBottomSheetVisible}
        onClose={() => setIsInfoBottomSheetVisible(false)}
        height={350}
      >
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>Now Playing</Text>

          {/* Currently Playing Video */}
          <View style={styles.videoControlSection}>
            <Text style={styles.videoTitleText} numberOfLines={2}>
              {getCurrentVideoName()}
            </Text>
          </View>

          {/* Info Message */}
          <Text style={styles.sliderInfoText}>
            Note: Adjusting the slider will affect the video playback for all users in the room.
          </Text>

          {/* Video Progress Slider */}
          <View style={styles.sliderSection}>
            <Text style={styles.timeText}>
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 100}
              value={currentTime}
              onValueChange={(value) => {
                setIsSeeking(true);
                setCurrentTime(value);
              }}
              onSlidingComplete={(value) => {
                handleSeek(value);
                setIsSeeking(false);
              }}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#4CAF50"
            />
            <Text style={styles.timeText}>
              {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        </View>
      </BottomSheet>

      {/* Message Popup */}
      <MessagePopup
        visible={isMessagePopupVisible}
        onClose={() => setIsMessagePopupVisible(false)}
        targetUsername={selectedUser?.username}
        onSend={(message) => {
          if (selectedUser) {
            // Convert pixel position to percentage for API
            const position = formatPositionForAPI(selectedUser.x, selectedUser.y, width, height);

            // Emit throw event via WebSocket with message
            throwPlane(selectedUser.id, position.x, position.y);
            console.log('Sending message to user:', selectedUser.id, 'message:', message);
            // Send message to the target user via WebSocket
            sendMessage(selectedUser.id, message);
          }
        }}
      />

      {/* Family Image with absolute positioning */}
      <Image
        source={familyImage}
        style={styles.familyImage}
        resizeMode="contain"
      />
      <Image source={speakerImage} style={styles.tableLampImage} resizeMode="contain" />

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        visible={showExitPopup}
        onJoinBackSoon={handleJoinBackSoon}
        onJoinLater={handleJoinLater}
        onCancel={handleCancelExit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  bottomSheetContent: {
    flex: 1,
    paddingVertical: 20,
  },
  bottomSheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  actionButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonSpacing: {
    marginTop: 12,
  },
  actionButtonText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  playlistContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playlistSection: {
    flex: 1,
  },
  playlistSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  playlistScroll: {
    flex: 1,
  },
  emptyPlaylistText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  thumbnail: {
    width: 120,
    height: 68,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginRight: 12,
  },
  playlistItemContent: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  playlistItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  playButton: {
    padding: 10,
    marginRight: 8,
  },
  deleteButton: {
    padding: 10,
  },
  familyImage: {
    position: 'absolute',
    width: 180,
    height: 200,
    top: 280,
    right: 10,
  },
  tableLampImage: {
    position: 'absolute',
    width: 40,
    height: 80,
    top: 320,
    right: 10,
  },
  infoSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  videoControlSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  videoTitleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    lineHeight: 24,
  },
  sliderInfoText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 16,
  },
  sliderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 45,
    textAlign: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 50,
    padding: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  divider: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
});

export default Floor;