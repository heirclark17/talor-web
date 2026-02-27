/**
 * ThemeToggle Component Tests
 *
 * Tests by calling the component function directly with mocked hooks.
 * Covers theme cycling logic, icon rendering branches (dark vs light),
 * accessibility labels, and background color selection.
 */

// Mock the useTheme hook from hooks/useTheme
const mockSetThemeMode = jest.fn();
let mockThemeState = {
  isDark: true,
  themeMode: 'dark' as 'light' | 'dark' | 'sand-tan' | 'system',
  setThemeMode: mockSetThemeMode,
};

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => mockThemeState),
}));

import ThemeToggle from '../ThemeToggle';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetThemeMode.mockClear();
    mockThemeState = {
      isDark: true,
      themeMode: 'dark',
      setThemeMode: mockSetThemeMode,
    };
  });

  describe('module exports', () => {
    it('should export ThemeToggle as the default export', () => {
      expect(ThemeToggle).toBeDefined();
      expect(typeof ThemeToggle).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(ThemeToggle.name).toBe('ThemeToggle');
    });
  });

  describe('rendering in dark mode', () => {
    beforeEach(() => {
      mockThemeState = {
        isDark: true,
        themeMode: 'dark',
        setThemeMode: mockSetThemeMode,
      };
    });

    it('should return a React element', () => {
      const element = ThemeToggle();
      expect(element).toBeTruthy();
    });

    it('should render a TouchableOpacity wrapper', () => {
      const element = ThemeToggle();
      // In our mock environment, TouchableOpacity is 'TouchableOpacity' string
      // The element type will be the string 'TouchableOpacity'
      expect(element.type).toBe('TouchableOpacity');
    });

    it('should use neutral bg background color in dark mode', () => {
      const element = ThemeToggle();
      const styles = element.props.style;
      // styles is an array: [staticStyles.button, dynamic]
      const dynamicStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.backgroundColor && s.backgroundColor !== undefined)
        : styles;
      expect(dynamicStyle.backgroundColor).toBe(ALPHA_COLORS.neutral.bg);
    });

    it('should render Sun icon (not Moon) in dark mode', () => {
      const element = ThemeToggle();
      // children of the TouchableOpacity should be the Sun icon
      const children = element.props.children;
      // In dark mode: isDark ? Sun : Moon
      // Sun is a mock function that returns "SunIcon" string
      // But React.createElement would create an element with Sun as type
      expect(children).toBeTruthy();
      // The children element type should be Sun mock
      if (typeof children === 'object' && children.type) {
        expect(children.type.displayName).toBe('Sun');
      }
    });

    it('should set accessibility label reflecting dark mode', () => {
      const element = ThemeToggle();
      expect(element.props.accessibilityLabel).toBe('Switch theme. Current: dark');
    });

    it('should set accessibilityRole to button', () => {
      const element = ThemeToggle();
      expect(element.props.accessibilityRole).toBe('button');
    });

    it('should set accessibilityHint', () => {
      const element = ThemeToggle();
      expect(element.props.accessibilityHint).toBe('Cycles between light, dark, sand-tan, and system theme');
    });
  });

  describe('rendering in light mode', () => {
    beforeEach(() => {
      mockThemeState = {
        isDark: false,
        themeMode: 'light',
        setThemeMode: mockSetThemeMode,
      };
    });

    it('should return a React element in light mode', () => {
      const element = ThemeToggle();
      expect(element).toBeTruthy();
    });

    it('should use black[10] background color in light mode', () => {
      const element = ThemeToggle();
      const styles = element.props.style;
      const dynamicStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.backgroundColor && s.backgroundColor !== undefined)
        : styles;
      expect(dynamicStyle.backgroundColor).toBe(ALPHA_COLORS.black[10]);
    });

    it('should render Moon icon (not Sun) in light mode', () => {
      const element = ThemeToggle();
      const children = element.props.children;
      expect(children).toBeTruthy();
      if (typeof children === 'object' && children.type) {
        expect(children.type.displayName).toBe('Moon');
      }
    });

    it('should set accessibility label reflecting light mode', () => {
      const element = ThemeToggle();
      expect(element.props.accessibilityLabel).toBe('Switch theme. Current: light');
    });
  });

  describe('rendering in system mode', () => {
    it('should set accessibility label reflecting system mode', () => {
      mockThemeState = {
        isDark: false,
        themeMode: 'system',
        setThemeMode: mockSetThemeMode,
      };
      const element = ThemeToggle();
      expect(element.props.accessibilityLabel).toBe('Switch theme. Current: system');
    });
  });

  describe('handleToggle cycling logic', () => {
    it('should cycle from light to dark on press', () => {
      mockThemeState = { isDark: false, themeMode: 'light', setThemeMode: mockSetThemeMode };
      const element = ThemeToggle();
      // Simulate press by calling onPress
      const onPress = element.props.onPress;
      expect(onPress).toBeDefined();
      onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
    });

    it('should cycle from dark to sand-tan on press', () => {
      mockThemeState = { isDark: true, themeMode: 'dark', setThemeMode: mockSetThemeMode };
      const element = ThemeToggle();
      element.props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('sand-tan');
    });

    it('should cycle from sand-tan to system on press', () => {
      mockThemeState = { isDark: false, themeMode: 'sand-tan', setThemeMode: mockSetThemeMode };
      const element = ThemeToggle();
      element.props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('system');
    });

    it('should cycle from system to light on press', () => {
      mockThemeState = { isDark: false, themeMode: 'system', setThemeMode: mockSetThemeMode };
      const element = ThemeToggle();
      element.props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('light');
    });

    it('should complete a full cycle: light -> dark -> sand-tan -> system -> light', () => {
      // light -> dark
      mockThemeState = { isDark: false, themeMode: 'light', setThemeMode: mockSetThemeMode };
      ThemeToggle().props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('dark');

      // dark -> sand-tan
      mockSetThemeMode.mockClear();
      mockThemeState = { isDark: true, themeMode: 'dark', setThemeMode: mockSetThemeMode };
      ThemeToggle().props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('sand-tan');

      // sand-tan -> system
      mockSetThemeMode.mockClear();
      mockThemeState = { isDark: false, themeMode: 'sand-tan', setThemeMode: mockSetThemeMode };
      ThemeToggle().props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('system');

      // system -> light
      mockSetThemeMode.mockClear();
      mockThemeState = { isDark: false, themeMode: 'system', setThemeMode: mockSetThemeMode };
      ThemeToggle().props.onPress();
      expect(mockSetThemeMode).toHaveBeenCalledWith('light');
    });
  });

  describe('icon color props', () => {
    it('should pass warning color to Sun icon in dark mode', () => {
      mockThemeState = { isDark: true, themeMode: 'dark', setThemeMode: mockSetThemeMode };
      const element = ThemeToggle();
      const iconElement = element.props.children;
      if (typeof iconElement === 'object' && iconElement.props) {
        expect(iconElement.props.color).toBe(COLORS.warning);
        expect(iconElement.props.size).toBe(20);
      }
    });

    it('should pass info color to Moon icon in light mode', () => {
      mockThemeState = { isDark: false, themeMode: 'light', setThemeMode: mockSetThemeMode };
      const element = ThemeToggle();
      const iconElement = element.props.children;
      if (typeof iconElement === 'object' && iconElement.props) {
        expect(iconElement.props.color).toBe(COLORS.info);
        expect(iconElement.props.size).toBe(20);
      }
    });
  });

  describe('static style values', () => {
    it('should have a 44x44 button size', () => {
      const element = ThemeToggle();
      const styles = element.props.style;
      const staticStyle = Array.isArray(styles) ? styles[0] : styles;
      expect(staticStyle.width).toBe(44);
      expect(staticStyle.height).toBe(44);
    });
  });
});
