import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { setAuthUserId, setAuthToken } from '../utils/userSession'

/**
 * Syncs Supabase user ID and auth token into the userSession module so that
 * getUserId() returns the Supabase-based ID and API requests include Bearer tokens.
 */
export function useAuthUserSync() {
  const { user, session, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user && session) {
      setAuthUserId(user.id)
      setAuthToken(session.access_token)
    } else {
      setAuthUserId(null)
      setAuthToken(null)
    }
  }, [isLoaded, isSignedIn, user, session])
}

/** @deprecated Use useAuthUserSync instead */
export const useClerkUserSync = useAuthUserSync
