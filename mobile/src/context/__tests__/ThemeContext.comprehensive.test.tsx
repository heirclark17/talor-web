/**
 * Comprehensive Tests for context/ThemeContext.tsx
 *
 * Uses react-test-renderer to render ThemeProvider with consumer components
 * that read context values, enabling full coverage of:
 * - ThemeProvider initialization and isInitialized gate
 * - AsyncStorage loading of saved preferences (theme, background, custom URI)
 * - setThemeMode, setBackgroundImage, setCustomBackgroundUri persistence
 * - isDark computation (dark/light/system modes)
 * - Color object selection (COLORS.dark vs COLORS.light)
 * - getGlassBackground helper for all 5 materials x dark/light
 * - getGlassCardStyle helper for all 5 materials x dark/light
 * - All four hooks: useTheme, useColors, useBackground, useGlass
 * - useTheme default context when used outside ThemeProvider
 * - Error handling for AsyncStorage load/save failures
 *
 * Target: 100% line/branch/function coverage for ThemeContext.tsx
 */

// Mock backgrounds constants
jest.mock('../../constants/backgrounds', () => ({
  DEFAULT_BACKGROUND_ID: 'default',
  BackgroundId: {},
}));

import React from 'react';
import renderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import {
  COLORS,
  STORAGE_KEYS,
  GLASS,
  SHADOWS,
  ALPHA_COLORS,
} from '../../utils/constants';

// Import the module under test
import {
  ThemeProvider,
  useTheme,
  useColors,
  useBackground,
  useGlass,
} from '../ThemeContext';

// Typed reference to the useColorScheme mock
const mockUseColorScheme = useColorScheme as jest.Mock;

// ---------- Consumer Components ----------
// Each consumer captures hook results into a mutable ref for assertions.

let themeResult: any = null;
function ThemeConsumer() {
  themeResult = useTheme();
  return null;
}

let colorsResult: any = null;
function ColorsConsumer() {
  colorsResult = useColors();
  return null;
}

let backgroundResult: any = null;
function BackgroundConsumer() {
  backgroundResult = useBackground();
  return null;
}

let glassResult: any = null;
function GlassConsumer() {
  glassResult = useGlass();
  return null;
}

// ---------- Helpers ----------

/**
 * Render ThemeProvider with the given consumer, wait for initialization,
 * and return the renderer tree.
 */
async function renderWithProvider(
  Consumer: React.ComponentType,
  presetStorage?: Record<string, string>
) {
  // Pre-populate AsyncStorage if requested
  if (presetStorage) {
    for (const [key, value] of Object.entries(presetStorage)) {
      await AsyncStorage.setItem(key, value);
    }
  }

  let tree: renderer.ReactTestRenderer;
  await renderer.act(async () => {
    tree = renderer.create(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(Consumer)
      )
    );
  });

  return tree!;
}

/**
 * Safely unmount a tree inside act() to avoid warnings.
 */
async function safeUnmount(tree: renderer.ReactTestRenderer) {
  await renderer.act(async () => {
    tree.unmount();
  });
}

// ---------- Test Suite ----------

describe('ThemeContext - Comprehensive Tests', () => {
  beforeEach(async () => {
    // Reset ONLY specific things -- do NOT call jest.clearAllMocks()
    // because it destroys AsyncStorage's mock implementations.
    // Instead, clear the storage contents and reset our consumer refs.
    await AsyncStorage.clear();

    // Default system color scheme to dark
    mockUseColorScheme.mockReturnValue('dark');

    // Reset consumer results
    themeResult = null;
    colorsResult = null;
    backgroundResult = null;
    glassResult = null;
  });

  // =================================================================
  // 1. ThemeProvider Initialization & isInitialized Gate
  // =================================================================
  describe('ThemeProvider initialization', () => {
    it('renders children after initialization completes', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult).not.toBeNull();
      await safeUnmount(tree);
    });

    it('provides default values when no saved preferences exist', async () => {
      const tree = await renderWithProvider(ThemeConsumer);

      expect(themeResult.isDark).toBe(true);
      expect(themeResult.themeMode).toBe('dark');
      expect(themeResult.backgroundId).toBe('default');
      expect(themeResult.customBackgroundUri).toBeNull();
      expect(themeResult.colors).toBe(COLORS.dark);
      expect(themeResult.glass).toBe(GLASS);
      expect(themeResult.shadows).toBe(SHADOWS);
      expect(themeResult.alphaColors).toBe(ALPHA_COLORS);
      expect(typeof themeResult.setThemeMode).toBe('function');
      expect(typeof themeResult.setBackgroundImage).toBe('function');
      expect(typeof themeResult.setCustomBackgroundUri).toBe('function');
      expect(typeof themeResult.getGlassBackground).toBe('function');
      expect(typeof themeResult.getGlassCardStyle).toBe('function');

      await safeUnmount(tree);
    });

    it('returns null before preferences are loaded (isInitialized gate)', async () => {
      // Temporarily override getItem to hang indefinitely
      const originalImpl = (AsyncStorage.getItem as jest.Mock).getMockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // never resolves
      );

      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(
          React.createElement(
            ThemeProvider,
            null,
            React.createElement('View', null, 'child-text')
          )
        );
      });

      // Provider should return null (no children rendered)
      const json = tree!.toJSON();
      expect(json).toBeNull();

      // Restore original implementation
      if (originalImpl) {
        (AsyncStorage.getItem as jest.Mock).mockImplementation(originalImpl);
      }
      await safeUnmount(tree!);
    });
  });

  // =================================================================
  // 2. AsyncStorage Loading of Saved Preferences
  // =================================================================
  describe('AsyncStorage preference loading', () => {
    it('loads saved dark theme mode from AsyncStorage', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'dark',
      });

      expect(themeResult.themeMode).toBe('dark');
      expect(themeResult.isDark).toBe(true);

      await safeUnmount(tree);
    });

    it('loads saved light theme mode from AsyncStorage', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });

      expect(themeResult.themeMode).toBe('light');
      expect(themeResult.isDark).toBe(false);
      expect(themeResult.colors).toBe(COLORS.light);

      await safeUnmount(tree);
    });

    it('loads saved system theme mode from AsyncStorage', async () => {
      mockUseColorScheme.mockReturnValue('light');
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'system',
      });

      expect(themeResult.themeMode).toBe('system');
      expect(themeResult.isDark).toBe(false);
      expect(themeResult.colors).toBe(COLORS.light);

      await safeUnmount(tree);
    });

    it('ignores invalid saved theme mode', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'invalid_mode',
      });

      // Falls back to default 'dark'
      expect(themeResult.themeMode).toBe('dark');

      await safeUnmount(tree);
    });

    it('loads saved background ID from AsyncStorage', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        talor_background: 'ocean-depths',
      });

      expect(themeResult.backgroundId).toBe('ocean-depths');

      await safeUnmount(tree);
    });

    it('loads saved custom background URI from AsyncStorage', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        talor_custom_bg: 'file:///photos/custom.jpg',
      });

      expect(themeResult.customBackgroundUri).toBe('file:///photos/custom.jpg');

      await safeUnmount(tree);
    });

    it('loads all three preferences simultaneously', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
        talor_background: 'aurora',
        talor_custom_bg: 'file:///my-bg.png',
      });

      expect(themeResult.themeMode).toBe('light');
      expect(themeResult.backgroundId).toBe('aurora');
      expect(themeResult.customBackgroundUri).toBe('file:///my-bg.png');

      await safeUnmount(tree);
    });

    it('handles AsyncStorage load error gracefully and still initializes', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Save original implementation and override
      const originalImpl = (AsyncStorage.getItem as jest.Mock).getMockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage read failure'));

      const tree = await renderWithProvider(ThemeConsumer);

      // Should still initialize with defaults
      expect(themeResult).not.toBeNull();
      expect(themeResult.themeMode).toBe('dark');
      expect(themeResult.backgroundId).toBe('default');
      expect(themeResult.customBackgroundUri).toBeNull();

      // Should have logged the error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading theme preferences:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      // Restore original implementation
      if (originalImpl) {
        (AsyncStorage.getItem as jest.Mock).mockImplementation(originalImpl);
      }
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 3. setThemeMode and Persistence
  // =================================================================
  describe('setThemeMode', () => {
    it('changes theme to light mode and persists', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult.themeMode).toBe('dark');

      await renderer.act(async () => {
        await themeResult.setThemeMode('light');
      });

      expect(themeResult.themeMode).toBe('light');
      expect(themeResult.isDark).toBe(false);
      expect(themeResult.colors).toBe(COLORS.light);

      // Verify persistence
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      expect(stored).toBe('light');

      await safeUnmount(tree);
    });

    it('changes theme to system mode and persists', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      const tree = await renderWithProvider(ThemeConsumer);

      await renderer.act(async () => {
        await themeResult.setThemeMode('system');
      });

      expect(themeResult.themeMode).toBe('system');
      expect(themeResult.isDark).toBe(true);

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      expect(stored).toBe('system');

      await safeUnmount(tree);
    });

    it('changes theme back to dark mode from light', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });
      expect(themeResult.themeMode).toBe('light');

      await renderer.act(async () => {
        await themeResult.setThemeMode('dark');
      });

      expect(themeResult.themeMode).toBe('dark');
      expect(themeResult.isDark).toBe(true);
      expect(themeResult.colors).toBe(COLORS.dark);

      await safeUnmount(tree);
    });

    it('handles AsyncStorage save error when setting theme mode', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const tree = await renderWithProvider(ThemeConsumer);

      // Save original and override setItem to fail once
      const originalImpl = (AsyncStorage.setItem as jest.Mock).getMockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Write failure')
      );

      await renderer.act(async () => {
        await themeResult.setThemeMode('light');
      });

      // State should still change even though persist failed
      expect(themeResult.themeMode).toBe('light');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving theme mode:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      // Restore
      if (originalImpl) {
        (AsyncStorage.setItem as jest.Mock).mockImplementation(originalImpl);
      }
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 4. setBackgroundImage and Persistence
  // =================================================================
  describe('setBackgroundImage', () => {
    it('changes background ID and persists', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult.backgroundId).toBe('default');

      await renderer.act(async () => {
        await themeResult.setBackgroundImage('ocean-depths');
      });

      expect(themeResult.backgroundId).toBe('ocean-depths');

      const stored = await AsyncStorage.getItem('talor_background');
      expect(stored).toBe('ocean-depths');

      await safeUnmount(tree);
    });

    it('handles AsyncStorage save error when setting background', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const tree = await renderWithProvider(ThemeConsumer);

      const originalImpl = (AsyncStorage.setItem as jest.Mock).getMockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Background write failure')
      );

      await renderer.act(async () => {
        await themeResult.setBackgroundImage('aurora');
      });

      expect(themeResult.backgroundId).toBe('aurora');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving background:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      if (originalImpl) {
        (AsyncStorage.setItem as jest.Mock).mockImplementation(originalImpl);
      }
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 5. setCustomBackgroundUri and Persistence
  // =================================================================
  describe('setCustomBackgroundUri', () => {
    it('sets a custom URI and persists it', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult.customBackgroundUri).toBeNull();

      await renderer.act(async () => {
        await themeResult.setCustomBackgroundUri('file:///custom.jpg');
      });

      expect(themeResult.customBackgroundUri).toBe('file:///custom.jpg');

      const stored = await AsyncStorage.getItem('talor_custom_bg');
      expect(stored).toBe('file:///custom.jpg');

      await safeUnmount(tree);
    });

    it('clears custom URI by passing null and removes from storage', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        talor_custom_bg: 'file:///existing.png',
      });
      expect(themeResult.customBackgroundUri).toBe('file:///existing.png');

      await renderer.act(async () => {
        await themeResult.setCustomBackgroundUri(null);
      });

      expect(themeResult.customBackgroundUri).toBeNull();

      // Verify the value was removed from storage
      const stored = await AsyncStorage.getItem('talor_custom_bg');
      expect(stored).toBeNull();

      await safeUnmount(tree);
    });

    it('handles AsyncStorage save error when setting custom URI', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const tree = await renderWithProvider(ThemeConsumer);

      const originalImpl = (AsyncStorage.setItem as jest.Mock).getMockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Custom BG write failure')
      );

      await renderer.act(async () => {
        await themeResult.setCustomBackgroundUri('file:///custom.png');
      });

      expect(themeResult.customBackgroundUri).toBe('file:///custom.png');
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving custom background:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      if (originalImpl) {
        (AsyncStorage.setItem as jest.Mock).mockImplementation(originalImpl);
      }
      await safeUnmount(tree);
    });

    it('handles AsyncStorage removeItem error when clearing custom URI', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const tree = await renderWithProvider(ThemeConsumer, {
        talor_custom_bg: 'file:///existing.png',
      });

      const originalImpl = (AsyncStorage.removeItem as jest.Mock).getMockImplementation();
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Remove failure')
      );

      await renderer.act(async () => {
        await themeResult.setCustomBackgroundUri(null);
      });

      expect(themeResult.customBackgroundUri).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error saving custom background:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
      if (originalImpl) {
        (AsyncStorage.removeItem as jest.Mock).mockImplementation(originalImpl);
      }
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 6. isDark Computation (dark/light/system modes)
  // =================================================================
  describe('isDark computation', () => {
    it('isDark is true when themeMode is dark', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult.isDark).toBe(true);
      await safeUnmount(tree);
    });

    it('isDark is false when themeMode is light', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });
      expect(themeResult.isDark).toBe(false);
      await safeUnmount(tree);
    });

    it('isDark follows system preference when themeMode is system (dark system)', async () => {
      mockUseColorScheme.mockReturnValue('dark');
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'system',
      });
      expect(themeResult.isDark).toBe(true);
      await safeUnmount(tree);
    });

    it('isDark follows system preference when themeMode is system (light system)', async () => {
      mockUseColorScheme.mockReturnValue('light');
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'system',
      });
      expect(themeResult.isDark).toBe(false);
      await safeUnmount(tree);
    });

    it('isDark is false when system mode and system returns null', async () => {
      mockUseColorScheme.mockReturnValue(null);
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'system',
      });
      // null !== 'dark', so isDark = false
      expect(themeResult.isDark).toBe(false);
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 7. Color Object Generation
  // =================================================================
  describe('color object generation', () => {
    it('returns COLORS.dark when isDark is true', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult.colors).toBe(COLORS.dark);
      expect(themeResult.colors.background).toBe('#0a0a0a');
      expect(themeResult.colors.text).toBe('#ffffff');
      await safeUnmount(tree);
    });

    it('returns COLORS.light when isDark is false', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });
      expect(themeResult.colors).toBe(COLORS.light);
      expect(themeResult.colors.background).toBe('#f8fafc');
      expect(themeResult.colors.text).toBe('#0f172a');
      await safeUnmount(tree);
    });

    it('color object updates when theme mode changes', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      expect(themeResult.colors).toBe(COLORS.dark);

      await renderer.act(async () => {
        await themeResult.setThemeMode('light');
      });

      expect(themeResult.colors).toBe(COLORS.light);
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 8. getGlassBackground Helper
  // =================================================================
  describe('getGlassBackground', () => {
    const materialNames: Array<keyof typeof GLASS.materials> = [
      'ultraThin',
      'thin',
      'regular',
      'thick',
      'chrome',
    ];

    describe('dark mode', () => {
      materialNames.forEach((material) => {
        it(`returns correct dark glass background for ${material} material`, async () => {
          const tree = await renderWithProvider(ThemeConsumer);
          const result = themeResult.getGlassBackground(material);

          const { opacity } = GLASS.materials[material];
          const expectedBg = `rgba(255, 255, 255, ${opacity * 0.3})`;
          expect(result).toEqual({ backgroundColor: expectedBg });

          await safeUnmount(tree);
        });
      });

      it('defaults to regular material when no argument is passed', async () => {
        const tree = await renderWithProvider(ThemeConsumer);
        const result = themeResult.getGlassBackground();

        const { opacity } = GLASS.materials.regular;
        expect(result).toEqual({
          backgroundColor: `rgba(255, 255, 255, ${opacity * 0.3})`,
        });

        await safeUnmount(tree);
      });
    });

    describe('light mode', () => {
      materialNames.forEach((material) => {
        it(`returns correct light glass background for ${material} material`, async () => {
          const tree = await renderWithProvider(ThemeConsumer, {
            [STORAGE_KEYS.THEME]: 'light',
          });
          const result = themeResult.getGlassBackground(material);

          const { opacity } = GLASS.materials[material];
          const expectedBg = `rgba(255, 255, 255, ${opacity})`;
          expect(result).toEqual({ backgroundColor: expectedBg });

          await safeUnmount(tree);
        });
      });
    });
  });

  // =================================================================
  // 9. getGlassCardStyle Helper
  // =================================================================
  describe('getGlassCardStyle', () => {
    it('returns complete card style in dark mode with default material', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      const result = themeResult.getGlassCardStyle();

      const { opacity } = GLASS.materials.regular;
      expect(result).toEqual({
        backgroundColor: `rgba(255, 255, 255, ${opacity * 0.3})`,
        borderWidth: 1,
        borderColor: ALPHA_COLORS.white[10],
        borderRadius: 16,
        overflow: 'hidden',
      });

      await safeUnmount(tree);
    });

    it('returns complete card style in light mode with default material', async () => {
      const tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });
      const result = themeResult.getGlassCardStyle();

      const { opacity } = GLASS.materials.regular;
      expect(result).toEqual({
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        borderWidth: 1,
        borderColor: ALPHA_COLORS.black[10],
        borderRadius: 16,
        overflow: 'hidden',
      });

      await safeUnmount(tree);
    });

    it('uses specified material for card style', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      const result = themeResult.getGlassCardStyle('thick');

      const { opacity } = GLASS.materials.thick;
      expect(result.backgroundColor).toBe(
        `rgba(255, 255, 255, ${opacity * 0.3})`
      );

      await safeUnmount(tree);
    });

    it('card style includes borderWidth 1 and borderRadius 16', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      const result = themeResult.getGlassCardStyle('ultraThin');

      expect(result.borderWidth).toBe(1);
      expect(result.borderRadius).toBe(16);
      expect(result.overflow).toBe('hidden');

      await safeUnmount(tree);
    });

    it('dark mode uses white[10] border, light mode uses black[10] border', async () => {
      // Dark mode
      let tree = await renderWithProvider(ThemeConsumer);
      let result = themeResult.getGlassCardStyle();
      expect(result.borderColor).toBe(ALPHA_COLORS.white[10]);
      await safeUnmount(tree);

      // Light mode
      themeResult = null;
      tree = await renderWithProvider(ThemeConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });
      result = themeResult.getGlassCardStyle();
      expect(result.borderColor).toBe(ALPHA_COLORS.black[10]);
      await safeUnmount(tree);
    });

    it('getGlassCardStyle works for all 5 materials in dark mode', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      const materialNames: Array<keyof typeof GLASS.materials> = [
        'ultraThin', 'thin', 'regular', 'thick', 'chrome',
      ];

      for (const material of materialNames) {
        const result = themeResult.getGlassCardStyle(material);
        const { opacity } = GLASS.materials[material];
        expect(result.backgroundColor).toBe(
          `rgba(255, 255, 255, ${opacity * 0.3})`
        );
        expect(result.borderColor).toBe(ALPHA_COLORS.white[10]);
      }

      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 10. useTheme Hook
  // =================================================================
  describe('useTheme hook', () => {
    it('returns all expected context fields', async () => {
      const tree = await renderWithProvider(ThemeConsumer);

      expect(themeResult).toHaveProperty('isDark');
      expect(themeResult).toHaveProperty('themeMode');
      expect(themeResult).toHaveProperty('setThemeMode');
      expect(themeResult).toHaveProperty('colors');
      expect(themeResult).toHaveProperty('backgroundId');
      expect(themeResult).toHaveProperty('setBackgroundImage');
      expect(themeResult).toHaveProperty('customBackgroundUri');
      expect(themeResult).toHaveProperty('setCustomBackgroundUri');
      expect(themeResult).toHaveProperty('glass');
      expect(themeResult).toHaveProperty('shadows');
      expect(themeResult).toHaveProperty('alphaColors');
      expect(themeResult).toHaveProperty('getGlassBackground');
      expect(themeResult).toHaveProperty('getGlassCardStyle');

      await safeUnmount(tree);
    });

    it('provides working context when used inside ThemeProvider', async () => {
      const tree = await renderWithProvider(ThemeConsumer);
      // Verify the context is functional (not the default no-ops)
      const glassResult = themeResult.getGlassBackground();
      expect(glassResult).toHaveProperty('backgroundColor');
      // Default no-op returns {}, real impl returns {backgroundColor: ...}
      expect(Object.keys(glassResult).length).toBeGreaterThan(0);
      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 11. useColors Hook
  // =================================================================
  describe('useColors hook', () => {
    it('returns colors object for dark mode', async () => {
      const tree = await renderWithProvider(ColorsConsumer);

      expect(colorsResult).toBe(COLORS.dark);
      expect(colorsResult.background).toBe('#0a0a0a');
      expect(colorsResult.text).toBe('#ffffff');
      expect(colorsResult.textSecondary).toBe('#9ca3af');
      expect(colorsResult.textTertiary).toBe('#6b7280');
      expect(colorsResult.border).toBe('#374151');
      expect(colorsResult.accent).toBe('#60a5fa');

      await safeUnmount(tree);
    });

    it('returns colors object for light mode', async () => {
      const tree = await renderWithProvider(ColorsConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });

      expect(colorsResult).toBe(COLORS.light);
      expect(colorsResult.background).toBe('#f8fafc');
      expect(colorsResult.text).toBe('#0f172a');
      expect(colorsResult.accent).toBe('#3b82f6');

      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 12. useBackground Hook
  // =================================================================
  describe('useBackground hook', () => {
    it('returns background state and setters', async () => {
      const tree = await renderWithProvider(BackgroundConsumer);

      expect(backgroundResult.backgroundId).toBe('default');
      expect(backgroundResult.customBackgroundUri).toBeNull();
      expect(typeof backgroundResult.setBackgroundImage).toBe('function');
      expect(typeof backgroundResult.setCustomBackgroundUri).toBe('function');

      await safeUnmount(tree);
    });

    it('returns loaded background ID from storage', async () => {
      const tree = await renderWithProvider(BackgroundConsumer, {
        talor_background: 'cherry-blossom',
      });

      expect(backgroundResult.backgroundId).toBe('cherry-blossom');

      await safeUnmount(tree);
    });

    it('returns loaded custom URI from storage', async () => {
      const tree = await renderWithProvider(BackgroundConsumer, {
        talor_custom_bg: 'file:///wallpaper.jpg',
      });

      expect(backgroundResult.customBackgroundUri).toBe('file:///wallpaper.jpg');

      await safeUnmount(tree);
    });

    it('setBackgroundImage updates backgroundId via useBackground', async () => {
      const tree = await renderWithProvider(BackgroundConsumer);

      await renderer.act(async () => {
        await backgroundResult.setBackgroundImage('forest-canopy');
      });

      expect(backgroundResult.backgroundId).toBe('forest-canopy');

      await safeUnmount(tree);
    });

    it('setCustomBackgroundUri updates via useBackground', async () => {
      const tree = await renderWithProvider(BackgroundConsumer);

      await renderer.act(async () => {
        await backgroundResult.setCustomBackgroundUri('file:///new-bg.png');
      });

      expect(backgroundResult.customBackgroundUri).toBe('file:///new-bg.png');

      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 13. useGlass Hook
  // =================================================================
  describe('useGlass hook', () => {
    it('returns glass object and helper functions', async () => {
      const tree = await renderWithProvider(GlassConsumer);

      expect(glassResult.glass).toBe(GLASS);
      expect(typeof glassResult.getGlassBackground).toBe('function');
      expect(typeof glassResult.getGlassCardStyle).toBe('function');
      expect(typeof glassResult.isDark).toBe('boolean');

      await safeUnmount(tree);
    });

    it('isDark is true in dark mode via useGlass', async () => {
      const tree = await renderWithProvider(GlassConsumer);
      expect(glassResult.isDark).toBe(true);
      await safeUnmount(tree);
    });

    it('isDark is false in light mode via useGlass', async () => {
      const tree = await renderWithProvider(GlassConsumer, {
        [STORAGE_KEYS.THEME]: 'light',
      });
      expect(glassResult.isDark).toBe(false);
      await safeUnmount(tree);
    });

    it('getGlassBackground works via useGlass hook', async () => {
      const tree = await renderWithProvider(GlassConsumer);
      const result = glassResult.getGlassBackground('thin');

      const { opacity } = GLASS.materials.thin;
      expect(result).toEqual({
        backgroundColor: `rgba(255, 255, 255, ${opacity * 0.3})`,
      });

      await safeUnmount(tree);
    });

    it('getGlassCardStyle works via useGlass hook', async () => {
      const tree = await renderWithProvider(GlassConsumer);
      const result = glassResult.getGlassCardStyle('chrome');

      const { opacity } = GLASS.materials.chrome;
      expect(result.backgroundColor).toBe(
        `rgba(255, 255, 255, ${opacity * 0.3})`
      );
      expect(result.borderWidth).toBe(1);
      expect(result.borderRadius).toBe(16);

      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 14. Context Value Stability (useMemo)
  // =================================================================
  describe('context value stability', () => {
    it('glass, shadows, and alphaColors are stable references', async () => {
      const tree = await renderWithProvider(ThemeConsumer);

      const glass1 = themeResult.glass;
      const shadows1 = themeResult.shadows;
      const alpha1 = themeResult.alphaColors;

      // Trigger a re-render by changing background
      await renderer.act(async () => {
        await themeResult.setBackgroundImage('waves');
      });

      expect(themeResult.glass).toBe(glass1);
      expect(themeResult.shadows).toBe(shadows1);
      expect(themeResult.alphaColors).toBe(alpha1);

      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 15. Default Context Values (used outside provider)
  // =================================================================
  describe('default context values', () => {
    it('default context has expected structure when used without provider', () => {
      let result: any;
      let tree: renderer.ReactTestRenderer;
      renderer.act(() => {
        tree = renderer.create(
          React.createElement(() => {
            result = useTheme();
            return null;
          })
        );
      });

      // Default context values from createContext
      expect(result.isDark).toBe(true);
      expect(result.themeMode).toBe('dark');
      expect(result.colors).toBe(COLORS.dark);
      expect(result.backgroundId).toBe('default');
      expect(result.customBackgroundUri).toBeNull();
      expect(result.glass).toBe(GLASS);
      expect(result.shadows).toBe(SHADOWS);
      expect(result.alphaColors).toBe(ALPHA_COLORS);

      // Default setters are no-ops -- invoke them to cover the empty arrow functions
      expect(typeof result.setThemeMode).toBe('function');
      expect(typeof result.setBackgroundImage).toBe('function');
      expect(typeof result.setCustomBackgroundUri).toBe('function');

      // Explicitly call the no-op default setters to ensure coverage of lines 50, 53, 55
      const setThemeResult = result.setThemeMode('light');
      const setBgResult = result.setBackgroundImage('aurora');
      const setCustomResult = result.setCustomBackgroundUri('file:///x.png');
      expect(setThemeResult).toBeUndefined();
      expect(setBgResult).toBeUndefined();
      expect(setCustomResult).toBeUndefined();

      // Default helpers return empty objects
      expect(result.getGlassBackground()).toEqual({});
      expect(result.getGlassCardStyle()).toEqual({});

      renderer.act(() => {
        tree!.unmount();
      });
    });
  });

  // =================================================================
  // 15b. useTheme error path (context === undefined)
  // =================================================================
  describe('useTheme error when context is undefined', () => {
    it('throws error when useContext returns undefined', () => {
      // The module uses destructured `import { useContext } from 'react'`, so
      // jest.spyOn(React, 'useContext') won't intercept it. Instead, use
      // jest.isolateModules to re-import with a patched useContext.
      let caughtError: Error | null = null;

      jest.isolateModules(() => {
        // Patch useContext before requiring ThemeContext
        const originalReact = jest.requireActual('react');
        jest.doMock('react', () => ({
          ...originalReact,
          useContext: jest.fn(() => undefined),
        }));

        try {
          const { useTheme: isolatedUseTheme } = require('../ThemeContext');
          // Calling useTheme directly won't work outside render, but the check
          // happens before any React-specific hook logic.
          isolatedUseTheme();
        } catch (e: any) {
          caughtError = e;
        }
      });

      expect(caughtError).not.toBeNull();
      expect(caughtError!.message).toBe('useTheme must be used within a ThemeProvider');
    });
  });

  // =================================================================
  // 16. Multiple Sequential Theme Changes
  // =================================================================
  describe('sequential state changes', () => {
    it('handles rapid theme mode changes correctly', async () => {
      const tree = await renderWithProvider(ThemeConsumer);

      await renderer.act(async () => {
        await themeResult.setThemeMode('light');
      });
      expect(themeResult.themeMode).toBe('light');
      expect(themeResult.isDark).toBe(false);

      await renderer.act(async () => {
        await themeResult.setThemeMode('system');
      });
      expect(themeResult.themeMode).toBe('system');

      await renderer.act(async () => {
        await themeResult.setThemeMode('dark');
      });
      expect(themeResult.themeMode).toBe('dark');
      expect(themeResult.isDark).toBe(true);

      await safeUnmount(tree);
    });

    it('handles combined background and URI changes', async () => {
      const tree = await renderWithProvider(ThemeConsumer);

      await renderer.act(async () => {
        await themeResult.setBackgroundImage('hexagons');
      });
      expect(themeResult.backgroundId).toBe('hexagons');

      await renderer.act(async () => {
        await themeResult.setCustomBackgroundUri('file:///pic.jpg');
      });
      expect(themeResult.customBackgroundUri).toBe('file:///pic.jpg');

      await renderer.act(async () => {
        await themeResult.setBackgroundImage('default');
      });
      expect(themeResult.backgroundId).toBe('default');

      await renderer.act(async () => {
        await themeResult.setCustomBackgroundUri(null);
      });
      expect(themeResult.customBackgroundUri).toBeNull();

      await safeUnmount(tree);
    });
  });

  // =================================================================
  // 17. Edge Cases
  // =================================================================
  describe('edge cases', () => {
    it('handles empty string background ID from storage (falsy, stays default)', async () => {
      await AsyncStorage.setItem('talor_background', '');
      const tree = await renderWithProvider(ThemeConsumer);

      // Empty string is falsy, so backgroundId stays at default
      expect(themeResult.backgroundId).toBe('default');

      await safeUnmount(tree);
    });

    it('handles empty string custom URI from storage (falsy, stays null)', async () => {
      await AsyncStorage.setItem('talor_custom_bg', '');
      const tree = await renderWithProvider(ThemeConsumer);

      // Empty string is falsy, so customBackgroundUri stays null
      expect(themeResult.customBackgroundUri).toBeNull();

      await safeUnmount(tree);
    });

    it('handles null return from AsyncStorage for all keys', async () => {
      const tree = await renderWithProvider(ThemeConsumer);

      expect(themeResult.themeMode).toBe('dark');
      expect(themeResult.backgroundId).toBe('default');
      expect(themeResult.customBackgroundUri).toBeNull();

      await safeUnmount(tree);
    });

    it('ThemeProvider renders children element correctly after init', async () => {
      let rendered = false;
      const ChildComponent = () => {
        rendered = true;
        return null;
      };

      let tree: renderer.ReactTestRenderer;
      await renderer.act(async () => {
        tree = renderer.create(
          React.createElement(
            ThemeProvider,
            null,
            React.createElement(ChildComponent)
          )
        );
      });

      expect(rendered).toBe(true);
      await safeUnmount(tree!);
    });
  });
});
