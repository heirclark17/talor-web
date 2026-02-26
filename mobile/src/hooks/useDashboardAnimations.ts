import { useState } from 'react';
import { ViewStyle } from 'react-native';

export type DashboardPhase = 'greeting' | 'transitioning' | 'dashboard';

const STATIC_STYLE: ViewStyle = {};

export function useDashboardAnimations(_skipGreetingParam: boolean = false) {
  // Animations disabled — show dashboard immediately
  const [phase] = useState<DashboardPhase>('dashboard');

  const cardAnimatedStyles: ViewStyle[] = Array(15).fill(STATIC_STYLE);

  return {
    phase,
    greetingStyle: STATIC_STYLE,
    dashboardStyle: STATIC_STYLE,
    cardAnimatedStyles,
    skipGreeting: () => {},
  };
}
