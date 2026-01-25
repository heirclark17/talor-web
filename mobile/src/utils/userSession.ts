import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// Generate a unique user ID (same logic as web app)
const generateUserId = (): string => {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Get or create user ID
export const getUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!userId) {
      userId = generateUserId();
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      console.log('Generated new user ID:', userId);
    }

    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    // Fallback to a temporary ID
    return generateUserId();
  }
};

// Clear user session
export const clearUserSession = async (): Promise<void> => {
  try {
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

// Save session data
export const saveSessionData = async (data: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving session data:', error);
  }
};

// Load session data
export const loadSessionData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading session data:', error);
    return null;
  }
};
