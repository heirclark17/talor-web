import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

interface ThemeToggleProps {
  variant?: 'button' | 'switch'
  className?: string
  showLabel?: boolean
}

/**
 * Theme Toggle Component
 *
 * Allows users to switch between light and dark mode.
 * Supports two variants:
 * - 'button': Icon button with hover effects (default)
 * - 'switch': iOS-style toggle switch
 *
 * @example
 * ```tsx
 * // Icon button (default)
 * <ThemeToggle />
 *
 * // Switch with label
 * <ThemeToggle variant="switch" showLabel />
 *
 * // Custom className
 * <ThemeToggle className="my-custom-class" />
 * ```
 */
export default function ThemeToggle({
  variant = 'button',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-theme-secondary">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-theme"
          style={{
            backgroundColor: isDark ? '#3b82f6' : '#d1d5db',
          }}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          role="switch"
          aria-checked={isDark}
        >
          <span
            className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform ${
              isDark ? 'translate-x-7' : 'translate-x-1'
            }`}
          >
            {isDark ? (
              <Moon className="h-4 w-4 text-blue-600" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </span>
        </button>
      </div>
    )
  }

  // Button variant (default)
  return (
    <button
      onClick={toggleTheme}
      className={`group relative inline-flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 hover:bg-theme-glass-10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-theme ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon for dark mode (clicking switches to light) */}
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
            : 'rotate-90 scale-0 absolute'
        }`}
      />
      {/* Moon icon for light mode (clicking switches to dark) */}
      <Moon
        className={`h-5 w-5 transition-all duration-300 ${
          !isDark
            ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
            : '-rotate-90 scale-0 absolute'
        }`}
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-theme-secondary group-hover:text-theme">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
