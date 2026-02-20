/**
 * User Session Management
 * Generates and persists a unique user ID for isolating user data.
 * With Supabase auth, this serves as a fallback during migration.
 */

const USER_ID_KEY = 'talor_user_id';

// Module-level auth user ID, set by setClerkUserId()
let _clerkUserId: string | null = null;

// Module-level cached auth token for API requests
let _cachedAuthToken: string | null = null;

/**
 * Set the auth user ID (called from auth context)
 */
export function setClerkUserId(id: string | null): void {
  _clerkUserId = id ? `supa_${id}` : null;
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  return 'user_' + crypto.randomUUID();
}

/**
 * Get user ID — prefers Supabase user, falls back to localStorage
 */
export function getUserId(): string {
  // Prefer Clerk user ID if available
  if (_clerkUserId) {
    return _clerkUserId;
  }

  // Fall back to localStorage (legacy / unauthenticated)
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('Generated new user ID:', userId);
  } else if (!userId.startsWith('user_')) {
    console.log('Migrating old user ID format to new format');
    userId = 'user_' + userId;
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('Migrated user ID:', userId);
  }

  return userId;
}

/**
 * Get the old localStorage user ID (for migration)
 */
export function getOldUserId(): string | null {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored && stored.startsWith('user_')) {
    return stored;
  }
  return null;
}

/**
 * Clear user session (for testing/logout)
 */
export function clearUserSession(): void {
  localStorage.removeItem(USER_ID_KEY);
  _clerkUserId = null;
  console.log('User session cleared');
}

/**
 * Check if user has an existing session
 */
export function hasExistingSession(): boolean {
  return localStorage.getItem(USER_ID_KEY) !== null;
}

/**
 * Set cached auth token (called from Clerk sync hook)
 */
export function setAuthToken(token: string | null): void {
  _cachedAuthToken = token;
}

/**
 * Get cached auth token for API requests
 */
export function getAuthToken(): string | null {
  return _cachedAuthToken;
}
