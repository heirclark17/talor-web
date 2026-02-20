import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore, initializeTheme } from './themeStore'

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store and clear localStorage
    useThemeStore.getState().setTheme('dark')
    localStorage.clear()
    // Clear data-theme attribute
    document.documentElement.removeAttribute('data-theme')
  })

  describe('initial state', () => {
    it('defaults to dark theme', () => {
      const { theme } = useThemeStore.getState()
      expect(theme).toBe('dark')
    })
  })

  describe('setTheme', () => {
    it('updates theme to light', () => {
      const { setTheme } = useThemeStore.getState()
      setTheme('light')

      expect(useThemeStore.getState().theme).toBe('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('updates theme to dark', () => {
      const { setTheme } = useThemeStore.getState()
      setTheme('light')
      setTheme('dark')

      expect(useThemeStore.getState().theme).toBe('dark')
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })

    it('applies theme to document element', () => {
      const { setTheme } = useThemeStore.getState()

      setTheme('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      setTheme('dark')
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })
  })

  describe('toggleTheme', () => {
    it('toggles from dark to light', () => {
      const { toggleTheme } = useThemeStore.getState()
      expect(useThemeStore.getState().theme).toBe('dark')

      toggleTheme()

      expect(useThemeStore.getState().theme).toBe('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('toggles from light to dark', () => {
      const { setTheme, toggleTheme } = useThemeStore.getState()
      setTheme('light')

      toggleTheme()

      expect(useThemeStore.getState().theme).toBe('dark')
      expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    })

    it('can toggle multiple times', () => {
      const { toggleTheme } = useThemeStore.getState()

      toggleTheme() // dark -> light
      expect(useThemeStore.getState().theme).toBe('light')

      toggleTheme() // light -> dark
      expect(useThemeStore.getState().theme).toBe('dark')

      toggleTheme() // dark -> light
      expect(useThemeStore.getState().theme).toBe('light')
    })
  })

  describe('persistence', () => {
    it('persists theme to localStorage', () => {
      const { setTheme } = useThemeStore.getState()
      setTheme('light')

      const stored = localStorage.getItem('theme-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.theme).toBe('light')
    })

    it('restores theme from localStorage', () => {
      // Manually set localStorage
      localStorage.setItem(
        'theme-storage',
        JSON.stringify({ state: { theme: 'light' }, version: 0 })
      )

      // Create new store instance (simulates app reload)
      const store = useThemeStore.getState()

      expect(store.theme).toBe('light')
    })
  })

  describe('initializeTheme', () => {
    it('uses theme from localStorage if available', () => {
      localStorage.setItem(
        'theme-storage',
        JSON.stringify({ state: { theme: 'light' }, version: 0 })
      )

      initializeTheme()

      expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('falls back to system preference if localStorage is empty', () => {
      const mockMatchMedia = vi.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      vi.stubGlobal('matchMedia', mockMatchMedia)

      localStorage.clear()
      initializeTheme()

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
      expect(useThemeStore.getState().theme).toBe('dark')

      vi.unstubAllGlobals()
    })

    it('sets light theme when system prefers light', () => {
      const mockMatchMedia = vi.fn((query: string) => ({
        matches: query === '(prefers-color-scheme: light)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))

      vi.stubGlobal('matchMedia', mockMatchMedia)

      localStorage.clear()
      initializeTheme()

      expect(useThemeStore.getState().theme).toBe('light')
      expect(document.documentElement.getAttribute('data-theme')).toBe('light')

      vi.unstubAllGlobals()
    })

    it('handles invalid localStorage data gracefully', () => {
      localStorage.setItem('theme-storage', 'invalid json')

      initializeTheme()

      // Should fall back to system preference without crashing
      expect(useThemeStore.getState().theme).toBeDefined()
    })
  })

  describe('selectors', () => {
    it('selectIsDarkMode returns true for dark theme', () => {
      const { selectIsDarkMode } = require('./themeStore')
      const { setTheme } = useThemeStore.getState()

      setTheme('dark')
      expect(selectIsDarkMode(useThemeStore.getState())).toBe(true)

      setTheme('light')
      expect(selectIsDarkMode(useThemeStore.getState())).toBe(false)
    })

    it('selectIsLightMode returns true for light theme', () => {
      const { selectIsLightMode } = require('./themeStore')
      const { setTheme } = useThemeStore.getState()

      setTheme('light')
      expect(selectIsLightMode(useThemeStore.getState())).toBe(true)

      setTheme('dark')
      expect(selectIsLightMode(useThemeStore.getState())).toBe(false)
    })
  })
})
