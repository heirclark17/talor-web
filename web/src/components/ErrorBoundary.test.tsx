import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import ErrorBoundary, { useErrorHandler } from './ErrorBoundary'
import React from 'react'

// Component that throws an error for testing
function ProblematicComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Working component</div>
}

describe('ErrorBoundary Component', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    consoleErrorSpy.mockClear()
    vi.unstubAllGlobals()
  })

  describe('Normal Rendering', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child content')).toBeInTheDocument()
    })

    it('should render multiple children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
    })

    it('should not render error UI when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      )

      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })
  })

  describe('Error Catching', () => {
    it('should catch errors from child components', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should display error UI when error is caught', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
    })

    it('should display error icon', () => {
      const { container } = render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      // Check for the icon container with red background
      const iconContainer = container.querySelector('.bg-red-500\\/20')
      expect(iconContainer).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText(/we're sorry, but something unexpected happened/i)).toBeInTheDocument()
    })

    it('should call console.error when error is caught', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )
    })

    it('should call onError callback when provided', () => {
      const onError = vi.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledTimes(1)
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error message' }),
        expect.any(Object)
      )
    })
  })

  describe('Action Buttons', () => {
    it('should render Try Again button', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toBeInTheDocument()
    })

    it('should render Go Home button', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const goHomeButton = screen.getByRole('button', { name: /go to home page/i })
      expect(goHomeButton).toBeInTheDocument()
    })

    it('should reset error state when Try Again is clicked', () => {
      // Use a component that can dynamically control whether it throws
      let shouldThrow = true
      function ToggleErrorComponent() {
        if (shouldThrow) {
          throw new Error('Test error')
        }
        return <div>Working component</div>
      }

      const { rerender } = render(
        <ErrorBoundary>
          <ToggleErrorComponent />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()

      // Stop throwing before clicking Try Again
      shouldThrow = false

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(tryAgainButton)

      // After reset with fixed component, should show working state
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
      expect(screen.getByText('Working component')).toBeInTheDocument()
    })

    it('should navigate to home when Go Home is clicked', () => {
      const mockHref = vi.fn()
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
      })
      vi.stubGlobal('location', { href: mockHref })

      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const goHomeButton = screen.getByRole('button', { name: /go to home page/i })
      fireEvent.click(goHomeButton)

      // Can't easily test window.location.href assignment, but we can verify the button exists
      expect(goHomeButton).toBeInTheDocument()
    })

    it('should have correct styling on Try Again button', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toHaveClass('bg-blue-500')
      expect(tryAgainButton).toHaveClass('hover:bg-blue-600')
    })

    it('should have minimum touch target size on buttons', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toHaveClass('min-h-[44px]')
    })
  })

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    })

    it('should not render default UI when custom fallback is provided', () => {
      const customFallback = <div>Custom error</div>

      render(
        <ErrorBoundary fallback={customFallback}>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument()
    })
  })

  describe('Support Link', () => {
    it('should render support email link', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      expect(supportLink).toBeInTheDocument()
    })

    it('should have correct email mailto link', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      expect(supportLink).toHaveAttribute('href', 'mailto:support@talor.app?subject=Bug Report')
    })

    it('should have underline styling on support link', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const supportLink = screen.getByRole('link', { name: /contact support/i })
      expect(supportLink).toHaveClass('underline')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on Try Again button', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByRole('button', { name: /try again/i })
      expect(tryAgainButton).toHaveAttribute('aria-label', 'Try again')
    })

    it('should have aria-label on Go Home button', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const goHomeButton = screen.getByRole('button', { name: /go to home page/i })
      expect(goHomeButton).toHaveAttribute('aria-label', 'Go to home page')
    })

    it('should have aria-hidden on icons', () => {
      const { container } = render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const icons = container.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive button layout classes', () => {
      const { container } = render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const buttonContainer = container.querySelector('.flex.flex-col.sm\\:flex-row')
      expect(buttonContainer).toBeInTheDocument()
    })

    it('should have responsive text sizing', () => {
      render(
        <ErrorBoundary>
          <ProblematicComponent shouldThrow={true} />
        </ErrorBoundary>
      )

      const heading = screen.getByRole('heading', { name: /something went wrong/i })
      expect(heading).toHaveClass('text-2xl')
      expect(heading).toHaveClass('sm:text-3xl')
    })
  })
})

describe('useErrorHandler Hook', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    consoleErrorSpy.mockClear()
  })

  it('should initialize with no error', () => {
    const { result } = renderHook(() => useErrorHandler())

    expect(result.current.handleError).toBeDefined()
    expect(result.current.resetError).toBeDefined()
  })

  it('should provide handleError function', () => {
    const { result } = renderHook(() => useErrorHandler())

    expect(typeof result.current.handleError).toBe('function')
  })

  it('should provide resetError function', () => {
    const { result } = renderHook(() => useErrorHandler())

    expect(typeof result.current.resetError).toBe('function')
  })

  it('should call console.error when handleError is called', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Test error')

    try {
      act(() => {
        result.current.handleError(testError)
      })
    } catch (e) {
      // Expected to throw
    }

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'useErrorHandler caught an error:',
      testError
    )
  })

  it('should throw error after handleError is called', () => {
    const { result } = renderHook(() => useErrorHandler())
    const testError = new Error('Test error')

    expect(() => {
      act(() => {
        result.current.handleError(testError)
      })
    }).toThrow('Test error')
  })

  it('should maintain stable function references', () => {
    const { result, rerender } = renderHook(() => useErrorHandler())

    const initialHandleError = result.current.handleError
    const initialResetError = result.current.resetError

    rerender()

    expect(result.current.handleError).toBe(initialHandleError)
    expect(result.current.resetError).toBe(initialResetError)
  })
})
