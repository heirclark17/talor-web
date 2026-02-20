import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Pricing from './Pricing'
import * as authContext from '../contexts/AuthContext'
import * as subscriptionStore from '../stores/subscriptionStore'

// Mock dependencies
vi.mock('../contexts/AuthContext')
vi.mock('../stores/subscriptionStore')
vi.mock('../utils/toast')

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Pricing', () => {
  const mockCreateCheckoutSession = vi.fn()
  const mockCreatePortalSession = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      isSignedIn: false,
      user: null,
      session: null,
      isLoaded: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    vi.spyOn(subscriptionStore, 'useSubscriptionStore').mockReturnValue({
      subscription: null,
      loading: false,
      error: null,
      fetchSubscription: vi.fn(),
      createCheckoutSession: mockCreateCheckoutSession,
      createPortalSession: mockCreatePortalSession,
      cancelSubscription: vi.fn(),
      checkFeatureAccess: vi.fn(),
      reset: vi.fn(),
    } as any)
  })

  it('renders pricing page with all three plans', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Lifetime')).toBeInTheDocument()
  })

  it('shows monthly/yearly toggle', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    expect(screen.getByText('Monthly')).toBeInTheDocument()
    expect(screen.getByText('Yearly')).toBeInTheDocument()
    expect(screen.getByText('Save 45%')).toBeInTheDocument()
  })

  it('updates pricing when toggling billing interval', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    // Default to yearly (shows $99 for Pro)
    expect(screen.getAllByText('$99')[0]).toBeInTheDocument()

    // Switch to monthly
    await user.click(screen.getByText('Monthly'))

    // Should show $15 for Pro monthly
    await waitFor(() => {
      expect(screen.getAllByText('$15')[0]).toBeInTheDocument()
    })
  })

  it('redirects to sign-up when unauthenticated user clicks paid plan', async () => {
    const user = userEvent.setup()
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    // Click on Pro plan CTA
    const proButton = screen.getByText('Upgrade to Pro')
    await user.click(proButton)

    expect(mockNavigate).toHaveBeenCalledWith('/sign-up')
  })

  it('creates checkout session when authenticated user clicks paid plan', async () => {
    const user = userEvent.setup()
    mockCreateCheckoutSession.mockResolvedValue('https://checkout.stripe.com/session')

    // Mock authenticated user
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      isSignedIn: true,
      user: { id: 'user-123', email: 'test@example.com' },
      session: { access_token: 'token' },
      isLoaded: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    // Mock window.location.href
    delete (window as any).location
    window.location = { href: '' } as any

    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    // Click on Pro plan CTA
    const proButton = screen.getByText('Upgrade to Pro')
    await user.click(proButton)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith('pro', 'yearly')
      expect(window.location.href).toBe('https://checkout.stripe.com/session')
    })
  })

  it('shows "Current Plan" for active subscription', () => {
    vi.spyOn(subscriptionStore, 'useSubscriptionStore').mockReturnValue({
      subscription: { plan: 'pro', status: 'active' },
      loading: false,
      error: null,
      fetchSubscription: vi.fn(),
      createCheckoutSession: mockCreateCheckoutSession,
      createPortalSession: mockCreatePortalSession,
      cancelSubscription: vi.fn(),
      checkFeatureAccess: vi.fn(),
      reset: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    // Pro plan should show "Current Plan"
    expect(screen.getAllByText('Current Plan')[0]).toBeInTheDocument()

    // Should have green "Active" badge
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('displays FAQ section', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel anytime?')).toBeInTheDocument()
    expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument()
    expect(screen.getByText('Is the Lifetime plan really lifetime?')).toBeInTheDocument()
  })

  it('shows MOST POPULAR badge on Pro plan', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument()
  })

  it('displays trust signals at bottom', () => {
    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    expect(screen.getByText(/Trusted by professionals worldwide/)).toBeInTheDocument()
    expect(screen.getByText('256-bit SSL Encryption')).toBeInTheDocument()
    expect(screen.getByText('PCI Compliant')).toBeInTheDocument()
    expect(screen.getByText('SOC 2 Certified')).toBeInTheDocument()
  })

  it('disables buttons when processing checkout', async () => {
    const user = userEvent.setup()
    mockCreateCheckoutSession.mockImplementation(() => new Promise(() => {})) // Never resolves

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      isSignedIn: true,
      user: { id: 'user-123', email: 'test@example.com' },
      session: { access_token: 'token' },
      isLoaded: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Pricing />
      </BrowserRouter>
    )

    const proButton = screen.getByText('Upgrade to Pro')
    await user.click(proButton)

    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })
})
