import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const INITIAL_USER_DATA = {
  name: 'Rohith Kumar',
  email: 'rohith.kumar@example.com',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  joinedDate: 'December 2024',
  spacesCreated: 3,
  friendsCount: 24,
};

const ProfileScreen = ({ navigation }) => {
  // User data state
  const [userData, setUserData] = useState(INITIAL_USER_DATA);

  // Edit Profile Modal state
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [editName, setEditName] = useState(userData.name);
  const [editEmail, setEditEmail] = useState(userData.email);
  const [editLoading, setEditLoading] = useState(false);

  // Change Password Modal state
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notifications Modal state
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  // Image Viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    soundEnabled: true,
    vibrationEnabled: false,
    friendRequests: true,
    spaceInvites: true,
    mentions: true,
    activityUpdates: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  // Edit Profile handlers
  const openEditProfile = () => {
    setEditName(userData.name);
    setEditEmail(userData.email);
    setEditProfileVisible(true);
  };

  const closeEditProfile = () => {
    setEditProfileVisible(false);
    setEditName(userData.name);
    setEditEmail(userData.email);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setEditLoading(true);

    // Simulate API call
    setTimeout(() => {
      setUserData(prev => ({
        ...prev,
        name: editName.trim(),
        email: editEmail.trim(),
      }));
      setEditLoading(false);
      setEditProfileVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    }, 1000);
  };

  // Change Password handlers
  const openChangePassword = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setChangePasswordVisible(true);
  };

  const closeChangePassword = () => {
    setChangePasswordVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    // Simulate API call
    setTimeout(() => {
      setPasswordLoading(false);
      setChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully');
    }, 1000);
  };

  // Notifications handlers
  const openNotifications = () => {
    setNotificationsVisible(true);
  };

  const closeNotifications = () => {
    setNotificationsVisible(false);
  };

  const toggleNotificationSetting = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const NotificationToggle = ({ icon, label, description, settingKey }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationIconContainer}>
        <Ionicons name={icon} size={20} color="#7C3AED" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationLabel}>{label}</Text>
        {description && <Text style={styles.notificationDescription}>{description}</Text>}
      </View>
      <Switch
        value={notificationSettings[settingKey]}
        onValueChange={() => toggleNotificationSetting(settingKey)}
        trackColor={{ false: '#E0E7FF', true: '#C4B5FD' }}
        thumbColor={notificationSettings[settingKey] ? '#7C3AED' : '#FFFFFF'}
        ios_backgroundColor="#E0E7FF"
      />
    </View>
  );

  const MenuItem = ({ icon, label, value, onPress, showChevron = true, danger = false }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[styles.menuIconContainer, danger && styles.menuIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? '#DC2626' : '#7C3AED'} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {showChevron && (
        <Ionicons name="chevron-forward" size={20} color="#C4B5FD" />
      )}
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setImageViewerVisible(true)}
            >
              <Image
                source={{ uri: userData.avatar }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.editAvatarButton} activeOpacity={0.7}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userEmail}>{userData.email}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.spacesCreated}</Text>
              <Text style={styles.statLabel}>Spaces</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userData.friendsCount}</Text>
              <Text style={styles.statLabel}>Friends</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Dec '24</Text>
              <Text style={styles.statLabel}>Joined</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              onPress={openEditProfile}
            />
            <MenuItem
              icon="mail-outline"
              label="Email"
              value={userData.email}
              showChevron={false}
            />
            <MenuItem
              icon="lock-closed-outline"
              label="Change Password"
              onPress={openChangePassword}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={openNotifications}
            />
            <MenuItem
              icon="moon-outline"
              label="Appearance"
              value="Light"
              onPress={() => {}}
            />
            <MenuItem
              icon="language-outline"
              label="Language"
              value="English"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => {}}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              showChevron={false}
              danger
            />
          </View>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditProfile}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboardView}
        >
          <TouchableWithoutFeedback onPress={closeEditProfile}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>
                    <TouchableOpacity onPress={closeEditProfile} activeOpacity={0.7}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    {/* Avatar Preview */}
                    <View style={styles.modalAvatarContainer}>
                      <Image
                        source={{ uri: userData.avatar }}
                        style={styles.modalAvatar}
                      />
                      <TouchableOpacity style={styles.modalEditAvatarButton} activeOpacity={0.7}>
                        <Ionicons name="camera" size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Name</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Enter your name"
                        placeholderTextColor="#A5B4FC"
                      />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editEmail}
                        onChangeText={setEditEmail}
                        placeholder="Enter your email"
                        placeholderTextColor="#A5B4FC"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeEditProfile}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, editLoading && styles.saveButtonDisabled]}
                      onPress={handleSaveProfile}
                      activeOpacity={0.8}
                      disabled={editLoading}
                    >
                      {editLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={changePasswordVisible}
        transparent
        animationType="fade"
        onRequestClose={closeChangePassword}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalKeyboardView}
        >
          <TouchableWithoutFeedback onPress={closeChangePassword}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Change Password</Text>
                    <TouchableOpacity onPress={closeChangePassword} activeOpacity={0.7}>
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Current Password</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="Enter current password"
                          placeholderTextColor="#A5B4FC"
                          secureTextEntry={!showCurrentPassword}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8B5CF6"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>New Password</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Enter new password"
                          placeholderTextColor="#A5B4FC"
                          secureTextEntry={!showNewPassword}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowNewPassword(!showNewPassword)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8B5CF6"
                          />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.inputHint}>Must be at least 6 characters</Text>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Confirm New Password</Text>
                      <View style={styles.passwordInputContainer}>
                        <TextInput
                          style={styles.passwordInput}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Confirm new password"
                          placeholderTextColor="#A5B4FC"
                          secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                          style={styles.eyeButton}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color="#8B5CF6"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeChangePassword}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, passwordLoading && styles.saveButtonDisabled]}
                      onPress={handleChangePassword}
                      activeOpacity={0.8}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>Update</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={closeNotifications}
      >
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback onPress={closeNotifications}>
            <View style={styles.modalBackdropTouchable} />
          </TouchableWithoutFeedback>
          <View style={styles.notificationModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={closeNotifications} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.notificationScrollView}
              showsVerticalScrollIndicator={true}
              bounces={true}
              nestedScrollEnabled={true}
            >
              {/* General Section */}
              <View style={styles.notificationSection}>
                <Text style={styles.notificationSectionTitle}>General</Text>
                <NotificationToggle
                  icon="notifications"
                  label="Push Notifications"
                  description="Receive push notifications on your device"
                  settingKey="pushEnabled"
                />
                <NotificationToggle
                  icon="mail"
                  label="Email Notifications"
                  description="Receive notifications via email"
                  settingKey="emailEnabled"
                />
                <NotificationToggle
                  icon="volume-high"
                  label="Sound"
                  description="Play sound for notifications"
                  settingKey="soundEnabled"
                />
                <NotificationToggle
                  icon="phone-portrait"
                  label="Vibration"
                  description="Vibrate for notifications"
                  settingKey="vibrationEnabled"
                />
              </View>

              {/* Activity Section */}
              <View style={styles.notificationSection}>
                <Text style={styles.notificationSectionTitle}>Activity</Text>
                <NotificationToggle
                  icon="person-add"
                  label="Friend Requests"
                  description="When someone sends you a friend request"
                  settingKey="friendRequests"
                />
                <NotificationToggle
                  icon="enter"
                  label="Space Invites"
                  description="When you're invited to a space"
                  settingKey="spaceInvites"
                />
                <NotificationToggle
                  icon="at"
                  label="Mentions"
                  description="When someone mentions you"
                  settingKey="mentions"
                />
                <NotificationToggle
                  icon="pulse"
                  label="Activity Updates"
                  description="Updates about activity in your spaces"
                  settingKey="activityUpdates"
                />
              </View>
            </ScrollView>

            <View style={styles.notificationFooter}>
              <TouchableOpacity
                style={styles.notificationSaveButton}
                onPress={() => {
                  closeNotifications();
                  Alert.alert('Success', 'Notification settings saved');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.imageViewerCloseButton}
            onPress={() => setImageViewerVisible(false)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Zoomable Image */}
          <ScrollView
            style={styles.imageViewerScrollView}
            contentContainerStyle={styles.imageViewerScrollContent}
            maximumZoomScale={5}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            centerContent={true}
            bouncesZoom={true}
          >
            <Image
              source={{ uri: userData.avatar }}
              style={styles.imageViewerImage}
              resizeMode="contain"
            />
          </ScrollView>

          {/* User Name */}
          <View style={styles.imageViewerFooter}>
            <Text style={styles.imageViewerName}>{userData.name}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1B4B',
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E7FF',
    borderWidth: 4,
    borderColor: '#EDE9FE',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EDE9FE',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EDE9FE',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIconDanger: {
    backgroundColor: '#FEE2E2',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E1B4B',
  },
  menuLabelDanger: {
    color: '#DC2626',
  },
  menuValue: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#A5B4FC',
    marginTop: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal Styles
  modalKeyboardView: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    minWidth: 320,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  modalBody: {
    padding: 24,
  },
  modalAvatarContainer: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 24,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E7FF',
    borderWidth: 3,
    borderColor: '#EDE9FE',
  },
  modalEditAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E1B4B',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E1B4B',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputHint: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 6,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Notification Modal Styles
  modalBackdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  notificationModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  notificationScrollView: {
    flexGrow: 0,
  },
  notificationSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  notificationSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 12,
  },
  notificationLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E1B4B',
  },
  notificationDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  notificationFooter: {
    padding: 24,
    paddingTop: 8,
  },
  notificationSaveButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Image Viewer Styles
  imageViewerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  imageViewerCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerScrollView: {
    flex: 1,
  },
  imageViewerScrollContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  imageViewerFooter: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  imageViewerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
});

export default ProfileScreen;
