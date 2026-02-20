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
    } catch (error) {
      setIsReady(true);
    }
  }, []);

  const capture = (event: string, properties?: Record<string, any>) => {
    if (!posthog.__loaded) {
      return;
    }

    try {
      posthog.capture(event, properties);
    } catch (error) {
    }
  };

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (!posthog.__loaded) {
      return;
    }

    try {
      posthog.identify(userId, properties);
    } catch (error) {
    }
  };

  const reset = () => {
    if (!posthog.__loaded) {
      return;
    }

    try {
      posthog.reset();
    } catch (error) {
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
