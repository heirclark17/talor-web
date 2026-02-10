import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { setClerkUserId } from '../utils/userSession'

/**
 * Syncs Clerk user ID into the userSession module so that
 * getUserId() returns the Clerk-based ID when signed in.
 */
export function useClerkUserSync() {
  const { user, isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    if (!isLoaded) return

    if (isSignedIn && user) {
      setClerkUserId(user.id)
    } else {
      setClerkUserId(null)
    }
  }, [isLoaded, isSignedIn, user])
}
