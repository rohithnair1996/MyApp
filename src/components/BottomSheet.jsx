import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const BottomSheet = ({
  visible,
  onClose,
  children,
  height = SCREEN_HEIGHT * 0.5,
  closeOnBackdropPress = true,
}) => {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeOnBackdropPress ? onClose : null}
        />
        <View
          style={[
            styles.bottomSheet,
            {
              height: height,
              paddingBottom: insets.bottom,
              marginBottom: keyboardHeight,
            },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BottomSheet;
