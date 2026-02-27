/**
 * Date Utilities
 *
 * Provides timezone-aware date formatting utilities that automatically
 * convert UTC timestamps from the backend to the user's local timezone
 */

/**
 * Format a date/time string in the user's local timezone
 *
 * @param dateStr - ISO date string from backend (UTC)
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string in user's local timezone
 */
export function formatLocalDateTime(
  dateStr?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateStr) return 'Recently'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Recently'

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }

  return date.toLocaleString('en-US', options || defaultOptions)
}

/**
 * Format a date (no time) in the user's local timezone
 *
 * @param dateStr - ISO date string from backend (UTC)
 * @returns Formatted date string without time
 */
export function formatLocalDate(dateStr?: string | null): string {
  if (!dateStr) return 'Recently'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Recently'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

/**
 * Format a time in the user's local timezone
 *
 * @param dateStr - ISO date string from backend (UTC)
 * @returns Formatted time string
 */
export function formatLocalTime(dateStr?: string | null): string {
  if (!dateStr) return ''

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format a relative time (e.g., "2 hours ago")
 *
 * @param dateStr - ISO date string from backend (UTC)
 * @returns Relative time string
 */
export function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'Recently'

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Recently'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? 's' : ''} ago`
  return `${diffYear} year${diffYear !== 1 ? 's' : ''} ago`
}

/**
 * Get the user's timezone abbreviation (e.g., "PST", "EST")
 */
export function getUserTimezone(): string {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
  const parts = formatter.formatToParts(new Date())
  const timeZonePart = parts.find(part => part.type === 'timeZoneName')
  return timeZonePart?.value || ''
}

/**
 * Check if a date is today in the user's local timezone
 */
export function isToday(dateStr?: string | null): boolean {
  if (!dateStr) return false

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false

  const today = new Date()
  return date.toDateString() === today.toDateString()
}

/**
 * Check if a date is within the last N days in the user's local timezone
 */
export function isWithinDays(dateStr: string | null | undefined, days: number): boolean {
  if (!dateStr) return false

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  return diffDays <= days
}
