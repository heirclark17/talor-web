/**
 * Constants Tests
 *
 * Pure unit tests for all exported constants from constants.ts
 */

import {
  API_BASE_URL,
  STORAGE_KEYS,
  COLORS,
  FONTS,
  SPACING,
  TAB_BAR_HEIGHT,
  RADIUS,
  GLASS,
  ALPHA_COLORS,
  SHADOWS,
  ANIMATION,
} from '../constants';

describe('Constants', () => {
  describe('API_BASE_URL', () => {
    it('should be the correct Railway backend URL', () => {
      expect(API_BASE_URL).toBe(
        'https://resume-ai-backend-production-3134.up.railway.app'
      );
    });
  });

  describe('STORAGE_KEYS', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS).toEqual({
        USER_ID: 'talor_user_id',
        SESSION_DATA: 'tailor_session_data',
        LAST_TAILORED_RESUME: 'tailor_last_viewed_resume',
        THEME: 'app_theme',
      });
    });
  });

  describe('COLORS', () => {
    it('should have all required dark theme color keys', () => {
      const darkKeys = Object.keys(COLORS.dark);
      expect(darkKeys).toContain('background');
      expect(darkKeys).toContain('backgroundSecondary');
      expect(darkKeys).toContain('backgroundTertiary');
      expect(darkKeys).toContain('text');
      expect(darkKeys).toContain('textSecondary');
      expect(darkKeys).toContain('textTertiary');
      expect(darkKeys).toContain('border');
      expect(darkKeys).toContain('accent');
      expect(darkKeys).toContain('glass');
      expect(darkKeys).toContain('glassBorder');
    });

    it('should have all required light theme color keys', () => {
      const lightKeys = Object.keys(COLORS.light);
      expect(lightKeys).toContain('background');
      expect(lightKeys).toContain('backgroundSecondary');
      expect(lightKeys).toContain('backgroundTertiary');
      expect(lightKeys).toContain('text');
      expect(lightKeys).toContain('textSecondary');
      expect(lightKeys).toContain('textTertiary');
      expect(lightKeys).toContain('border');
      expect(lightKeys).toContain('accent');
      expect(lightKeys).toContain('glass');
      expect(lightKeys).toContain('glassBorder');
    });

    it('should have all shared color values', () => {
      expect(COLORS.primary).toBe('#3b82f6');
      expect(COLORS.success).toBe('#10b981');
      expect(COLORS.warning).toBe('#f59e0b');
      expect(COLORS.danger).toBe('#ef4444');
      expect(COLORS.error).toBe('#ef4444');
      expect(COLORS.purple).toBe('#8b5cf6');
      expect(COLORS.info).toBe('#06b6d4');
      expect(COLORS.cyan).toBe('#06b6d4');
    });
  });

  describe('FONTS', () => {
    it('should have all font weight variants', () => {
      expect(FONTS.extralight).toBe('Urbanist_200ExtraLight');
      expect(FONTS.light).toBe('Urbanist_300Light');
      expect(FONTS.regular).toBe('Urbanist_400Regular');
      expect(FONTS.medium).toBe('Urbanist_500Medium');
      expect(FONTS.semibold).toBe('Urbanist_600SemiBold');
      expect(FONTS.bold).toBe('Urbanist_700Bold');
      expect(FONTS.extrabold).toBe('Urbanist_800ExtraBold');
      expect(FONTS.italic).toBe('Urbanist_400Regular');
    });
  });

  describe('SPACING', () => {
    it('should have correct spacing values', () => {
      expect(SPACING).toEqual({
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
      });
    });
  });

  describe('TAB_BAR_HEIGHT', () => {
    it('should be 100', () => {
      expect(TAB_BAR_HEIGHT).toBe(100);
    });
  });

  describe('RADIUS', () => {
    it('should have correct border radius values', () => {
      expect(RADIUS).toEqual({
        sm: 10,
        md: 16,
        lg: 24,
        xl: 32,
        full: 9999,
      });
    });
  });

  describe('GLASS', () => {
    it('should return correct blur intensity for each material', () => {
      expect(GLASS.getBlurIntensity('ultraThin')).toBe(20);
      expect(GLASS.getBlurIntensity('thin')).toBe(40);
      expect(GLASS.getBlurIntensity('regular')).toBe(60);
      expect(GLASS.getBlurIntensity('thick')).toBe(80);
      expect(GLASS.getBlurIntensity('chrome')).toBe(70);
    });

    it('should return default blur intensity (60) for unknown material', () => {
      // Force an unknown key through the type system
      expect(GLASS.getBlurIntensity('nonexistent' as any)).toBe(60);
    });

    it('should expose materials with blur and opacity properties', () => {
      expect(GLASS.materials.ultraThin).toEqual({ blur: 20, opacity: 0.15 });
      expect(GLASS.materials.thin).toEqual({ blur: 40, opacity: 0.25 });
      expect(GLASS.materials.regular).toEqual({ blur: 60, opacity: 0.35 });
      expect(GLASS.materials.thick).toEqual({ blur: 80, opacity: 0.50 });
      expect(GLASS.materials.chrome).toEqual({ blur: 70, opacity: 0.40 });
    });
  });

  describe('SHADOWS', () => {
    it('should have all shadow levels', () => {
      const shadowKeys = Object.keys(SHADOWS);
      expect(shadowKeys).toContain('none');
      expect(shadowKeys).toContain('subtle');
      expect(shadowKeys).toContain('standard');
      expect(shadowKeys).toContain('elevated');
      expect(shadowKeys).toContain('floating');
      expect(shadowKeys).toContain('glass');
    });

    it('should have correct shadow structure for each level', () => {
      for (const key of Object.keys(SHADOWS) as Array<keyof typeof SHADOWS>) {
        const shadow = SHADOWS[key];
        expect(shadow).toHaveProperty('shadowColor');
        expect(shadow).toHaveProperty('shadowOffset');
        expect(shadow).toHaveProperty('shadowOpacity');
        expect(shadow).toHaveProperty('shadowRadius');
        expect(shadow).toHaveProperty('elevation');
      }
    });
  });

  describe('ANIMATION', () => {
    it('should have correct duration values', () => {
      expect(ANIMATION.fast).toBe(150);
      expect(ANIMATION.normal).toBe(250);
      expect(ANIMATION.slow).toBe(400);
    });

    it('should have spring configuration', () => {
      expect(ANIMATION.spring).toEqual({
        damping: 15,
        stiffness: 150,
        mass: 1,
      });
    });
  });

  describe('ALPHA_COLORS', () => {
    it('should have all semantic color groups', () => {
      const keys = Object.keys(ALPHA_COLORS);
      expect(keys).toContain('danger');
      expect(keys).toContain('success');
      expect(keys).toContain('primary');
      expect(keys).toContain('warning');
      expect(keys).toContain('info');
      expect(keys).toContain('purple');
      expect(keys).toContain('white');
      expect(keys).toContain('black');
      expect(keys).toContain('neutral');
      expect(keys).toContain('neutralDark');
      expect(keys).toContain('overlay');
      expect(keys).toContain('glass');
    });
  });
});
