import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { saveAuthToken, clearAuthTokens } from '../utils/userSession';

/**
 * Hook to sync Clerk authentication token to secure storage
 * This ensures the API client can access the JWT token for authenticated requests
 */
export function useAuthSync() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    async function syncToken() {
      if (isSignedIn) {
        try {
          // Get JWT token from Clerk
          const token = await getToken();
          if (token) {
            // Save to secure storage for API client
            await saveAuthToken(token);
            console.log('[useAuthSync] Token synced to secure storage');
          }
        } catch (error) {
          console.error('[useAuthSync] Error syncing token:', error);
        }
      } else {
        // Clear tokens if not signed in
        await clearAuthTokens();
        console.log('[useAuthSync] Tokens cleared (user signed out)');
      }
    }

    syncToken();
  }, [isSignedIn, getToken]);
}
