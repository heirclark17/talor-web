/**
 * Unit tests for userSession utilities
 * Tests all exported functions from userSession.ts
 */

const mockGetSession = jest.fn().mockResolvedValue({ data: { session: null }, error: null });

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  getUserId,
  clearUserSession,
  saveSessionData,
  loadSessionData,
  saveAuthToken,
  getAuthToken,
  saveRefreshToken,
  getRefreshToken,
  clearAuthTokens,
} from '../userSession';
import { STORAGE_KEYS } from '../constants';

// Cast mocks for easy access
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('userSession utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: SecureStore is available
    mockSecureStore.isAvailableAsync.mockResolvedValue(true);
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.setItemAsync.mockResolvedValue();
    mockSecureStore.deleteItemAsync.mockResolvedValue();
    (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (mockAsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (mockAsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (mockAsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
    // Default: no Supabase session
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
  });

  // =============================================
  // getUserId
  // =============================================
  describe('getUserId', () => {
    it('should return supa_ prefixed ID from Supabase session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'abc-123-uuid' } } },
        error: null,
      });

      const userId = await getUserId();

      expect(userId).toBe('supa_abc-123-uuid');
    });

    it('should return ID as-is if already prefixed with supa_', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'supa_already-prefixed' } } },
        error: null,
      });

      const userId = await getUserId();

      expect(userId).toBe('supa_already-prefixed');
    });

    it('should fall back to SecureStore when no Supabase session', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('user_existing-id-1234');

      const userId = await getUserId();

      expect(userId).toBe('user_existing-id-1234');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('secure_user_id');
    });

    it('should fall back to AsyncStorage when SecureStore is unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue('user_async-fallback-id');

      const userId = await getUserId();

      expect(userId).toBe('user_async-fallback-id');
      expect(mockSecureStore.getItemAsync).not.toHaveBeenCalled();
    });

    it('should throw when no session and no stored ID', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await expect(getUserId()).rejects.toThrow('No user session - please sign in');
    });

    it('should throw when SecureStore unavailable and no AsyncStorage ID', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      await expect(getUserId()).rejects.toThrow('No user session - please sign in');
    });

    it('should not check storage when Supabase session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'session-user-id' } } },
        error: null,
      });

      await getUserId();

      expect(mockSecureStore.getItemAsync).not.toHaveBeenCalled();
      expect(mockAsyncStorage.getItem).not.toHaveBeenCalled();
    });
  });

  // =============================================
  // clearUserSession
  // =============================================
  describe('clearUserSession', () => {
    it('should delete all keys from SecureStore', async () => {
      await clearUserSession();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_user_id');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_auth_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_refresh_token');
    });

    it('should remove session keys from AsyncStorage', async () => {
      await clearUserSession();

      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.SESSION_DATA,
        STORAGE_KEYS.LAST_TAILORED_RESUME,
      ]);
    });

    it('should skip SecureStore deletion when SecureStore is unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);

      await clearUserSession();

      expect(mockSecureStore.deleteItemAsync).not.toHaveBeenCalled();
      // AsyncStorage should still be cleared
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('should handle errors gracefully without throwing', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('Delete failed'));

      // Should not throw
      await expect(clearUserSession()).resolves.toBeUndefined();
    });
  });

  // =============================================
  // saveSessionData
  // =============================================
  describe('saveSessionData', () => {
    it('should save data to AsyncStorage under the SESSION_DATA key', async () => {
      const data = { name: 'Justin', role: 'Cybersecurity PM' };

      await saveSessionData(data);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.SESSION_DATA,
        JSON.stringify(data)
      );
    });

    it('should strip sensitive fields (token, authToken, refreshToken, password)', async () => {
      const data = {
        name: 'Justin',
        token: 'secret-jwt-token',
        authToken: 'secret-auth-token',
        refreshToken: 'secret-refresh-token',
        password: 'super-secret-password',
        role: 'PM',
      };

      await saveSessionData(data);

      const savedValue = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(savedValue);

      expect(parsed.name).toBe('Justin');
      expect(parsed.role).toBe('PM');
      expect(parsed.token).toBeUndefined();
      expect(parsed.authToken).toBeUndefined();
      expect(parsed.refreshToken).toBeUndefined();
      expect(parsed.password).toBeUndefined();
    });

    it('should handle errors gracefully without throwing', async () => {
      (mockAsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage full'));

      await expect(saveSessionData({ key: 'value' })).resolves.toBeUndefined();
    });
  });

  // =============================================
  // loadSessionData
  // =============================================
  describe('loadSessionData', () => {
    it('should return parsed data from AsyncStorage', async () => {
      const storedData = { name: 'Justin', lastLogin: '2026-02-06' };
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(storedData));

      const result = await loadSessionData();

      expect(result).toEqual(storedData);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.SESSION_DATA);
    });

    it('should return null when no data is stored', async () => {
      (mockAsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadSessionData();

      expect(result).toBeNull();
    });
  });

  // =============================================
  // saveAuthToken / getAuthToken
  // =============================================
  describe('saveAuthToken and getAuthToken', () => {
    it('should save auth token to SecureStore and return true', async () => {
      const result = await saveAuthToken('jwt-token-abc123');

      expect(result).toBe(true);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'secure_auth_token',
        'jwt-token-abc123'
      );
    });

    it('should return false when SecureStore is unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);

      const result = await saveAuthToken('jwt-token-abc123');

      expect(result).toBe(false);
      expect(mockSecureStore.setItemAsync).not.toHaveBeenCalled();
    });

    it('should return null from getAuthToken when SecureStore is unavailable', async () => {
      mockSecureStore.isAvailableAsync.mockResolvedValue(false);

      const token = await getAuthToken();

      expect(token).toBeNull();
    });

    it('should return the stored token from getAuthToken', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('stored-jwt-token');

      const token = await getAuthToken();

      expect(token).toBe('stored-jwt-token');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('secure_auth_token');
    });
  });

  // =============================================
  // saveRefreshToken / getRefreshToken
  // =============================================
  describe('saveRefreshToken and getRefreshToken', () => {
    it('should save and retrieve refresh token via SecureStore', async () => {
      await saveRefreshToken('refresh-token-xyz');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'secure_refresh_token',
        'refresh-token-xyz'
      );
    });

    it('should return the stored refresh token', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('stored-refresh-token');

      const token = await getRefreshToken();

      expect(token).toBe('stored-refresh-token');
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('secure_refresh_token');
    });
  });

  // =============================================
  // clearAuthTokens
  // =============================================
  describe('clearAuthTokens', () => {
    it('should delete user ID, auth token, and refresh token from SecureStore', async () => {
      await clearAuthTokens();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_user_id');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_auth_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_refresh_token');
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(3);
    });
  });
});
