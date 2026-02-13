// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://resume-ai-backend-production-3134.up.railway.app';

// Clerk Authentication
export const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

// Storage Keys
export const STORAGE_KEYS = {
  USER_ID: 'talor_user_id',
  SESSION_DATA: 'tailor_session_data',
  LAST_TAILORED_RESUME: 'tailor_last_viewed_resume',
  THEME: 'app_theme',
};

// Colors - matching web app theme
export const COLORS = {
  // Dark theme (primary)
  dark: {
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    border: '#374151',
    accent: '#60a5fa',
    glass: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
  },
  // Light theme
  light: {
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    backgroundTertiary: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#64748b',
    border: '#cbd5e1',
    accent: '#3b82f6',
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(148, 163, 184, 0.3)',
  },
  // Shared colors
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f87171',
  error: '#f87171',
  purple: '#8b5cf6',
  info: '#06b6d4',
  cyan: '#06b6d4',

  // Semantic color variants (from health app design system)
  semanticColors: {
    success: '#10b981',
    successStrong: '#4ADE80',
    successMuted: '#96CEB4',
    error: '#f87171',
    errorStrong: '#FF3B30',
    errorMuted: '#FCA5A5',
    warning: '#f59e0b',
    warningOrange: '#FB923C',
    warningMuted: '#FDE68A',
    info: '#06b6d4',
    infoStrong: '#22D3EE',
    infoMuted: '#A5F3FC',
  },
};

// Typography - Urbanist font family
export const FONTS = {
  extralight: 'Urbanist_200ExtraLight',
  light: 'Urbanist_300Light',
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
  extrabold: 'Urbanist_800ExtraBold',
  italic: 'Urbanist_400Regular', // Fallback - Urbanist doesn't have separate italic

  // Numeric variants (using Urbanist bold weights for numbers)
  // In future, can be replaced with SF Pro Rounded for iOS
  numericUltralight: 'Urbanist_200ExtraLight',
  numericThin: 'Urbanist_300Light',
  numericLight: 'Urbanist_300Light',
  numericRegular: 'Urbanist_400Regular',
  numericMedium: 'Urbanist_500Medium',
  numericSemiBold: 'Urbanist_600SemiBold',
  numericBold: 'Urbanist_700Bold',
  numericHeavy: 'Urbanist_800ExtraBold',
  numericBlack: 'Urbanist_800ExtraBold',
};

// iOS Typography Scale (from Human Interface Guidelines)
export const TYPOGRAPHY = {
  largeTitle: { fontFamily: FONTS.bold, fontSize: 34, lineHeight: 41 },
  title1: { fontFamily: FONTS.bold, fontSize: 28, lineHeight: 34 },
  title2: { fontFamily: FONTS.semibold, fontSize: 22, lineHeight: 28 },
  title3: { fontFamily: FONTS.semibold, fontSize: 20, lineHeight: 25 },
  headline: { fontFamily: FONTS.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: FONTS.regular, fontSize: 17, lineHeight: 22 },
  callout: { fontFamily: FONTS.regular, fontSize: 16, lineHeight: 21 },
  subhead: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 20 },
  footnote: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  caption1: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16 },
  caption2: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 13 },
};

// Spacing
export const SPACING = {
  // Base spacing scale
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Semantic spacing (from health app)
  screenMargin: 16,
  screenMarginIPad: 24,
  cardPadding: 16,
  cardGap: 16,
  sectionGap: 24,
  touchTarget: 44,      // Minimum touch target size (iOS HIG)
  touchTargetLarge: 48,

  // iOS 26 border radius standards
  radiusXS: 4,
  radiusSM: 8,
  radiusMD: 20,    // Cards (extra round for iOS 26 aesthetic)
  radiusLG: 24,
  radiusXL: 32,
};

// Tab Bar
export const TAB_BAR_HEIGHT = 100; // Height of tab bar (65px) + safe area padding (~35px)

// Border Radius
export const RADIUS = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

// ========== GLASS MATERIALS (iOS 26 Liquid Glass) ==========
const GLASS_MATERIALS = {
  ultraThin: { blur: 20, opacity: 0.15 },
  thin: { blur: 40, opacity: 0.25 },
  regular: { blur: 60, opacity: 0.35 },
  thick: { blur: 80, opacity: 0.50 },
  chrome: { blur: 70, opacity: 0.40 },
} as const;

export const GLASS = {
  materials: GLASS_MATERIALS,
  // Helper to get blur intensity based on material
  getBlurIntensity: (material: keyof typeof GLASS_MATERIALS): number => {
    return GLASS_MATERIALS[material]?.blur ?? 60;
  },
};

// ========== ALPHA COLORS (for badges/overlays/semantic) ==========
export const ALPHA_COLORS = {
  // Semantic colors with alpha variants
  danger: {
    bg: 'rgba(239, 68, 68, 0.15)',
    bgSubtle: 'rgba(239, 68, 68, 0.10)',
    border: 'rgba(239, 68, 68, 0.30)',
    text: 'rgba(239, 68, 68, 1)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    bgSubtle: 'rgba(16, 185, 129, 0.10)',
    border: 'rgba(16, 185, 129, 0.30)',
    text: 'rgba(16, 185, 129, 1)',
  },
  primary: {
    bg: 'rgba(59, 130, 246, 0.15)',
    bgSubtle: 'rgba(59, 130, 246, 0.10)',
    bgStrong: 'rgba(59, 130, 246, 0.20)',
    border: 'rgba(59, 130, 246, 0.30)',
    text: 'rgba(59, 130, 246, 1)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    bgSubtle: 'rgba(245, 158, 11, 0.10)',
    border: 'rgba(245, 158, 11, 0.30)',
    text: 'rgba(245, 158, 11, 1)',
  },
  info: {
    bg: 'rgba(6, 182, 212, 0.15)',
    bgSubtle: 'rgba(6, 182, 212, 0.10)',
    border: 'rgba(6, 182, 212, 0.30)',
    text: 'rgba(6, 182, 212, 1)',
  },
  purple: {
    bg: 'rgba(139, 92, 246, 0.15)',
    bgSubtle: 'rgba(139, 92, 246, 0.10)',
    border: 'rgba(139, 92, 246, 0.30)',
    text: 'rgba(139, 92, 246, 1)',
  },
  // White-based alpha colors (for dark mode)
  white: {
    5: 'rgba(255, 255, 255, 0.05)',
    10: 'rgba(255, 255, 255, 0.10)',
    15: 'rgba(255, 255, 255, 0.15)',
    20: 'rgba(255, 255, 255, 0.20)',
    30: 'rgba(255, 255, 255, 0.30)',
    50: 'rgba(255, 255, 255, 0.50)',
    70: 'rgba(255, 255, 255, 0.70)',
    80: 'rgba(255, 255, 255, 0.80)',
    90: 'rgba(255, 255, 255, 0.90)',
  },
  // Black-based alpha colors (for light mode)
  black: {
    3: 'rgba(0, 0, 0, 0.03)',
    5: 'rgba(0, 0, 0, 0.05)',
    10: 'rgba(0, 0, 0, 0.10)',
    15: 'rgba(0, 0, 0, 0.15)',
    20: 'rgba(0, 0, 0, 0.20)',
    30: 'rgba(0, 0, 0, 0.30)',
    50: 'rgba(0, 0, 0, 0.50)',
    70: 'rgba(0, 0, 0, 0.70)',
    80: 'rgba(0, 0, 0, 0.80)',
  },
  // Neutral (legacy support)
  neutral: {
    bg: 'rgba(255, 255, 255, 0.10)',
    border: 'rgba(255, 255, 255, 0.20)',
    text: 'rgba(255, 255, 255, 0.70)',
  },
  neutralDark: {
    bg: 'rgba(0, 0, 0, 0.10)',
    border: 'rgba(0, 0, 0, 0.20)',
    text: 'rgba(0, 0, 0, 0.70)',
  },
  // Overlay colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.50)',
    medium: 'rgba(0, 0, 0, 0.60)',
    dark: 'rgba(0, 0, 0, 0.70)',
    heavy: 'rgba(0, 0, 0, 0.80)',
  },
  // Glass tints
  glass: {
    light: 'rgba(255, 255, 255, 0.25)',
    medium: 'rgba(255, 255, 255, 0.15)',
    subtle: 'rgba(255, 255, 255, 0.10)',
    dark: 'rgba(0, 0, 0, 0.25)',
    darkMedium: 'rgba(0, 0, 0, 0.15)',
    darkSubtle: 'rgba(0, 0, 0, 0.10)',
  },
};

// ========== SHADOWS ==========
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  standard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 8,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  // Glass-specific shadows - iOS 26 Liquid Glass compliant
  // Uses black shadow color with soft diffusion for glass effect
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};

// ========== ANIMATION DURATIONS ==========
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
};
