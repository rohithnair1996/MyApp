import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

let toastId = 0;
let addToastCallback = null;

export const showToast = ({ type = 'info', text1, text2 }) => {
  if (addToastCallback) {
    addToastCallback({ id: toastId++, type, text1, text2 });
  }
};

const ToastStack = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastCallback = (toast) => {
      setToasts((prev) => [...prev, { ...toast, opacity: new Animated.Value(0) }]);

      // Auto-hide after 4 seconds
      setTimeout(() => {
        removeToast(toast.id);
      }, 4000);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  useEffect(() => {
    // Animate in new toasts
    toasts.forEach((toast) => {
      Animated.timing(toast.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  }, [toasts]);

  const removeToast = (id) => {
    setToasts((prev) => {
      const toast = prev.find((t) => t.id === id);
      if (toast) {
        Animated.timing(toast.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setToasts((current) => current.filter((t) => t.id !== id));
        });
      }
      return prev;
    });
  };

  const getToastStyle = (type) => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'info':
      default:
        return styles.info;
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <Animated.View
          key={toast.id}
          style={[
            styles.toast,
            getToastStyle(toast.type),
            {
              opacity: toast.opacity,
              top: 80 + index * 65, // Stack toasts with 65px spacing
            },
          ]}
        >
          <View style={styles.toastContent}>
            <View style={styles.textContainer}>
              <Text style={styles.text1}>{toast.text1}</Text>
              {toast.text2 && <Text style={styles.text2}>{toast.text2}</Text>}
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => removeToast(toast.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  toastContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 2,
  },
  info: {
    backgroundColor: '#3498db',
  },
  success: {
    backgroundColor: '#2ecc71',
  },
  error: {
    backgroundColor: '#e74c3c',
  },
  text1: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  text2: {
    fontSize: 12,
    color: '#fff',
  },
});

export default ToastStack;
