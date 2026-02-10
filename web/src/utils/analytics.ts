/**
 * Analytics Utility - PostHog integration
 */

let posthog: any = null

export async function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return

  try {
    const { default: ph } = await import('posthog-js')
    ph.init(key, {
      api_host: 'https://us.i.posthog.com',
      autocapture: false,
      capture_pageview: true,
    })
    posthog = ph
  } catch {
    // PostHog not installed or failed to load - analytics disabled
  }
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  posthog?.identify(userId, properties)
}

export function trackEvent(name: string, properties?: Record<string, any>) {
  posthog?.capture(name, properties)
}

export function resetAnalytics() {
  posthog?.reset()
}
