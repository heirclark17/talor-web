import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from './ThemeToggle'
import * as ThemeContext from '../contexts/ThemeContext'

vi.mock('../contexts/ThemeContext', () => ({
  useTheme: vi.fn(),
}))

describe('ThemeToggle Component', () => {
  const mockToggleTheme = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dark Theme State', () => {
    beforeEach(() => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })
    })

    it('should render theme toggle button', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toBeInTheDocument()
    })

    it('should display sun icon in dark theme', () => {
      const { container } = render(<ThemeToggle />)

      const sunIcon = container.querySelector('[data-icon="sun"]')
      expect(sunIcon).toBeInTheDocument()
    })

    it('should not display moon icon in dark theme', () => {
      const { container } = render(<ThemeToggle />)

      const moonIcon = container.querySelector('[data-icon="moon"]')
      expect(moonIcon).not.toBeInTheDocument()
    })

    it('should have correct aria-label in dark theme', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveAttribute('aria-label', 'Switch to light theme')
    })

    it('should have aria-pressed="true" in dark theme', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveAttribute('aria-pressed', 'true')
    })

    it('should apply dark theme styling', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('dark:bg-gray-700')
      expect(button).toHaveClass('dark:hover:bg-gray-600')
    })

    it('should have yellow sun icon color', () => {
      const { container } = render(<ThemeToggle />)

      const sunIcon = container.querySelector('[data-icon="sun"]')
      expect(sunIcon).toHaveClass('text-yellow-400')
    })
  })

  describe('Light Theme State', () => {
    beforeEach(() => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })
    })

    it('should display moon icon in light theme', () => {
      const { container } = render(<ThemeToggle />)

      const moonIcon = container.querySelector('[data-icon="moon"]')
      expect(moonIcon).toBeInTheDocument()
    })

    it('should not display sun icon in light theme', () => {
      const { container } = render(<ThemeToggle />)

      const sunIcon = container.querySelector('[data-icon="sun"]')
      expect(sunIcon).not.toBeInTheDocument()
    })

    it('should have correct aria-label in light theme', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveAttribute('aria-label', 'Switch to dark theme')
    })

    it('should have aria-pressed="false" in light theme', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })

    it('should have blue moon icon color', () => {
      const { container } = render(<ThemeToggle />)

      const moonIcon = container.querySelector('[data-icon="moon"]')
      expect(moonIcon).toHaveClass('text-blue-600')
    })
  })

  describe('Toggle Functionality', () => {
    beforeEach(() => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })
    })

    it('should call toggleTheme when button is clicked', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      fireEvent.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should call toggleTheme multiple times on multiple clicks', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })
    })

    it('should have button role', () => {
      render(<ThemeToggle />)

      const button = screen.getByRole('button', { name: /switch to light theme/i })
      expect(button).toBeInTheDocument()
    })

    it('should have aria-hidden on icon', () => {
      const { container } = render(<ThemeToggle />)

      const icon = container.querySelector('[aria-hidden="true"]')
      expect(icon).toBeInTheDocument()
    })

    it('should have data-testid for testing', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toBeInTheDocument()
    })

    it('should meet minimum touch target size (44x44)', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('min-w-[44px]')
      expect(button).toHaveClass('min-h-[44px]')
    })
  })

  describe('Styling', () => {
    beforeEach(() => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })
    })

    it('should have fixed positioning', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('fixed')
      expect(button).toHaveClass('top-4')
      expect(button).toHaveClass('right-4')
    })

    it('should have high z-index', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('z-50')
    })

    it('should have rounded corners', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('rounded-lg')
    })

    it('should have background color', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('bg-gray-800')
    })

    it('should have hover styling', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('hover:bg-gray-700')
    })

    it('should have transition effect', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('transition-colors')
    })

    it('should use flexbox for centering', () => {
      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toHaveClass('flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
    })
  })

  describe('Icon Sizing', () => {
    it('should render sun icon with correct size', () => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
      })

      const { container } = render(<ThemeToggle />)

      const sunIcon = container.querySelector('[data-icon="sun"]')
      expect(sunIcon).toHaveClass('w-5')
      expect(sunIcon).toHaveClass('h-5')
    })

    it('should render moon icon with correct size', () => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
      })

      const { container } = render(<ThemeToggle />)

      const moonIcon = container.querySelector('[data-icon="moon"]')
      expect(moonIcon).toHaveClass('w-5')
      expect(moonIcon).toHaveClass('h-5')
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing theme context gracefully', () => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: undefined as any,
        toggleTheme: mockToggleTheme,
      })

      expect(() => render(<ThemeToggle />)).not.toThrow()
    })

    it('should handle undefined toggleTheme', () => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: undefined as any,
      })

      expect(() => render(<ThemeToggle />)).not.toThrow()
    })

    it('should render button even with missing context', () => {
      vi.mocked(ThemeContext.useTheme).mockReturnValue({
        theme: 'dark',
        toggleTheme: undefined as any,
      })

      render(<ThemeToggle />)

      const button = screen.getByTestId('theme-toggle')
      expect(button).toBeInTheDocument()
    })
  })
})
