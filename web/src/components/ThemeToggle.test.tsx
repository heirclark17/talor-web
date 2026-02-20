import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from './ThemeToggle'
import { useThemeStore } from '../stores/themeStore'

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset theme to dark before each test
    useThemeStore.getState().setTheme('dark')
  })

  describe('button variant (default)', () => {
    it('renders without crashing', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('shows sun icon when dark mode is active', () => {
      useThemeStore.getState().setTheme('dark')
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('shows moon icon when light mode is active', () => {
      useThemeStore.getState().setTheme('light')
      render(<ThemeToggle />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })

    it('toggles theme when clicked', () => {
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      expect(useThemeStore.getState().theme).toBe('dark')

      fireEvent.click(button)
      expect(useThemeStore.getState().theme).toBe('light')

      fireEvent.click(button)
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('applies custom className', () => {
      render(<ThemeToggle className="custom-class" />)
      const button = screen.getByRole('button')
      expect(button.className).toContain('custom-class')
    })

    it('shows label when showLabel is true', () => {
      useThemeStore.getState().setTheme('dark')
      render(<ThemeToggle showLabel />)

      expect(screen.getByText('Light')).toBeInTheDocument()
    })

    it('updates label when theme changes', () => {
      const { rerender } = render(<ThemeToggle showLabel />)
      expect(screen.getByText('Light')).toBeInTheDocument()

      useThemeStore.getState().setTheme('light')
      rerender(<ThemeToggle showLabel />)
      expect(screen.getByText('Dark')).toBeInTheDocument()
    })
  })

  describe('switch variant', () => {
    it('renders switch variant', () => {
      render(<ThemeToggle variant="switch" />)
      const button = screen.getByRole('switch')
      expect(button).toBeInTheDocument()
    })

    it('has correct aria-checked state', () => {
      useThemeStore.getState().setTheme('dark')
      const { rerender } = render(<ThemeToggle variant="switch" />)
      const button = screen.getByRole('switch')

      expect(button).toHaveAttribute('aria-checked', 'true')

      useThemeStore.getState().setTheme('light')
      rerender(<ThemeToggle variant="switch" />)
      expect(button).toHaveAttribute('aria-checked', 'false')
    })

    it('toggles theme when clicked', () => {
      render(<ThemeToggle variant="switch" />)
      const button = screen.getByRole('switch')

      expect(useThemeStore.getState().theme).toBe('dark')

      fireEvent.click(button)
      expect(useThemeStore.getState().theme).toBe('light')

      fireEvent.click(button)
      expect(useThemeStore.getState().theme).toBe('dark')
    })

    it('shows label when showLabel is true', () => {
      useThemeStore.getState().setTheme('dark')
      render(<ThemeToggle variant="switch" showLabel />)

      expect(screen.getByText('Dark Mode')).toBeInTheDocument()
    })

    it('updates label when theme changes', () => {
      const { rerender } = render(<ThemeToggle variant="switch" showLabel />)
      expect(screen.getByText('Dark Mode')).toBeInTheDocument()

      useThemeStore.getState().setTheme('light')
      rerender(<ThemeToggle variant="switch" showLabel />)
      expect(screen.getByText('Light Mode')).toBeInTheDocument()
    })

    it('applies correct background color for dark mode', () => {
      useThemeStore.getState().setTheme('dark')
      render(<ThemeToggle variant="switch" />)
      const button = screen.getByRole('switch')

      expect(button).toHaveStyle({ backgroundColor: '#3b82f6' })
    })

    it('applies correct background color for light mode', () => {
      useThemeStore.getState().setTheme('light')
      render(<ThemeToggle variant="switch" />)
      const button = screen.getByRole('switch')

      expect(button).toHaveStyle({ backgroundColor: '#d1d5db' })
    })

    it('applies correct translate classes based on theme', () => {
      useThemeStore.getState().setTheme('dark')
      const { rerender } = render(<ThemeToggle variant="switch" />)

      let toggleKnob = screen.getByRole('switch').querySelector('span')
      expect(toggleKnob?.className).toContain('translate-x-7')

      useThemeStore.getState().setTheme('light')
      rerender(<ThemeToggle variant="switch" />)
      toggleKnob = screen.getByRole('switch').querySelector('span')
      expect(toggleKnob?.className).toContain('translate-x-1')
    })
  })

  describe('accessibility', () => {
    it('has proper aria-label for button variant', () => {
      useThemeStore.getState().setTheme('dark')
      render(<ThemeToggle />)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
      expect(button).toHaveAttribute('title', 'Switch to light mode')
    })

    it('has proper aria-label for switch variant', () => {
      useThemeStore.getState().setTheme('dark')
      render(<ThemeToggle variant="switch" />)
      const button = screen.getByRole('switch')

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')
    })

    it('updates aria-label when theme changes', () => {
      const { rerender } = render(<ThemeToggle />)
      const button = screen.getByRole('button')

      expect(button).toHaveAttribute('aria-label', 'Switch to light mode')

      useThemeStore.getState().setTheme('light')
      rerender(<ThemeToggle />)
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode')
    })
  })
})
