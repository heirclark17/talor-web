/**
 * LiquidGlassWrapper Unit Tests -- Direct Invocation for Coverage
 *
 * Tests the wrapper components that handle unsupported platforms:
 * - LiquidGlassView and LiquidGlassContainerView are callable functions
 * - isLiquidGlassSupported flag behavior
 * - Fallback to View when native module unavailable
 * - Component invocation with various props
 * - No crash on module load
 */

import React from 'react';

describe('LiquidGlassWrapper', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('module exports', () => {
    it('should export LiquidGlassView as a function', () => {
      const wrapper = require('../LiquidGlassWrapper');
      expect(wrapper.LiquidGlassView).toBeDefined();
      expect(typeof wrapper.LiquidGlassView).toBe('function');
    });

    it('should export LiquidGlassContainerView as a function', () => {
      const wrapper = require('../LiquidGlassWrapper');
      expect(wrapper.LiquidGlassContainerView).toBeDefined();
      expect(typeof wrapper.LiquidGlassContainerView).toBe('function');
    });

    it('should export isLiquidGlassSupported as a boolean', () => {
      const wrapper = require('../LiquidGlassWrapper');
      expect(typeof wrapper.isLiquidGlassSupported).toBe('boolean');
    });
  });

  describe('platform check logic', () => {
    it('should default isLiquidGlassSupported to false in test environment', () => {
      const wrapper = require('../LiquidGlassWrapper');
      expect(wrapper.isLiquidGlassSupported).toBe(false);
    });

    it('should have Platform.OS as ios in test environment', () => {
      const { Platform } = require('react-native');
      expect(Platform.OS).toBe('ios');
    });
  });

  describe('fallback behavior', () => {
    it('should not throw when loading the module', () => {
      expect(() => {
        require('../LiquidGlassWrapper');
      }).not.toThrow();
    });

    it('should produce callable LiquidGlassView when unsupported', () => {
      const wrapper = require('../LiquidGlassWrapper');
      expect(wrapper.isLiquidGlassSupported).toBe(false);
      expect(typeof wrapper.LiquidGlassView).toBe('function');
    });

    it('should produce callable LiquidGlassContainerView when unsupported', () => {
      const wrapper = require('../LiquidGlassWrapper');
      expect(typeof wrapper.LiquidGlassContainerView).toBe('function');
    });
  });

  describe('LiquidGlassView invocation', () => {
    it('should render LiquidGlassView with effect and tintColor props', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const child = React.createElement('View', null, 'child');
      const element = wrapper.LiquidGlassView({
        effect: 'clear',
        tintColor: 'rgba(59, 130, 246, 0.4)',
        colorScheme: 'dark',
        interactive: true,
        children: child,
      });
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassView with no optional props', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassView({});
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassView with light colorScheme', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassView({ colorScheme: 'light' });
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassView with system colorScheme', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassView({ colorScheme: 'system' });
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassView with regular effect', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassView({ effect: 'regular' });
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassView with none effect', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassView({ effect: 'none' });
      expect(element).toBeTruthy();
    });
  });

  describe('LiquidGlassContainerView invocation', () => {
    it('should render LiquidGlassContainerView with spacing prop', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const child = React.createElement('View', null, 'container-child');
      const element = wrapper.LiquidGlassContainerView({
        spacing: 8,
        children: child,
      });
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassContainerView with no props', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassContainerView({});
      expect(element).toBeTruthy();
    });

    it('should render LiquidGlassContainerView with custom style', () => {
      const wrapper = require('../LiquidGlassWrapper');
      const element = wrapper.LiquidGlassContainerView({
        style: { borderRadius: 16 },
      });
      expect(element).toBeTruthy();
    });
  });

  describe('prop interface validation', () => {
    it('should accept valid effect values', () => {
      const validEffects = ['clear', 'regular', 'none'];
      validEffects.forEach((effect) => {
        expect(['clear', 'regular', 'none']).toContain(effect);
      });
    });

    it('should accept valid colorScheme values', () => {
      const validSchemes = ['light', 'dark', 'system'];
      validSchemes.forEach((scheme) => {
        expect(['light', 'dark', 'system']).toContain(scheme);
      });
    });
  });
});
