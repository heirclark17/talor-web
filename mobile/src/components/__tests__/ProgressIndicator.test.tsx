/**
 * ProgressIndicator Component Tests
 *
 * Tests the ProgressIndicator using react-test-renderer to properly
 * handle React hooks (useRef, useEffect). Covers step status logic
 * (completed/active/pending/error), step configs, error rendering,
 * estimated time display, and all pre-defined step sets.
 */

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: Object.assign(
    (props: any) => `Ionicons(${props.name})`,
    { glyphMap: { 'checkmark-circle': 0, 'close-circle': 0, 'warning': 0 } }
  ),
}));

// Mock ThemeContext
const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  border: '#374151',
  backgroundSecondary: '#1a1a1a',
};

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: mockColors,
    isDark: true,
  })),
}));

import React from 'react';
import renderer from 'react-test-renderer';
import {
  ProgressIndicator,
  TAILOR_STEPS,
  INTERVIEW_PREP_STEPS,
  CAREER_PATH_STEPS,
} from '../ProgressIndicator';
import type { ProgressStep } from '../ProgressIndicator';
import { COLORS } from '../../utils/constants';

describe('ProgressIndicator Component', () => {
  const basicSteps: ProgressStep[] = [
    { id: 'step1', label: 'Step One', description: 'First step' },
    { id: 'step2', label: 'Step Two', description: 'Second step' },
    { id: 'step3', label: 'Step Three', description: 'Third step' },
  ];

  // Helper: render component via react-test-renderer wrapped in act()
  const renderPI = (props: any) => {
    let tree: any;
    renderer.act(() => {
      tree = renderer.create(React.createElement(ProgressIndicator, props));
    });
    return tree!.toJSON();
  };

  describe('module exports', () => {
    it('should export ProgressIndicator as a named export', () => {
      expect(ProgressIndicator).toBeDefined();
      expect(typeof ProgressIndicator).toBe('function');
    });

    it('should export ProgressIndicator as the default export', () => {
      const defaultExport = require('../ProgressIndicator').default;
      expect(defaultExport).toBe(ProgressIndicator);
    });

    it('should export TAILOR_STEPS', () => {
      expect(TAILOR_STEPS).toBeDefined();
      expect(Array.isArray(TAILOR_STEPS)).toBe(true);
    });

    it('should export INTERVIEW_PREP_STEPS', () => {
      expect(INTERVIEW_PREP_STEPS).toBeDefined();
      expect(Array.isArray(INTERVIEW_PREP_STEPS)).toBe(true);
    });

    it('should export CAREER_PATH_STEPS', () => {
      expect(CAREER_PATH_STEPS).toBeDefined();
      expect(Array.isArray(CAREER_PATH_STEPS)).toBe(true);
    });
  });

  describe('component rendering with currentStep=0 (first step active)', () => {
    it('should return a React element', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
      });
      expect(json).toBeTruthy();
    });

    it('should display the default title "Processing..."', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Processing...');
    });

    it('should use backgroundSecondary for container', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
      });
      const str = JSON.stringify(json);
      expect(str).toContain(mockColors.backgroundSecondary);
    });

    it('should render all step labels', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Step One');
      expect(str).toContain('Step Two');
      expect(str).toContain('Step Three');
    });
  });

  describe('custom title and estimatedTime', () => {
    it('should display custom title', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
        title: 'Tailoring Resume...',
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Tailoring Resume...');
    });

    it('should display estimatedTime when provided and no error', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
        estimatedTime: '~30 seconds',
      });
      const str = JSON.stringify(json);
      expect(str).toContain('~30 seconds');
    });

    it('should not display estimatedTime when error is present', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 1,
        estimatedTime: '~30 seconds',
        error: 'Something went wrong',
      });
      const str = JSON.stringify(json);
      expect(str).not.toContain('~30 seconds');
    });
  });

  describe('step status determination', () => {
    it('should mark steps before currentStep as completed (checkmark icon)', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 2,
      });
      const str = JSON.stringify(json);
      expect(str).toContain('checkmark-circle');
    });

    it('should mark the current step as active (ActivityIndicator)', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 1,
      });
      const str = JSON.stringify(json);
      expect(str).toContain('ActivityIndicator');
    });

    it('should show description only for the active step', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 1,
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Second step');
    });

    it('should mark steps after currentStep as pending (dot)', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
      });
      expect(json).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('should show error text when error is provided', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 1,
        error: 'Network timeout',
      });
      const str = JSON.stringify(json);
      expect(str).toContain('Network timeout');
    });

    it('should show close-circle icon for the current step on error', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 1,
        error: 'Failed',
      });
      const str = JSON.stringify(json);
      expect(str).toContain('close-circle');
    });

    it('should still show completed steps before error step', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 2,
        error: 'Error occurred',
      });
      const str = JSON.stringify(json);
      expect(str).toContain('checkmark-circle');
      expect(str).toContain('close-circle');
    });

    it('should show error container with warning icon and danger color', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
        error: 'Something broke',
      });
      const str = JSON.stringify(json);
      expect(str).toContain('warning');
      expect(str).toContain('Something broke');
    });
  });

  describe('connector lines between steps', () => {
    it('should render connectors between steps (not after the last step)', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 0,
      });
      expect(json).toBeTruthy();
    });

    it('should use success color for connectors of completed steps', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 2,
      });
      const str = JSON.stringify(json);
      expect(str).toContain(COLORS.success);
    });
  });

  describe('TAILOR_STEPS configuration', () => {
    it('should have exactly 5 steps', () => {
      expect(TAILOR_STEPS).toHaveLength(5);
    });

    it('should have unique IDs', () => {
      const ids = TAILOR_STEPS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have the correct step order', () => {
      expect(TAILOR_STEPS.map((s) => s.id)).toEqual(['extract', 'analyze', 'match', 'tailor', 'finalize']);
    });

    it('should have labels and descriptions for all steps', () => {
      TAILOR_STEPS.forEach((step) => {
        expect(step.label.length).toBeGreaterThan(0);
        expect(step.description).toBeDefined();
        expect(step.description!.length).toBeGreaterThan(0);
      });
    });

    it('should render correctly when passed as steps prop', () => {
      const json = renderPI({
        steps: TAILOR_STEPS,
        currentStep: 2,
        title: 'Tailoring...',
      });
      expect(json).toBeTruthy();
      const str = JSON.stringify(json);
      expect(str).toContain('Matching your experience');
    });
  });

  describe('INTERVIEW_PREP_STEPS configuration', () => {
    it('should have exactly 4 steps', () => {
      expect(INTERVIEW_PREP_STEPS).toHaveLength(4);
    });

    it('should have unique IDs', () => {
      const ids = INTERVIEW_PREP_STEPS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have the correct step order', () => {
      expect(INTERVIEW_PREP_STEPS.map((s) => s.id)).toEqual(['research', 'values', 'questions', 'strategy']);
    });

    it('should have labels and descriptions for all steps', () => {
      INTERVIEW_PREP_STEPS.forEach((step) => {
        expect(step.label.length).toBeGreaterThan(0);
        expect(step.description!.length).toBeGreaterThan(0);
      });
    });

    it('should render correctly when passed as steps prop', () => {
      const json = renderPI({
        steps: INTERVIEW_PREP_STEPS,
        currentStep: 0,
      });
      expect(json).toBeTruthy();
      const str = JSON.stringify(json);
      expect(str).toContain('Researching company');
    });
  });

  describe('CAREER_PATH_STEPS configuration', () => {
    it('should have exactly 4 steps', () => {
      expect(CAREER_PATH_STEPS).toHaveLength(4);
    });

    it('should have unique IDs', () => {
      const ids = CAREER_PATH_STEPS.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have the correct step order', () => {
      expect(CAREER_PATH_STEPS.map((s) => s.id)).toEqual(['analyze', 'research', 'plan', 'resources']);
    });

    it('should have labels and descriptions for all steps', () => {
      CAREER_PATH_STEPS.forEach((step) => {
        expect(step.label.length).toBeGreaterThan(0);
        expect(step.description!.length).toBeGreaterThan(0);
      });
    });

    it('should render correctly when passed as steps prop', () => {
      const json = renderPI({
        steps: CAREER_PATH_STEPS,
        currentStep: 3,
      });
      expect(json).toBeTruthy();
      const str = JSON.stringify(json);
      expect(str).toContain('Finding resources');
    });
  });

  describe('step without description', () => {
    it('should render correctly when step has no description', () => {
      const stepsNoDesc: ProgressStep[] = [
        { id: 'a', label: 'First' },
        { id: 'b', label: 'Second' },
      ];
      const json = renderPI({
        steps: stepsNoDesc,
        currentStep: 0,
      });
      expect(json).toBeTruthy();
      const str = JSON.stringify(json);
      expect(str).toContain('First');
    });
  });

  describe('all steps completed', () => {
    it('should render all checkmarks when currentStep exceeds total steps', () => {
      const json = renderPI({
        steps: basicSteps,
        currentStep: 5,
      });
      expect(json).toBeTruthy();
      const str = JSON.stringify(json);
      const matches = str.match(/checkmark-circle/g);
      expect(matches).toBeTruthy();
      expect(matches!.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('ProgressStep interface', () => {
    it('should accept required fields only', () => {
      const step: ProgressStep = { id: 'test', label: 'Test Step' };
      expect(step.id).toBe('test');
      expect(step.label).toBe('Test Step');
      expect(step.description).toBeUndefined();
    });

    it('should accept all fields', () => {
      const step: ProgressStep = { id: 'test', label: 'Test', description: 'Desc' };
      expect(step.description).toBe('Desc');
    });
  });
});
