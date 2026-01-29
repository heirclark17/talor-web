// API Configuration
export const API_BASE_URL = 'https://resume-ai-backend-production-3134.up.railway.app';

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
  danger: '#ef4444',
  error: '#ef4444',
  purple: '#8b5cf6',
  info: '#06b6d4',
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
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
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
  danger: {
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.30)',
    text: 'rgba(239, 68, 68, 1)',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.30)',
    text: 'rgba(16, 185, 129, 1)',
  },
  primary: {
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.30)',
    text: 'rgba(59, 130, 246, 1)',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.30)',
    text: 'rgba(245, 158, 11, 1)',
  },
  info: {
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.30)',
    text: 'rgba(6, 182, 212, 1)',
  },
  purple: {
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.30)',
    text: 'rgba(139, 92, 246, 1)',
  },
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
  // Glass-specific shadows with color tint
  glass: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
