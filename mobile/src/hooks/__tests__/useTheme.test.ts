/**
 * Tests for hooks/useTheme.ts
 * Verifies all 4 hooks are re-exported from ThemeContext
 */

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({ isDark: true })),
  useColors: jest.fn(() => ({ background: '#000' })),
  useBackground: jest.fn(() => ({ backgroundId: 'default' })),
  useGlass: jest.fn(() => ({ isDark: true })),
}));

import { useTheme, useColors, useBackground, useGlass } from '../useTheme';

describe('useTheme re-exports', () => {
  test('useTheme is exported and callable', () => {
    expect(useTheme).toBeDefined();
    expect(typeof useTheme).toBe('function');
    const result = useTheme();
    expect(result).toEqual({ isDark: true });
  });

  test('useColors is exported and callable', () => {
    expect(useColors).toBeDefined();
    expect(typeof useColors).toBe('function');
    const result = useColors();
    expect(result).toEqual({ background: '#000' });
  });

  test('useBackground is exported and callable', () => {
    expect(useBackground).toBeDefined();
    expect(typeof useBackground).toBe('function');
    const result = useBackground();
    expect(result).toEqual({ backgroundId: 'default' });
  });

  test('useGlass is exported and callable', () => {
    expect(useGlass).toBeDefined();
    expect(typeof useGlass).toBe('function');
    const result = useGlass();
    expect(result).toEqual({ isDark: true });
  });
});
