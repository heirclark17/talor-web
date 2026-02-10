import { useUser } from '@clerk/clerk-react'

export function useClerkUser() {
  const { user, isLoaded, isSignedIn } = useUser()

  return {
    userId: user ? `clerk_${user.id}` : '',
    clerkId: user?.id ?? '',
    email: user?.primaryEmailAddress?.emailAddress ?? '',
    fullName: user?.fullName ?? '',
    isLoaded,
    isSignedIn: isSignedIn ?? false,
  }
}
