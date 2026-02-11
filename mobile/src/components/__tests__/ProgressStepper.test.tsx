/**
 * ProgressStepper Component Tests
 *
 * REWRITTEN: Uses react-test-renderer for component rendering (handles hooks
 * properly) and renderHook from @testing-library/react-native for hook testing.
 *
 * Covers:
 * - Module exports (default export + useStepNavigation)
 * - Default variant: completed/current/future steps, labels, descriptions,
 *   connector lines, step click, icons, custom styles, colors
 * - Compact variant: dots, colors, accessibility labels, click behavior
 * - Vertical variant: circles, connector lines, labels, descriptions, icons
 * - allowStepClick disabled state
 * - useStepNavigation hook: goToStep, nextStep, prevStep, completeStep, reset,
 *   isFirstStep, isLastStep, isStepCompleted, progress, completedSteps
 * - Edge cases: single step, no onStepClick, step icons, numeric ids
 */

// Mock ThemeContext before any imports
const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  border: '#374151',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#2a2a2a',
};

let mockIsDark = true;
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: mockColors,
    isDark: mockIsDark,
  })),
}));

import React from 'react';
import renderer from 'react-test-renderer';
import { renderHook, act } from '@testing-library/react-native';
import { COLORS } from '../../utils/constants';

import ProgressStepper, { useStepNavigation } from '../ProgressStepper';

// ---- Helpers ----

/** Render ProgressStepper via react-test-renderer with act() */
const renderPS = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(ProgressStepper, props));
  });
  return tree!;
};

/** Recursively collect all text from a JSON tree */
const getAllText = (node: any): string => {
  if (node === null || node === undefined) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getAllText).join('');
  if (node.children) return node.children.map(getAllText).join('');
  return '';
};

// ---- Test Data ----

const threeSteps = [
  { id: 'step1', label: 'Upload', description: 'Upload your resume' },
  { id: 'step2', label: 'Analyze', description: 'AI analysis' },
  { id: 'step3', label: 'Results', description: 'View results' },
];

const twoSteps = [
  { id: 'a', label: 'First' },
  { id: 'b', label: 'Second' },
];

const singleStep = [{ id: 'only', label: 'Only Step', description: 'The one and only' }];

const stepsWithIcons = [
  { id: 'i1', label: 'Icon Step', icon: React.createElement('View', { testID: 'custom-icon' }) },
  { id: 'i2', label: 'No Icon' },
];

// =========================================================================
// Component Tests
// =========================================================================

describe('ProgressStepper Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsDark = true;
  });

  // -----------------------------------------------------------------------
  // Module exports
  // -----------------------------------------------------------------------
  describe('module exports', () => {
    it('should export ProgressStepper as default export', () => {
      expect(ProgressStepper).toBeDefined();
      expect(typeof ProgressStepper).toBe('function');
    });

    it('should export useStepNavigation as named export', () => {
      expect(useStepNavigation).toBeDefined();
      expect(typeof useStepNavigation).toBe('function');
    });

    it('default export should match require default', () => {
      const mod = require('../ProgressStepper');
      expect(mod.default).toBe(ProgressStepper);
    });

    it('should export useStepNavigation via require', () => {
      const mod = require('../ProgressStepper');
      expect(mod.useStepNavigation).toBe(useStepNavigation);
    });
  });

  // -----------------------------------------------------------------------
  // DEFAULT VARIANT
  // -----------------------------------------------------------------------
  describe('default variant', () => {
    it('should render without crashing with minimal props', () => {
      const tree = renderPS({ steps: threeSteps, currentStep: 0 });
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should render a View as root element', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 0 }).toJSON();
      expect(json.type).toBe('View');
    });

    it('should have progressbar accessibility role', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 0 }).toJSON();
      expect(json.props.accessibilityRole).toBe('progressbar');
    });

    it('should have correct accessibility label for step 1 of 3', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 0 }).toJSON();
      expect(json.props.accessibilityLabel).toBe('Step 1 of 3');
    });

    it('should have correct accessibility label for step 2 of 3', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 1 }).toJSON();
      expect(json.props.accessibilityLabel).toBe('Step 2 of 3');
    });

    it('should display all step labels', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 0 }).toJSON();
      const text = getAllText(json);
      expect(text).toContain('Upload');
      expect(text).toContain('Analyze');
      expect(text).toContain('Results');
    });

    it('should display step descriptions when provided', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      expect(str).toContain('Upload your resume');
      expect(str).toContain('AI analysis');
      expect(str).toContain('View results');
    });

    it('should not render description when step has none', () => {
      const str = JSON.stringify(renderPS({ steps: twoSteps, currentStep: 0 }).toJSON());
      expect(str).not.toContain('Upload your resume');
    });

    it('should show step numbers for non-completed steps', () => {
      const text = getAllText(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
      expect(text).toContain('3');
    });

    it('should show Check icon for completed steps (currentStep=2)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2 }).toJSON());
      expect(str).toContain('Check');
    });

    it('should use success color for completed step circles', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2 }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use primary color for current step circle', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1 }).toJSON());
      expect(str).toContain(COLORS.primary);
    });

    it('should use backgroundTertiary for future step circles', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      expect(str).toContain(mockColors.backgroundTertiary);
    });

    it('should use text color for current step label', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1 }).toJSON());
      expect(str).toContain(mockColors.text);
    });

    it('should use textSecondary for future step labels', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      expect(str).toContain(mockColors.textSecondary);
    });

    it('should use success color for completed step labels', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2 }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should render 2 connector lines for 3 steps', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      // defaultLine has height: 3
      const lineMatches = str.match(/"height":3/g);
      expect(lineMatches).toBeTruthy();
      expect(lineMatches!.length).toBe(2);
    });

    it('should use success color for connector line after completed step', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2 }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use border color for connector line after non-completed step', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      expect(str).toContain(mockColors.border);
    });

    it('should apply custom style to container', () => {
      const str = JSON.stringify(
        renderPS({ steps: threeSteps, currentStep: 0, style: { marginTop: 99 } }).toJSON()
      );
      expect(str).toContain('"marginTop":99');
    });

    it('should render step icon instead of number when icon is provided (current step)', () => {
      // currentStep=0 so stepsWithIcons[0] is current, its icon should render
      const str = JSON.stringify(renderPS({ steps: stepsWithIcons, currentStep: 0 }).toJSON());
      expect(str).toContain('custom-icon');
    });

    it('should render number when step has no icon and is not completed', () => {
      const text = getAllText(renderPS({ steps: stepsWithIcons, currentStep: 0 }).toJSON());
      expect(text).toContain('2');
    });

    it('should apply current step circle shadow style (shadowRadius:8)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1 }).toJSON());
      expect(str).toContain('"shadowRadius":8');
    });

    it('should use white color for step number on current step', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1 }).toJSON());
      expect(str).toContain('#ffffff');
    });

    it('should render no connector lines for single step', () => {
      const str = JSON.stringify(renderPS({ steps: singleStep, currentStep: 0 }).toJSON());
      const lineMatches = str.match(/"height":3/g);
      expect(lineMatches).toBeNull();
    });

    describe('step click behavior', () => {
      it('should call onStepClick when clicking a completed step', () => {
        const onStepClick = jest.fn();
        const tree = renderPS({
          steps: threeSteps, currentStep: 2, onStepClick, allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        renderer.act(() => { touchables[0].props.onPress(); });
        expect(onStepClick).toHaveBeenCalledWith(0);
      });

      it('should call onStepClick with correct index for second completed step', () => {
        const onStepClick = jest.fn();
        const tree = renderPS({
          steps: threeSteps, currentStep: 2, onStepClick, allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        renderer.act(() => { touchables[1].props.onPress(); });
        expect(onStepClick).toHaveBeenCalledWith(1);
      });

      it('should NOT call onStepClick when clicking the current step', () => {
        const onStepClick = jest.fn();
        const tree = renderPS({
          steps: threeSteps, currentStep: 1, onStepClick, allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        renderer.act(() => { touchables[1].props.onPress(); });
        expect(onStepClick).not.toHaveBeenCalled();
      });

      it('should NOT call onStepClick when clicking a future step', () => {
        const onStepClick = jest.fn();
        const tree = renderPS({
          steps: threeSteps, currentStep: 0, onStepClick, allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        renderer.act(() => { touchables[2].props.onPress(); });
        expect(onStepClick).not.toHaveBeenCalled();
      });

      it('should NOT call onStepClick when allowStepClick is false', () => {
        const onStepClick = jest.fn();
        const tree = renderPS({
          steps: threeSteps, currentStep: 2, onStepClick, allowStepClick: false,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        renderer.act(() => { touchables[0].props.onPress(); });
        expect(onStepClick).not.toHaveBeenCalled();
      });

      it('should disable touchable for non-clickable steps', () => {
        const tree = renderPS({
          steps: threeSteps, currentStep: 1, onStepClick: jest.fn(), allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        expect(touchables[0].props.disabled).toBe(false);  // completed
        expect(touchables[1].props.disabled).toBe(true);   // current
        expect(touchables[2].props.disabled).toBe(true);   // future
      });

      it('should disable all touchables when no onStepClick provided', () => {
        const tree = renderPS({
          steps: threeSteps, currentStep: 2, allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        touchables.forEach((t: any) => { expect(t.props.disabled).toBe(true); });
      });

      it('should not crash when handleStepClick fires without onStepClick', () => {
        const tree = renderPS({
          steps: threeSteps, currentStep: 2, allowStepClick: true,
        });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        expect(() => {
          renderer.act(() => { touchables[0].props.onPress(); });
        }).not.toThrow();
      });

      it('should apply clickable style (scale:1) to completed steps with onStepClick', () => {
        const str = JSON.stringify(renderPS({
          steps: threeSteps, currentStep: 2, onStepClick: jest.fn(), allowStepClick: true,
        }).toJSON());
        expect(str).toContain('"scale":1');
      });

      it('should have correct accessibility labels for steps', () => {
        const tree = renderPS({ steps: threeSteps, currentStep: 1, onStepClick: jest.fn() });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        expect(touchables[0].props.accessibilityLabel).toBe('Step 1: Upload (completed)');
        expect(touchables[1].props.accessibilityLabel).toBe('Step 2: Analyze (current)');
        expect(touchables[2].props.accessibilityLabel).toContain('Step 3: Results');
        expect(touchables[2].props.accessibilityLabel).not.toContain('(completed)');
        expect(touchables[2].props.accessibilityLabel).not.toContain('(current)');
      });

      it('should set selected accessibility state for current step only', () => {
        const tree = renderPS({ steps: threeSteps, currentStep: 1 });
        const touchables = tree.root.findAllByType('TouchableOpacity');
        expect(touchables[0].props.accessibilityState).toEqual({ selected: false });
        expect(touchables[1].props.accessibilityState).toEqual({ selected: true });
        expect(touchables[2].props.accessibilityState).toEqual({ selected: false });
      });
    });
  });

  // -----------------------------------------------------------------------
  // COMPACT VARIANT
  // -----------------------------------------------------------------------
  describe('compact variant', () => {
    it('should render compact variant without crashing', () => {
      expect(renderPS({ steps: threeSteps, currentStep: 0, variant: 'compact' }).toJSON()).toBeTruthy();
    });

    it('should have progressbar accessibility role', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 1, variant: 'compact' }).toJSON();
      expect(json.props.accessibilityRole).toBe('progressbar');
    });

    it('should have correct accessibility label', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 1, variant: 'compact' }).toJSON();
      expect(json.props.accessibilityLabel).toBe('Step 2 of 3');
    });

    it('should render one TouchableOpacity per step', () => {
      const tree = renderPS({ steps: threeSteps, currentStep: 0, variant: 'compact' });
      expect(tree.root.findAllByType('TouchableOpacity').length).toBe(3);
    });

    it('should use success color for completed dots', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2, variant: 'compact' }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use primary color for current dot', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1, variant: 'compact' }).toJSON());
      expect(str).toContain(COLORS.primary);
    });

    it('should use backgroundTertiary for future dots', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'compact' }).toJSON());
      expect(str).toContain(mockColors.backgroundTertiary);
    });

    it('should apply current dot enlarged style (width:12, height:12)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1, variant: 'compact' }).toJSON());
      expect(str).toContain('"width":12');
      expect(str).toContain('"height":12');
    });

    it('should call onStepClick for completed dot click', () => {
      const onStepClick = jest.fn();
      const tree = renderPS({
        steps: threeSteps, currentStep: 2, variant: 'compact', onStepClick,
      });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      renderer.act(() => { touchables[0].props.onPress(); });
      expect(onStepClick).toHaveBeenCalledWith(0);
    });

    it('should NOT call onStepClick for current dot click', () => {
      const onStepClick = jest.fn();
      const tree = renderPS({
        steps: threeSteps, currentStep: 1, variant: 'compact', onStepClick,
      });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      renderer.act(() => { touchables[1].props.onPress(); });
      expect(onStepClick).not.toHaveBeenCalled();
    });

    it('should disable dots when allowStepClick is false', () => {
      const tree = renderPS({
        steps: threeSteps, currentStep: 2, variant: 'compact', onStepClick: jest.fn(), allowStepClick: false,
      });
      tree.root.findAllByType('TouchableOpacity').forEach((t: any) => {
        expect(t.props.disabled).toBe(true);
      });
    });

    it('should have correct accessibility labels for compact dots', () => {
      const tree = renderPS({ steps: threeSteps, currentStep: 1, variant: 'compact' });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      expect(touchables[0].props.accessibilityLabel).toBe('Step 1: Upload (completed)');
      expect(touchables[1].props.accessibilityLabel).toBe('Step 2: Analyze (current)');
      expect(touchables[2].props.accessibilityLabel).toBe('Step 3: Results');
    });

    it('should set selected accessibility state for current dot only', () => {
      const tree = renderPS({ steps: threeSteps, currentStep: 1, variant: 'compact' });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      expect(touchables[0].props.accessibilityState).toEqual({ selected: false });
      expect(touchables[1].props.accessibilityState).toEqual({ selected: true });
      expect(touchables[2].props.accessibilityState).toEqual({ selected: false });
    });

    it('should apply custom style to compact container', () => {
      const str = JSON.stringify(renderPS({
        steps: threeSteps, currentStep: 0, variant: 'compact', style: { paddingHorizontal: 42 },
      }).toJSON());
      expect(str).toContain('"paddingHorizontal":42');
    });
  });

  // -----------------------------------------------------------------------
  // VERTICAL VARIANT
  // -----------------------------------------------------------------------
  describe('vertical variant', () => {
    it('should render vertical variant without crashing', () => {
      expect(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON()).toBeTruthy();
    });

    it('should have progressbar accessibility role', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON();
      expect(json.props.accessibilityRole).toBe('progressbar');
    });

    it('should have correct accessibility label', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 2, variant: 'vertical' }).toJSON();
      expect(json.props.accessibilityLabel).toBe('Step 3 of 3');
    });

    it('should display all step labels', () => {
      const text = getAllText(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(text).toContain('Upload');
      expect(text).toContain('Analyze');
      expect(text).toContain('Results');
    });

    it('should display step descriptions', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain('Upload your resume');
      expect(str).toContain('AI analysis');
      expect(str).toContain('View results');
    });

    it('should not render description when step has none', () => {
      const str = JSON.stringify(renderPS({ steps: twoSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).not.toContain('Upload your resume');
    });

    it('should show Check icon for completed steps', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2, variant: 'vertical' }).toJSON());
      expect(str).toContain('Check');
    });

    it('should show step numbers for non-completed steps', () => {
      const text = getAllText(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
      expect(text).toContain('3');
    });

    it('should use success color for completed step circles', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2, variant: 'vertical' }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use primary color for current step circle', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1, variant: 'vertical' }).toJSON());
      expect(str).toContain(COLORS.primary);
    });

    it('should use backgroundTertiary for future step circles', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.backgroundTertiary);
    });

    it('should use border color for future step circle border', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.border);
    });

    it('should render 2 connector lines for 3 steps (height:48)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      const lineMatches = str.match(/"height":48/g);
      expect(lineMatches).toBeTruthy();
      expect(lineMatches!.length).toBe(2);
    });

    it('should NOT render connector line after last step', () => {
      const str = JSON.stringify(renderPS({ steps: singleStep, currentStep: 0, variant: 'vertical' }).toJSON());
      const lineMatches = str.match(/"height":48/g);
      expect(lineMatches).toBeNull();
    });

    it('should use success color for connector line after completed step', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2, variant: 'vertical' }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use border color for connector line after non-completed step', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.border);
    });

    it('should apply current step circle shadow style (shadowRadius:8)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1, variant: 'vertical' }).toJSON());
      expect(str).toContain('"shadowRadius":8');
    });

    it('should use white color for current step number', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1, variant: 'vertical' }).toJSON());
      expect(str).toContain('#ffffff');
    });

    it('should use textSecondary for future step number color', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.textSecondary);
    });

    it('should use text color for current step label', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.text);
    });

    it('should use success color for completed step label', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2, variant: 'vertical' }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use textSecondary for future step label', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.textSecondary);
    });

    it('should use textTertiary for description color', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain(mockColors.textTertiary);
    });

    it('should call onStepClick for completed step click', () => {
      const onStepClick = jest.fn();
      const tree = renderPS({
        steps: threeSteps, currentStep: 2, variant: 'vertical', onStepClick,
      });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      renderer.act(() => { touchables[0].props.onPress(); });
      expect(onStepClick).toHaveBeenCalledWith(0);
    });

    it('should NOT call onStepClick for current step click', () => {
      const onStepClick = jest.fn();
      const tree = renderPS({
        steps: threeSteps, currentStep: 1, variant: 'vertical', onStepClick,
      });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      renderer.act(() => { touchables[1].props.onPress(); });
      expect(onStepClick).not.toHaveBeenCalled();
    });

    it('should disable touchable for non-clickable steps', () => {
      const tree = renderPS({
        steps: threeSteps, currentStep: 1, variant: 'vertical', onStepClick: jest.fn(), allowStepClick: true,
      });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      expect(touchables[0].props.disabled).toBe(false);
      expect(touchables[1].props.disabled).toBe(true);
      expect(touchables[2].props.disabled).toBe(true);
    });

    it('should render step icon instead of number when icon is provided (current step)', () => {
      // currentStep=0 so stepsWithIcons[0] is current, its icon should render
      const str = JSON.stringify(renderPS({
        steps: stepsWithIcons, currentStep: 0, variant: 'vertical',
      }).toJSON());
      expect(str).toContain('custom-icon');
    });

    it('should apply custom style to vertical container', () => {
      const str = JSON.stringify(renderPS({
        steps: threeSteps, currentStep: 0, variant: 'vertical', style: { marginLeft: 77 },
      }).toJSON());
      expect(str).toContain('"marginLeft":77');
    });

    it('should have correct accessibility labels for steps', () => {
      const tree = renderPS({ steps: threeSteps, currentStep: 1, variant: 'vertical' });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      expect(touchables[0].props.accessibilityLabel).toBe('Step 1: Upload (completed)');
      expect(touchables[1].props.accessibilityLabel).toBe('Step 2: Analyze (current)');
      expect(touchables[2].props.accessibilityLabel).toContain('Step 3: Results');
    });

    it('should set selected accessibility state for current step only', () => {
      const tree = renderPS({ steps: threeSteps, currentStep: 1, variant: 'vertical' });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      expect(touchables[0].props.accessibilityState).toEqual({ selected: false });
      expect(touchables[1].props.accessibilityState).toEqual({ selected: true });
      expect(touchables[2].props.accessibilityState).toEqual({ selected: false });
    });
  });

  // -----------------------------------------------------------------------
  // EDGE CASES
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('should render with all steps completed (currentStep beyond last index)', () => {
      const json = renderPS({ steps: threeSteps, currentStep: 3 }).toJSON();
      expect(json).toBeTruthy();
      const text = getAllText(json);
      expect(text).toContain('Upload');
    });

    it('should handle numeric step ids', () => {
      const steps = [{ id: 1, label: 'One' }, { id: 2, label: 'Two' }];
      const text = getAllText(renderPS({ steps, currentStep: 0 }).toJSON());
      expect(text).toContain('One');
      expect(text).toContain('Two');
    });

    it('should default to variant="default" when not specified', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      // defaultLine has height: 3 (not 48 for vertical)
      expect(str).toContain('"height":3');
    });

    it('should default allowStepClick to true', () => {
      const onStepClick = jest.fn();
      const tree = renderPS({ steps: threeSteps, currentStep: 2, onStepClick });
      const touchables = tree.root.findAllByType('TouchableOpacity');
      expect(touchables[0].props.disabled).toBe(false);
    });

    it('should render single step in compact variant', () => {
      const json = renderPS({ steps: singleStep, currentStep: 0, variant: 'compact' }).toJSON();
      expect(json).toBeTruthy();
    });

    it('should render single step in vertical variant with description', () => {
      const str = JSON.stringify(renderPS({ steps: singleStep, currentStep: 0, variant: 'vertical' }).toJSON());
      expect(str).toContain('Only Step');
      expect(str).toContain('The one and only');
    });

    it('should use border color for border of current step circle (default variant)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 1 }).toJSON());
      // current step borderColor should be COLORS.primary
      expect(str).toContain(COLORS.primary);
    });

    it('should use success for border of completed step circle (default variant)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 2 }).toJSON());
      expect(str).toContain(COLORS.success);
    });

    it('should use border color for border of future step circle (default variant)', () => {
      const str = JSON.stringify(renderPS({ steps: threeSteps, currentStep: 0 }).toJSON());
      expect(str).toContain(mockColors.border);
    });
  });
});

// =========================================================================
// useStepNavigation Hook Tests
// =========================================================================

describe('useStepNavigation Hook', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useStepNavigation(5));
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isFirstStep).toBe(true);
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.progress).toBe(20);
    expect(result.current.completedSteps).toEqual(new Set());
  });

  it('should accept custom initial step', () => {
    const { result } = renderHook(() => useStepNavigation(5, 2));
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isFirstStep).toBe(false);
    expect(result.current.isLastStep).toBe(false);
    expect(result.current.progress).toBe(60);
  });

  it('should recognize isLastStep when initialStep is last', () => {
    const { result } = renderHook(() => useStepNavigation(3, 2));
    expect(result.current.isLastStep).toBe(true);
  });

  describe('goToStep', () => {
    it('should navigate to a valid step', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.goToStep(3); });
      expect(result.current.currentStep).toBe(3);
    });

    it('should not navigate to negative step', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.goToStep(-1); });
      expect(result.current.currentStep).toBe(0);
    });

    it('should not navigate beyond totalSteps', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.goToStep(5); });
      expect(result.current.currentStep).toBe(0);
    });

    it('should not navigate to exactly totalSteps', () => {
      const { result } = renderHook(() => useStepNavigation(3));
      act(() => { result.current.goToStep(3); });
      expect(result.current.currentStep).toBe(0);
    });

    it('should navigate to step 0', () => {
      const { result } = renderHook(() => useStepNavigation(5, 3));
      act(() => { result.current.goToStep(0); });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isFirstStep).toBe(true);
    });

    it('should navigate to last valid step', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.goToStep(4); });
      expect(result.current.currentStep).toBe(4);
      expect(result.current.isLastStep).toBe(true);
    });
  });

  describe('nextStep', () => {
    it('should advance to next step', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      expect(result.current.currentStep).toBe(1);
    });

    it('should mark current step as completed when advancing', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      expect(result.current.isStepCompleted(0)).toBe(true);
    });

    it('should not advance beyond last step', () => {
      const { result } = renderHook(() => useStepNavigation(3, 2));
      act(() => { result.current.nextStep(); });
      expect(result.current.currentStep).toBe(2);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should mark multiple steps as completed when advancing sequentially', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      act(() => { result.current.nextStep(); });
      act(() => { result.current.nextStep(); });
      expect(result.current.currentStep).toBe(3);
      expect(result.current.isStepCompleted(0)).toBe(true);
      expect(result.current.isStepCompleted(1)).toBe(true);
      expect(result.current.isStepCompleted(2)).toBe(true);
      expect(result.current.isStepCompleted(3)).toBe(false);
    });

    it('should update progress when advancing', () => {
      const { result } = renderHook(() => useStepNavigation(4));
      expect(result.current.progress).toBe(25);
      act(() => { result.current.nextStep(); });
      expect(result.current.progress).toBe(50);
    });

    it('should update isFirstStep after advancing', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      expect(result.current.isFirstStep).toBe(true);
      act(() => { result.current.nextStep(); });
      expect(result.current.isFirstStep).toBe(false);
    });
  });

  describe('prevStep', () => {
    it('should go to previous step', () => {
      const { result } = renderHook(() => useStepNavigation(5, 2));
      act(() => { result.current.prevStep(); });
      expect(result.current.currentStep).toBe(1);
    });

    it('should not go below step 0', () => {
      const { result } = renderHook(() => useStepNavigation(5, 0));
      act(() => { result.current.prevStep(); });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isFirstStep).toBe(true);
    });

    it('should update isLastStep after going back from last step', () => {
      const { result } = renderHook(() => useStepNavigation(3, 2));
      expect(result.current.isLastStep).toBe(true);
      act(() => { result.current.prevStep(); });
      expect(result.current.isLastStep).toBe(false);
    });

    it('should update progress after going back', () => {
      const { result } = renderHook(() => useStepNavigation(4, 3));
      expect(result.current.progress).toBe(100);
      act(() => { result.current.prevStep(); });
      expect(result.current.progress).toBe(75);
    });
  });

  describe('completeStep', () => {
    it('should mark a specific step as completed', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.completeStep(2); });
      expect(result.current.isStepCompleted(2)).toBe(true);
    });

    it('should not affect current step position', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.completeStep(3); });
      expect(result.current.currentStep).toBe(0);
    });

    it('should allow marking non-adjacent step as completed', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.completeStep(4); });
      expect(result.current.isStepCompleted(4)).toBe(true);
      expect(result.current.isStepCompleted(0)).toBe(false);
    });

    it('should accumulate completed steps', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.completeStep(1); });
      act(() => { result.current.completeStep(3); });
      expect(result.current.isStepCompleted(1)).toBe(true);
      expect(result.current.isStepCompleted(3)).toBe(true);
      expect(result.current.isStepCompleted(0)).toBe(false);
      expect(result.current.isStepCompleted(2)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset to initial step', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      act(() => { result.current.nextStep(); });
      act(() => { result.current.reset(); });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isFirstStep).toBe(true);
    });

    it('should clear completed steps', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      act(() => { result.current.nextStep(); });
      expect(result.current.isStepCompleted(0)).toBe(true);
      act(() => { result.current.reset(); });
      expect(result.current.isStepCompleted(0)).toBe(false);
      expect(result.current.completedSteps.size).toBe(0);
    });

    it('should reset to custom initial step', () => {
      const { result } = renderHook(() => useStepNavigation(5, 2));
      act(() => { result.current.nextStep(); });
      expect(result.current.currentStep).toBe(3);
      act(() => { result.current.reset(); });
      expect(result.current.currentStep).toBe(2);
    });

    it('should reset progress to initial', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      expect(result.current.progress).toBe(40);
      act(() => { result.current.reset(); });
      expect(result.current.progress).toBe(20);
    });
  });

  describe('isStepCompleted', () => {
    it('should return false for uncompleted step', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      expect(result.current.isStepCompleted(0)).toBe(false);
    });

    it('should return true after step is completed via nextStep', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      expect(result.current.isStepCompleted(0)).toBe(true);
    });

    it('should return true after step is completed via completeStep', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.completeStep(2); });
      expect(result.current.isStepCompleted(2)).toBe(true);
    });
  });

  describe('progress computation', () => {
    it('should compute progress for step 0 of 5 as 20%', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      expect(result.current.progress).toBe(20);
    });

    it('should compute progress for step 4 of 5 as 100%', () => {
      const { result } = renderHook(() => useStepNavigation(5, 4));
      expect(result.current.progress).toBe(100);
    });

    it('should compute progress for step 0 of 1 as 100%', () => {
      const { result } = renderHook(() => useStepNavigation(1));
      expect(result.current.progress).toBe(100);
    });

    it('should compute progress for step 1 of 4 as 50%', () => {
      const { result } = renderHook(() => useStepNavigation(4, 1));
      expect(result.current.progress).toBe(50);
    });
  });

  describe('isFirstStep and isLastStep', () => {
    it('should be first and last with single step', () => {
      const { result } = renderHook(() => useStepNavigation(1));
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should be first but not last at step 0 of multi-step', () => {
      const { result } = renderHook(() => useStepNavigation(3));
      expect(result.current.isFirstStep).toBe(true);
      expect(result.current.isLastStep).toBe(false);
    });

    it('should be last but not first at final step of multi-step', () => {
      const { result } = renderHook(() => useStepNavigation(3, 2));
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(true);
    });

    it('should be neither first nor last at middle step', () => {
      const { result } = renderHook(() => useStepNavigation(3, 1));
      expect(result.current.isFirstStep).toBe(false);
      expect(result.current.isLastStep).toBe(false);
    });
  });

  describe('combined operations', () => {
    it('should handle nextStep then prevStep correctly (completed stays)', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.nextStep(); });
      expect(result.current.isStepCompleted(0)).toBe(true);
      act(() => { result.current.prevStep(); });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.isStepCompleted(0)).toBe(true);
    });

    it('should handle goToStep then nextStep correctly', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => { result.current.goToStep(2); });
      act(() => { result.current.nextStep(); });
      expect(result.current.currentStep).toBe(3);
      expect(result.current.isStepCompleted(2)).toBe(true);
    });

    it('should handle completeStep then reset', () => {
      const { result } = renderHook(() => useStepNavigation(5));
      act(() => {
        result.current.completeStep(0);
        result.current.completeStep(1);
        result.current.completeStep(2);
      });
      expect(result.current.completedSteps.size).toBe(3);
      act(() => { result.current.reset(); });
      expect(result.current.completedSteps.size).toBe(0);
    });
  });
});
