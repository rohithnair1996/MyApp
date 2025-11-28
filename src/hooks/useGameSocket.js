import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';

export const useGameSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState([]);
  const [myUserId, setMyUserId] = useState(null);
  const [incomingTomatoThrows, setIncomingTomatoThrows] = useState([]);
  const [incomingPlaneThrows, setIncomingPlaneThrows] = useState([]);
  const socketRef = useRef(null);

  // Connect to WebSocket server
  const connect = useCallback(async () => {
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
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
        setIsConnected(false);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      // Game event handlers
      socketRef.current.on('playersState', (data) => {
        console.log('Received players state:', data);
        if (data.players) {
          setPlayers(data.players);
        }
      });

      socketRef.current.on('playerJoined', (player) => {
        console.log('Player joined:', player);
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
        console.log('Player moved:', player);
        setPlayers((prevPlayers) =>
          prevPlayers.map(p =>
            p.userId === player.userId
              ? { ...p, x: player.x, y: player.y }
              : p
          )
        );
      });

      socketRef.current.on('playerLeft', (data) => {
        console.log('Player left:', data);
        setPlayers((prevPlayers) =>
          prevPlayers.filter(p => p.userId !== data.userId)
        );
      });

      socketRef.current.on('tomatoThrown', (data) => {
        console.log('Tomato thrown:', data);
        // Add to incoming tomato throws list
        setIncomingTomatoThrows((prev) => [...prev, { ...data, id: Date.now() + Math.random() }]);
      });

      socketRef.current.on('planeThrown', (data) => {
        console.log('Plane thrown:', data);
        // Add to incoming plane throws list
        setIncomingPlaneThrows((prev) => [...prev, { ...data, id: Date.now() + Math.random() }]);
      });

      socketRef.current.on('error', (data) => {
        console.error('Server error:', data);
      });

    } catch (error) {
      console.error('Error connecting to socket:', error);
    }
  }, []);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setPlayers([]);
    }
  }, []);

  // Send player movement to server
  const movePlayer = useCallback((x, y) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('move', {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        timestamp: Date.now(),
      });
    }
  }, [isConnected]);

  // Send tomato throw to server
  const throwTomato = useCallback((targetUserId, targetX, targetY) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('throwTomato', {
        targetUserId,
        targetX,
        targetY,
        timestamp: Date.now(),
      });
    }
  }, [isConnected]);

  // Send plane throw to server
  const throwPlane = useCallback((targetUserId, targetX, targetY) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('throwPlane', {
        targetUserId,
        targetX,
        targetY,
        timestamp: Date.now(),
      });
    }
  }, [isConnected]);

  // Clear a processed tomato throw from the list
  const clearTomatoThrow = useCallback((tomatoId) => {
    setIncomingTomatoThrows((prev) => prev.filter(t => t.id !== tomatoId));
  }, []);

  // Clear a processed plane throw from the list
  const clearPlaneThrow = useCallback((planeId) => {
    setIncomingPlaneThrows((prev) => prev.filter(p => p.id !== planeId));
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    players,
    myUserId,
    movePlayer,
    throwTomato,
    throwPlane,
    incomingTomatoThrows,
    incomingPlaneThrows,
    clearTomatoThrow,
    clearPlaneThrow,
    disconnect,
  };
};
