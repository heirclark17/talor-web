import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignUp from './SignUp'

// Mock Clerk SignUp component
vi.mock('@clerk/clerk-react', () => ({
  SignUp: ({ appearance, routing, path, signInUrl, forceRedirectUrl }: any) => (
    <div data-testid="clerk-signup">
      <div data-testid="clerk-appearance">{JSON.stringify(appearance)}</div>
      <div data-testid="clerk-routing">{routing}</div>
      <div data-testid="clerk-path">{path}</div>
      <div data-testid="clerk-signin-url">{signInUrl}</div>
      <div data-testid="clerk-redirect-url">{forceRedirectUrl}</div>
    </div>
  )
}))

describe('SignUp Page', () => {
  it('should render without crashing', () => {
    render(<SignUp />)
    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument()
  })

  it('should render Clerk SignUp component', () => {
    render(<SignUp />)
    expect(screen.getByTestId('clerk-signup')).toBeInTheDocument()
  })

  it('should configure routing as path', () => {
    render(<SignUp />)
    expect(screen.getByTestId('clerk-routing')).toHaveTextContent('path')
  })

  it('should set sign-up path', () => {
    render(<SignUp />)
    expect(screen.getByTestId('clerk-path')).toHaveTextContent('/sign-up')
  })

  it('should set sign-in URL', () => {
    render(<SignUp />)
    expect(screen.getByTestId('clerk-signin-url')).toHaveTextContent('/sign-in')
  })

  it('should set redirect URL to resumes', () => {
    render(<SignUp />)
    expect(screen.getByTestId('clerk-redirect-url')).toHaveTextContent('/resumes')
  })

  it('should pass appearance customization', () => {
    render(<SignUp />)
    const appearanceElement = screen.getByTestId('clerk-appearance')
    const appearance = JSON.parse(appearanceElement.textContent || '{}')

    expect(appearance.elements).toBeDefined()
    expect(appearance.elements.rootBox).toBeDefined()
    expect(appearance.elements.card).toBeDefined()
  })

  it('should have glass container styling', () => {
    const { container } = render(<SignUp />)
    const glassDiv = container.querySelector('.glass')
    expect(glassDiv).toBeInTheDocument()
  })

  it('should center content on screen', () => {
    const { container } = render(<SignUp />)
    const centerDiv = container.querySelector('.min-h-screen')
    expect(centerDiv).toBeInTheDocument()
    expect(centerDiv).toHaveClass('flex', 'items-center', 'justify-center')
  })
})
