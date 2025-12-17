import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ImageBackground,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { authFetch } from '../config/api';

const SpacesScreen = ({ navigation }) => {
  const [publicSpaces, setPublicSpaces] = useState([]);
  const [privateSpaces, setPrivateSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSpaces = async () => {
    try {
      setError(null);
      const response = await authFetch('/spaces');
      const data = await response.json();

      if (data.success) {
        setPublicSpaces(data.publicSpaces || []);
        setPrivateSpaces(data.privateSpaces || []);
      } else {
        setError(data.error || 'Failed to fetch spaces');
      }
    } catch (err) {
      console.error('Error fetching spaces:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSpaces();
  };

  const handleSpacePress = (space) => {
    navigation.navigate('Floor', { spaceId: space.id, spaceName: space.name });
  };

  const getSpaceIcon = (spaceName) => {
    const name = spaceName.toLowerCase();
    if (name.includes('lobby') || name.includes('main')) return 'business';
    if (name.includes('cafe') || name.includes('coffee')) return 'cafe';
    if (name.includes('park') || name.includes('garden')) return 'leaf';
    if (name.includes('beach') || name.includes('ocean')) return 'sunny';
    if (name.includes('office') || name.includes('work')) return 'briefcase';
    if (name.includes('lounge') || name.includes('chill')) return 'wine';
    if (name.includes('music') || name.includes('dance')) return 'musical-notes';
    return 'globe';
  };

  const renderSpaceCard = (space, isPrivate = false) => (
    <TouchableOpacity
      key={space.id}
      activeOpacity={0.7}
      onPress={() => handleSpacePress(space)}
      style={styles.roomCard}
    >
      <ImageBackground
        source={{ uri: space.backgroundImage }}
        style={styles.cardBackground}
        imageStyle={styles.cardBackgroundImage}
      >
        <View style={styles.cardOverlay}>
          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getSpaceIcon(space.name)}
                  size={28}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.cardText}>
                <View style={styles.nameRow}>
                  <Text style={styles.roomName}>{space.name}</Text>
                  {isPrivate && (
                    <View style={styles.privateBadge}>
                      <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <Text style={styles.roomSubtitle}>
                  {space.currentPeopleCount > 0
                    ? `${space.currentPeopleCount} ${space.currentPeopleCount === 1 ? 'person' : 'people'} here`
                    : 'No one here yet'}
                </Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <View style={styles.membersBadge}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.membersText}>{space.currentPeopleCount}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading spaces...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Ionicons name="cloud-offline" size={64} color="#666666" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSpaces}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={['#FFFFFF']}
          />
        }
      >
        {/* Public Spaces Section */}
        {publicSpaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="globe-outline" size={20} color="#999999" />
              <Text style={styles.sectionTitle}>Public Spaces</Text>
            </View>
            {publicSpaces.map((space) => renderSpaceCard(space, false))}
          </View>
        )}

        {/* Private Spaces Section */}
        {privateSpaces.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color="#999999" />
              <Text style={styles.sectionTitle}>Private Spaces</Text>
            </View>
            {privateSpaces.map((space) => renderSpaceCard(space, true))}
          </View>
        )}

        {/* Empty State */}
        {publicSpaces.length === 0 && privateSpaces.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="planet-outline" size={64} color="#666666" />
            <Text style={styles.emptyStateText}>No spaces available</Text>
            <Text style={styles.emptyStateSubtext}>
              Pull down to refresh
            </Text>
          </View>
        )}

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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
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
    paddingBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roomCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardBackground: {
    width: '100%',
    height: 120,
  },
  cardBackgroundImage: {
    borderRadius: 18,
  },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    justifyContent: 'center',
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
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  privateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  membersText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#555555',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default SpacesScreen;
