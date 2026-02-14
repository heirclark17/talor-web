import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignIn from './SignIn'

// Mock Clerk SignIn component
vi.mock('@clerk/clerk-react', () => ({
  SignIn: ({ appearance, routing, path, signUpUrl, forceRedirectUrl }: any) => (
    <div data-testid="clerk-signin">
      <div data-testid="clerk-appearance">{JSON.stringify(appearance)}</div>
      <div data-testid="clerk-routing">{routing}</div>
      <div data-testid="clerk-path">{path}</div>
      <div data-testid="clerk-signup-url">{signUpUrl}</div>
      <div data-testid="clerk-redirect-url">{forceRedirectUrl}</div>
    </div>
  )
}))

describe('SignIn Page', () => {
  it('should render without crashing', () => {
    render(<SignIn />)
    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument()
  })

  it('should render Clerk SignIn component', () => {
    render(<SignIn />)
    expect(screen.getByTestId('clerk-signin')).toBeInTheDocument()
  })

  it('should configure routing as path', () => {
    render(<SignIn />)
    expect(screen.getByTestId('clerk-routing')).toHaveTextContent('path')
  })

  it('should set sign-in path', () => {
    render(<SignIn />)
    expect(screen.getByTestId('clerk-path')).toHaveTextContent('/sign-in')
  })

  it('should set sign-up URL', () => {
    render(<SignIn />)
    expect(screen.getByTestId('clerk-signup-url')).toHaveTextContent('/sign-up')
  })

  it('should set redirect URL to resumes', () => {
    render(<SignIn />)
    expect(screen.getByTestId('clerk-redirect-url')).toHaveTextContent('/resumes')
  })

  it('should pass appearance customization', () => {
    render(<SignIn />)
    const appearanceElement = screen.getByTestId('clerk-appearance')
    const appearance = JSON.parse(appearanceElement.textContent || '{}')

    expect(appearance.elements).toBeDefined()
    expect(appearance.elements.rootBox).toBeDefined()
    expect(appearance.elements.card).toBeDefined()
  })

  it('should have glass container styling', () => {
    const { container } = render(<SignIn />)
    const glassDiv = container.querySelector('.glass')
    expect(glassDiv).toBeInTheDocument()
  })

  it('should center content on screen', () => {
    const { container } = render(<SignIn />)
    const centerDiv = container.querySelector('.min-h-screen')
    expect(centerDiv).toBeInTheDocument()
    expect(centerDiv).toHaveClass('flex', 'items-center', 'justify-center')
  })
})
