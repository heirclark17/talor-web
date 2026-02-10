import { useEffect, useCallback } from 'react'
import { useUser, useAuth } from '@clerk/clerk-react'
import { setClerkUserId, setAuthToken } from '../utils/userSession'

/**
 * Syncs Clerk user ID and auth token into the userSession module so that
 * getUserId() returns the Clerk-based ID and API requests include Bearer tokens.
 */
export function useClerkUserSync() {
  const { user, isSignedIn, isLoaded } = useUser()
  const { getToken } = useAuth()

  const refreshToken = useCallback(async () => {
    if (!isSignedIn) {
      setAuthToken(null)
      return
    }
    try {
      const token = await getToken()
      setAuthToken(token)
    } catch {
      setAuthToken(null)
    }
  }, [isSignedIn, getToken])

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user) {
      setClerkUserId(user.id)
      refreshToken()
    } else {
      setClerkUserId(null)
      setAuthToken(null)
    }
  }, [isLoaded, isSignedIn, user, refreshToken])

  // Refresh token periodically (every 50 seconds, tokens typically expire in 60s)
  useEffect(() => {
    if (!isSignedIn) return

    const interval = setInterval(refreshToken, 50_000)
    return () => clearInterval(interval)
  }, [isSignedIn, refreshToken])
}
