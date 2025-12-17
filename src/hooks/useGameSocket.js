import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

/**
 * Hook for managing WebSocket connection to the game server
 * @param {string} spaceId - The space ID to join (required)
 * @returns {object} Socket state and methods
 */
export const useGameSocket = (spaceId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInSpace, setIsInSpace] = useState(false);
  const [players, setPlayers] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [currentSpaceId, setCurrentSpaceId] = useState(null);
  const [incomingTomatoThrows, setIncomingTomatoThrows] = useState([]);
  const [incomingPlaneThrows, setIncomingPlaneThrows] = useState([]);
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [incomingPokes, setIncomingPokes] = useState([]);
  const socketRef = useRef(null);

  // Connect to WebSocket server and join space
  const connect = useCallback(async () => {
    if (!spaceId) {
      console.error('No spaceId provided to useGameSocket');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');

      if (!token) {
        console.error('No auth token found');
        return;
      }

      if (userData) {
        const user = JSON.parse(userData);
        setMyUserId(user.id);
      }

      console.log('Connecting to WebSocket:', API_BASE_URL);
      console.log('Will join space:', spaceId);

      // Create socket connection with auth token
      socketRef.current = io(API_BASE_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // Connection event handlers
      socketRef.current.on('connect', () => {
        console.log('Connected to game server');
        setIsConnected(true);

        // Join the space after connection
        console.log('Joining space:', spaceId);
        socketRef.current.emit('joinSpace', { spaceId });
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setIsConnected(false);
        setIsInSpace(false);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        setIsInSpace(false);
        setPlayers([]);
      });

      // Space join confirmation
      socketRef.current.on('spaceJoined', (data) => {
        console.log('Successfully joined space:', data.spaceId);
        setIsInSpace(true);
        setCurrentSpaceId(data.spaceId);
      });

      // Space leave confirmation
      socketRef.current.on('spaceLeft', (data) => {
        console.log('Left space:', data.spaceId);
        setIsInSpace(false);
        setCurrentSpaceId(null);
        setPlayers([]);
      });

      // Game event handlers
      socketRef.current.on('playersState', (data) => {
        console.log('Received players state for space:', data.spaceId);
        if (data.players) {
          setPlayers(data.players);
        }
      });

      socketRef.current.on('playerJoined', (player) => {
        console.log('Player joined space:', player.username);
        setPlayers((prevPlayers) => {
          // Check if player already exists
          const exists = prevPlayers.some(p => p.userId === player.userId);
          if (exists) {
            return prevPlayers.map(p =>
              p.userId === player.userId ? player : p
            );
          }
          return [...prevPlayers, player];
        });
      });

      socketRef.current.on('playerMoved', (player) => {
        setPlayers((prevPlayers) =>
          prevPlayers.map(p =>
            p.userId === player.userId
              ? { ...p, x: player.x, y: player.y }
              : p
          )
        );
      });

      socketRef.current.on('playerLeft', (data) => {
        console.log('Player left space:', data.username);
        setPlayers((prevPlayers) =>
          prevPlayers.filter(p => p.userId !== data.userId)
        );
      });

      socketRef.current.on('tomatoThrown', (data) => {
        console.log('Tomato thrown:', data);
        setIncomingTomatoThrows((prev) => [...prev, { ...data, id: Date.now() + Math.random() }]);
      });

      socketRef.current.on('planeThrown', (data) => {
        console.log('Plane thrown:', data);
        setIncomingPlaneThrows((prev) => [...prev, { ...data, id: Date.now() + Math.random() }]);
      });

      socketRef.current.on('messageReceived', (data) => {
        console.log('Message received:', data);
        setIncomingMessages((prev) => [...prev, { ...data, id: Date.now() + Math.random() }]);
      });

      socketRef.current.on('userPoked', (data) => {
        console.log('User poked:', data);
        setIncomingPokes((prev) => [...prev, { ...data, id: Date.now() + Math.random() }]);
      });

      socketRef.current.on('error', (data) => {
        console.error('Server error:', data);
      });

    } catch (error) {
      console.error('Error connecting to socket:', error);
    }
  }, [spaceId]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Leave space before disconnecting
      if (currentSpaceId) {
        socketRef.current.emit('leaveSpace', { spaceId: currentSpaceId });
      }
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsInSpace(false);
      setPlayers([]);
      setCurrentSpaceId(null);
    }
  }, [currentSpaceId]);

  // Leave the current space (without disconnecting)
  const leaveSpace = useCallback(() => {
    if (socketRef.current && currentSpaceId) {
      socketRef.current.emit('leaveSpace', { spaceId: currentSpaceId });
    }
  }, [currentSpaceId]);

  // Send player movement to server
  const movePlayer = useCallback((x, y) => {
    if (socketRef.current && isConnected && isInSpace) {
      socketRef.current.emit('move', {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        timestamp: Date.now(),
      });
    }
  }, [isConnected, isInSpace]);

  // Send tomato throw to server
  const throwTomato = useCallback((targetUserId, targetX, targetY) => {
    if (socketRef.current && isConnected && isInSpace) {
      socketRef.current.emit('throwTomato', {
        targetUserId,
        targetX,
        targetY,
        timestamp: Date.now(),
      });
    }
  }, [isConnected, isInSpace]);

  // Send plane throw to server
  const throwPlane = useCallback((targetUserId, targetX, targetY) => {
    if (socketRef.current && isConnected && isInSpace) {
      socketRef.current.emit('throwPlane', {
        targetUserId,
        targetX,
        targetY,
        timestamp: Date.now(),
      });
    }
  }, [isConnected, isInSpace]);

  // Send message to server
  const sendMessage = useCallback((targetUserId, message) => {
    if (socketRef.current && isConnected && isInSpace) {
      socketRef.current.emit('sendMessage', {
        targetUserId,
        message,
        timestamp: Date.now(),
      });
    }
  }, [isConnected, isInSpace]);

  // Send poke to server
  const pokeUser = useCallback((targetUserId) => {
    if (socketRef.current && isConnected && isInSpace) {
      socketRef.current.emit('pokeUser', {
        targetUserId,
        timestamp: Date.now(),
      });
    }
  }, [isConnected, isInSpace]);

  // Clear a processed tomato throw from the list
  const clearTomatoThrow = useCallback((tomatoId) => {
    setIncomingTomatoThrows((prev) => prev.filter(t => t.id !== tomatoId));
  }, []);

  // Clear a processed plane throw from the list
  const clearPlaneThrow = useCallback((planeId) => {
    setIncomingPlaneThrows((prev) => prev.filter(p => p.id !== planeId));
  }, []);

  // Clear a processed message from the list
  const clearMessage = useCallback((messageId) => {
    setIncomingMessages((prev) => prev.filter(m => m.id !== messageId));
  }, []);

  // Clear a processed poke from the list
  const clearPoke = useCallback((pokeId) => {
    setIncomingPokes((prev) => prev.filter(p => p.id !== pokeId));
  }, []);

  // Connect on mount when spaceId is available, disconnect on unmount
  useEffect(() => {
    if (spaceId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [spaceId]);

  return {
    isConnected,
    isInSpace,
    currentSpaceId,
    players,
    myUserId,
    movePlayer,
    throwTomato,
    throwPlane,
    sendMessage,
    pokeUser,
    incomingTomatoThrows,
    incomingPlaneThrows,
    incomingMessages,
    incomingPokes,
    clearTomatoThrow,
    clearPlaneThrow,
    clearMessage,
    clearPoke,
    leaveSpace,
    disconnect,
  };
};
