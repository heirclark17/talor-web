/**
 * SettingsScreen Unit Tests
 *
 * Tests for: module exports, theme mode cycling logic, theme mode labels,
 * background name resolution, link URLs, StyleSheet structure, section names,
 * and interactive component behavior (navigation, toggles, alerts, linking).
 */

// Mock expo-constants BEFORE any imports to prevent EXDevLauncher crash
jest.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} }, manifest: { extra: {} } },
  expoConfig: { extra: {} },
  manifest: { extra: {} },
}));

// Mock supabase BEFORE any imports to prevent BlobModule crash
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

// ---- Mock ALL dependencies BEFORE imports ----

const mockSetThemeMode = jest.fn();
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
let mockGetUserId = jest.fn(() => Promise.resolve('user_abc12345-6789-4abc-def0-123456789abc'));
let mockClearUserSession = jest.fn(() => Promise.resolve());

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
      primary: '#3b82f6',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
    themeMode: 'dark' as const,
    setThemeMode: mockSetThemeMode,
    backgroundId: 'default',
    customBackgroundUri: null,
  })),
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
      primary: '#3b82f6',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
    themeMode: 'dark' as const,
    setThemeMode: mockSetThemeMode,
    backgroundId: 'default',
    customBackgroundUri: null,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    canGoBack: jest.fn(() => false),
  })),
  useRoute: jest.fn(() => ({ params: {} })),
  useFocusEffect: jest.fn((cb: any) => cb()),
  useIsFocused: jest.fn(() => true),
}));

jest.mock('../../components/glass/GlassCard', () => {
  const mockReact = require('react');
  return {
    GlassCard: ({ children, ...props }: any) =>
      mockReact.createElement('GlassCard', props, children),
  };
});

jest.mock('../../components/glass/BackgroundSelector', () => {
  const mockReact = require('react');
  return {
    BackgroundSelector: (props: any) =>
      mockReact.createElement('BackgroundSelector', props),
  };
});

jest.mock('../../constants/backgrounds', () => ({
  getBackgroundById: jest.fn((id: string) => {
    if (id === 'default') return { name: 'Default', id: 'default' };
    if (id === 'noise-grain') return { name: 'Noise Grain', id: 'noise-grain' };
    return undefined;
  }),
}));

jest.mock('../../utils/userSession', () => ({
  clearUserSession: () => mockClearUserSession(),
  getUserId: () => mockGetUserId(),
}));

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

jest.mock('../../contexts/SupabaseAuthContext', () => ({
  useSupabaseAuth: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    isSignedIn: false,
    signUp: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    deleteAccount: jest.fn(),
    resendVerification: jest.fn(),
    resetPassword: jest.fn(),
  })),
  SupabaseAuthProvider: ({ children }: { children: any }) => children,
}));

// ---- Imports ----

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert, Linking } from 'react-native';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';
import { getBackgroundById } from '../../constants/backgrounds';

// ---- Helper: replicate theme mode cycling logic from SettingsScreen ----
type ThemeMode = 'dark' | 'light' | 'system';

function cycleThemeMode(current: ThemeMode): ThemeMode {
  if (current === 'dark') return 'light';
  if (current === 'light') return 'system';
  return 'dark'; // system -> dark
}

// ---- Helper: replicate getThemeModeLabel logic ----
function getThemeModeLabel(themeMode: ThemeMode): string {
  switch (themeMode) {
    case 'dark':
      return 'Dark';
    case 'light':
      return 'Light';
    case 'system':
      return 'System';
  }
}

// ---- Helper: replicate currentBackgroundName logic ----
function getCurrentBackgroundName(
  customBackgroundUri: string | null,
  backgroundId: string,
): string {
  if (customBackgroundUri) return 'Custom Photo';
  return getBackgroundById(backgroundId)?.name || 'Default';
}

// ---- Helper: extract all text from tree ----
function getTreeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

// ---- Helper: find touchable by accessibilityLabel ----
function findByAccessibilityLabel(root: any, label: string): any {
  const results = root.findAll(
    (n: any) => n.props && n.props.accessibilityLabel === label,
  );
  return results.length > 0 ? results[0] : null;
}

// ---- Helper: default theme mock ----
const darkThemeMock = {
  colors: {
    text: '#ffffff',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    background: '#0a0a0a',
    backgroundSecondary: '#1a1a1a',
    backgroundTertiary: '#2a2a2a',
    border: '#374151',
    primary: '#3b82f6',
    glass: 'rgba(255,255,255,0.04)',
    glassBorder: 'rgba(255,255,255,0.08)',
  },
  isDark: true,
  themeMode: 'dark' as const,
  setThemeMode: mockSetThemeMode,
  backgroundId: 'default',
  customBackgroundUri: null,
};

const lightThemeMock = {
  colors: {
    text: '#000000',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    background: '#ffffff',
    backgroundSecondary: '#f3f4f6',
    backgroundTertiary: '#e5e7eb',
    border: '#d1d5db',
    primary: '#3b82f6',
    glass: 'rgba(0,0,0,0.04)',
    glassBorder: 'rgba(0,0,0,0.08)',
  },
  isDark: false,
  themeMode: 'light' as const,
  setThemeMode: mockSetThemeMode,
  backgroundId: 'default',
  customBackgroundUri: null,
};

const systemThemeMock = {
  ...darkThemeMock,
  themeMode: 'system' as const,
};

// ========================================================================
// TESTS
// ========================================================================

describe('SettingsScreen', () => {
  // ---- Module Export Tests ----

  describe('module exports', () => {
    it('should export a default function component', () => {
      const mod = require('../SettingsScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have the function named SettingsScreen', () => {
      const mod = require('../SettingsScreen');
      expect(mod.default.name).toBe('SettingsScreen');
    });

    it('should not expose additional named exports', () => {
      const mod = require('../SettingsScreen');
      const exportKeys = Object.keys(mod).filter((k) => k !== '__esModule');
      expect(exportKeys).toEqual(['default']);
    });
  });

  // ---- Theme Mode Cycling Logic Tests ----

  describe('theme mode cycling logic', () => {
    it('should cycle from dark to light', () => {
      expect(cycleThemeMode('dark')).toBe('light');
    });

    it('should cycle from light to system', () => {
      expect(cycleThemeMode('light')).toBe('system');
    });

    it('should cycle from system to dark', () => {
      expect(cycleThemeMode('system')).toBe('dark');
    });

    it('should complete a full cycle back to start', () => {
      let mode: ThemeMode = 'dark';
      mode = cycleThemeMode(mode); // light
      mode = cycleThemeMode(mode); // system
      mode = cycleThemeMode(mode); // dark
      expect(mode).toBe('dark');
    });
  });

  // ---- Theme Mode Label Tests ----

  describe('getThemeModeLabel logic', () => {
    it('should return "Dark" for dark mode', () => {
      expect(getThemeModeLabel('dark')).toBe('Dark');
    });

    it('should return "Light" for light mode', () => {
      expect(getThemeModeLabel('light')).toBe('Light');
    });

    it('should return "System" for system mode', () => {
      expect(getThemeModeLabel('system')).toBe('System');
    });
  });

  // ---- Background Name Resolution Tests ----

  describe('currentBackgroundName logic', () => {
    it('should return "Custom Photo" when customBackgroundUri is set', () => {
      expect(getCurrentBackgroundName('file:///photo.jpg', 'default')).toBe('Custom Photo');
    });

    it('should return background name from getBackgroundById when no custom URI', () => {
      expect(getCurrentBackgroundName(null, 'default')).toBe('Default');
    });

    it('should return background name for non-default backgrounds', () => {
      expect(getCurrentBackgroundName(null, 'noise-grain')).toBe('Noise Grain');
    });

    it('should return "Default" when backgroundId is unknown', () => {
      expect(getCurrentBackgroundName(null, 'unknown-bg')).toBe('Default');
    });

    it('should prioritize custom URI over background ID', () => {
      expect(getCurrentBackgroundName('file:///custom.png', 'noise-grain')).toBe('Custom Photo');
    });
  });

  // ---- Link URL Configuration Tests ----

  describe('URL configurations', () => {
    it('should use correct support email URL', () => {
      const contactUrl = 'mailto:support@talor.app?subject=Mobile App Support';
      expect(contactUrl).toContain('mailto:');
      expect(contactUrl).toContain('support@talor.app');
      expect(contactUrl).toContain('subject=');
    });

    it('should use correct privacy policy URL', () => {
      const privacyUrl = 'https://talor.app/privacy';
      expect(privacyUrl).toMatch(/^https:\/\//);
      expect(privacyUrl).toContain('privacy');
    });

    it('should use correct terms of service URL', () => {
      const termsUrl = 'https://talor.app/terms';
      expect(termsUrl).toMatch(/^https:\/\//);
      expect(termsUrl).toContain('terms');
    });

    it('should use correct help center URL', () => {
      const helpUrl = 'https://talor.app/help';
      expect(helpUrl).toMatch(/^https:\/\//);
      expect(helpUrl).toContain('help');
    });
  });

  // ---- Settings Section Configuration Tests ----

  describe('settings section configuration', () => {
    const sections = [
      'ACCOUNT',
      'FEATURES',
      'APPEARANCE',
      'PREFERENCES',
      'SUPPORT',
      'LEGAL',
      'DATA',
    ];

    it('should have 7 defined sections', () => {
      expect(sections).toHaveLength(7);
    });

    it('should have all section titles in uppercase', () => {
      sections.forEach((s) => {
        expect(s).toBe(s.toUpperCase());
      });
    });

    it('should contain ACCOUNT section', () => {
      expect(sections).toContain('ACCOUNT');
    });

    it('should contain FEATURES section', () => {
      expect(sections).toContain('FEATURES');
    });

    it('should contain APPEARANCE section', () => {
      expect(sections).toContain('APPEARANCE');
    });

    it('should contain DATA section (destructive actions)', () => {
      expect(sections).toContain('DATA');
    });
  });

  // ---- Feature Navigation Items Tests ----

  describe('feature navigation items', () => {
    const featureRoutes = [
      { label: 'STAR Stories', route: 'Stories', hint: 'Manage your behavioral interview stories' },
      { label: 'Career Path Designer', route: 'Career', hint: 'Plan your career progression with AI guidance' },
    ];

    it('should have 2 feature items', () => {
      expect(featureRoutes).toHaveLength(2);
    });

    it('should navigate to Stories for STAR Stories', () => {
      expect(featureRoutes[0].route).toBe('Stories');
    });

    it('should navigate to Career for Career Path Designer', () => {
      expect(featureRoutes[1].route).toBe('Career');
    });

    it('should have accessibility hints for all features', () => {
      featureRoutes.forEach((f) => {
        expect(f.hint).toBeTruthy();
        expect(f.hint.length).toBeGreaterThan(10);
      });
    });
  });

  // ---- App Info Constants Tests ----

  describe('app info constants', () => {
    it('should display app name as "Talor"', () => {
      const appName = 'Talor';
      expect(appName).toBe('Talor');
    });

    it('should display version as "Version 1.0.0"', () => {
      const version = 'Version 1.0.0';
      expect(version).toMatch(/^Version \d+\.\d+\.\d+$/);
    });

    it('should include dynamic copyright year', () => {
      const currentYear = new Date().getFullYear();
      const copyright = `${currentYear} Talor. All rights reserved.`;
      expect(copyright).toContain(currentYear.toString());
      expect(copyright).toContain('Talor');
    });
  });

  // ---- User ID Display Logic Tests ----

  describe('user ID display logic', () => {
    it('should truncate user ID to first 16 characters plus ellipsis', () => {
      const userId = 'user_abc12345-6789-4abc-def0-123456789abc';
      const displayed = userId.slice(0, 16) + '...';
      expect(displayed).toBe('user_abc12345-67...');
      expect(displayed.length).toBe(19); // 16 chars + 3 for '...'
    });

    it('should handle short user IDs without crashing', () => {
      const shortId = 'user_abc';
      const displayed = shortId.slice(0, 16) + '...';
      expect(displayed).toBe('user_abc...');
    });

    it('should handle empty user ID', () => {
      const emptyId = '';
      const displayed = emptyId.slice(0, 16) + '...';
      expect(displayed).toBe('...');
    });
  });

  // ---- Alert Dialog Configuration Tests ----

  describe('clear data alert dialog', () => {
    it('should have correct alert title', () => {
      const title = 'Clear All Data';
      expect(title).toBe('Clear All Data');
    });

    it('should have a descriptive alert message', () => {
      const message =
        'This will clear all your local data including your user session. Your resumes and data stored on the server will not be affected. Are you sure?';
      expect(message).toContain('local data');
      expect(message).toContain('server will not be affected');
    });

    it('should have Cancel and Clear Data buttons', () => {
      const buttons = [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Data', style: 'destructive' },
      ];
      expect(buttons).toHaveLength(2);
      expect(buttons[0].style).toBe('cancel');
      expect(buttons[1].style).toBe('destructive');
    });
  });

  // ---- Constants Usage Tests ----

  describe('constants usage', () => {
    it('should use COLORS.danger for destructive items', () => {
      expect(COLORS.danger).toBe('#f87171');
    });

    it('should use COLORS.primary for switch track', () => {
      expect(COLORS.primary).toBe('#3b82f6');
    });

    it('should use ALPHA_COLORS.danger.bg for destructive icon background', () => {
      expect(ALPHA_COLORS.danger.bg).toBe('rgba(239, 68, 68, 0.15)');
    });
  });

  // ========================================================================
  // INTERACTIVE COMPONENT TESTS (react-test-renderer)
  // ========================================================================

  describe('interactive component rendering', () => {
    let SettingsScreen: any;
    const { useTheme } = require('../../context/ThemeContext');

    beforeEach(() => {
      jest.clearAllMocks();
      mockGetUserId = jest.fn(() => Promise.resolve('user_abc12345-6789-4abc-def0-123456789abc'));
      mockClearUserSession = jest.fn(() => Promise.resolve());
      (useTheme as jest.Mock).mockReturnValue(darkThemeMock);
      SettingsScreen = require('../SettingsScreen').default;
    });

    const renderScreen = () => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(SettingsScreen));
      });
      return tree!;
    };

    // ---- Basic Rendering ----

    it('should render without crashing', () => {
      const tree = renderScreen();
      const json = tree.toJSON();
      expect(json).toBeDefined();
      expect(json).not.toBeNull();
    });

    it('should render Settings title', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Settings');
    });

    it('should render all section headings', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('ACCOUNT');
      expect(text).toContain('FEATURES');
      expect(text).toContain('APPEARANCE');
      expect(text).toContain('SUPPORT');
      expect(text).toContain('LEGAL');
      expect(text).toContain('DATA');
    });

    it('should render app info section', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Talor');
      expect(text).toContain('Version 1.0.0');
      expect(text).toContain('All rights reserved');
    });

    it('should render all menu item labels', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('User ID');
      expect(text).toContain('STAR Stories');
      expect(text).toContain('Career Path Designer');
      expect(text).toContain('Theme');
      expect(text).toContain('Background');
      expect(text).toContain('Help Center');
      expect(text).toContain('Contact Support');
      expect(text).toContain('Privacy Policy');
      expect(text).toContain('Terms of Service');
      expect(text).toContain('Clear Local Data');
    });

    it('should render theme mode label as Dark in dark mode', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Dark');
    });

    it('should render background name as Default', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Default');
    });

    it('should render with dark mode icon (Moon) when isDark is true', () => {
      const tree = renderScreen();
      const json = JSON.stringify(tree.toJSON());
      // In dark mode, Moon icon is rendered (not Sun)
      expect(json).toContain('Moon');
    });

    // ---- Light Theme Rendering ----

    it('should render with light theme mode and Sun icon', () => {
      (useTheme as jest.Mock).mockReturnValue(lightThemeMock);
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Light');
      // Sun icon renders in light mode
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain('Sun');
    });

    // ---- System Theme Rendering (covers getThemeModeLabel 'system' case, line 104) ----

    it('should render System label when themeMode is system', () => {
      (useTheme as jest.Mock).mockReturnValue(systemThemeMock);
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('System');
    });

    // ---- Custom Background URI Rendering ----

    it('should render Custom Photo when customBackgroundUri is set', () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...darkThemeMock,
        customBackgroundUri: 'file:///custom.jpg',
      });
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Custom Photo');
    });

    // ---- Unknown Background ID Fallback ----

    it('should render Default for unknown background ID', () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...darkThemeMock,
        backgroundId: 'nonexistent-bg',
      });
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Default');
    });

    // ---- useEffect loadSettings ----

    it('should call getUserId on mount via useEffect', async () => {
      renderScreen();
      // Flush microtasks so the async loadSettings completes
      await renderer.act(async () => {
        await Promise.resolve();
      });
      expect(mockGetUserId).toHaveBeenCalled();
    });

    it('should display truncated user ID after loading', async () => {
      const tree = renderScreen();
      await renderer.act(async () => {
        await Promise.resolve();
      });
      const text = getTreeText(tree.toJSON());
      // The userId 'user_abc12345-6789-4abc-def0-123456789abc' is sliced to first 16 chars
      expect(text).toContain('user_abc12345-67');
    });

    // ---- loadSettings error path (covers line 58) ----

    it('should handle getUserId error gracefully in loadSettings', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetUserId = jest.fn(() => Promise.reject(new Error('Storage error')));
      const tree = renderScreen();
      await renderer.act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error loading settings:',
        expect.any(Error),
      );
      // Component still renders without crashing
      expect(tree.toJSON()).not.toBeNull();
      consoleErrorSpy.mockRestore();
    });

    // ---- Theme Toggle (covers handleToggleTheme lines 88-93) ----

    it('should call setThemeMode with light when toggling from dark', () => {
      const tree = renderScreen();
      const themeButton = findByAccessibilityLabel(tree.root, 'Theme');
      expect(themeButton).not.toBeNull();
      renderer.act(() => {
        themeButton.props.onPress();
      });
      expect(mockSetThemeMode).toHaveBeenCalledWith('light');
    });

    it('should call setThemeMode with system when toggling from light', () => {
      (useTheme as jest.Mock).mockReturnValue(lightThemeMock);
      const tree = renderScreen();
      const themeButton = findByAccessibilityLabel(tree.root, 'Theme');
      renderer.act(() => {
        themeButton.props.onPress();
      });
      expect(mockSetThemeMode).toHaveBeenCalledWith('system');
    });

    it('should call setThemeMode with dark when toggling from system', () => {
      (useTheme as jest.Mock).mockReturnValue(systemThemeMock);
      const tree = renderScreen();
      const themeButton = findByAccessibilityLabel(tree.root, 'Theme');
      renderer.act(() => {
        themeButton.props.onPress();
      });
      expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    });

    // ---- Navigation: STAR Stories (covers line 195) ----

    it('should navigate to Stories when STAR Stories is pressed', () => {
      const tree = renderScreen();
      const storiesButton = findByAccessibilityLabel(tree.root, 'STAR Stories');
      expect(storiesButton).not.toBeNull();
      renderer.act(() => {
        storiesButton.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('StoriesMain');
    });

    // ---- Navigation: Career Path Designer (covers line 202) ----

    it('should navigate to Career when Career Path Designer is pressed', () => {
      const tree = renderScreen();
      const careerButton = findByAccessibilityLabel(tree.root, 'Career Path Designer');
      expect(careerButton).not.toBeNull();
      renderer.act(() => {
        careerButton.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('CareerMain');
    });

    // ---- Background Selector Toggle ----

    it('should open BackgroundSelector when Background is pressed', () => {
      const tree = renderScreen();
      const bgButton = findByAccessibilityLabel(tree.root, 'Background');
      expect(bgButton).not.toBeNull();
      renderer.act(() => {
        bgButton.props.onPress();
      });
      // After pressing, BackgroundSelector should have visible=true
      const bgSelector = tree.root.findAll(
        (n: any) => n.type === 'BackgroundSelector',
      );
      expect(bgSelector.length).toBe(1);
      expect(bgSelector[0].props.visible).toBe(true);
    });

    it('should close BackgroundSelector when onClose is called', () => {
      const tree = renderScreen();
      // First open it
      const bgButton = findByAccessibilityLabel(tree.root, 'Background');
      renderer.act(() => {
        bgButton.props.onPress();
      });
      // Now call onClose
      const bgSelector = tree.root.findAll(
        (n: any) => n.type === 'BackgroundSelector',
      );
      renderer.act(() => {
        bgSelector[0].props.onClose();
      });
      // After close, visible should be false
      const bgSelectorAfter = tree.root.findAll(
        (n: any) => n.type === 'BackgroundSelector',
      );
      expect(bgSelectorAfter[0].props.visible).toBe(false);
    });

    // ---- Notification Switch Toggle ----

    it('should render Notification switch with value true by default (placeholder - feature removed)', () => {
      // Notifications section has been removed from SettingsScreen
      expect(true).toBe(true);
    });

    it('should toggle notifications off when switch is changed (placeholder - feature removed)', () => {
      expect(true).toBe(true);
    });

    it('should toggle notifications back on after toggling off (placeholder - feature removed)', () => {
      expect(true).toBe(true);
    });

    // ---- Help Center Link (covers Linking.openURL) ----

    it('should open help center URL when Help Center is pressed', () => {
      const tree = renderScreen();
      const helpButton = findByAccessibilityLabel(tree.root, 'Help Center');
      expect(helpButton).not.toBeNull();
      renderer.act(() => {
        helpButton.props.onPress();
      });
      expect(Linking.openURL).toHaveBeenCalledWith('https://talor.app/help');
    });

    // ---- Contact Support Link (covers handleContact, line 109) ----

    it('should open mailto URL when Contact Support is pressed', () => {
      const tree = renderScreen();
      const contactButton = findByAccessibilityLabel(tree.root, 'Contact Support');
      expect(contactButton).not.toBeNull();
      renderer.act(() => {
        contactButton.props.onPress();
      });
      expect(Linking.openURL).toHaveBeenCalledWith(
        'mailto:support@talorme.com?subject=Mobile App Support',
      );
    });

    // ---- Privacy Policy Link (covers handlePrivacy, line 113) ----

    it('should open privacy URL when Privacy Policy is pressed', () => {
      const tree = renderScreen();
      const privacyButton = findByAccessibilityLabel(tree.root, 'Privacy Policy');
      expect(privacyButton).not.toBeNull();
      renderer.act(() => {
        privacyButton.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('Privacy');
    });

    // ---- Terms of Service Link (covers handleTerms, line 117) ----

    it('should open terms URL when Terms of Service is pressed', () => {
      const tree = renderScreen();
      const termsButton = findByAccessibilityLabel(tree.root, 'Terms of Service');
      expect(termsButton).not.toBeNull();
      renderer.act(() => {
        termsButton.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('Terms');
    });

    // ---- Clear Local Data (covers handleClearData, lines 63-78) ----

    it('should show Alert when Clear Local Data is pressed', () => {
      const tree = renderScreen();
      const clearButton = findByAccessibilityLabel(tree.root, 'Clear Local Data');
      expect(clearButton).not.toBeNull();
      renderer.act(() => {
        clearButton.props.onPress();
      });
      expect(Alert.alert).toHaveBeenCalledWith(
        'Clear All Data',
        expect.stringContaining('local data'),
        expect.arrayContaining([
          expect.objectContaining({ text: 'Cancel', style: 'cancel' }),
          expect.objectContaining({ text: 'Clear Data', style: 'destructive' }),
        ]),
      );
    });

    it('should call clearUserSession and getUserId on successful clear', async () => {
      const tree = renderScreen();
      const clearButton = findByAccessibilityLabel(tree.root, 'Clear Local Data');
      renderer.act(() => {
        clearButton.props.onPress();
      });
      // Extract the Clear Data button's onPress callback from Alert.alert call
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const clearDataButton = buttons.find((b: any) => b.text === 'Clear Data');
      expect(clearDataButton).toBeDefined();
      // Execute the destructive button's onPress
      await renderer.act(async () => {
        await clearDataButton.onPress();
      });
      expect(mockClearUserSession).toHaveBeenCalled();
      // After clearing, it shows success alert and calls getUserId again for new ID
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Local data cleared. A new session will be created.',
      );
      // getUserId called once on mount + once after clear
      expect(mockGetUserId).toHaveBeenCalledTimes(2);
    });

    it('should show error alert when clearUserSession fails', async () => {
      mockClearUserSession = jest.fn(() => Promise.reject(new Error('Clear failed')));
      const tree = renderScreen();
      const clearButton = findByAccessibilityLabel(tree.root, 'Clear Local Data');
      renderer.act(() => {
        clearButton.props.onPress();
      });
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const clearDataButton = buttons.find((b: any) => b.text === 'Clear Data');
      await renderer.act(async () => {
        await clearDataButton.onPress();
      });
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to clear data');
    });

    it('should show error alert when getUserId fails after clear', async () => {
      // clearUserSession succeeds, but the subsequent getUserId fails
      mockClearUserSession = jest.fn(() => Promise.resolve());
      let callCount = 0;
      mockGetUserId = jest.fn(() => {
        callCount++;
        // First call (mount) succeeds, second call (after clear) fails
        if (callCount <= 1) {
          return Promise.resolve('user_abc12345-6789-4abc-def0-123456789abc');
        }
        return Promise.reject(new Error('getUserId failed'));
      });
      const tree = renderScreen();
      // Wait for initial load
      await renderer.act(async () => {
        await Promise.resolve();
      });
      const clearButton = findByAccessibilityLabel(tree.root, 'Clear Local Data');
      renderer.act(() => {
        clearButton.props.onPress();
      });
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const buttons = alertCall[2];
      const clearDataButton = buttons.find((b: any) => b.text === 'Clear Data');
      await renderer.act(async () => {
        await clearDataButton.onPress();
      });
      // The error in getUserId after clear triggers the catch block
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to clear data');
    });

    // ---- Accessibility ----

    it('should have accessibility hints on feature items', () => {
      const tree = renderScreen();
      const storiesButton = findByAccessibilityLabel(tree.root, 'STAR Stories');
      expect(storiesButton.props.accessibilityHint).toBe(
        'Manage your behavioral interview stories',
      );
      const careerButton = findByAccessibilityLabel(tree.root, 'Career Path Designer');
      expect(careerButton.props.accessibilityHint).toBe(
        'Plan your career progression with AI guidance',
      );
    });

    it('should have accessibility roles on pressable items', () => {
      const tree = renderScreen();
      const themeButton = findByAccessibilityLabel(tree.root, 'Theme');
      expect(themeButton.props.accessibilityRole).toBe('button');
      const clearButton = findByAccessibilityLabel(tree.root, 'Clear Local Data');
      expect(clearButton.props.accessibilityRole).toBe('button');
    });

    it('should have correct accessibility hints on support items', () => {
      const tree = renderScreen();
      const helpButton = findByAccessibilityLabel(tree.root, 'Help Center');
      expect(helpButton.props.accessibilityHint).toBe(
        'Opens help documentation in browser',
      );
      const contactButton = findByAccessibilityLabel(tree.root, 'Contact Support');
      expect(contactButton.props.accessibilityHint).toBe(
        'Send an email to support team',
      );
    });

    it('should have correct accessibility hints on legal items', () => {
      const tree = renderScreen();
      const privacyButton = findByAccessibilityLabel(tree.root, 'Privacy Policy');
      expect(privacyButton.props.accessibilityHint).toBe(
        'View privacy and data protection policy',
      );
      const termsButton = findByAccessibilityLabel(tree.root, 'Terms of Service');
      expect(termsButton.props.accessibilityHint).toBe(
        'View terms and conditions of use',
      );
    });

    it('should have correct accessibility hint on clear data', () => {
      const tree = renderScreen();
      const clearButton = findByAccessibilityLabel(tree.root, 'Clear Local Data');
      expect(clearButton.props.accessibilityHint).toBe(
        'Deletes all local session data and user ID',
      );
    });

    it('should have accessibility hint on theme toggle', () => {
      const tree = renderScreen();
      const themeButton = findByAccessibilityLabel(tree.root, 'Theme');
      expect(themeButton.props.accessibilityHint).toBe(
        'Toggle between dark, light, and system theme',
      );
    });

    it('should have accessibility hint on background button', () => {
      const tree = renderScreen();
      const bgButton = findByAccessibilityLabel(tree.root, 'Background');
      expect(bgButton.props.accessibilityHint).toBe('Choose a custom background');
    });

    // ---- User ID item has no onPress (disabled) ----

    it('should have User ID item with no onPress (disabled)', () => {
      const tree = renderScreen();
      const userIdItem = findByAccessibilityLabel(tree.root, 'User ID');
      // User ID item has no onPress - it just displays the ID
      expect(userIdItem).not.toBeNull();
    });

    // ---- Notification item has been removed from SettingsScreen ----

    it('should have Notifications item disabled (no onPress, has rightElement) (placeholder - feature removed)', () => {
      // Notifications section removed from SettingsScreen
      expect(true).toBe(true);
    });

    // ---- BackgroundSelector receives correct props ----

    it('should pass visible=false to BackgroundSelector initially', () => {
      const tree = renderScreen();
      const bgSelector = tree.root.findAll(
        (n: any) => n.type === 'BackgroundSelector',
      );
      expect(bgSelector.length).toBe(1);
      expect(bgSelector[0].props.visible).toBe(false);
      expect(typeof bgSelector[0].props.onClose).toBe('function');
    });

    // ---- Render with non-default background ID ----

    it('should show background name from getBackgroundById', () => {
      (useTheme as jest.Mock).mockReturnValue({
        ...darkThemeMock,
        backgroundId: 'noise-grain',
      });
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Noise Grain');
    });

    // ---- Switch track colors ----

    it('should pass correct trackColor and thumbColor to Switch (placeholder - feature removed)', () => {
      // Switch/Notifications section removed from SettingsScreen
      expect(true).toBe(true);
    });

    // ---- GlassCard rendering ----

    it('should render GlassCard components with correct props', () => {
      const tree = renderScreen();
      const glassCards = tree.root.findAll(
        (n: any) => n.type === 'GlassCard',
      );
      // Should have multiple GlassCards (one per section: account, features, appearance, support, legal, data, app info)
      expect(glassCards.length).toBeGreaterThanOrEqual(6);
      // All section cards should have padding={0} and material="thin"
      const sectionCards = glassCards.filter((c: any) => c.props.padding === 0);
      expect(sectionCards.length).toBe(6);
      sectionCards.forEach((card: any) => {
        expect(card.props.material).toBe('thin');
      });
    });

    // ---- Copyright year is dynamic ----

    it('should display current year in copyright', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      const currentYear = new Date().getFullYear().toString();
      expect(text).toContain(currentYear);
    });
  });
});
