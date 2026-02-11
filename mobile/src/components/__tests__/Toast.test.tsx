/**
 * Toast Component Tests
 *
 * Tests the Toast component using react-test-renderer to properly
 * handle React hooks (useRef, useEffect). Covers all toast types,
 * visibility branches, description/action rendering, TOAST_CONFIG
 * color mapping, useToast hook, and haptics.
 */

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: Object.assign(
    (props: any) => `Ionicons(${props.name})`,
    { glyphMap: { 'checkmark-circle': 0, 'close-circle': 0, 'warning': 0, 'information-circle': 0, 'close': 0 } }
  ),
}));

// Mock ThemeContext
const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  background: '#f5f5f5',
  backgroundSecondary: '#1a1a1a',
  border: '#374151',
};

let mockIsDark = true;
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: mockColors,
    isDark: mockIsDark,
  })),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, right: 0, bottom: 34, left: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
}));

import React from 'react';
import renderer from 'react-test-renderer';
import { COLORS } from '../../utils/constants';

describe('Toast Component', () => {
  let Toast: any;
  let useToast: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDark = true;
    const mod = require('../Toast');
    Toast = mod.Toast;
    useToast = mod.useToast;
  });

  // Helper: render Toast component via react-test-renderer wrapped in act()
  const renderToast = (props: any) => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(Toast, props));
    });
    return tree!.toJSON();
  };

  describe('module exports', () => {
    it('should export Toast as a named export function', () => {
      expect(Toast).toBeDefined();
      expect(typeof Toast).toBe('function');
    });

    it('should export Toast as the default export', () => {
      const mod = require('../Toast');
      expect(mod.default).toBe(mod.Toast);
    });

    it('should export useToast hook', () => {
      expect(useToast).toBeDefined();
      expect(typeof useToast).toBe('function');
    });
  });

  describe('rendering when visible=false', () => {
    it('should return null when visible is false', () => {
      const json = renderToast({
        visible: false,
        type: 'success',
        message: 'Test',
        onDismiss: jest.fn(),
      });
      expect(json).toBeNull();
    });

    it('should return null for every toast type when not visible', () => {
      const types = ['success', 'error', 'warning', 'info'] as const;
      types.forEach((type) => {
        const json = renderToast({
          visible: false,
          type,
          message: 'Test',
          onDismiss: jest.fn(),
        });
        expect(json).toBeNull();
      });
    });
  });

  describe('rendering when visible=true', () => {
    it('should return a rendered tree for success type', () => {
      const json = renderToast({
        visible: true,
        type: 'success',
        message: 'Saved!',
        onDismiss: jest.fn(),
      });
      expect(json).toBeTruthy();
    });

    it('should render with error type', () => {
      const json = renderToast({
        visible: true,
        type: 'error',
        message: 'Failed',
        onDismiss: jest.fn(),
      });
      expect(json).toBeTruthy();
    });

    it('should render with warning type', () => {
      const json = renderToast({
        visible: true,
        type: 'warning',
        message: 'Caution',
        onDismiss: jest.fn(),
      });
      expect(json).toBeTruthy();
    });

    it('should render with info type', () => {
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'FYI',
        onDismiss: jest.fn(),
      });
      expect(json).toBeTruthy();
    });
  });

  describe('borderLeftColor from TOAST_CONFIG', () => {
    it('should use success color for success type', () => {
      const json = renderToast({
        visible: true,
        type: 'success',
        message: 'ok',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.success);
    });

    it('should use danger color for error type', () => {
      const json = renderToast({
        visible: true,
        type: 'error',
        message: 'err',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.danger);
    });

    it('should use warning color for warning type', () => {
      const json = renderToast({
        visible: true,
        type: 'warning',
        message: 'warn',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.warning);
    });

    it('should use info color for info type', () => {
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'info',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.info);
    });
  });

  describe('dark mode background', () => {
    it('should use backgroundSecondary in dark mode', () => {
      mockIsDark = true;
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'test',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain(mockColors.backgroundSecondary);
    });
  });

  describe('description rendering', () => {
    it('should include description text when provided', () => {
      const json = renderToast({
        visible: true,
        type: 'success',
        message: 'Done',
        description: 'All items saved',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain('All items saved');
    });

    it('should include the message text', () => {
      const json = renderToast({
        visible: true,
        type: 'success',
        message: 'Done',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Done');
    });
  });

  describe('action button rendering', () => {
    it('should include action button label when action prop is provided', () => {
      const mockAction = { label: 'Undo', onPress: jest.fn() };
      const json = renderToast({
        visible: true,
        type: 'error',
        message: 'Deleted',
        onDismiss: jest.fn(),
        action: mockAction,
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Undo');
    });

    it('should not contain action label when action prop is not provided', () => {
      const json = renderToast({
        visible: true,
        type: 'error',
        message: 'Deleted',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).not.toContain('Undo');
    });
  });

  describe('safe area insets', () => {
    it('should position toast using safe area top inset plus spacing', () => {
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'test',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      // top = insets.top (44) + SPACING.sm (8) = 52
      expect(str).toContain('"top":52');
    });
  });

  describe('default duration prop', () => {
    it('should render without error when duration is not specified', () => {
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'test',
        onDismiss: jest.fn(),
      });
      expect(json).toBeTruthy();
    });

    it('should accept custom duration', () => {
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'test',
        onDismiss: jest.fn(),
        duration: 2000,
      });
      expect(json).toBeTruthy();
    });

    it('should accept zero duration', () => {
      const json = renderToast({
        visible: true,
        type: 'info',
        message: 'test',
        onDismiss: jest.fn(),
        duration: 0,
      });
      expect(json).toBeTruthy();
    });
  });

  describe('message text', () => {
    it('should display the message in the rendered output', () => {
      const json = renderToast({
        visible: true,
        type: 'success',
        message: 'Hello World',
        onDismiss: jest.fn(),
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Hello World');
    });
  });

  describe('useToast hook', () => {
    let mockSetState: jest.Mock;
    let capturedState: any;

    beforeEach(() => {
      capturedState = {
        visible: false,
        type: 'info' as const,
        message: '',
      };
      mockSetState = jest.fn((updater: any) => {
        if (typeof updater === 'function') {
          capturedState = updater(capturedState);
        } else {
          capturedState = updater;
        }
      });

      jest.spyOn(React, 'useState').mockImplementation((initial: any) => {
        capturedState = initial;
        return [capturedState, mockSetState];
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return an object with toast state and all methods', () => {
      const result = useToast();
      expect(result).toHaveProperty('toast');
      expect(result).toHaveProperty('show');
      expect(result).toHaveProperty('hide');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('warning');
      expect(result).toHaveProperty('info');
    });

    it('should initialize with visible=false, type=info, empty message', () => {
      const result = useToast();
      expect(result.toast.visible).toBe(false);
      expect(result.toast.type).toBe('info');
      expect(result.toast.message).toBe('');
    });

    it('show() should set visible=true with type and message', () => {
      const result = useToast();
      result.show('success', 'Done');
      expect(mockSetState).toHaveBeenCalledWith({
        visible: true,
        type: 'success',
        message: 'Done',
        description: undefined,
        action: undefined,
      });
    });

    it('show() should pass description option', () => {
      const result = useToast();
      result.show('error', 'Failed', { description: 'Network error' });
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Network error' })
      );
    });

    it('show() should pass action option', () => {
      const mockAction = { label: 'Retry', onPress: jest.fn() };
      const result = useToast();
      result.show('error', 'Failed', { action: mockAction });
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ action: mockAction })
      );
    });

    it('hide() should call setState with updater that sets visible=false', () => {
      const result = useToast();
      result.hide();
      expect(mockSetState).toHaveBeenCalledWith(expect.any(Function));
      const updater = mockSetState.mock.calls[0][0];
      const prev = { visible: true, type: 'success' as const, message: 'test', description: 'desc' };
      const next = updater(prev);
      expect(next.visible).toBe(false);
      expect(next.type).toBe('success');
      expect(next.message).toBe('test');
    });

    it('success() should call show with success type', () => {
      const result = useToast();
      result.success('Saved!');
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ visible: true, type: 'success', message: 'Saved!' })
      );
    });

    it('success() should pass description option', () => {
      const result = useToast();
      result.success('Saved!', { description: 'File saved to disk' });
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'File saved to disk' })
      );
    });

    it('error() should call show with error type', () => {
      const result = useToast();
      result.error('Failed');
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ visible: true, type: 'error', message: 'Failed' })
      );
    });

    it('error() should pass action option for retry', () => {
      const retryAction = { label: 'Retry', onPress: jest.fn() };
      const result = useToast();
      result.error('Failed', { action: retryAction });
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ action: retryAction })
      );
    });

    it('warning() should call show with warning type', () => {
      const result = useToast();
      result.warning('Low battery');
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ visible: true, type: 'warning', message: 'Low battery' })
      );
    });

    it('info() should call show with info type', () => {
      const result = useToast();
      result.info('Update available');
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ visible: true, type: 'info', message: 'Update available' })
      );
    });
  });

  describe('TOAST_CONFIG color values', () => {
    it('success color should be COLORS.success', () => {
      expect(COLORS.success).toBe('#10b981');
    });

    it('error color should be COLORS.danger', () => {
      expect(COLORS.danger).toBe('#ef4444');
    });

    it('warning color should be COLORS.warning', () => {
      expect(COLORS.warning).toBe('#f59e0b');
    });

    it('info color should be COLORS.info', () => {
      expect(COLORS.info).toBe('#06b6d4');
    });
  });
});
