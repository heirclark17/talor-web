import { useAuth } from '../contexts/AuthContext'

export function useAuthUser() {
  const { user, isLoaded, isSignedIn } = useAuth()

  return {
    userId: user ? `supa_${user.id}` : '',
    supabaseId: user?.id ?? '',
    email: user?.email ?? '',
    fullName: user?.user_metadata?.full_name ?? '',
    isLoaded,
    isSignedIn,
  }
}

/** @deprecated Use useAuthUser instead */
export const useClerkUser = useAuthUser
