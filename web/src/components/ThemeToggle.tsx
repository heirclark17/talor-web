import React from 'react'
import { Sun, Moon, Palette } from 'lucide-react'
import { useThemeStore } from '../stores/themeStore'

interface ThemeToggleProps {
  variant?: 'button' | 'switch'
  className?: string
  showLabel?: boolean
}

/**
 * Theme Toggle Component
 *
 * Allows users to cycle between dark, light, and sand-tan themes.
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
  const { theme, cycleTheme } = useThemeStore()
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  const isSandTan = theme === 'sand-tan'

  if (variant === 'switch') {
    const themeLabel = isDark ? 'Dark' : isLight ? 'Light' : 'Sand Tan'
    const themeColor = isDark ? '#3b82f6' : isLight ? '#d1d5db' : '#B8860B'

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {showLabel && (
          <span className="text-sm font-medium text-theme-secondary">
            {themeLabel} Mode
          </span>
        )}
        <button
          onClick={cycleTheme}
          className="relative inline-flex h-8 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-theme"
          style={{
            backgroundColor: themeColor,
          }}
          aria-label={`Cycle theme (currently ${themeLabel})`}
          role="switch"
          aria-checked={isDark}
        >
          <span
            className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform ${
              isDark ? 'translate-x-1' : isLight ? 'translate-x-7' : 'translate-x-[3.25rem]'
            }`}
          >
            {isDark ? (
              <Moon className="h-4 w-4 text-blue-600" />
            ) : isLight ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Palette className="h-4 w-4 text-amber-700" />
            )}
          </span>
        </button>
      </div>
    )
  }

  // Button variant (default)
  const themeLabel = isDark ? 'Dark' : isLight ? 'Light' : 'Sand Tan'
  const nextTheme = isDark ? 'Light' : isLight ? 'Sand Tan' : 'Dark'

  return (
    <button
      onClick={cycleTheme}
      className={`group relative inline-flex items-center justify-center rounded-lg p-2.5 transition-all duration-200 hover:bg-theme-glass-10 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-theme ${className}`}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode (currently ${themeLabel})`}
    >
      {/* Moon icon - shown in dark mode */}
      <Moon
        className={`h-5 w-5 transition-all duration-300 ${
          isDark
            ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
            : 'rotate-90 scale-0 absolute'
        }`}
      />
      {/* Sun icon - shown in light mode */}
      <Sun
        className={`h-5 w-5 transition-all duration-300 ${
          isLight
            ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
            : '-rotate-90 scale-0 absolute'
        }`}
      />
      {/* Palette icon - shown in sand-tan mode */}
      <Palette
        className={`h-5 w-5 transition-all duration-300 ${
          isSandTan
            ? 'rotate-0 scale-100 text-theme-secondary group-hover:text-theme'
            : 'rotate-180 scale-0 absolute'
        }`}
      />
      {showLabel && (
        <span className="ml-2 text-sm font-medium text-theme-secondary group-hover:text-theme">
          {themeLabel}
        </span>
      )}
    </button>
  )
}
