import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { lightImpact } from '../utils/haptics';
import { ANIMATION } from '../utils/constants';

export type DashboardPhase = 'greeting' | 'transitioning' | 'dashboard';

// Category group boundaries: Resume Tools (0-5), Career Prep (6-10), Growth (11-14)
const GROUP_BREAKS = [6, 11];

export function useDashboardAnimations(skipGreetingParam: boolean = false) {
  const [phase, setPhase] = useState<DashboardPhase>('greeting');
  const hasPlayedGreeting = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  // Greeting animated values
  const greetingOpacity = useSharedValue(1);
  const greetingTranslateY = useSharedValue(0);

  // Dashboard container animated values
  const dashboardOpacity = useSharedValue(0);
  const dashboardTranslateY = useSharedValue(24);

  // 15 card pairs - explicit declarations for hooks rules
  const card0Opacity = useSharedValue(0);
  const card0TranslateY = useSharedValue(20);
  const card1Opacity = useSharedValue(0);
  const card1TranslateY = useSharedValue(20);
  const card2Opacity = useSharedValue(0);
  const card2TranslateY = useSharedValue(20);
  const card3Opacity = useSharedValue(0);
  const card3TranslateY = useSharedValue(20);
  const card4Opacity = useSharedValue(0);
  const card4TranslateY = useSharedValue(20);
  const card5Opacity = useSharedValue(0);
  const card5TranslateY = useSharedValue(20);
  const card6Opacity = useSharedValue(0);
  const card6TranslateY = useSharedValue(20);
  const card7Opacity = useSharedValue(0);
  const card7TranslateY = useSharedValue(20);
  const card8Opacity = useSharedValue(0);
  const card8TranslateY = useSharedValue(20);
  const card9Opacity = useSharedValue(0);
  const card9TranslateY = useSharedValue(20);
  const card10Opacity = useSharedValue(0);
  const card10TranslateY = useSharedValue(20);
  const card11Opacity = useSharedValue(0);
  const card11TranslateY = useSharedValue(20);
  const card12Opacity = useSharedValue(0);
  const card12TranslateY = useSharedValue(20);
  const card13Opacity = useSharedValue(0);
  const card13TranslateY = useSharedValue(20);
  const card14Opacity = useSharedValue(0);
  const card14TranslateY = useSharedValue(20);

  const cardOpacities = [
    card0Opacity, card1Opacity, card2Opacity, card3Opacity, card4Opacity,
    card5Opacity, card6Opacity, card7Opacity, card8Opacity, card9Opacity,
    card10Opacity, card11Opacity, card12Opacity, card13Opacity, card14Opacity,
  ];
  const cardTranslateYs = [
    card0TranslateY, card1TranslateY, card2TranslateY, card3TranslateY, card4TranslateY,
    card5TranslateY, card6TranslateY, card7TranslateY, card8TranslateY, card9TranslateY,
    card10TranslateY, card11TranslateY, card12TranslateY, card13TranslateY, card14TranslateY,
  ];

  // Animated styles
  const greetingStyle = useAnimatedStyle(() => ({
    opacity: greetingOpacity.value,
    transform: [{ translateY: greetingTranslateY.value }],
  }));

  const dashboardStyle = useAnimatedStyle(() => ({
    opacity: dashboardOpacity.value,
    transform: [{ translateY: dashboardTranslateY.value }],
  }));

  // Card animated styles - must be explicit for hooks
  const cardStyle0 = useAnimatedStyle(() => ({ opacity: card0Opacity.value, transform: [{ translateY: card0TranslateY.value }] }));
  const cardStyle1 = useAnimatedStyle(() => ({ opacity: card1Opacity.value, transform: [{ translateY: card1TranslateY.value }] }));
  const cardStyle2 = useAnimatedStyle(() => ({ opacity: card2Opacity.value, transform: [{ translateY: card2TranslateY.value }] }));
  const cardStyle3 = useAnimatedStyle(() => ({ opacity: card3Opacity.value, transform: [{ translateY: card3TranslateY.value }] }));
  const cardStyle4 = useAnimatedStyle(() => ({ opacity: card4Opacity.value, transform: [{ translateY: card4TranslateY.value }] }));
  const cardStyle5 = useAnimatedStyle(() => ({ opacity: card5Opacity.value, transform: [{ translateY: card5TranslateY.value }] }));
  const cardStyle6 = useAnimatedStyle(() => ({ opacity: card6Opacity.value, transform: [{ translateY: card6TranslateY.value }] }));
  const cardStyle7 = useAnimatedStyle(() => ({ opacity: card7Opacity.value, transform: [{ translateY: card7TranslateY.value }] }));
  const cardStyle8 = useAnimatedStyle(() => ({ opacity: card8Opacity.value, transform: [{ translateY: card8TranslateY.value }] }));
  const cardStyle9 = useAnimatedStyle(() => ({ opacity: card9Opacity.value, transform: [{ translateY: card9TranslateY.value }] }));
  const cardStyle10 = useAnimatedStyle(() => ({ opacity: card10Opacity.value, transform: [{ translateY: card10TranslateY.value }] }));
  const cardStyle11 = useAnimatedStyle(() => ({ opacity: card11Opacity.value, transform: [{ translateY: card11TranslateY.value }] }));
  const cardStyle12 = useAnimatedStyle(() => ({ opacity: card12Opacity.value, transform: [{ translateY: card12TranslateY.value }] }));
  const cardStyle13 = useAnimatedStyle(() => ({ opacity: card13Opacity.value, transform: [{ translateY: card13TranslateY.value }] }));
  const cardStyle14 = useAnimatedStyle(() => ({ opacity: card14Opacity.value, transform: [{ translateY: card14TranslateY.value }] }));

  const cardAnimatedStyles = [
    cardStyle0, cardStyle1, cardStyle2, cardStyle3, cardStyle4,
    cardStyle5, cardStyle6, cardStyle7, cardStyle8, cardStyle9,
    cardStyle10, cardStyle11, cardStyle12, cardStyle13, cardStyle14,
  ];

  const showDashboardImmediate = useCallback(() => {
    // Set all values to final state immediately
    greetingOpacity.value = 0;
    dashboardOpacity.value = 1;
    dashboardTranslateY.value = 0;
    for (let i = 0; i < 15; i++) {
      cardOpacities[i].value = 1;
      cardTranslateYs[i].value = 0;
    }
    setPhase('dashboard');
  }, []);

  const animateCards = useCallback(() => {
    let delay = 0;
    for (let i = 0; i < 15; i++) {
      // Add extra pause between category groups
      if (GROUP_BREAKS.includes(i)) {
        delay += 80;
      }

      cardOpacities[i].value = withDelay(delay, withSpring(1, ANIMATION.smoothSpring));
      cardTranslateYs[i].value = withDelay(delay, withSpring(0, ANIMATION.smoothSpring));

      delay += 40;
    }
  }, []);

  const startTransition = useCallback(() => {
    if (phase !== 'greeting') return;
    setPhase('transitioning');

    // Fade out greeting
    greetingOpacity.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.ease) });
    greetingTranslateY.value = withTiming(-16, { duration: 250, easing: Easing.out(Easing.ease) });

    // Fire haptic
    lightImpact();

    // Fade in dashboard after greeting fades
    setTimeout(() => {
      dashboardOpacity.value = withSpring(1, ANIMATION.smoothSpring);
      dashboardTranslateY.value = withSpring(0, ANIMATION.smoothSpring);

      // Start card stagger after dashboard container is visible
      setTimeout(() => {
        setPhase('dashboard');
        animateCards();
      }, 200);
    }, 100);
  }, [phase]);

  const skipGreeting = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startTransition();
  }, [startTransition]);

  // Start greeting timer on mount (only once)
  useEffect(() => {
    if (skipGreetingParam || hasPlayedGreeting.current) {
      // Skip greeting when navigating via logo tap or already played
      showDashboardImmediate();
      return;
    }

    hasPlayedGreeting.current = true;

    if (reduceMotion) {
      showDashboardImmediate();
      return;
    }

    timerRef.current = setTimeout(() => {
      startTransition();
    }, 1500);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    phase,
    greetingStyle,
    dashboardStyle,
    cardAnimatedStyles,
    skipGreeting,
  };
}
