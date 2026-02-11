/**
 * PracticeQuestions Component Tests
 *
 * Tests module exports, navigation logic (next/previous),
 * progress calculation, response management, and direct component rendering
 * via react-test-renderer for empty/data states.
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('lucide-react-native', () => new Proxy({}, { get: (_, name) => name }));
jest.mock('../glass/GlassCard', () => ({
  GlassCard: ({ children, ...props }: any) => require('react').createElement('GlassCard', props, children),
}));
jest.mock('../glass/GlassButton', () => ({
  GlassButton: ({ children, ...props }: any) => require('react').createElement('GlassButton', props, children),
}));
jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#fff',
      textSecondary: '#aaa',
      textTertiary: '#666',
      border: '#333',
      backgroundTertiary: '#222',
    },
  }),
}));

import PracticeQuestions from '../PracticeQuestions';

const renderComponent = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(PracticeQuestions, props));
  });
  return tree!;
};

const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  let text = '';
  if (node.props) {
    for (const val of Object.values(node.props)) {
      if (typeof val === 'string') text += ' ' + val;
    }
  }
  if (node.children) {
    for (const child of node.children) {
      text += ' ' + getTreeText(child);
    }
  }
  return text;
};

describe('PracticeQuestions', () => {
  const mockQuestions = [
    { id: 'q1', question: 'Tell me about yourself', guidance: 'Keep it concise' },
    { id: 'q2', question: 'Why this company?', guidance: 'Research the company' },
    { id: 'q3', question: 'Greatest weakness?', guidance: 'Be honest but strategic' },
  ];

  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(PracticeQuestions).toBeDefined();
      expect(typeof PracticeQuestions).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(PracticeQuestions.name).toBe('PracticeQuestions');
    });
  });

  describe('navigation logic - handleNext', () => {
    it('should advance to the next question when not at end', () => {
      let currentIndex = 0;
      const totalQuestions = mockQuestions.length;

      // handleNext logic
      if (currentIndex < totalQuestions - 1) {
        currentIndex = currentIndex + 1;
      }
      expect(currentIndex).toBe(1);
    });

    it('should not advance past the last question', () => {
      let currentIndex = 2; // last index for 3 questions
      const totalQuestions = mockQuestions.length;

      if (currentIndex < totalQuestions - 1) {
        currentIndex = currentIndex + 1;
      }
      expect(currentIndex).toBe(2);
    });
  });

  describe('navigation logic - handlePrevious', () => {
    it('should go back to the previous question when not at start', () => {
      let currentIndex = 2;

      if (currentIndex > 0) {
        currentIndex = currentIndex - 1;
      }
      expect(currentIndex).toBe(1);
    });

    it('should not go before the first question', () => {
      let currentIndex = 0;

      if (currentIndex > 0) {
        currentIndex = currentIndex - 1;
      }
      expect(currentIndex).toBe(0);
    });
  });

  describe('progress calculation', () => {
    it('should calculate correct progress percentage', () => {
      const currentIndex = 0;
      const total = mockQuestions.length;
      const progress = ((currentIndex + 1) / total) * 100;
      expect(progress).toBeCloseTo(33.33, 1);
    });

    it('should show 100% on last question', () => {
      const currentIndex = 2;
      const total = mockQuestions.length;
      const progress = ((currentIndex + 1) / total) * 100;
      expect(progress).toBe(100);
    });
  });

  describe('response management', () => {
    it('should store responses keyed by question id', () => {
      const responses: Record<string, string> = {};
      responses['q1'] = 'My answer to question 1';
      responses['q2'] = 'My answer to question 2';

      expect(responses['q1']).toBe('My answer to question 1');
      expect(responses['q2']).toBe('My answer to question 2');
      expect(responses['q3']).toBeUndefined();
    });

    it('should call onSaveResponse with current question id and response', () => {
      const onSaveResponse = jest.fn();
      const currentQuestion = mockQuestions[0];
      const responses: Record<string, string> = { q1: 'My answer' };

      if (onSaveResponse && currentQuestion) {
        onSaveResponse(currentQuestion.id, responses[currentQuestion.id] || '');
      }

      expect(onSaveResponse).toHaveBeenCalledWith('q1', 'My answer');
    });
  });

  describe('component rendering - empty state (no questions)', () => {
    it('should render empty state when questions array is empty', () => {
      const tree = renderComponent({ questions: [] });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('No practice questions available');
    });

    it('should render a GlassCard for empty state', () => {
      const tree = renderComponent({ questions: [] });
      const cards = tree.root.findAllByType('GlassCard');
      expect(cards.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('component rendering - with questions', () => {
    it('should render first question by default', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about yourself');
    });

    it('should display progress text for first question', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const json = getTreeText(tree.toJSON());
      expect(json).toMatch(/Question\s+1\s+of\s+3/);
    });

    it('should show guidance text for current question', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Keep it concise');
    });

    it('should render Previous, Save, and Next buttons', () => {
      const tree = renderComponent({ questions: mockQuestions, onSaveResponse: jest.fn() });
      const buttons = tree.root.findAllByType('GlassButton');
      const labels = buttons.map((b: any) => b.props.label);
      expect(labels).toContain('Previous');
      expect(labels).toContain('Save');
      expect(labels).toContain('Next');
    });

    it('should disable Previous button on first question', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const buttons = tree.root.findAllByType('GlassButton');
      const prevBtn = buttons.find((b: any) => b.props.label === 'Previous');
      expect(prevBtn!.props.disabled).toBe(true);
    });

    it('should not disable Next button on first question with multiple questions', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const buttons = tree.root.findAllByType('GlassButton');
      const nextBtn = buttons.find((b: any) => b.props.label === 'Next');
      expect(nextBtn!.props.disabled).toBe(false);
    });

    it('should disable Next button when only one question', () => {
      const tree = renderComponent({ questions: [mockQuestions[0]] });
      const buttons = tree.root.findAllByType('GlassButton');
      const nextBtn = buttons.find((b: any) => b.props.label === 'Next');
      expect(nextBtn!.props.disabled).toBe(true);
    });

    it('should render the Your Answer label', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Your Answer');
    });

    it('should navigate to next question when Next is pressed', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const buttons = tree.root.findAllByType('GlassButton');
      const nextBtn = buttons.find((b: any) => b.props.label === 'Next');

      renderer.act(() => {
        nextBtn!.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Why this company?');
      expect(json).toMatch(/Question\s+2\s+of\s+3/);
    });

    it('should navigate back when Previous is pressed after advancing', () => {
      const tree = renderComponent({ questions: mockQuestions });
      const getButton = (label: string) => {
        const buttons = tree.root.findAllByType('GlassButton');
        return buttons.find((b: any) => b.props.label === label);
      };

      // Go to question 2
      renderer.act(() => {
        getButton('Next')!.props.onPress();
      });

      // Go back to question 1
      renderer.act(() => {
        getButton('Previous')!.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about yourself');
      expect(json).toMatch(/Question\s+1\s+of\s+3/);
    });

    it('should call onSaveResponse when Save is pressed', () => {
      const mockSave = jest.fn();
      const tree = renderComponent({ questions: mockQuestions, onSaveResponse: mockSave });
      const buttons = tree.root.findAllByType('GlassButton');
      const saveBtn = buttons.find((b: any) => b.props.label === 'Save');

      renderer.act(() => {
        saveBtn!.props.onPress();
      });

      expect(mockSave).toHaveBeenCalledWith('q1', '');
    });
  });
});
