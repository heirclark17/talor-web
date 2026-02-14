import React, { createContext, useContext, useEffect, useState } from 'react';
import posthog from 'posthog-js';

interface PostHogContextType {
  isReady: boolean;
  capture: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, properties?: Record<string, any>) => void;
  reset: () => void;
}

const PostHogContext = createContext<PostHogContextType>({
  isReady: false,
  capture: () => {},
  identify: () => {},
  reset: () => {},
});

export const usePostHog = () => useContext(PostHogContext);

interface PostHogProviderProps {
  children: React.ReactNode;
}

export const PostHogProvider: React.FC<PostHogProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize PostHog
    const apiKey = import.meta.env.VITE_POSTHOG_API_KEY;
    const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

    if (!apiKey) {
      console.warn('[PostHog] API key not configured - analytics disabled');
      setIsReady(true);
      return;
    }

    try {
      posthog.init(apiKey, {
        api_host: host,
        // Automatically capture pageviews
        capture_pageview: true,
        // Automatically capture page leaves
        capture_pageleave: true,
        // Disable session recording by default for privacy
        disable_session_recording: true,
        // Enable persistence for cross-session tracking
        persistence: 'localStorage',
        // Autocapture DOM events (clicks, form submissions, etc.)
        autocapture: false, // Disable to have more control
      });

      setIsReady(true);
      console.log('[PostHog] ✅ Initialized successfully');
    } catch (error) {
      console.error('[PostHog] Initialization error:', error);
      setIsReady(true);
    }
  }, []);

  const capture = (event: string, properties?: Record<string, any>) => {
    if (!posthog.__loaded) {
      console.warn('[PostHog] Not initialized - event skipped:', event);
      return;
    }

    try {
      posthog.capture(event, properties);
      console.log('[PostHog] Event captured:', event, properties);
    } catch (error) {
      console.error('[PostHog] Capture error:', error);
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (!posthog.__loaded) {
      console.warn('[PostHog] Not initialized - identify skipped');
      return;
    }

    try {
      posthog.identify(userId, properties);
      console.log('[PostHog] User identified:', userId);
    } catch (error) {
      console.error('[PostHog] Identify error:', error);
    }
  };

  const reset = () => {
    if (!posthog.__loaded) {
      console.warn('[PostHog] Not initialized - reset skipped');
      return;
    }

    try {
      posthog.reset();
      console.log('[PostHog] Session reset');
    } catch (error) {
      console.error('[PostHog] Reset error:', error);
    }
  };

  const value: PostHogContextType = {
    isReady,
    capture,
    identify,
    reset,
  };

  return (
    <PostHogContext.Provider value={value}>
      {children}
    </PostHogContext.Provider>
  );
};
