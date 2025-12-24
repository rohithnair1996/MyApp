import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#2C2C2C',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8A8A8A',
    marginTop: 4,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#F5F4F2',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#AAAAAA',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginLeft: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#FFFFFF',
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EDE8',
  },
  buttonActive: {
    backgroundColor: '#2C2C2C',
    borderColor: '#2C2C2C',
    shadowOpacity: 0.15,
  },
  buttonText: {
    fontSize: 22,
  },
  // Movement buttons - subtle warm tones
  runButton: {
    backgroundColor: '#FFF8F5',
    borderColor: '#F5E6E0',
  },
  jumpButton: {
    backgroundColor: '#F8F5FF',
    borderColor: '#E8E0F5',
  },
  danceButton: {
    backgroundColor: '#FFFAF5',
    borderColor: '#F5EBE0',
  },
  // Action buttons - subtle cool tones
  waveButton: {
    backgroundColor: '#F5FFF8',
    borderColor: '#E0F5E6',
  },
  clapButton: {
    backgroundColor: '#F5F8FF',
    borderColor: '#E0E6F5',
  },
  // Emotion buttons - muted pastel tones
  sadButton: {
    backgroundColor: '#F5FBFF',
    borderColor: '#E0EEF5',
  },
  angryButton: {
    backgroundColor: '#FFF5F5',
    borderColor: '#F5E0E0',
  },
  romanceButton: {
    backgroundColor: '#FFF5FA',
    borderColor: '#F5E0EB',
  },
  // Speech button
  speechButton: {
    backgroundColor: '#FAF5FF',
    borderColor: '#EBE0F5',
  },
});
