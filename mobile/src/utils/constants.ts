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
  purple: '#8b5cf6',
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
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
