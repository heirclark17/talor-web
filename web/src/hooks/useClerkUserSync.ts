import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { setClerkUserId, setAuthToken } from '../utils/userSession'

/**
 * Syncs Supabase user ID and auth token into the userSession module so that
 * getUserId() returns the Supabase-based ID and API requests include Bearer tokens.
 */
export function useClerkUserSync() {
  const { user, session, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user && session) {
      setClerkUserId(user.id)
      setAuthToken(session.access_token)
    } else {
      setClerkUserId(null)
      setAuthToken(null)
    }
  }, [isLoaded, isSignedIn, user, session])
}
