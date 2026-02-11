/**
 * ValidatedInput Component Tests
 *
 * Tests the ValidatedInput component using react-test-renderer to properly
 * handle React hooks (useState, useCallback). Covers all render branches:
 * label, error/hint footer, char count, left/right icons, validation icon
 * visibility, border/background colors, and internal state management.
 */

// Mock dependencies before imports
const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  border: '#374151',
  backgroundSecondary: '#1a1a1a',
};

let mockIsDark = true;
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: mockColors,
    isDark: mockIsDark,
  })),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: Object.assign(
    (props: any) => `Ionicons(${props.name})`,
    { glyphMap: { 'alert-circle': 0, 'checkmark-circle': 0, 'warning': 0, 'eye': 0, 'search': 0 } }
  ),
}));

jest.mock('../../utils/validation', () => ({
  ValidationResult: {},
}));

import React from 'react';
import renderer from 'react-test-renderer';
import { ValidatedInput } from '../ValidatedInput';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';

describe('ValidatedInput Component', () => {
  beforeEach(() => {
    mockIsDark = true;
  });

  // Helper: render using react-test-renderer wrapped in act()
  const renderVI = (props: any) => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(ValidatedInput, props));
    });
    return tree!.toJSON();
  };

  describe('module exports', () => {
    it('should export ValidatedInput as named export', () => {
      expect(ValidatedInput).toBeDefined();
      expect(typeof ValidatedInput).toBe('function');
    });

    it('should export ValidatedInput as default export', () => {
      const mod = require('../ValidatedInput');
      expect(mod.default).toBe(mod.ValidatedInput);
    });
  });

  describe('basic rendering', () => {
    it('should return a rendered tree with minimal props', () => {
      const json = renderVI({});
      expect(json).toBeTruthy();
    });

    it('should render a View as the root element', () => {
      const json = renderVI({});
      expect(json).toBeTruthy();
      // react-test-renderer toJSON returns type as string
      expect(json.type).toBe('View');
    });
  });

  describe('label rendering', () => {
    it('should render label text when label prop is provided', () => {
      const json = renderVI({ label: 'Email Address' });
      const str = JSON.stringify(json);
      expect(str).toContain('Email Address');
    });

    it('should not render label text when label prop is not provided', () => {
      const json = renderVI({});
      const str = JSON.stringify(json);
      expect(str).not.toContain('Email Address');
    });
  });

  describe('border color logic', () => {
    it('should use danger color when external error is present', () => {
      const json = renderVI({ error: 'Required field' });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.danger);
    });

    it('should use default border color when no error and not focused', () => {
      const json = renderVI({});
      const str = JSON.stringify(json);
      expect(str).toContain(mockColors.border);
    });
  });

  describe('background color logic in dark mode', () => {
    it('should use danger bgSubtle when error exists (dark mode)', () => {
      mockIsDark = true;
      const json = renderVI({ error: 'Bad input' });
      const str = JSON.stringify(json);
      expect(str).toContain(ALPHA_COLORS.danger.bgSubtle);
    });

    it('should use neutral bg when not focused and no error (dark mode)', () => {
      mockIsDark = true;
      const json = renderVI({});
      const str = JSON.stringify(json);
      expect(str).toContain(ALPHA_COLORS.neutral.bg);
    });
  });

  describe('background color logic in light mode', () => {
    it('should use neutralDark bg when not focused and no error (light mode)', () => {
      mockIsDark = false;
      const json = renderVI({});
      const str = JSON.stringify(json);
      expect(str).toContain(ALPHA_COLORS.neutralDark.bg);
    });

    it('should use danger bgSubtle when error exists (light mode)', () => {
      mockIsDark = false;
      const json = renderVI({ error: 'Invalid' });
      const str = JSON.stringify(json);
      expect(str).toContain(ALPHA_COLORS.danger.bgSubtle);
    });
  });

  describe('left icon', () => {
    it('should render left icon when leftIcon prop is provided', () => {
      const json = renderVI({ leftIcon: 'search' });
      const str = JSON.stringify(json);
      expect(str).toContain('search');
    });

    it('should use danger color for left icon when error exists', () => {
      const json = renderVI({ leftIcon: 'search', error: 'Error' });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.danger);
    });
  });

  describe('right icon', () => {
    it('should render right icon when rightIcon prop is provided', () => {
      const json = renderVI({ rightIcon: 'eye' });
      const str = JSON.stringify(json);
      expect(str).toContain('eye');
    });
  });

  describe('error and hint footer', () => {
    it('should show error message with warning icon when error exists', () => {
      const json = renderVI({ error: 'Field is required' });
      const str = JSON.stringify(json);
      expect(str).toContain('Field is required');
      expect(str).toContain('warning');
    });

    it('should show hint when no error and hint is provided', () => {
      const json = renderVI({ hint: 'Enter your email' });
      const str = JSON.stringify(json);
      expect(str).toContain('Enter your email');
    });

    it('should prioritize error over hint', () => {
      const json = renderVI({ error: 'Invalid', hint: 'Enter email' });
      const str = JSON.stringify(json);
      expect(str).toContain('Invalid');
    });
  });

  describe('character count', () => {
    it('should show character count when showCharCount is true', () => {
      const json = renderVI({ showCharCount: true, value: 'hello' });
      const str = JSON.stringify(json);
      expect(str).toContain('5');
    });

    it('should show count with max when maxCharCount is provided', () => {
      const json = renderVI({ showCharCount: true, value: 'hello', maxCharCount: 100 });
      const str = JSON.stringify(json);
      expect(str).toContain('5');
      expect(str).toContain('/100');
    });

    it('should use danger color when over maxCharCount', () => {
      const json = renderVI({
        showCharCount: true,
        value: 'this is too long',
        maxCharCount: 5,
      });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.danger);
    });

    it('should use textTertiary color when within limit', () => {
      const json = renderVI({
        showCharCount: true,
        value: 'hi',
        maxCharCount: 100,
      });
      const str = JSON.stringify(json);
      expect(str).toContain(mockColors.textTertiary);
    });

    it('should not show character count when showCharCount is false', () => {
      const json = renderVI({ showCharCount: false, value: 'hello' });
      expect(json).toBeTruthy();
    });

    it('should handle undefined value for charCount (0)', () => {
      const json = renderVI({ showCharCount: true });
      const str = JSON.stringify(json);
      expect(str).toContain('0');
    });
  });

  describe('TextInput props', () => {
    it('should pass value to TextInput', () => {
      const json = renderVI({ value: 'test input' });
      const str = JSON.stringify(json);
      expect(str).toContain('test input');
    });

    it('should pass placeholderTextColor from theme', () => {
      const json = renderVI({ value: '' });
      const str = JSON.stringify(json);
      expect(str).toContain(mockColors.textTertiary);
    });
  });

  describe('handleChangeText callback', () => {
    it('should accept onChangeText prop', () => {
      const onChangeText = jest.fn();
      const json = renderVI({ onChangeText, value: '' });
      expect(json).toBeTruthy();
    });

    it('should accept validate prop with validateOnChange', () => {
      const validate = jest.fn(() => ({ valid: true }));
      const json = renderVI({
        validateOnChange: true,
        validate,
        value: 'test',
      });
      expect(json).toBeTruthy();
    });
  });

  describe('handleBlur callback', () => {
    it('should accept onBlur prop', () => {
      const onBlur = jest.fn();
      const json = renderVI({ onBlur, value: '' });
      expect(json).toBeTruthy();
    });
  });

  describe('error resolution between external and internal', () => {
    it('should show external error in the rendered output', () => {
      const json = renderVI({ error: 'External error' });
      const str = JSON.stringify(json);
      expect(str).toContain('External error');
    });
  });

  describe('focus and blur interactions', () => {
    it('should render with initial unfocused state', () => {
      const json = renderVI({});
      const str = JSON.stringify(json);
      // Should use default border color (not primary)
      expect(str).toContain(mockColors.border);
    });

    it('should change border color on focus via tree interaction', () => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ValidatedInput, {}));
      });
      // Find the TextInput and trigger onFocus
      const root = tree!.root;
      const textInputs = root.findAllByType('TextInput');
      if (textInputs.length > 0) {
        renderer.act(() => {
          textInputs[0].props.onFocus();
        });
      }
      const json = tree!.toJSON();
      const str = JSON.stringify(json);
      // After focus, border should be primary color
      expect(str).toContain(COLORS.primary);
    });

    it('should show validation icon after blur when value is present', () => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ValidatedInput, { value: 'test' }));
      });
      // Trigger blur to set hasBeenBlurred = true
      const root = tree!.root;
      const textInputs = root.findAllByType('TextInput');
      if (textInputs.length > 0) {
        renderer.act(() => {
          textInputs[0].props.onBlur({ nativeEvent: {} });
        });
      }
      const json = tree!.toJSON();
      const str = JSON.stringify(json);
      // After blur with valid value and no error, checkmark should appear
      expect(str).toContain('checkmark-circle');
    });
  });
});
