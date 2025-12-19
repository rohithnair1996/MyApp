import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Enable playback in silence mode (iOS)
Sound.setCategory('Playback');

// Sound file references (without extension for Android raw folder)
const SOUNDS = {
  clap: 'claps',
  jump: 'jump',
  joinRoom: 'join_room',
  laughFemale: 'laugh_female',
  laughMale: 'laugh_male',
};

// Cache for loaded sounds
const soundCache = {};

/**
 * Load a sound file and cache it
 * @param {string} soundName - Name of the sound from SOUNDS object
 * @returns {Promise<Sound>} - Loaded sound object
 */
const loadSound = (soundName) => {
  return new Promise((resolve, reject) => {
    const fileName = SOUNDS[soundName];
    if (!fileName) {
      reject(new Error(`Unknown sound: ${soundName}`));
      return;
    }

    // Return cached sound if available
    if (soundCache[soundName]) {
      resolve(soundCache[soundName]);
      return;
    }

    // For Android, load from res/raw folder (pass filename without extension)
    // For iOS, load from main bundle with extension
    const soundFile = Platform.OS === 'android' ? fileName : `${fileName}.mp3`;
    const basePath = Platform.OS === 'android' ? Sound.MAIN_BUNDLE : Sound.MAIN_BUNDLE;

    const sound = new Sound(soundFile, basePath, (error) => {
      if (error) {
        console.error(`Failed to load sound ${soundName}:`, error);
        reject(error);
        return;
      }
      soundCache[soundName] = sound;
      resolve(sound);
    });
  });
};

/**
 * Play a sound
 * @param {string} soundName - Name of the sound from SOUNDS object
 * @param {number} volume - Volume level (0.0 to 1.0), default 1.0
 */
export const playSound = async (soundName, volume = 1.0) => {
  try {
    const sound = await loadSound(soundName);
    sound.setVolume(volume);
    sound.stop(() => {
      sound.play((success) => {
        if (!success) {
          console.warn(`Sound ${soundName} playback failed`);
        }
      });
    });
  } catch (error) {
    console.error(`Error playing sound ${soundName}:`, error);
  }
};

/**
 * Play clap sound
 */
export const playClapSound = () => playSound('clap');

/**
 * Play jump sound
 */
export const playJumpSound = () => playSound('jump');

/**
 * Play join room sound
 */
export const playJoinRoomSound = () => playSound('joinRoom');

/**
 * Play laugh sound
 * @param {'male' | 'female'} gender - Gender for laugh sound
 */
export const playLaughSound = (gender = 'male') => {
  const soundName = gender === 'female' ? 'laughFemale' : 'laughMale';
  return playSound(soundName);
};

/**
 * Release all cached sounds (call on app unmount)
 */
export const releaseAllSounds = () => {
  Object.values(soundCache).forEach((sound) => {
    if (sound) {
      sound.release();
    }
  });
  Object.keys(soundCache).forEach((key) => delete soundCache[key]);
};

export default {
  playSound,
  playClapSound,
  playJoinRoomSound,
  playLaughSound,
  releaseAllSounds,
};
