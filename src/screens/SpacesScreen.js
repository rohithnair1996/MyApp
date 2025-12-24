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
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../config/api';

const SpacesScreen = ({ navigation }) => {
  const [publicSpaces, setPublicSpaces] = useState([]);
  const [privateSpaces, setPrivateSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('private'); // 'private' or 'public'

  const fetchSpaces = async () => {
    try {
      setError(null);
      const response = await api.get('/spaces');
      const data = response.data;

      if (data.success) {
        setPublicSpaces(data.publicSpaces || []);
        setPrivateSpaces(data.privateSpaces || []);
      } else {
        setError(data.error || 'Failed to fetch spaces');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Failed to fetch spaces');
      } else {
        setError('Network error. Please check your connection.');
      }
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

  const renderSpaceCard = (space, isPrivate = false) => (
    <TouchableOpacity
      key={space.id}
      activeOpacity={0.85}
      onPress={() => handleSpacePress(space)}
      style={styles.roomCard}
    >
      {/* Image Section */}
      <View style={styles.cardImageContainer}>
        {space.backgroundImage ? (
          <Image
            source={{ uri: space.backgroundImage }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#D0D0D0" />
          </View>
        )}
        {/* Gradient overlay at bottom of image */}
        <View style={styles.cardImageGradient} />

        {/* People count badge on image */}
        {space.currentPeopleCount > 0 && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{space.currentPeopleCount} here</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.cardInfo}>
        <View style={styles.cardInfoLeft}>
          <View style={styles.cardNameRow}>
            <Text style={styles.roomName} numberOfLines={1}>{space.name}</Text>
            {isPrivate && (
              <View style={styles.privateBadge}>
                <Ionicons name="heart" size={12} color="#E8A0A0" />
              </View>
            )}
          </View>
          <Text style={styles.roomSubtitle} numberOfLines={1}>
            {space.currentPeopleCount > 0
              ? `${space.currentPeopleCount} ${space.currentPeopleCount === 1 ? 'person' : 'people'} present`
              : 'Quiet right now'}
          </Text>
        </View>
        <View style={styles.cardInfoRight}>
          <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />
        <ActivityIndicator size="large" color="#2C2C2C" />
        <Text style={styles.loadingText}>Finding spaces...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />
        <View style={styles.errorIconContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#AAAAAA" />
        </View>
        <Text style={styles.errorTitle}>Connection issue</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchSpaces} activeOpacity={0.8}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />

      {/* Decorative background element */}
      <View style={styles.decorativeCircle} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Spaces</Text>
          <Text style={styles.subtitle}>Find a place to be</Text>
        </View>
        <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
          <Ionicons name="person-outline" size={22} color="#5A5A5A" />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'private' && styles.activeTab]}
          onPress={() => setActiveTab('private')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'private' ? 'heart' : 'heart-outline'}
            size={18}
            color={activeTab === 'private' ? '#2C2C2C' : '#999999'}
          />
          <Text style={[styles.tabText, activeTab === 'private' && styles.activeTabText]}>
            Friends
          </Text>
          {privateSpaces.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'private' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'private' && styles.activeTabBadgeText]}>
                {privateSpaces.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'public' && styles.activeTab]}
          onPress={() => setActiveTab('public')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'public' ? 'compass' : 'compass-outline'}
            size={18}
            color={activeTab === 'public' ? '#2C2C2C' : '#999999'}
          />
          <Text style={[styles.tabText, activeTab === 'public' && styles.activeTabText]}>
            Explore
          </Text>
          {publicSpaces.length > 0 && (
            <View style={[styles.tabBadge, activeTab === 'public' && styles.activeTabBadge]}>
              <Text style={[styles.tabBadgeText, activeTab === 'public' && styles.activeTabBadgeText]}>
                {publicSpaces.length}
              </Text>
            </View>
          )}
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
            tintColor="#999999"
            colors={['#2C2C2C']}
          />
        }
      >
        {/* Private Spaces */}
        {activeTab === 'private' && (
          <>
            {privateSpaces.length > 0 ? (
              <View style={styles.section}>
                {privateSpaces.map((space) => renderSpaceCard(space, true))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="heart-outline" size={40} color="#CCCCCC" />
                </View>
                <Text style={styles.emptyStateText}>No friend spaces yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Private spaces with friends will appear here
                </Text>
              </View>
            )}
          </>
        )}

        {/* Public Spaces */}
        {activeTab === 'public' && (
          <>
            {publicSpaces.length > 0 ? (
              <View style={styles.section}>
                {publicSpaces.map((space) => renderSpaceCard(space, false))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="compass-outline" size={40} color="#CCCCCC" />
                </View>
                <Text style={styles.emptyStateText}>No spaces available</Text>
                <Text style={styles.emptyStateSubtext}>
                  Pull down to check again
                </Text>
              </View>
            )}
          </>
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
    backgroundColor: '#FAFAF9',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#F0EDE8',
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#7A7A7A',
    fontSize: 15,
    marginTop: 20,
    fontWeight: '400',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#FAFAF9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F4F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  errorText: {
    color: '#8A8A8A',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#2C2C2C',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2C2C2C',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8A8A8A',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#F5F4F2',
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999999',
  },
  activeTabText: {
    color: '#2C2C2C',
  },
  tabBadge: {
    backgroundColor: '#E8E6E3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#2C2C2C',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999999',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
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
  roomCard: {
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  cardImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#F5F4F2',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0EDE8',
  },
  cardImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'transparent',
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7CB47C',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A5A5A',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardInfoLeft: {
    flex: 1,
    marginRight: 12,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    letterSpacing: 0.2,
  },
  privateBadge: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomSubtitle: {
    fontSize: 13,
    color: '#8A8A8A',
    marginTop: 3,
  },
  cardInfoRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F4F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#5A5A5A',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default SpacesScreen;
