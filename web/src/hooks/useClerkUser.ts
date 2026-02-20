import { useAuth } from '../contexts/AuthContext'

export function useClerkUser() {
  const { user, isLoaded, isSignedIn } = useAuth()

  return {
    userId: user ? `supa_${user.id}` : '',
    clerkId: user?.id ?? '',
    email: user?.email ?? '',
    fullName: user?.user_metadata?.full_name ?? '',
    isLoaded,
    isSignedIn,
  }
}
