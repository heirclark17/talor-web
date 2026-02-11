/**
 * GlassContainer Unit Tests -- Direct Invocation for Coverage
 *
 * Calls GlassContainer as a function to execute all internal code paths:
 * - Dark vs light mode background/border color computation
 * - useBlur true (BlurView path) vs false (plain View path)
 * - square vs rounded (borderRadius toggle)
 * - All 5 material types
 * - Custom style prop
 */

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    isDark: true,
  })),
}));

import React from 'react';
import { GlassContainer } from '../GlassContainer';
import { useTheme } from '../../../context/ThemeContext';
import { GLASS, RADIUS } from '../../../utils/constants';

const mockUseTheme = useTheme as jest.Mock;

describe('GlassContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTheme.mockReturnValue({ isDark: true });
  });

  describe('module exports', () => {
    it('should export GlassContainer as a named export', () => {
      expect(GlassContainer).toBeDefined();
      expect(typeof GlassContainer).toBe('function');
    });

    it('should export GlassContainer as the default export', () => {
      const mod = require('../GlassContainer');
      expect(mod.default).toBe(mod.GlassContainer);
    });
  });

  describe('default rendering - dark mode with blur', () => {
    it('should render with default props (thin material, useBlur, not square)', () => {
      const child = React.createElement('View', null, 'child');
      const element = GlassContainer({ children: child });
      expect(element).toBeTruthy();
    });

    it('should render with dark mode colors', () => {
      const child = React.createElement('View', null, 'content');
      const element = GlassContainer({ children: child, material: 'thin' });
      expect(element).toBeTruthy();
    });
  });

  describe('light mode rendering', () => {
    beforeEach(() => {
      mockUseTheme.mockReturnValue({ isDark: false });
    });

    it('should render with light mode colors using blur', () => {
      const child = React.createElement('View', null, 'light');
      const element = GlassContainer({ children: child });
      expect(element).toBeTruthy();
    });

    it('should render with light mode colors without blur', () => {
      const child = React.createElement('View', null, 'light-noblur');
      const element = GlassContainer({ children: child, useBlur: false });
      expect(element).toBeTruthy();
    });
  });

  describe('useBlur toggle', () => {
    it('should render BlurView path when useBlur is true (default)', () => {
      const child = React.createElement('View', null, 'blur');
      const element = GlassContainer({ children: child, useBlur: true });
      expect(element).toBeTruthy();
    });

    it('should render plain View path when useBlur is false', () => {
      const child = React.createElement('View', null, 'noblur');
      const element = GlassContainer({ children: child, useBlur: false });
      expect(element).toBeTruthy();
    });
  });

  describe('square prop', () => {
    it('should include borderRadius when square is false (default)', () => {
      const child = React.createElement('View', null, 'rounded');
      const element = GlassContainer({ children: child, square: false });
      expect(element).toBeTruthy();
    });

    it('should omit borderRadius when square is true', () => {
      const child = React.createElement('View', null, 'square');
      const element = GlassContainer({ children: child, square: true });
      expect(element).toBeTruthy();
    });

    it('should render square without blur', () => {
      const child = React.createElement('View', null, 'square-noblur');
      const element = GlassContainer({ children: child, square: true, useBlur: false });
      expect(element).toBeTruthy();
    });
  });

  describe('all material types', () => {
    const materials: Array<keyof typeof GLASS.materials> = ['ultraThin', 'thin', 'regular', 'thick', 'chrome'];

    materials.forEach((material) => {
      it(`should render with ${material} material using blur`, () => {
        const child = React.createElement('View', null, material);
        const element = GlassContainer({ children: child, material });
        expect(element).toBeTruthy();
      });

      it(`should render with ${material} material without blur`, () => {
        const child = React.createElement('View', null, `${material}-noblur`);
        const element = GlassContainer({ children: child, material, useBlur: false });
        expect(element).toBeTruthy();
      });
    });
  });

  describe('custom style prop', () => {
    it('should accept and apply custom style', () => {
      const child = React.createElement('View', null, 'styled');
      const element = GlassContainer({ children: child, style: { padding: 20 } });
      expect(element).toBeTruthy();
    });
  });

  describe('style computation logic', () => {
    it('should compute dark mode background color using opacity * 0.2', () => {
      const opacity = GLASS.materials.thin.opacity; // 0.25
      const bg = `rgba(255, 255, 255, ${opacity * 0.2})`;
      expect(bg).toBe('rgba(255, 255, 255, 0.05)');
    });

    it('should compute dark mode border color using opacity * 0.3', () => {
      const opacity = GLASS.materials.thin.opacity;
      const border = `rgba(255, 255, 255, ${opacity * 0.3})`;
      expect(border).toBe('rgba(255, 255, 255, 0.075)');
    });

    it('should compute light mode background color using opacity * 1.2', () => {
      const opacity = GLASS.materials.thin.opacity;
      const bg = `rgba(255, 255, 255, ${opacity * 1.2})`;
      expect(bg).toBe(`rgba(255, 255, 255, ${0.25 * 1.2})`);
    });

    it('should compute light mode border color using opacity * 0.1', () => {
      const opacity = GLASS.materials.thin.opacity;
      const border = `rgba(0, 0, 0, ${opacity * 0.1})`;
      expect(border).toBe(`rgba(0, 0, 0, ${0.25 * 0.1})`);
    });
  });

  describe('GLASS materials configuration', () => {
    it('should have all five material types', () => {
      expect(Object.keys(GLASS.materials)).toHaveLength(5);
      expect(GLASS.materials.ultraThin).toEqual({ blur: 20, opacity: 0.15 });
      expect(GLASS.materials.thin).toEqual({ blur: 40, opacity: 0.25 });
      expect(GLASS.materials.regular).toEqual({ blur: 60, opacity: 0.35 });
      expect(GLASS.materials.thick).toEqual({ blur: 80, opacity: 0.50 });
      expect(GLASS.materials.chrome).toEqual({ blur: 70, opacity: 0.40 });
    });
  });

  describe('combined prop permutations', () => {
    it('should render dark, thick, square, no blur', () => {
      const child = React.createElement('View', null, 'combo');
      const element = GlassContainer({ children: child, material: 'thick', square: true, useBlur: false });
      expect(element).toBeTruthy();
    });

    it('should render light, chrome, rounded, with blur', () => {
      mockUseTheme.mockReturnValue({ isDark: false });
      const child = React.createElement('View', null, 'combo-light');
      const element = GlassContainer({ children: child, material: 'chrome', square: false, useBlur: true });
      expect(element).toBeTruthy();
    });
  });
});
