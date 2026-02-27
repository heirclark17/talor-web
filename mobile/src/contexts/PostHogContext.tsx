import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

interface PostHogContextType {
  posthog: PostHog | null;
  isReady: boolean;
  identify: (userId: string, properties?: Record<string, any>) => void;
  capture: (event: string, properties?: Record<string, any>) => void;
  reset: () => void;
}

const PostHogContext = createContext<PostHogContextType>({
  posthog: null,
  isReady: false,
  identify: () => {},
  capture: () => {},
  reset: () => {},
});

export const usePostHog = () => useContext(PostHogContext);

interface PostHogProviderProps {
  children: React.ReactNode;
}

export const PostHogProvider: React.FC<PostHogProviderProps> = ({ children }) => {
  const [posthog, setPosthog] = useState<PostHog | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializePostHog = async () => {
      try {
        // Get API key and host from environment
        const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
        const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

        if (!apiKey) {
          console.warn('[PostHog] API key not configured - analytics disabled');
          setIsReady(true);
          return;
        }

        // Initialize PostHog
        const client = new PostHog(apiKey, {
          host,
          // Enable automatic screen tracking
          captureAppLifecycleEvents: true,
          // Enable session recording (optional)
          enableSessionReplay: false,
          // Flush events every 30 seconds
          flushInterval: 30,
        });

        // Set default super properties (sent with every event)
        await client.register({
          app_name: 'TalorMe Mobile',
          app_version: Constants.expoConfig?.version || '1.0.0',
          platform: Platform.OS,
          device_model: Constants.deviceName || 'unknown',
        });

        setPosthog(client);
        setIsReady(true);
        if (__DEV__) console.log('[PostHog] Initialized successfully');
      } catch (error) {
        console.error('[PostHog] Initialization error:', error);
        setIsReady(true); // Mark as ready even on error to not block app
      }
    };

    initializePostHog();
  }, []);

  const identify = (userId: string, properties?: Record<string, any>) => {
    if (!posthog) {
      console.warn('[PostHog] Not initialized - identify skipped');
      return;
    }

    try {
      posthog.identify(userId, properties);
      if (__DEV__) console.log('[PostHog] User identified');
    } catch (error) {
      console.error('[PostHog] Identify error:', error);
    }
  };

  const capture = (event: string, properties?: Record<string, any>) => {
    if (!posthog) {
      console.warn('[PostHog] Not initialized - event skipped:', event);
      return;
    }

    try {
      posthog.capture(event, properties);
    } catch (error) {
      console.error('[PostHog] Capture error:', error);
    }
  };

  const reset = () => {
    if (!posthog) {
      console.warn('[PostHog] Not initialized - reset skipped');
      return;
    }

    try {
      posthog.reset();
      if (__DEV__) console.log('[PostHog] Session reset');
    } catch (error) {
      console.error('[PostHog] Reset error:', error);
    }
  };

  const value: PostHogContextType = {
    posthog,
    isReady,
    identify,
    capture,
    reset,
  };

  return (
    <PostHogContext.Provider value={value}>
      {children}
    </PostHogContext.Provider>
  );
};
