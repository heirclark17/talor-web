import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { STORAGE_KEYS } from './constants';

/**
 * Secure storage keys - these are stored encrypted
 */
const SECURE_KEYS = {
  USER_ID: 'secure_user_id',
  AUTH_TOKEN: 'secure_auth_token',
  REFRESH_TOKEN: 'secure_refresh_token',
} as const;

/**
 * Generate a cryptographically secure UUID v4
 * Uses expo-crypto for secure random generation
 * Format: user_XXXXXXXX-XXXX-4XXX-YXXX-XXXXXXXXXXXX
 */
const generateUserId = async (): Promise<string> => {
  // Generate 16 random bytes using cryptographically secure RNG
  const randomBytes = await Crypto.getRandomBytesAsync(16);

  // Convert to hex string
  const hex = Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Format as UUID v4
  const uuid = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '4' + hex.slice(13, 16), // Version 4
    ((parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hex.slice(18, 20), // Variant
    hex.slice(20, 32),
  ].join('-');

  return 'user_' + uuid;
};

/**
 * Check if secure storage is available on this device
 */
const isSecureStoreAvailable = async (): Promise<boolean> => {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

/**
 * Get or create user ID using secure storage
 * Falls back to AsyncStorage if SecureStore is unavailable
 */
export const getUserId = async (): Promise<string> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();

    if (secureAvailable) {
      // Try to get from secure storage first
      let userId = await SecureStore.getItemAsync(SECURE_KEYS.USER_ID);

      if (!userId) {
        // Check if there's an old ID in AsyncStorage to migrate
        const legacyId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
        if (legacyId) {
          // Migrate to secure storage
          await SecureStore.setItemAsync(SECURE_KEYS.USER_ID, legacyId);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
          userId = legacyId;
          console.log('Migrated user ID to secure storage');
        } else {
          // Generate new secure ID
          userId = await generateUserId();
          await SecureStore.setItemAsync(SECURE_KEYS.USER_ID, userId);
          console.log('Generated new secure user ID');
        }
      }

      return userId;
    } else {
      // Fallback to AsyncStorage if SecureStore unavailable
      let userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

      if (!userId) {
        userId = await generateUserId();
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
        console.log('Generated new user ID (AsyncStorage fallback)');
      }

      return userId;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Generate a temporary ID as last resort
    return await generateUserId();
  }
};

/**
 * Clear all user session data from both secure and regular storage
 */
export const clearUserSession = async (): Promise<void> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();

    // Clear secure storage
    if (secureAvailable) {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_KEYS.USER_ID),
        SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      ]);
    }

    // Clear regular storage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.SESSION_DATA,
      STORAGE_KEYS.LAST_TAILORED_RESUME,
    ]);

    console.log('User session cleared');
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
};

/**
 * Save non-sensitive session data to AsyncStorage
 * For sensitive data like tokens, use saveAuthToken instead
 */
export const saveSessionData = async (data: Record<string, unknown>): Promise<void> => {
  try {
    // Sanitize data - remove any sensitive fields that should use secure storage
    const sanitizedData = { ...data };
    delete sanitizedData.token;
    delete sanitizedData.authToken;
    delete sanitizedData.refreshToken;
    delete sanitizedData.password;

    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(sanitizedData));
  } catch (error) {
    console.error('Error saving session data:', error);
  }
};

/**
 * Load non-sensitive session data from AsyncStorage
 */
export const loadSessionData = async (): Promise<Record<string, unknown> | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading session data:', error);
    return null;
  }
};

/**
 * Securely save authentication token
 */
export const saveAuthToken = async (token: string): Promise<boolean> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      await SecureStore.setItemAsync(SECURE_KEYS.AUTH_TOKEN, token);
      return true;
    } else {
      console.warn('SecureStore not available - auth token not saved');
      return false;
    }
  } catch (error) {
    console.error('Error saving auth token:', error);
    return false;
  }
};

/**
 * Retrieve authentication token from secure storage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      return await SecureStore.getItemAsync(SECURE_KEYS.AUTH_TOKEN);
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Securely save refresh token
 */
export const saveRefreshToken = async (token: string): Promise<boolean> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, token);
      return true;
    } else {
      console.warn('SecureStore not available - refresh token not saved');
      return false;
    }
  } catch (error) {
    console.error('Error saving refresh token:', error);
    return false;
  }
};

/**
 * Retrieve refresh token from secure storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      return await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    }
    return null;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Clear all authentication tokens
 */
export const clearAuthTokens = async (): Promise<void> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      ]);
    }
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};
