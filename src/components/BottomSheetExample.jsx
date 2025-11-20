import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import BottomSheet from './BottomSheet';

const BottomSheetExample = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Button title="Open Bottom Sheet" onPress={() => setIsVisible(true)} />

      <BottomSheet
        visible={isVisible}
        onClose={() => setIsVisible(false)}
        height={300}
        closeOnBackdropPress={true}
      >
        <Text style={styles.title}>Bottom Sheet Content</Text>
        <Text style={styles.description}>
          This is a simple custom bottom sheet without animations.
        </Text>
        <Button title="Close" onPress={() => setIsVisible(false)} />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
});

export default BottomSheetExample;
