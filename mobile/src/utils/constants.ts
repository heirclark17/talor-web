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

  // Sand Theme Colors - Light Mode (Warm Beige/Cream) - from HeirclarkHealthApp
  sandLight: {
    background: '#FAF6F1',
    backgroundSecondary: '#F5EDE4',
    backgroundTertiary: '#EDE5DB',
    text: '#1A1A1A',
    textSecondary: '#4A4A4A',
    textTertiary: '#7A7067',
    border: '#DDD5CA',
    accent: '#2C2620',
    glass: 'rgba(250, 246, 241, 0.6)',
    glassBorder: 'rgba(221, 213, 202, 0.5)',
  },

  // Sand Theme Colors - Dark Mode (Deep Warm Brown) - from HeirclarkHealthApp
  sandDark: {
    background: '#2C2620',
    backgroundSecondary: '#3D352D',
    backgroundTertiary: '#4E443A',
    text: '#FAF6F1',
    textSecondary: '#C9C0B5',
    textTertiary: '#9A9088',
    border: '#5A4F44',
    accent: '#FAF6F1',
    glass: 'rgba(44, 38, 32, 0.7)',
    glassBorder: 'rgba(90, 79, 68, 0.4)',
  },

  // Midnight Gold Theme (Luxe Leopard Print) - from HeirclarkHealthApp
  midnightGold: {
    background: '#0D0D0D',
    backgroundSecondary: '#0A0805',
    backgroundTertiary: '#151510',
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textTertiary: '#C9A227',
    border: 'rgba(201, 162, 39, 0.15)',
    accent: '#C9A227',
    glass: 'rgba(201, 162, 39, 0.08)',
    glassBorder: 'rgba(255, 215, 0, 0.20)',
    // Gold palette
    goldPrimary: '#C9A227',
    goldLight: '#FFD700',
    goldDark: '#8B7320',
    goldMuted: 'rgba(201, 162, 39, 0.6)',
  },

  // Macro/Nutrition Colors (from HeirclarkHealthApp)
  macroColors: {
    calories: '#E74C3C',      // Red
    protein: '#F39C12',       // Orange
    carbs: '#FFB6C1',         // Light pink
    fat: '#FF69B4',           // Hot pink
    fatLoss: '#9B59B6',       // Purple
  },

  // Health Metrics Colors (from HeirclarkHealthApp)
  healthColors: {
    activeEnergy: '#CC7722',    // Burnt yellow (active energy/calories burned)
    restingEnergy: '#4169E1',   // Royal blue (resting/basal energy)
    stepsColor: '#CC7722',      // Burnt yellow (steps)
    overTarget: '#FF3B30',      // Apple red for over-target
    goalAchieved: '#34C759',    // iOS green for goal met/exceeded
    gaugeFill: '#CC7722',       // Burnt yellow for gauges
    gaugeBg: '#333333',         // Dark gauge background
  },

  // Wearable Device Brand Colors (from HeirclarkHealthApp)
  wearableBrands: {
    apple_health: '#FF3B30',   // Apple Health red
    fitbit: '#00B0B9',         // Fitbit teal
    garmin: '#007CC3',         // Garmin blue
    oura: '#8B5CF6',           // Oura purple
    strava: '#FC4C02',         // Strava orange
    whoop: '#000000',          // Whoop black
    withings: '#00A9CE',       // Withings cyan
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

  // Numeric variants - SF Pro Rounded for numbers (matching HeirclarkHealthApp)
  numericUltralight: 'SFProRounded-Ultralight',
  numericThin: 'SFProRounded-Thin',
  numericLight: 'SFProRounded-Light',
  numericRegular: 'SFProRounded-Regular',
  numericMedium: 'SFProRounded-Medium',
  numericSemiBold: 'SFProRounded-Semibold',
  numericBold: 'SFProRounded-Bold',
  numericHeavy: 'SFProRounded-Heavy',
  numericBlack: 'SFProRounded-Black',
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

  // Legacy aliases for backward compatibility (from HeirclarkHealthApp)
  // Headers
  h1: {
    fontFamily: FONTS.bold,
    fontSize: 32,
  },
  h2: {
    fontFamily: FONTS.bold,
    fontSize: 28,
  },
  h3: {
    fontFamily: FONTS.semibold,
    fontSize: 24,
  },
  h4: {
    fontFamily: FONTS.semibold,
    fontSize: 20,
  },
  h5: {
    fontFamily: FONTS.semibold,
    fontSize: 18,
  },
  h6: {
    fontFamily: FONTS.semibold,
    fontSize: 16,
  },

  // Body text variants
  bodyMedium: {
    fontFamily: FONTS.medium,
    fontSize: 17,
  },
  bodySemiBold: {
    fontFamily: FONTS.semibold,
    fontSize: 17,
  },

  // Small text
  small: {
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  smallMedium: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
  smallSemiBold: {
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },

  // Caption variants
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  captionMedium: {
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
  captionSemiBold: {
    fontFamily: FONTS.semibold,
    fontSize: 12,
  },

  // Tiny text
  tiny: {
    fontFamily: FONTS.regular,
    fontSize: 10,
  },
  tinyMedium: {
    fontFamily: FONTS.medium,
    fontSize: 10,
  },
  tinySemiBold: {
    fontFamily: FONTS.semibold,
    fontSize: 10,
  },
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

// Border Radius (Standardized across mobile & web)
export const RADIUS = {
  sm: 8,       // Small elements, chips
  md: 12,      // Buttons, inputs (STANDARD)
  lg: 16,      // Cards, containers (STANDARD)
  xl: 20,      // Large cards, modals
  xxl: 24,     // Hero sections
  full: 9999,  // Pills, circles
};

// Input Heights (Standardized - matches web)
export const INPUT_HEIGHT = 48; // Standard input field height

// Icon Sizes (Standardized across mobile & web)
export const ICON_SIZES = {
  xs: 16,  // Inline with small text, badges
  sm: 20,  // Inline with body text
  md: 24,  // Standard UI icons (MOST COMMON)
  lg: 28,  // Section headers
  xl: 32,  // Hero sections, primary actions
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

  // Theme-aware helpers (from HeirclarkHealthApp LiquidGlass)
  // Helper to get liquid glass background color based on theme
  getBg: (isDark: boolean, isSelected: boolean = false, theme: 'default' | 'midnightGold' | 'sandLight' | 'sandDark' = 'default'): string => {
    if (theme === 'midnightGold') {
      return isSelected ? 'rgba(201, 162, 39, 0.18)' : 'rgba(201, 162, 39, 0.08)';
    }
    if (theme === 'sandLight') {
      return isSelected ? 'rgba(139, 115, 85, 0.15)' : 'rgba(250, 246, 241, 0.6)';
    }
    if (theme === 'sandDark') {
      return isSelected ? 'rgba(201, 160, 120, 0.18)' : 'rgba(44, 38, 32, 0.7)';
    }
    // Default theme (dark or light)
    if (isSelected) {
      return isDark ? 'rgba(150, 206, 180, 0.15)' : 'rgba(150, 206, 180, 0.12)';
    }
    return isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)';
  },

  // Helper to get liquid glass border color based on theme
  getBorder: (isDark: boolean, isSelected: boolean = false, theme: 'default' | 'midnightGold' | 'sandLight' | 'sandDark' = 'default'): string => {
    if (theme === 'midnightGold') {
      return isSelected ? 'rgba(255, 215, 0, 0.40)' : 'rgba(255, 215, 0, 0.20)';
    }
    if (theme === 'sandLight') {
      return isSelected ? 'rgba(139, 115, 85, 0.35)' : 'rgba(221, 213, 202, 0.5)';
    }
    if (theme === 'sandDark') {
      return isSelected ? 'rgba(201, 160, 120, 0.35)' : 'rgba(90, 79, 68, 0.4)';
    }
    // Default theme (dark or light)
    if (isSelected) {
      return isDark ? 'rgba(150, 206, 180, 0.4)' : 'rgba(150, 206, 180, 0.45)';
    }
    return isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  },

  // Helper to get blur intensity based on theme
  getBlurIntensityByTheme: (isDark: boolean, theme: 'default' | 'midnightGold' | 'sandLight' | 'sandDark' = 'default'): number => {
    if (theme === 'midnightGold') return 60; // Higher blur for gold theme (better contrast)
    if (theme === 'sandLight') return 40;
    if (theme === 'sandDark') return 25;
    return isDark ? 20 : 35; // Default theme
  },

  // Helper to get standard border width for glass components
  getBorderWidth: (): number => {
    return 1; // Standard 1px border for glass components
  },

  // Helper to get border color for glass components (default theme)
  getBorderColor: (): string => {
    // Using default dark theme border color (most common use case)
    return 'rgba(255, 255, 255, 0.06)';
  },

  // Helper to get corner radius based on size
  getCornerRadius: (size: 'small' | 'medium' | 'large' = 'medium'): number => {
    switch (size) {
      case 'small':
        return 8;
      case 'medium':
        return 12;
      case 'large':
        return 16;
      default:
        return 12;
    }
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

// ========== ANIMATION DURATIONS & SPRING CONFIGS ==========
export const ANIMATION = {
  // Timing durations (from HeirclarkHealthApp)
  fast: 150,
  normal: 250,
  slow: 400,

  // Legacy single spring config (kept for backward compatibility)
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  // Multiple spring configurations (from HeirclarkHealthApp)
  // GLASS_SPRING - iOS-style smooth spring animation
  // Used for: Glass card interactions, button presses, tab transitions
  glassSpring: {
    damping: 18,
    stiffness: 380,
    mass: 0.8,
  },

  // SMOOTH_SPRING - Gentle spring animation
  // Used for: Subtle UI transitions, modal appearances
  smoothSpring: {
    damping: 20,
    stiffness: 300,
    mass: 1,
  },

  // BOUNCY_SPRING - Playful bounce effect
  // Used for: Success animations, celebration moments
  bouncySpring: {
    damping: 12,
    stiffness: 400,
    mass: 0.5,
  },
};
