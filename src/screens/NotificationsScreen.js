import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    name: 'Divya',
    action: 'threw a tomato at you',
    time: '2 min ago',
    avatar: 'https://randomuser.me/api/portraits/women/23.jpg',
    read: false,
  },
  {
    id: '2',
    name: 'Akhila',
    action: 'buzzed you',
    time: '15 min ago',
    avatar: 'https://randomuser.me/api/portraits/women/45.jpg',
    read: false,
  },
  {
    id: '3',
    name: 'Neethu',
    action: 'invited you to Kochi Alambans',
    time: '1 hour ago',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    read: false,
  },
  {
    id: '4',
    name: 'Sreejith',
    action: 'sent you a virtual hug',
    time: '2 hours ago',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    read: false,
  },
  {
    id: '5',
    name: 'Anjali',
    action: 'reacted with fire to your status',
    time: '2 hours ago',
    avatar: 'https://randomuser.me/api/portraits/women/19.jpg',
    read: false,
  },
  {
    id: '6',
    name: 'Jiju',
    action: 'invited you to KKR Fans Association',
    time: '3 hours ago',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    read: true,
  },
  {
    id: '7',
    name: 'Rahul',
    action: 'waved at you',
    time: '5 hours ago',
    avatar: 'https://randomuser.me/api/portraits/men/15.jpg',
    read: true,
  },
  {
    id: '8',
    name: 'Priya',
    action: 'sent you a heart',
    time: 'Yesterday',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    read: true,
  },
  {
    id: '9',
    name: 'Arun',
    action: 'joined your space',
    time: 'Yesterday',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    read: true,
  },
  {
    id: '10',
    name: 'Meera',
    action: 'poked you',
    time: 'Yesterday',
    avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
    read: true,
  },
  {
    id: '11',
    name: 'Vishnu',
    action: 'mentioned you in Tech Enthusiasts',
    time: '2 days ago',
    avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
    read: true,
  },
  {
    id: '12',
    name: 'Lakshmi',
    action: 'started following you',
    time: '2 days ago',
    avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
    read: true,
  },
  {
    id: '13',
    name: 'Kiran',
    action: 'threw a snowball at you',
    time: '3 days ago',
    avatar: 'https://randomuser.me/api/portraits/men/48.jpg',
    read: true,
  },
  {
    id: '14',
    name: 'Deepa',
    action: 'invited you to Movie Buffs Club',
    time: '3 days ago',
    avatar: 'https://randomuser.me/api/portraits/women/42.jpg',
    read: true,
  },
  {
    id: '15',
    name: 'Sandeep',
    action: 'gave you a high five',
    time: '4 days ago',
    avatar: 'https://randomuser.me/api/portraits/men/11.jpg',
    read: true,
  },
  {
    id: '16',
    name: 'Reshma',
    action: 'commented on your moment',
    time: '5 days ago',
    avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
    read: true,
  },
  {
    id: '17',
    name: 'Ajay',
    action: 'cheered for you',
    time: '1 week ago',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    read: true,
  },
  {
    id: '18',
    name: 'Sneha',
    action: 'sent you a coffee',
    time: '1 week ago',
    avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
    read: true,
  },
];

const NotificationsScreen = ({ navigation }) => {
  const unreadCount = DUMMY_NOTIFICATIONS.filter(n => !n.read).length;

  const renderNotification = (notification) => (
    <TouchableOpacity
      key={notification.id}
      style={[
        styles.notificationItem,
        !notification.read && styles.notificationUnread,
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: notification.avatar }}
          style={styles.avatar}
        />
        {!notification.read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>
          <Text style={styles.nameText}>{notification.name}</Text>
          {' '}{notification.action}
        </Text>
        <Text style={styles.timeText}>{notification.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#6366F1" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Notifications List or Empty State */}
      {DUMMY_NOTIFICATIONS.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#8B5CF6" />
          </View>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            When someone interacts with you, you'll see it here
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Unread Section */}
          {unreadCount > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New</Text>
              {DUMMY_NOTIFICATIONS.filter(n => !n.read).map(renderNotification)}
            </View>
          )}

          {/* Read Section */}
          {DUMMY_NOTIFICATIONS.filter(n => n.read).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Earlier</Text>
              {DUMMY_NOTIFICATIONS.filter(n => n.read).map(renderNotification)}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  headerBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
    marginLeft: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationUnread: {
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#C4B5FD',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E0E7FF',
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#7C3AED',
    borderWidth: 2,
    borderColor: '#EDE9FE',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 15,
    color: '#1E1B4B',
    lineHeight: 22,
  },
  nameText: {
    fontWeight: '600',
  },
  timeText: {
    fontSize: 13,
    color: '#8B5CF6',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 40,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default NotificationsScreen;
