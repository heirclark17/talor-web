/**
 * Hook to sync authentication token to secure storage
 *
 * NOTE: This was originally built for Clerk auth but the app now uses Supabase.
 * Auth token sync is handled by the Supabase client directly.
 * Kept as a no-op for backwards compatibility.
 */
export function useAuthSync() {
  // No-op: Supabase handles token management internally
}
