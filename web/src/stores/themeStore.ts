import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'sand-tan'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  cycleTheme: () => void
}

/**
 * Theme Store - Manages light/dark mode with localStorage persistence
 *
 * Usage:
 * ```tsx
 * import { useThemeStore } from '../stores/themeStore'
 *
 * function MyComponent() {
 *   const { theme, setTheme, toggleTheme } = useThemeStore()
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       Current theme: {theme}
 *     </button>
 *   )
 * }
 * ```
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark', // Default to dark mode

      setTheme: (theme: Theme) => {
        set({ theme })
        applyThemeToDocument(theme)
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light'
          applyThemeToDocument(newTheme)
          return { theme: newTheme }
        })
      },

      cycleTheme: () => {
        set((state) => {
          const themes: Theme[] = ['dark', 'light', 'sand-tan']
          const currentIndex = themes.indexOf(state.theme)
          const nextIndex = (currentIndex + 1) % themes.length
          const newTheme = themes[nextIndex]
          applyThemeToDocument(newTheme)
          return { theme: newTheme }
        })
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
      // Apply theme to document on rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDocument(state.theme)
        }
      },
    }
  )
)

/**
 * Apply theme to document element
 * Sets data-theme attribute which CSS uses for theming
 */
function applyThemeToDocument(theme: Theme) {
  if (typeof document !== 'undefined') {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light')
    } else if (theme === 'sand-tan') {
      document.documentElement.setAttribute('data-theme', 'sand-tan')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }
}

/**
 * Initialize theme from localStorage or system preference on app load
 * Call this once in App.tsx
 */
export function initializeTheme() {
  // Check localStorage first
  const stored = localStorage.getItem('theme-storage')
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      const theme = parsed.state?.theme as Theme
      if (theme) {
        applyThemeToDocument(theme)
        return
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Fall back to system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const theme = prefersDark ? 'dark' : 'light'
    applyThemeToDocument(theme)
    useThemeStore.setState({ theme })
  }
}

// Export selector for common use cases
export const selectIsDarkMode = (state: ThemeState) => state.theme === 'dark'
export const selectIsLightMode = (state: ThemeState) => state.theme === 'light'
export const selectIsSandTanMode = (state: ThemeState) => state.theme === 'sand-tan'
