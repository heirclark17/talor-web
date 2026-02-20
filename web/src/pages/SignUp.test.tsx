import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SignUp from './SignUp'

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}))

function renderSignUp() {
  return render(
    <BrowserRouter>
      <SignUp />
    </BrowserRouter>
  )
}

describe('SignUp Page', () => {
  it('should render without crashing', () => {
    renderSignUp()
    expect(screen.getByText('Create your account')).toBeInTheDocument()
  })

  it('should render name, email, and password fields', () => {
    renderSignUp()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should render create account button', () => {
    renderSignUp()
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument()
  })

  it('should have link to sign in page', () => {
    renderSignUp()
    expect(screen.getByText('Sign in')).toHaveAttribute('href', '/sign-in')
  })

  it('should have glass container styling', () => {
    const { container } = renderSignUp()
    const glassDiv = container.querySelector('.glass')
    expect(glassDiv).toBeInTheDocument()
  })

  it('should center content on screen', () => {
    const { container } = renderSignUp()
    const centerDiv = container.querySelector('.min-h-screen')
    expect(centerDiv).toBeInTheDocument()
    expect(centerDiv).toHaveClass('flex', 'items-center', 'justify-center')
  })
})
