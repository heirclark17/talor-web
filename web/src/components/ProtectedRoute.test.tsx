import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from './ProtectedRoute'
import { BrowserRouter } from 'react-router-dom'

const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
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
      mockUseAuth.mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
      })
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
  })

  describe('Authenticated State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
      })
    })

    it('should render children when authenticated', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.getByText('Protected content')).toBeInTheDocument()
    })
  })

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
      })
    })

    it('should redirect to sign-in when not authenticated', () => {
      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Protected content</div>
          </ProtectedRoute>
        </BrowserRouter>
      )

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/sign-in')
    })
  })
})
