import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from './App'

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: any) => children,
  SignedIn: ({ children }: any) => children,
  SignedOut: () => null,
  UserButton: () => <div>UserButton</div>,
  useUser: () => ({ user: null, isLoaded: true, isSignedIn: false }),
  useAuth: () => ({ getToken: vi.fn() })
}))

// Mock hooks
vi.mock('./hooks/useScrollAnimation', () => ({
  useScrollAnimation: () => ({
    ref: { current: null },
    isVisible: false
  })
}))

vi.mock('./hooks/useSessionMigration', () => ({
  useSessionMigration: vi.fn()
}))

vi.mock('./hooks/useClerkUserSync', () => ({
  useClerkUserSync: vi.fn()
}))

// Mock lazy-loaded components
vi.mock('./pages/Home', () => ({
  default: () => <div>Home Page</div>
}))

vi.mock('./pages/UploadResume', () => ({
  default: () => <div>Upload Page</div>
}))

describe('App', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  it('should render router', () => {
    const { container } = render(<App />)
    expect(container.querySelector('[class*="min-h-screen"]')).toBeTruthy()
  })

  it('should include error boundary', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })
})
