import { useEffect, useRef } from 'react'
import { useAuthUser } from './useAuthUser'

const MIGRATION_DONE_KEY = 'talor_migration_done'
const OLD_USER_ID_KEY = 'talor_user_id'

/**
 * Migrates data from old localStorage-based user ID to Supabase user ID.
 * Runs once on first sign-in. Calls backend to reassign all records.
 */
export function useSessionMigration() {
  const { userId, isLoaded, isSignedIn } = useAuthUser()
  const migrationAttempted = useRef(false)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId || migrationAttempted.current) return

    // Only run once
    migrationAttempted.current = true

    // Check if migration already done
    if (localStorage.getItem(MIGRATION_DONE_KEY)) return

    // Check if there's an old user ID to migrate from
    const oldUserId = localStorage.getItem(OLD_USER_ID_KEY)
    if (!oldUserId || !oldUserId.startsWith('user_')) return

    // Don't migrate if old and new are somehow the same
    if (oldUserId === userId) return

    const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

    fetch(`${API_BASE_URL}/api/auth/migrate-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        old_user_id: oldUserId,
        new_user_id: userId,
      }),
    })
      .then(res => res.json())
      .then(() => {
        localStorage.setItem(MIGRATION_DONE_KEY, 'true')
        localStorage.removeItem(OLD_USER_ID_KEY)
      })
      .catch(() => {
        // Migration failed silently - will retry on next sign-in
      })
  }, [isLoaded, isSignedIn, userId])
}
