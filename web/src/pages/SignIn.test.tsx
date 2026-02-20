import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SignIn from './SignIn'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}))

function renderSignIn() {
  return render(
    <BrowserRouter>
      <SignIn />
    </BrowserRouter>
  )
}

describe('SignIn Page', () => {
  it('should render without crashing', () => {
    renderSignIn()
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
  })

  it('should render email and password fields', () => {
    renderSignIn()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should render sign in button', () => {
    renderSignIn()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  it('should render OAuth buttons', () => {
    renderSignIn()
    expect(screen.getByText('Continue with Google')).toBeInTheDocument()
    expect(screen.getByText('Continue with GitHub')).toBeInTheDocument()
  })

  it('should have link to sign up page', () => {
    renderSignIn()
    expect(screen.getByText('Sign up')).toHaveAttribute('href', '/sign-up')
  })

  it('should have glass container styling', () => {
    const { container } = renderSignIn()
    const glassDiv = container.querySelector('.glass')
    expect(glassDiv).toBeInTheDocument()
  })

  it('should center content on screen', () => {
    const { container } = renderSignIn()
    const centerDiv = container.querySelector('.min-h-screen')
    expect(centerDiv).toBeInTheDocument()
    expect(centerDiv).toHaveClass('flex', 'items-center', 'justify-center')
  })
})
