/**
 * User Session Management
 * Generates and persists a unique user ID for isolating user data
 */

const USER_ID_KEY = 'talor_user_id';

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
  // Generate UUID v4
  return 'user_' + crypto.randomUUID();
}

/**
 * Get or create user ID
 * Returns existing ID from localStorage or creates a new one
 */
export function getUserId(): string {
  // Check localStorage
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // Generate new ID
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('Generated new user ID:', userId);
  }

  return userId;
}

/**
 * Clear user session (for testing/logout)
 */
export function clearUserSession(): void {
  localStorage.removeItem(USER_ID_KEY);
  console.log('User session cleared');
}

/**
 * Check if user has an existing session
 */
export function hasExistingSession(): boolean {
  return localStorage.getItem(USER_ID_KEY) !== null;
}
