import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../api/client'

export type SubscriptionPlan = 'free' | 'pro' | 'lifetime'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'inactive'

export interface Subscription {
  id?: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_end?: string
  cancel_at_period_end?: boolean
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at?: string
  updated_at?: string
}

interface SubscriptionState {
  // Data
  subscription: Subscription | null
  loading: boolean
  error: string | null

  // Actions
  fetchSubscription: () => Promise<void>
  createCheckoutSession: (plan: SubscriptionPlan, interval: 'monthly' | 'yearly') => Promise<string | null>
  createPortalSession: () => Promise<string | null>
  cancelSubscription: () => Promise<boolean>
  checkFeatureAccess: (feature: string) => boolean
  reset: () => void
}

const initialState = {
  subscription: null,
  loading: false,
  error: null,
}

/**
 * Feature access control based on subscription plan
 */
const FEATURE_ACCESS: Record<SubscriptionPlan, string[]> = {
  free: [
    'resume_upload_1',
    'resume_tailor_1',
    'ats_analysis_basic',
    'keyword_matching',
    'interview_prep_basic',
    'application_tracker_5',
  ],
  pro: [
    'resume_upload_unlimited',
    'resume_tailor_unlimited',
    'batch_tailor',
    'ats_analysis_advanced',
    'keyword_analysis',
    'interview_prep_full',
    'company_research',
    'practice_questions',
    'star_story_builder',
    'cover_letter_generator',
    'career_path_designer',
    'certification_recommendations',
    'application_tracker_unlimited',
    'resume_comparison',
    'version_history',
    'priority_support',
  ],
  lifetime: [
    'resume_upload_unlimited',
    'resume_tailor_unlimited',
    'batch_tailor',
    'ats_analysis_advanced',
    'keyword_analysis',
    'interview_prep_full',
    'company_research',
    'practice_questions',
    'star_story_builder',
    'cover_letter_generator',
    'career_path_designer',
    'certification_recommendations',
    'application_tracker_unlimited',
    'resume_comparison',
    'version_history',
    'priority_support',
    'vip_support',
    'early_access',
    'priority_features',
  ],
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchSubscription: async () => {
        set({ loading: true, error: null })
        try {
          const result = await api.getSubscription()
          if (result.success && result.data) {
            set({ subscription: result.data, error: null })
          } else {
            // User has no subscription - set default free plan
            set({
              subscription: {
                plan: 'free',
                status: 'active',
              },
              error: null,
            })
          }
        } catch (error: any) {
          set({
            error: error.message || 'Failed to fetch subscription',
            subscription: {
              plan: 'free',
              status: 'active',
            },
          })
        } finally {
          set({ loading: false })
        }
      },

      createCheckoutSession: async (plan: SubscriptionPlan, interval: 'monthly' | 'yearly') => {
        set({ loading: true, error: null })
        try {
          const result = await api.createCheckoutSession(plan, interval)
          if (result.success && result.data?.url) {
            return result.data.url
          } else {
            set({ error: result.error || 'Failed to create checkout session' })
            return null
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to create checkout session' })
          return null
        } finally {
          set({ loading: false })
        }
      },

      createPortalSession: async () => {
        set({ loading: true, error: null })
        try {
          const result = await api.createPortalSession()
          if (result.success && result.data?.url) {
            return result.data.url
          } else {
            set({ error: result.error || 'Failed to create portal session' })
            return null
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to create portal session' })
          return null
        } finally {
          set({ loading: false })
        }
      },

      cancelSubscription: async () => {
        set({ loading: true, error: null })
        try {
          const result = await api.cancelSubscription()
          if (result.success) {
            await get().fetchSubscription()
            return true
          } else {
            set({ error: result.error || 'Failed to cancel subscription' })
            return false
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to cancel subscription' })
          return false
        } finally {
          set({ loading: false })
        }
      },

      checkFeatureAccess: (feature: string) => {
        const { subscription } = get()
        const plan = subscription?.plan || 'free'
        const status = subscription?.status || 'inactive'

        // Inactive or past_due subscriptions fall back to free tier
        if (status !== 'active' && status !== 'trialing') {
          return FEATURE_ACCESS.free.includes(feature)
        }

        return FEATURE_ACCESS[plan]?.includes(feature) || false
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist subscription data, not loading/error states
        subscription: state.subscription,
      }),
    }
  )
)

// Selectors
export const selectIsProOrLifetime = (state: SubscriptionState) =>
  state.subscription?.plan === 'pro' || state.subscription?.plan === 'lifetime'

export const selectIsLifetime = (state: SubscriptionState) =>
  state.subscription?.plan === 'lifetime'

export const selectHasActiveSubscription = (state: SubscriptionState) =>
  state.subscription?.status === 'active' || state.subscription?.status === 'trialing'
