/**
 * Accessibility Utilities Tests
 *
 * Pure unit tests for accessibility helper functions
 */

import { buttonA11y, linkA11y, inputA11y, headerA11y } from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('buttonA11y', () => {
    it('should return correct props with label only', () => {
      const result = buttonA11y('Submit');
      expect(result).toEqual({
        accessibilityRole: 'button',
        accessibilityLabel: 'Submit',
        accessibilityHint: undefined,
        accessibilityState: undefined,
      });
    });

    it('should return correct props with label and hint', () => {
      const result = buttonA11y('Submit', 'Submits the form');
      expect(result).toEqual({
        accessibilityRole: 'button',
        accessibilityLabel: 'Submit',
        accessibilityHint: 'Submits the form',
        accessibilityState: undefined,
      });
    });

    it('should include disabled state when disabled is true', () => {
      const result = buttonA11y('Submit', undefined, true);
      expect(result.accessibilityState).toEqual({ disabled: true });
    });

    it('should include disabled state when disabled is false', () => {
      const result = buttonA11y('Submit', undefined, false);
      expect(result.accessibilityState).toEqual({ disabled: false });
    });

    it('should have accessibilityState undefined when disabled is not provided', () => {
      const result = buttonA11y('Submit');
      expect(result.accessibilityState).toBeUndefined();
    });

    it('should always set accessibilityRole to button', () => {
      const result = buttonA11y('Anything');
      expect(result.accessibilityRole).toBe('button');
    });
  });

  describe('linkA11y', () => {
    it('should return correct props with label only', () => {
      const result = linkA11y('Visit website');
      expect(result).toEqual({
        accessibilityRole: 'link',
        accessibilityLabel: 'Visit website',
        accessibilityHint: undefined,
      });
    });

    it('should return correct props with label and hint', () => {
      const result = linkA11y('Visit website', 'Opens in browser');
      expect(result).toEqual({
        accessibilityRole: 'link',
        accessibilityLabel: 'Visit website',
        accessibilityHint: 'Opens in browser',
      });
    });

    it('should set accessibilityRole to link', () => {
      const result = linkA11y('Any link');
      expect(result.accessibilityRole).toBe('link');
    });
  });

  describe('inputA11y', () => {
    it('should return correct props with label only', () => {
      const result = inputA11y('Email address');
      expect(result).toEqual({
        accessibilityLabel: 'Email address',
        accessibilityHint: undefined,
        accessibilityValue: undefined,
      });
    });

    it('should return correct props with label and hint', () => {
      const result = inputA11y('Email address', 'Enter your email');
      expect(result).toEqual({
        accessibilityLabel: 'Email address',
        accessibilityHint: 'Enter your email',
        accessibilityValue: undefined,
      });
    });

    it('should set accessibilityValue.text when value is provided', () => {
      const result = inputA11y('Email address', undefined, 'test@example.com');
      expect(result.accessibilityValue).toEqual({ text: 'test@example.com' });
    });

    it('should have accessibilityValue undefined when value is not provided', () => {
      const result = inputA11y('Email address');
      expect(result.accessibilityValue).toBeUndefined();
    });

    it('should have accessibilityValue undefined when value is empty string', () => {
      const result = inputA11y('Email address', undefined, '');
      expect(result.accessibilityValue).toBeUndefined();
    });
  });

  describe('headerA11y', () => {
    it('should set accessibilityRole to header', () => {
      const result = headerA11y('Page Title');
      expect(result.accessibilityRole).toBe('header');
    });

    it('should set accessibilityLabel to the provided text', () => {
      const result = headerA11y('Settings');
      expect(result.accessibilityLabel).toBe('Settings');
    });

    it('should return the complete props object', () => {
      const result = headerA11y('Dashboard');
      expect(result).toEqual({
        accessibilityRole: 'header',
        accessibilityLabel: 'Dashboard',
      });
    });
  });
});
