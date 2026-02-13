/**
 * useReduceMotion Hook
 *
 * Respects user's "Reduce Motion" accessibility preference.
 * Returns true if user has enabled Reduce Motion in iOS settings.
 *
 * Usage:
 * ```tsx
 * const reduceMotion = useReduceMotion();
 * const animationDuration = reduceMotion ? 0 : ANIMATION.normal;
 * ```
 */

import { useState, useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        setReduceMotion(enabled ?? false);
      })
      .catch(() => {
        // Fallback to false if API not available
        setReduceMotion(false);
      });

    // Listen for changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        setReduceMotion(enabled);
      }
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return reduceMotion;
}

/**
 * Helper function to get animation duration based on Reduce Motion preference
 *
 * @param normalDuration - Duration in ms when Reduce Motion is disabled
 * @param reducedDuration - Duration in ms when Reduce Motion is enabled (default: 0)
 * @returns Appropriate duration based on user preference
 */
export function getAnimationDuration(
  normalDuration: number,
  reducedDuration: number = 0
): number {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => setReduceMotion(enabled ?? false))
      .catch(() => setReduceMotion(false));
  }, []);

  return reduceMotion ? reducedDuration : normalDuration;
}

/**
 * Hook to get animation config with Reduce Motion support
 *
 * Returns animation configuration that respects user preferences.
 * When Reduce Motion is enabled, returns instant animations.
 *
 * Usage:
 * ```tsx
 * const animConfig = useAnimationConfig();
 * withTiming(value, animConfig);
 * ```
 */
export function useAnimationConfig() {
  const reduceMotion = useReduceMotion();

  return {
    duration: reduceMotion ? 0 : 250,
    easing: reduceMotion ? undefined : 'ease-in-out' as const,
  };
}
