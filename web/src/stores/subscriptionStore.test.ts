import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSubscriptionStore } from './subscriptionStore'
import * as apiClient from '../api/client'

vi.mock('../api/client')

describe('subscriptionStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSubscriptionStore.getState().reset()
  })

  describe('fetchSubscription', () => {
    it('fetches subscription successfully', async () => {
      const mockSubscription = {
        id: 'sub_123',
        plan: 'pro',
        status: 'active',
        current_period_end: '2026-03-20',
      }

      vi.spyOn(apiClient.api, 'getSubscription').mockResolvedValue({
        success: true,
        data: mockSubscription,
      })

      await useSubscriptionStore.getState().fetchSubscription()

      const { subscription, loading, error } = useSubscriptionStore.getState()
      expect(loading).toBe(false)
      expect(error).toBe(null)
      expect(subscription).toEqual(mockSubscription)
    })

    it('sets default free plan when no subscription exists', async () => {
      vi.spyOn(apiClient.api, 'getSubscription').mockResolvedValue({
        success: true,
        data: null,
      })

      await useSubscriptionStore.getState().fetchSubscription()

      const { subscription } = useSubscriptionStore.getState()
      expect(subscription?.plan).toBe('free')
      expect(subscription?.status).toBe('active')
    })

    it('handles fetch error gracefully', async () => {
      vi.spyOn(apiClient.api, 'getSubscription').mockResolvedValue({
        success: false,
        error: 'Network error',
      })

      await useSubscriptionStore.getState().fetchSubscription()

      const { subscription, error } = useSubscriptionStore.getState()
      expect(subscription?.plan).toBe('free') // Falls back to free
      expect(error).toBeNull() // Error cleared after setting free plan
    })
  })

  describe('createCheckoutSession', () => {
    it('creates checkout session and returns URL', async () => {
      const checkoutUrl = 'https://checkout.stripe.com/session_123'

      vi.spyOn(apiClient.api, 'createCheckoutSession').mockResolvedValue({
        success: true,
        data: { url: checkoutUrl },
      })

      const result = await useSubscriptionStore
        .getState()
        .createCheckoutSession('pro', 'yearly')

      expect(result).toBe(checkoutUrl)
      expect(apiClient.api.createCheckoutSession).toHaveBeenCalledWith('pro', 'yearly')
    })

    it('returns null on error', async () => {
      vi.spyOn(apiClient.api, 'createCheckoutSession').mockResolvedValue({
        success: false,
        error: 'Stripe error',
      })

      const result = await useSubscriptionStore
        .getState()
        .createCheckoutSession('pro', 'monthly')

      expect(result).toBeNull()
    })
  })

  describe('createPortalSession', () => {
    it('creates portal session and returns URL', async () => {
      const portalUrl = 'https://billing.stripe.com/session_123'

      vi.spyOn(apiClient.api, 'createPortalSession').mockResolvedValue({
        success: true,
        data: { url: portalUrl },
      })

      const result = await useSubscriptionStore.getState().createPortalSession()

      expect(result).toBe(portalUrl)
    })
  })

  describe('cancelSubscription', () => {
    it('cancels subscription and refetches', async () => {
      vi.spyOn(apiClient.api, 'cancelSubscription').mockResolvedValue({
        success: true,
        data: { message: 'Subscription canceled' },
      })

      vi.spyOn(apiClient.api, 'getSubscription').mockResolvedValue({
        success: true,
        data: {
          plan: 'pro',
          status: 'active',
          cancel_at_period_end: true,
        },
      })

      const result = await useSubscriptionStore.getState().cancelSubscription()

      expect(result).toBe(true)
      expect(useSubscriptionStore.getState().subscription?.cancel_at_period_end).toBe(true)
    })

    it('returns false on cancel error', async () => {
      vi.spyOn(apiClient.api, 'cancelSubscription').mockResolvedValue({
        success: false,
        error: 'Cannot cancel',
      })

      const result = await useSubscriptionStore.getState().cancelSubscription()

      expect(result).toBe(false)
    })
  })

  describe('checkFeatureAccess', () => {
    it('allows free features on free plan', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'free', status: 'active' },
      })

      const hasAccess = useSubscriptionStore.getState().checkFeatureAccess('resume_upload_1')
      expect(hasAccess).toBe(true)
    })

    it('denies pro features on free plan', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'free', status: 'active' },
      })

      const hasAccess = useSubscriptionStore.getState().checkFeatureAccess('batch_tailor')
      expect(hasAccess).toBe(false)
    })

    it('allows all pro features on pro plan', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'pro', status: 'active' },
      })

      const hasBatchTailor = useSubscriptionStore
        .getState()
        .checkFeatureAccess('batch_tailor')
      const hasUnlimited = useSubscriptionStore
        .getState()
        .checkFeatureAccess('resume_tailor_unlimited')

      expect(hasBatchTailor).toBe(true)
      expect(hasUnlimited).toBe(true)
    })

    it('allows VIP features on lifetime plan', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'lifetime', status: 'active' },
      })

      const hasVIPSupport = useSubscriptionStore.getState().checkFeatureAccess('vip_support')
      const hasEarlyAccess = useSubscriptionStore
        .getState()
        .checkFeatureAccess('early_access')

      expect(hasVIPSupport).toBe(true)
      expect(hasEarlyAccess).toBe(true)
    })

    it('falls back to free plan when status is inactive', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'pro', status: 'inactive' },
      })

      const hasProFeature = useSubscriptionStore.getState().checkFeatureAccess('batch_tailor')
      const hasFreeFeature = useSubscriptionStore
        .getState()
        .checkFeatureAccess('resume_upload_1')

      expect(hasProFeature).toBe(false)
      expect(hasFreeFeature).toBe(true)
    })

    it('falls back to free plan when status is past_due', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'pro', status: 'past_due' },
      })

      const hasProFeature = useSubscriptionStore.getState().checkFeatureAccess('batch_tailor')
      expect(hasProFeature).toBe(false)
    })

    it('allows trialing subscriptions', () => {
      useSubscriptionStore.setState({
        subscription: { plan: 'pro', status: 'trialing' },
      })

      const hasProFeature = useSubscriptionStore.getState().checkFeatureAccess('batch_tailor')
      expect(hasProFeature).toBe(true)
    })
  })

  describe('selectors', () => {
    it('selectIsProOrLifetime identifies pro/lifetime plans', () => {
      const { selectIsProOrLifetime } = require('./subscriptionStore')

      const freeState = { subscription: { plan: 'free', status: 'active' } }
      const proState = { subscription: { plan: 'pro', status: 'active' } }
      const lifetimeState = { subscription: { plan: 'lifetime', status: 'active' } }

      expect(selectIsProOrLifetime(freeState as any)).toBe(false)
      expect(selectIsProOrLifetime(proState as any)).toBe(true)
      expect(selectIsProOrLifetime(lifetimeState as any)).toBe(true)
    })

    it('selectHasActiveSubscription checks status correctly', () => {
      const { selectHasActiveSubscription } = require('./subscriptionStore')

      const activeState = { subscription: { plan: 'pro', status: 'active' } }
      const trialingState = { subscription: { plan: 'pro', status: 'trialing' } }
      const canceledState = { subscription: { plan: 'pro', status: 'canceled' } }
      const pastDueState = { subscription: { plan: 'pro', status: 'past_due' } }

      expect(selectHasActiveSubscription(activeState as any)).toBe(true)
      expect(selectHasActiveSubscription(trialingState as any)).toBe(true)
      expect(selectHasActiveSubscription(canceledState as any)).toBe(false)
      expect(selectHasActiveSubscription(pastDueState as any)).toBe(false)
    })
  })

  describe('persistence', () => {
    it('persists subscription data to localStorage', async () => {
      const mockSubscription = {
        id: 'sub_123',
        plan: 'pro',
        status: 'active',
      }

      vi.spyOn(apiClient.api, 'getSubscription').mockResolvedValue({
        success: true,
        data: mockSubscription,
      })

      await useSubscriptionStore.getState().fetchSubscription()

      // Check localStorage (Zustand persist middleware uses subscription-storage key)
      const stored = localStorage.getItem('subscription-storage')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.state.subscription).toEqual(mockSubscription)
    })

    it('does not persist loading/error states', async () => {
      vi.spyOn(apiClient.api, 'getSubscription').mockResolvedValue({
        success: false,
        error: 'Test error',
      })

      await useSubscriptionStore.getState().fetchSubscription()

      const stored = localStorage.getItem('subscription-storage')
      const parsed = JSON.parse(stored!)
      expect(parsed.state.loading).toBeUndefined()
      expect(parsed.state.error).toBeUndefined()
    })
  })
})
