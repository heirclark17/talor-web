/**
 * Wrapper for @callstack/liquid-glass that handles unsupported platforms gracefully.
 * On platforms without iOS 26 / Xcode 26 support, exports fallback components.
 */
import React from 'react';
import { View, ViewProps, Platform } from 'react-native';

// Type definitions matching the library's API
interface LiquidGlassViewProps extends ViewProps {
  interactive?: boolean;
  effect?: 'clear' | 'regular' | 'none';
  tintColor?: string;
  colorScheme?: 'light' | 'dark' | 'system';
  children?: React.ReactNode;
}

interface LiquidGlassContainerViewProps extends ViewProps {
  spacing?: number;
  children?: React.ReactNode;
}

// Try to import the native module, fall back to View if unavailable
let LiquidGlassViewComponent: React.ComponentType<any> = View;
let LiquidGlassContainerViewComponent: React.ComponentType<any> = View;
let liquidGlassSupported = false;

// Only attempt to load on iOS
if (Platform.OS === 'ios') {
  try {
    const liquidGlass = require('@callstack/liquid-glass');
    console.log('[LiquidGlass] Module loaded:', Object.keys(liquidGlass));
    console.log('[LiquidGlass] isLiquidGlassSupported:', liquidGlass.isLiquidGlassSupported);

    // The library exports isLiquidGlassSupported as a boolean constant
    if (liquidGlass.isLiquidGlassSupported === true) {
      LiquidGlassViewComponent = liquidGlass.LiquidGlassView;
      LiquidGlassContainerViewComponent = liquidGlass.LiquidGlassContainerView;
      liquidGlassSupported = true;
      console.log('[LiquidGlass] Native Liquid Glass enabled!');
    } else {
      console.log('[LiquidGlass] iOS version does not support Liquid Glass (requires iOS 26+)');
    }
  } catch (e: any) {
    // Native module not available, use fallbacks
    console.log('[LiquidGlass] Native module not available:', e.message);
  }
}

// Export wrapped components that pass through all props
export const LiquidGlassView: React.FC<LiquidGlassViewProps> = (props) => {
  return <LiquidGlassViewComponent {...props} />;
};

export const LiquidGlassContainerView: React.FC<LiquidGlassContainerViewProps> = (props) => {
  return <LiquidGlassContainerViewComponent {...props} />;
};

export const isLiquidGlassSupported = liquidGlassSupported;
