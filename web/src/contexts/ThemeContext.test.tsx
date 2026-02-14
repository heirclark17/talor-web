import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from './ThemeContext'

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
  })

  describe('ThemeProvider', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should default to dark theme', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should load theme from localStorage', () => {
      localStorage.setItem('talor_theme', 'light')

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      expect(result.current.theme).toBe('light')
    })

    it('should apply theme class to document root', () => {
      renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  describe('toggleTheme', () => {
    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('light')
      expect(localStorage.getItem('talor_theme')).toBe('light')
    })

    it('should toggle from light to dark', () => {
      localStorage.setItem('talor_theme', 'light')

      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(result.current.theme).toBe('dark')
    })

    it('should update document root class when toggling', () => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ThemeProvider
      })

      act(() => {
        result.current.toggleTheme()
      })

      expect(document.documentElement.classList.contains('light')).toBe(true)
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('useTheme', () => {
    it('should throw error when used outside ThemeProvider', () => {
      expect(() => {
        renderHook(() => useTheme())
      }).toThrow('useTheme must be used within ThemeProvider')
    })
  })
})
