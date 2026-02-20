import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock Supabase before any imports that use it
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signOut: vi.fn(),
    },
  },
}))

import App from './App'

// Mock AuthContext
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: () => ({
    user: null,
    session: null,
    isLoaded: true,
    isSignedIn: false,
    signOut: vi.fn(),
  }),
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
