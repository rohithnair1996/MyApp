import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ExitConfirmationModal from './ExitConfirmationModal';

const Header = ({ navigation, playersLength, isConnected, spaceName }) => {
  const [showExitPopup, setShowExitPopup] = useState(false);

  const handleBackPress = () => {
    setShowExitPopup(true);
  };

  const handleJoinBackSoon = () => {
    setShowExitPopup(false);
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleJoinLater = () => {
    setShowExitPopup(false);
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleCancel = () => {
    setShowExitPopup(false);
  };

  return (
    <View style={styles.container}>
      {/* Decorative Elements */}
      <View style={styles.decorativePattern}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                opacity: Math.random() * 0.3 + 0.1,
              },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.leftContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          {spaceName && (
            <View style={styles.spaceNameContainer}>
              <Text style={styles.spaceName} numberOfLines={1}>{spaceName}</Text>
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          <View style={styles.statsContainer}>
            <MaterialCommunityIcons name="account-group" size={20} color={isConnected ? "#4CAF50" : "#F44336"} />
            <Text style={styles.statsText}>{playersLength || 0}</Text>
          </View>

          <TouchableOpacity style={styles.inviteButton}>
            <Ionicons name="person-add" size={18} color="#000000" />
            <Text style={styles.inviteText}>Invite</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Border Accent */}
      <View style={styles.bottomAccent}>
        <View style={styles.accentLine} />
      </View>

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        visible={showExitPopup}
        onJoinBackSoon={handleJoinBackSoon}
        onJoinLater={handleJoinLater}
        onCancel={handleCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
    position: 'relative',
    overflow: 'hidden',
  },
  decorativePattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  spaceNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  spaceName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inviteText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
  },
  accentLine: {
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.15,
    width: '30%',
  },
});

export default React.memo(Header);

