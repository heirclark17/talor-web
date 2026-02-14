import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import * as ClerkReact from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to} />),
  }
})

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    beforeEach(() => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
      } as any)
    })

    it('should render loading spinner when not loaded', () => {
      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not render children when loading', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('should have loading container with min height', () => {
      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const loadingContainer = container.querySelector('.min-h-screen')
      expect(loadingContainer).toBeInTheDocument()
    })

    it('should center loading spinner', () => {
      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const loadingContainer = container.querySelector('.min-h-screen')
      expect(loadingContainer).toHaveClass('flex')
      expect(loadingContainer).toHaveClass('items-center')
      expect(loadingContainer).toHaveClass('justify-center')
    })

    it('should render Loader2 icon with correct size', () => {
      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toHaveClass('w-8')
      expect(spinner).toHaveClass('h-8')
    })
  })

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      } as any)
    })

    it('should navigate to sign-in when not signed in', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toBeInTheDocument()
      expect(navigate).toHaveAttribute('data-to', '/sign-in')
    })

    it('should not render children when not signed in', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    })

    it('should not render loading spinner when loaded but not signed in', () => {
      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })
  })

  describe('Authenticated State', () => {
    beforeEach(() => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)
    })

    it('should render children when signed in', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    it('should render multiple children when signed in', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>First child</div>
            <div>Second child</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
    })

    it('should not render loading spinner when authenticated', () => {
      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })

    it('should not navigate when authenticated', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should render complex child components', () => {
      const ComplexChild = () => (
        <div>
          <h1>Dashboard</h1>
          <p>User dashboard content</p>
        </div>
      )

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <ComplexChild />
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByText('User dashboard content')).toBeInTheDocument()
    })
  })

  describe('State Transitions', () => {
    it('should transition from loading to authenticated', () => {
      const { rerender } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      // Start with loading state
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
      } as any)

      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()

      // Transition to authenticated
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)

      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })

    it('should transition from loading to unauthenticated', () => {
      const { rerender, container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      // Start with loading state
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
      } as any)

      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(container.querySelector('.animate-spin')).toBeInTheDocument()

      // Transition to unauthenticated
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      } as any)

      rerender(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle null children', () => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)

      expect(() =>
        render(
          <BrowserRouter>
            <ProtectedRoute>{null}</ProtectedRoute>
          </BrowserRouter>
        )
      ).not.toThrow()
    })

    it('should handle undefined children', () => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)

      expect(() =>
        render(
          <BrowserRouter>
            <ProtectedRoute>{undefined}</ProtectedRoute>
          </BrowserRouter>
        )
      ).not.toThrow()
    })

    it('should handle empty children', () => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)

      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>{''}</ProtectedRoute>
        </BrowserRouter>
      )

      expect(container.querySelector('.animate-spin')).not.toBeInTheDocument()
    })

    it('should handle fragments as children', () => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <>
              <div>Fragment child 1</div>
              <div>Fragment child 2</div>
            </>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('Fragment child 1')).toBeInTheDocument()
      expect(screen.getByText('Fragment child 2')).toBeInTheDocument()
    })
  })

  describe('Authentication Hook Integration', () => {
    it('should call useAuth hook', () => {
      const mockUseAuth = vi.mocked(ClerkReact.useAuth)
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      } as any)

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(mockUseAuth).toHaveBeenCalled()
    })

    it('should respect isLoaded from useAuth', () => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: true, // Even though signed in, should show loading
      } as any)

      const { container } = render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(container.querySelector('.animate-spin')).toBeInTheDocument()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })

    it('should respect isSignedIn from useAuth', () => {
      vi.mocked(ClerkReact.useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      } as any)

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })
})
