import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from './constants';
import { supabase } from '../lib/supabase';

/**
 * Secure storage keys - these are stored encrypted
 */
const SECURE_KEYS = {
  USER_ID: 'secure_user_id',
  AUTH_TOKEN: 'secure_auth_token',
  REFRESH_TOKEN: 'secure_refresh_token',
} as const;

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
 * Get user ID from Supabase session
 * This ensures the user ID matches the backend database
 */
export const getUserId = async (): Promise<string> => {
  try {
    // First, try to get user ID from Supabase session (primary source of truth)
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) {
      // Prefix with supa_ to match backend user ID format
      const uid = session.user.id;
      return uid.startsWith('supa_') ? uid : `supa_${uid}`;
    }

    // Fallback: Try secure storage (for offline scenarios)
    const secureAvailable = await isSecureStoreAvailable();

    if (secureAvailable) {
      const userId = await SecureStore.getItemAsync(SECURE_KEYS.USER_ID);
      if (userId) {
        return userId;
      }
    } else {
      // Fallback to AsyncStorage if SecureStore unavailable
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      if (userId) {
        return userId;
      }
    }

    // If no session and no stored ID, throw error
    // Don't generate random IDs - they won't work with backend
    throw new Error('No user session - please sign in');
  } catch (error) {
    console.error('Error getting user ID:', error);
    throw error; // Don't silently fail - force authentication
  }
};

/**
 * Save user ID to secure storage (called after successful sign-in)
 */
export const saveUserId = async (userId: string): Promise<void> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      await SecureStore.setItemAsync(SECURE_KEYS.USER_ID, userId);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    console.log('[UserSession] User ID saved:', userId.substring(0, 15) + '...');
  } catch (error) {
    console.error('Error saving user ID:', error);
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
 * Clear all authentication tokens and user ID
 */
export const clearAuthTokens = async (): Promise<void> => {
  try {
    const secureAvailable = await isSecureStoreAvailable();
    if (secureAvailable) {
      await Promise.all([
        SecureStore.deleteItemAsync(SECURE_KEYS.USER_ID),
        SecureStore.deleteItemAsync(SECURE_KEYS.AUTH_TOKEN),
        SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN),
      ]);
    }
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};
