import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../config/api';

const CreateSpaceScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('private');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter a space name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = {
        name: name.trim(),
        type,
      };

      if (backgroundImage.trim()) {
        body.backgroundImage = backgroundImage.trim();
      }

      const response = await api.post('/spaces', body);

      if (response.data.success) {
        navigation.goBack();
      } else {
        setError(response.data.error || 'Failed to create space');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.error || 'Failed to create space');
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidImageUrl = backgroundImage.trim().startsWith('http');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF9" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Space</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro Text */}
          <Text style={styles.introText}>
            Create a space where you and others can gather peacefully.
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Space Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Give your space a name"
              placeholderTextColor="#AAAAAA"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          {/* Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Visibility</Text>
            <View style={styles.typeContainer}>
              <TouchableOpacity
                style={[styles.typeOption, type === 'private' && styles.typeOptionActive]}
                onPress={() => setType('private')}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIcon, type === 'private' && styles.typeIconActive]}>
                  <Ionicons
                    name="heart"
                    size={20}
                    color={type === 'private' ? '#FFFFFF' : '#999999'}
                  />
                </View>
                <Text style={[styles.typeTitle, type === 'private' && styles.typeTitleActive]}>
                  Friends Only
                </Text>
                <Text style={styles.typeDescription}>
                  A private space for close connections
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOption, type === 'public' && styles.typeOptionActive]}
                onPress={() => setType('public')}
                activeOpacity={0.7}
              >
                <View style={[styles.typeIcon, type === 'public' && styles.typeIconActive]}>
                  <Ionicons
                    name="compass"
                    size={20}
                    color={type === 'public' ? '#FFFFFF' : '#999999'}
                  />
                </View>
                <Text style={[styles.typeTitle, type === 'public' && styles.typeTitleActive]}>
                  Public
                </Text>
                <Text style={styles.typeDescription}>
                  Open for anyone to discover
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Background Image Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Background Image</Text>
            <Text style={styles.labelHint}>Optional - paste an image URL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#AAAAAA"
              value={backgroundImage}
              onChangeText={setBackgroundImage}
              autoCapitalize="none"
              keyboardType="url"
            />

            {/* Image Preview */}
            {isValidImageUrl && (
              <View style={styles.imagePreview}>
                <Image
                  source={{ uri: backgroundImage }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setBackgroundImage('')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={18} color="#D07070" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Spacer */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Create Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.createButton, loading && styles.createButtonDisabled]}
            onPress={handleCreate}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add" size={22} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Create Space</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  headerRight: {
    width: 44,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },
  introText: {
    fontSize: 15,
    color: '#8A8A8A',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 10,
  },
  labelHint: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: -6,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2C2C2C',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#EEEEEE',
  },
  typeOptionActive: {
    borderColor: '#2C2C2C',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F4F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIconActive: {
    backgroundColor: '#2C2C2C',
  },
  typeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A5A5A',
    marginBottom: 4,
  },
  typeTitleActive: {
    color: '#2C2C2C',
  },
  typeDescription: {
    fontSize: 12,
    color: '#AAAAAA',
    lineHeight: 16,
  },
  imagePreview: {
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F0EDE8',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D07070',
  },
  spacer: {
    height: 40,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FAFAF9',
    borderTopWidth: 1,
    borderTopColor: '#F0EDE8',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2C',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2C2C2C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CreateSpaceScreen;
