import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SpacesScreen = ({ navigation }) => {
  const rooms = [
    {
      id: '1',
      name: 'Virtual Room',
      subtitle: 'The main party hub',
      icon: 'rocket',
      active: true,
      members: 12,
    },
    {
      id: '2',
      name: 'Chill Lounge',
      subtitle: 'Relax and unwind',
      icon: 'coffee',
      active: false,
      members: 8,
    },
    {
      id: '3',
      name: 'Dance Bay',
      subtitle: 'Move to the rhythm',
      icon: 'music',
      active: false,
      members: 24,
    },
    {
      id: '4',
      name: 'Audio Circle',
      subtitle: 'Voice-only vibes',
      icon: 'headphones',
      active: false,
      members: 6,
    },
    {
      id: '5',
      name: 'Afterglow',
      subtitle: 'Late night talks',
      icon: 'moon',
      active: false,
      members: 4,
    },
  ];

  const handleRoomPress = (room) => {
    if (room.active) {
      navigation.navigate('Floor');
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      rocket: 'rocket-launch',
      coffee: 'coffee',
      music: 'music-note',
      headphones: 'headset',
      moon: 'moon',
    };
    return iconMap[iconName] || 'star';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Animated Background Pattern */}
      <View style={styles.backgroundPattern}>
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                opacity: Math.random() * 0.15 + 0.05,
              },
            ]}
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <View
            key={`burst-${i}`}
            style={[
              styles.lightBurst,
              {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                opacity: Math.random() * 0.08 + 0.02,
              },
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Spaces</Text>
          <Text style={styles.subtitle}>Choose your destination</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={36} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Room Cards */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            activeOpacity={room.active ? 0.7 : 0.95}
            onPress={() => handleRoomPress(room)}
            style={[
              styles.roomCard,
              !room.active && styles.roomCardDisabled,
            ]}
          >
            <View style={styles.cardContent}>
              <View style={styles.cardLeft}>
                <View style={[
                  styles.iconContainer,
                  room.active && styles.iconContainerActive,
                ]}>
                  <Ionicons
                    name={getIconComponent(room.icon)}
                    size={32}
                    color={room.active ? '#000000' : '#666666'}
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={[
                    styles.roomName,
                    !room.active && styles.roomNameDisabled,
                  ]}>
                    {room.name}
                  </Text>
                  <Text style={styles.roomSubtitle}>{room.subtitle}</Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={styles.membersBadge}>
                  <MaterialCommunityIcons
                    name="account-group"
                    size={16}
                    color={room.active ? '#FFFFFF' : '#666666'}
                  />
                  <Text style={[
                    styles.membersText,
                    !room.active && styles.membersTextDisabled,
                  ]}>
                    {room.members}
                  </Text>
                </View>
                {room.active && (
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                )}
              </View>
            </View>

            {/* Geometric Accent Lines */}
            {room.active && (
              <View style={styles.accentLines}>
                <View style={styles.accentLine1} />
                <View style={styles.accentLine2} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundPattern: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  confetti: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  lightBurst: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1000,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#999999',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  roomCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginBottom: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  roomCardDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#3A3A3A',
  },
  iconContainerActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  cardText: {
    flex: 1,
  },
  roomName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  roomNameDisabled: {
    color: '#666666',
  },
  roomSubtitle: {
    fontSize: 14,
    color: '#888888',
    letterSpacing: 0.3,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  membersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  membersTextDisabled: {
    color: '#666666',
  },
  accentLines: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  accentLine1: {
    width: 100,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
    marginBottom: 8,
  },
  accentLine2: {
    width: 60,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.15,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default SpacesScreen;
