import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, Crown, Sparkles, CreditCard, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { showSuccess, showError } from '../utils/toast'

export default function Pricing() {
  const navigate = useNavigate()
  const { isSignedIn } = useAuth()
  const { subscription, loading: subLoading, createCheckoutSession } = useSubscriptionStore()
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly')
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)

  const handleSelectPlan = async (plan: 'free' | 'pro' | 'lifetime') => {
    if (!isSignedIn) {
      navigate('/sign-up')
      return
    }

    if (plan === 'free') {
      showSuccess('You are on the free plan')
      return
    }

    setProcessingPlan(plan)
    try {
      const checkoutUrl = await createCheckoutSession(plan, billingInterval)
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        showError('Failed to create checkout session. Please try again.')
      }
    } catch (error) {
      showError('An error occurred. Please try again.')
    } finally {
      setProcessingPlan(null)
    }
  }

  const currentPlan = subscription?.plan || 'free'
  const isActive = subscription?.status === 'active'

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Sparkles,
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for trying out Talor',
      features: [
        '1 resume upload',
        '1 resume tailoring',
        'Basic ATS analysis',
        'Resume keyword matching',
        'Basic interview prep',
        'Application tracker (5 jobs)',
      ],
      limitations: [
        'No batch tailoring',
        'No career path designer',
        'No STAR story builder',
        'No cover letter generator',
        'Limited interview questions',
      ],
      cta: 'Current Plan',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Zap,
      price: { monthly: 15, yearly: 99 },
      description: 'Everything you need to accelerate your job search',
      features: [
        'Unlimited resume uploads',
        'Unlimited resume tailoring',
        'Batch tailoring (10 jobs at once)',
        'Full ATS optimization',
        'Advanced keyword analysis',
        'Complete interview prep',
        'Company research & intelligence',
        '30 tailored practice questions',
        'STAR story builder with recording',
        'Cover letter generator (5 tones)',
        'Career path designer',
        'Certification recommendations',
        'Application tracker (unlimited)',
        'Side-by-side resume comparison',
        'Version history',
        'Priority support',
      ],
      limitations: [],
      cta: isActive && currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      popular: true,
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      icon: Crown,
      price: { monthly: 199, yearly: 199 },
      description: 'One-time payment, unlimited access forever',
      features: [
        'Everything in Pro',
        'Lifetime access (no recurring fees)',
        'All future features included',
        'Priority feature requests',
        'VIP support',
        'Early access to new features',
        'Exclusive community access',
      ],
      limitations: [],
      cta: isActive && currentPlan === 'lifetime' ? 'Current Plan' : 'Get Lifetime Access',
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-theme mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-theme-secondary mb-8">
            Choose the plan that works best for your job search
          </p>

          {/* Billing Interval Toggle */}
          <div className="inline-flex items-center gap-4 bg-theme-glass-5 rounded-full p-1.5">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                billingInterval === 'monthly'
                  ? 'bg-white text-theme-inverse shadow-lg'
                  : 'text-theme-secondary hover:text-theme'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-white text-theme-inverse shadow-lg'
                  : 'text-theme-secondary hover:text-theme'
              }`}
            >
              Yearly
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Save 45%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon
            const price = billingInterval === 'yearly' ? plan.price.yearly : plan.price.monthly
            const isCurrentPlan = currentPlan === plan.id && isActive
            const isProcessing = processingPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 shadow-2xl scale-105'
                    : 'bg-theme-glass-5 border border-white/10'
                } ${isCurrentPlan ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Active
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      plan.popular ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-theme-glass-10'
                    }`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-theme'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-theme">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-theme-secondary mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-theme">${price}</span>
                    {plan.id !== 'free' && (
                      <span className="text-theme-secondary">
                        {plan.id === 'lifetime' ? 'one-time' : `/${billingInterval === 'yearly' ? 'year' : 'month'}`}
                      </span>
                    )}
                  </div>
                  {billingInterval === 'yearly' && plan.id === 'pro' && (
                    <p className="text-xs text-green-400 mt-1">Save $81/year vs monthly</p>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id as any)}
                  disabled={isCurrentPlan || isProcessing || subLoading}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 mb-6 flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-theme-glass-10 text-theme-secondary cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-xl hover:scale-105'
                      : 'bg-white text-theme-inverse hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isCurrentPlan ? <Check className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                      {plan.cta}
                    </>
                  )}
                </button>

                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-theme-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-theme text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-theme-glass-5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-theme mb-2">Can I cancel anytime?</h3>
              <p className="text-theme-secondary">
                Yes! Pro subscriptions can be canceled anytime. You'll retain access until the end of your billing period.
              </p>
            </div>
            <div className="bg-theme-glass-5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-theme mb-2">What payment methods do you accept?</h3>
              <p className="text-theme-secondary">
                We accept all major credit cards, debit cards, and digital wallets through Stripe's secure payment processing.
              </p>
            </div>
            <div className="bg-theme-glass-5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-theme mb-2">Is the Lifetime plan really lifetime?</h3>
              <p className="text-theme-secondary">
                Yes! Pay once and get access to all current and future features forever. No recurring fees, ever.
              </p>
            </div>
            <div className="bg-theme-glass-5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-theme mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-theme-secondary">
                Absolutely. You can upgrade from Free to Pro or Lifetime anytime. Downgrades take effect at the end of your current billing cycle.
              </p>
            </div>
            <div className="bg-theme-glass-5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-theme mb-2">Do you offer refunds?</h3>
              <p className="text-theme-secondary">
                We offer a 14-day money-back guarantee on all paid plans. If you're not satisfied, contact support for a full refund.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 text-center">
          <p className="text-sm text-theme-tertiary mb-4">
            Trusted by professionals worldwide • Secure payments powered by Stripe
          </p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            <div className="text-xs text-theme-tertiary">256-bit SSL Encryption</div>
            <div className="text-xs text-theme-tertiary">•</div>
            <div className="text-xs text-theme-tertiary">PCI Compliant</div>
            <div className="text-xs text-theme-tertiary">•</div>
            <div className="text-xs text-theme-tertiary">SOC 2 Certified</div>
          </div>
        </div>
      </div>
    </div>
  )
}
