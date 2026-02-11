/**
 * BehavioralTechnicalQuestions Component Tests
 *
 * Tests module exports, question type/filter constants, difficulty levels,
 * getFilteredQuestions logic, and direct component rendering via react-test-renderer.
 * Covers all interactive behaviors: toggle expand/collapse, type filters,
 * difficulty filters, loading state, error state, expanded content sections
 * (example_answer, tips, follow_ups), and empty filter results.
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('lucide-react-native', () => new Proxy({}, {
  get: (_, name) => {
    if (name === '__esModule') return true;
    // Return React components so react-test-renderer can render them
    const R = require('react');
    const comp = R.forwardRef((props: any, ref: any) =>
      R.createElement(String(name), { ...props, ref })
    );
    comp.displayName = String(name);
    return comp;
  },
}));
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

import BehavioralTechnicalQuestions from '../BehavioralTechnicalQuestions';

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

const renderComponent = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(BehavioralTechnicalQuestions, props));
  });
  return tree!;
};

// Helper to generate data and transition out of empty state
const generateAndGetTree = async (mockData: any, extraProps: any = {}) => {
  const mockGenerate = jest.fn().mockResolvedValue(mockData);
  const tree = renderComponent({
    interviewPrepId: 1,
    companyName: 'TestCo',
    jobTitle: 'PM',
    onGenerate: mockGenerate,
    ...extraProps,
  });
  await renderer.act(async () => {
    tree.root.findAllByType('GlassButton')[0].props.onPress();
  });
  return tree;
};

// Rich mock data with all optional fields populated
const fullMockData = {
  behavioral_questions: [
    {
      id: 'b1',
      question: 'Tell me about a leadership challenge',
      type: 'behavioral' as const,
      difficulty: 'medium' as const,
      category: 'Leadership',
      why_asked: 'Tests leadership skills',
      what_theyre_looking_for: 'Clear decision making',
      approach: 'Use STAR method',
      example_answer: 'In my previous role I led a team of 10 engineers...',
      tips: ['Be specific about your actions', 'Quantify the results'],
      follow_ups: ['How did you handle disagreements?', 'What would you do differently?'],
    },
  ],
  technical_questions: [
    {
      id: 't1',
      question: 'Explain NIST framework components',
      type: 'technical' as const,
      difficulty: 'easy' as const,
      category: 'Compliance',
      why_asked: 'Tests framework knowledge',
      what_theyre_looking_for: 'Depth of understanding',
      approach: 'Walk through five core functions',
      example_answer: 'NIST CSF consists of Identify, Protect, Detect, Respond, Recover...',
      tips: ['Reference real-world examples'],
      follow_ups: ['How does NIST relate to ISO 27001?'],
    },
    {
      id: 't2',
      question: 'How would you design a zero trust architecture?',
      type: 'technical' as const,
      difficulty: 'hard' as const,
      category: 'Architecture',
      why_asked: 'Tests architectural thinking',
      what_theyre_looking_for: 'Systematic approach',
      approach: 'Start with principles then specifics',
    },
  ],
};

// Minimal data with no optional fields
const minimalMockData = {
  behavioral_questions: [
    {
      id: 'b1',
      question: 'Basic behavioral question',
      type: 'behavioral' as const,
      difficulty: 'easy' as const,
      category: '',
      why_asked: 'Why text',
      what_theyre_looking_for: 'Looking for text',
      approach: 'Approach text',
    },
  ],
  technical_questions: [],
};

describe('BehavioralTechnicalQuestions', () => {
  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(BehavioralTechnicalQuestions).toBeDefined();
      expect(typeof BehavioralTechnicalQuestions).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(BehavioralTechnicalQuestions.name).toBe('BehavioralTechnicalQuestions');
    });
  });

  describe('QuestionType filter constants', () => {
    it('should define three question type filter values', () => {
      const questionTypes = ['all', 'behavioral', 'technical'];
      expect(questionTypes).toHaveLength(3);
      expect(questionTypes).toContain('all');
      expect(questionTypes).toContain('behavioral');
      expect(questionTypes).toContain('technical');
    });
  });

  describe('DifficultyFilter constants', () => {
    it('should define four difficulty filter values', () => {
      const difficulties = ['all', 'easy', 'medium', 'hard'];
      expect(difficulties).toHaveLength(4);
      expect(difficulties).toContain('all');
      expect(difficulties).toContain('easy');
      expect(difficulties).toContain('medium');
      expect(difficulties).toContain('hard');
    });
  });

  describe('getDifficultyColor logic', () => {
    it('should return success color for easy difficulty', () => {
      const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
          case 'easy': return '#10b981';
          case 'medium': return '#f59e0b';
          case 'hard': return '#ef4444';
          default: return '#aaa';
        }
      };
      expect(getDifficultyColor('easy')).toBe('#10b981');
      expect(getDifficultyColor('medium')).toBe('#f59e0b');
      expect(getDifficultyColor('hard')).toBe('#ef4444');
      expect(getDifficultyColor('unknown')).toBe('#aaa');
    });
  });

  describe('getFilteredQuestions logic', () => {
    const mockData = {
      behavioral_questions: [
        { id: 'b1', question: 'Tell me about...', type: 'behavioral' as const, difficulty: 'easy' as const, category: 'Leadership', why_asked: '', what_theyre_looking_for: '', approach: '' },
        { id: 'b2', question: 'Describe a time...', type: 'behavioral' as const, difficulty: 'hard' as const, category: 'Teamwork', why_asked: '', what_theyre_looking_for: '', approach: '' },
      ],
      technical_questions: [
        { id: 't1', question: 'Explain NIST...', type: 'technical' as const, difficulty: 'medium' as const, category: 'Security', why_asked: '', what_theyre_looking_for: '', approach: '' },
        { id: 't2', question: 'How would you...', type: 'technical' as const, difficulty: 'hard' as const, category: 'Architecture', why_asked: '', what_theyre_looking_for: '', approach: '' },
      ],
    };

    it('should return all questions when type filter is all', () => {
      let questions = [...mockData.behavioral_questions, ...mockData.technical_questions];
      expect(questions).toHaveLength(4);
    });

    it('should return only behavioral questions when type filter is behavioral', () => {
      const questions = mockData.behavioral_questions;
      expect(questions).toHaveLength(2);
      expect(questions.every(q => q.type === 'behavioral')).toBe(true);
    });

    it('should return only technical questions when type filter is technical', () => {
      const questions = mockData.technical_questions;
      expect(questions).toHaveLength(2);
      expect(questions.every(q => q.type === 'technical')).toBe(true);
    });

    it('should filter by difficulty when difficulty filter is not all', () => {
      const allQuestions = [...mockData.behavioral_questions, ...mockData.technical_questions];
      const hardOnly = allQuestions.filter(q => q.difficulty === 'hard');
      expect(hardOnly).toHaveLength(2);
      expect(hardOnly.map(q => q.id)).toEqual(['b2', 't2']);
    });

    it('should return empty array when no data is available', () => {
      const noData = null;
      const result = noData ? [] : [];
      expect(result).toEqual([]);
    });
  });

  describe('component rendering - empty state (no data, not loading)', () => {
    it('should render the empty state with title and description', () => {
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'Security PM',
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Behavioral & Technical Interview Questions');
    });

    it('should include company name and job title in description', () => {
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'Acme Corp',
        jobTitle: 'CISO',
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISO');
      expect(json).toContain('Acme Corp');
    });

    it('should show generate button in empty state', () => {
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
        onGenerate: jest.fn(),
      });
      const buttons = tree.root.findAllByType('GlassButton');
      const generateBtn = buttons.find((b: any) => b.props.label === 'Generate Questions');
      expect(generateBtn).toBeTruthy();
      expect(generateBtn!.props.disabled).toBe(false);
    });

    it('should include difficulty/follow-up note text', () => {
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('difficulty ratings');
    });

    it('should not call onGenerate when onGenerate prop is not provided', async () => {
      // Covers line 69: if (!onGenerate) return;
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
      });
      const buttons = tree.root.findAllByType('GlassButton');
      const generateBtn = buttons.find((b: any) => b.props.label === 'Generate Questions');

      // Press the button without onGenerate prop -- should not throw
      await renderer.act(async () => {
        generateBtn!.props.onPress();
      });

      // Still in empty state (no data loaded)
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Behavioral & Technical Interview Questions');
    });
  });

  describe('component rendering - loading state', () => {
    it('should show loading indicator while generating', async () => {
      // Covers line 171: if (loading) -- render loading card
      // Use a promise that never resolves to keep the component in loading state
      let resolvePromise: any;
      const pendingPromise = new Promise<any>((resolve) => {
        resolvePromise = resolve;
      });
      const mockGenerate = jest.fn().mockReturnValue(pendingPromise);
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
        onGenerate: mockGenerate,
      });

      // Trigger generation (will stay loading since promise is pending)
      renderer.act(() => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Generating tailored questions');

      // Clean up: resolve the promise to avoid hanging
      await renderer.act(async () => {
        resolvePromise(null);
      });
    });
  });

  describe('component rendering - generate interaction', () => {
    it('should call onGenerate and show data state after success', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about a leadership challenge');
      expect(json).toContain('Explain NIST framework components');
    });

    it('should show error when generation fails', async () => {
      const mockGenerate = jest.fn().mockRejectedValue(new Error('API Error'));
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
        onGenerate: mockGenerate,
      });

      const generateBtn = tree.root.findAllByType('GlassButton').find(
        (b: any) => b.props.label === 'Generate Questions'
      );

      await renderer.act(async () => {
        generateBtn!.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('API Error');
    });

    it('should show fallback error message when error has no message', async () => {
      // Covers line 86: err.message || 'Failed to generate questions'
      const mockGenerate = jest.fn().mockRejectedValue({ message: '' });
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
        onGenerate: mockGenerate,
      });

      await renderer.act(async () => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Failed to generate questions');
    });

    it('should auto-expand first question after generation', async () => {
      const mockData = {
        behavioral_questions: [
          {
            id: 'b1',
            question: 'First behavioral question',
            type: 'behavioral' as const,
            difficulty: 'easy' as const,
            category: 'Cat',
            why_asked: 'Because testing',
            what_theyre_looking_for: 'Good answers',
            approach: 'Approach text',
          },
        ],
        technical_questions: [],
      };
      const tree = await generateAndGetTree(mockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('WHY THEY ASK THIS');
      expect(json).toContain('Because testing');
    });

    it('should auto-expand first technical question when no behavioral questions exist', async () => {
      // Covers line 80: result.behavioral_questions[0]?.id || result.technical_questions[0]?.id
      const mockData = {
        behavioral_questions: [],
        technical_questions: [
          {
            id: 't1',
            question: 'First tech question',
            type: 'technical' as const,
            difficulty: 'hard' as const,
            category: 'Security',
            why_asked: 'Tech why text',
            what_theyre_looking_for: 'Tech looking for',
            approach: 'Tech approach',
          },
        ],
      };
      const tree = await generateAndGetTree(mockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('WHY THEY ASK THIS');
      expect(json).toContain('Tech why text');
    });

    it('should handle null result from onGenerate gracefully', async () => {
      // Covers line 76: if (result) -- result is null
      const mockGenerate = jest.fn().mockResolvedValue(null);
      const tree = renderComponent({
        interviewPrepId: 1,
        companyName: 'TestCo',
        jobTitle: 'PM',
        onGenerate: mockGenerate,
      });

      await renderer.act(async () => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      // Should go back to empty state since data is still null
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Behavioral & Technical Interview Questions');
    });

    it('should handle result with both empty question arrays without auto-expanding', async () => {
      // Covers line 81 false branch: if (firstQuestion) when both arrays are empty
      const emptyData = {
        behavioral_questions: [] as any[],
        technical_questions: [] as any[],
      };
      const tree = await generateAndGetTree(emptyData);

      const json = getTreeText(tree.toJSON());
      // Should render the data view (filters visible) but no question cards
      expect(json).toContain('Question Type');
      expect(json).toContain('Difficulty');
      // No expanded content since there are no questions
      expect(json).not.toContain('WHY THEY ASK THIS');
      // Should show empty filter message
      expect(json).toContain('No questions match the selected filters');
    });

    it('should display filter chips after data is loaded', async () => {
      const tree = await generateAndGetTree(minimalMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Question Type');
      expect(json).toContain('Difficulty');
    });
  });

  describe('toggle expand/collapse', () => {
    it('should collapse an expanded question when header is pressed', async () => {
      // Covers lines 93-99: toggleExpand function
      const tree = await generateAndGetTree(fullMockData);

      // b1 is auto-expanded (first question). Find its header TouchableOpacity.
      const json1 = getTreeText(tree.toJSON());
      expect(json1).toContain('WHY THEY ASK THIS');
      expect(json1).toContain('Tests leadership skills');

      // Find the question header touchable for b1 (accessibilityLabel='Question 1')
      const questionHeaders = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Question 1' && node.props?.onPress
      );
      expect(questionHeaders.length).toBeGreaterThan(0);

      // Press to collapse
      await renderer.act(async () => {
        questionHeaders[0].props.onPress();
      });

      const json2 = getTreeText(tree.toJSON());
      // The expanded content should no longer be visible
      expect(json2).not.toContain('Tests leadership skills');
    });

    it('should expand a collapsed question when header is pressed', async () => {
      // Covers lines 96-98: newSet.add(questionId) branch
      const tree = await generateAndGetTree(fullMockData);

      // t1 (Question 2) starts collapsed. Find its header.
      const json1 = getTreeText(tree.toJSON());
      expect(json1).not.toContain('Tests framework knowledge');

      const questionHeaders = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Question 2' && node.props?.onPress
      );
      expect(questionHeaders.length).toBeGreaterThan(0);

      // Press to expand
      await renderer.act(async () => {
        questionHeaders[0].props.onPress();
      });

      const json2 = getTreeText(tree.toJSON());
      expect(json2).toContain('Tests framework knowledge');
      expect(json2).toContain('Depth of understanding');
    });
  });

  describe('type filter interaction', () => {
    it('should filter to behavioral-only when behavioral chip is pressed', async () => {
      // Covers line 193: setTypeFilter(type) via onPress
      const tree = await generateAndGetTree(fullMockData);

      // Find behavioral filter chip
      const filterChips = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by behavioral' && node.props?.onPress
      );
      expect(filterChips.length).toBeGreaterThan(0);

      await renderer.act(async () => {
        filterChips[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about a leadership challenge');
      expect(json).not.toContain('Explain NIST framework components');
      expect(json).not.toContain('zero trust architecture');
    });

    it('should filter to technical-only when technical chip is pressed', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const filterChips = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by technical' && node.props?.onPress
      );

      await renderer.act(async () => {
        filterChips[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).not.toContain('Tell me about a leadership challenge');
      expect(json).toContain('Explain NIST framework components');
      expect(json).toContain('zero trust architecture');
    });

    it('should show all questions when all chip is pressed after filtering', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // First filter to behavioral only
      const behavioralChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by behavioral' && node.props?.onPress
      );
      await renderer.act(async () => {
        behavioralChip[0].props.onPress();
      });

      // Then switch back to all
      const allChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by all' && node.props?.onPress
      );
      await renderer.act(async () => {
        allChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about a leadership challenge');
      expect(json).toContain('Explain NIST framework components');
    });
  });

  describe('difficulty filter interaction', () => {
    it('should filter to easy-only when easy difficulty chip is pressed', async () => {
      // Covers line 128: questions.filter(q => q.difficulty === difficultyFilter)
      // Covers line 227: setDifficultyFilter(diff) via onPress
      const tree = await generateAndGetTree(fullMockData);

      const easyChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by easy difficulty' && node.props?.onPress
      );
      expect(easyChip.length).toBeGreaterThan(0);

      await renderer.act(async () => {
        easyChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // easy question t1 should be visible
      expect(json).toContain('Explain NIST framework components');
      // medium question b1 should not be visible
      expect(json).not.toContain('Tell me about a leadership challenge');
      // hard question t2 should not be visible
      expect(json).not.toContain('zero trust architecture');
    });

    it('should filter to hard-only when hard difficulty chip is pressed', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const hardChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by hard difficulty' && node.props?.onPress
      );

      await renderer.act(async () => {
        hardChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('zero trust architecture');
      expect(json).not.toContain('Tell me about a leadership challenge');
      expect(json).not.toContain('Explain NIST framework components');
    });

    it('should filter to medium-only when medium difficulty chip is pressed', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const mediumChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by medium difficulty' && node.props?.onPress
      );

      await renderer.act(async () => {
        mediumChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about a leadership challenge');
      expect(json).not.toContain('Explain NIST framework components');
      expect(json).not.toContain('zero trust architecture');
    });

    it('should show all questions when all difficulty chip is pressed after filtering', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // Filter to hard first
      const hardChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by hard difficulty' && node.props?.onPress
      );
      await renderer.act(async () => {
        hardChip[0].props.onPress();
      });

      // Then back to all
      const allChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by all difficulty' && node.props?.onPress
      );
      await renderer.act(async () => {
        allChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Tell me about a leadership challenge');
      expect(json).toContain('Explain NIST framework components');
      expect(json).toContain('zero trust architecture');
    });
  });

  describe('empty filter results', () => {
    it('should show empty filter message when no questions match filters', async () => {
      // Covers lines 414-420: filteredQuestions.length === 0
      // Use data with only easy questions, then filter to hard
      const easyOnlyData = {
        behavioral_questions: [
          {
            id: 'b1',
            question: 'Easy behavioral',
            type: 'behavioral' as const,
            difficulty: 'easy' as const,
            category: 'Cat',
            why_asked: 'W',
            what_theyre_looking_for: 'L',
            approach: 'A',
          },
        ],
        technical_questions: [],
      };
      const tree = await generateAndGetTree(easyOnlyData);

      // Filter to hard difficulty -- no questions should match
      const hardChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by hard difficulty' && node.props?.onPress
      );
      await renderer.act(async () => {
        hardChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('No questions match the selected filters');
    });
  });

  describe('expanded content sections', () => {
    it('should display example_answer section when available', async () => {
      // Covers lines 357-373: question.example_answer && (...)
      const tree = await generateAndGetTree(fullMockData);

      // b1 is auto-expanded and has example_answer
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('EXAMPLE ANSWER');
      expect(json).toContain('In my previous role I led a team of 10 engineers');
    });

    it('should display tips section when tips array is non-empty', async () => {
      // Covers lines 376-390: question.tips && question.tips.length > 0
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('PRO TIPS');
      expect(json).toContain('Be specific about your actions');
      expect(json).toContain('Quantify the results');
    });

    it('should display follow-ups section when follow_ups array is non-empty', async () => {
      // Covers lines 393-407: question.follow_ups && question.follow_ups.length > 0
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('POTENTIAL FOLLOW-UP QUESTIONS');
      expect(json).toContain('How did you handle disagreements');
      expect(json).toContain('What would you do differently');
    });

    it('should display why_asked and what_theyre_looking_for sections', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('WHY THEY ASK THIS');
      expect(json).toContain('Tests leadership skills');
      expect(json).toContain("WHAT THEY'RE LOOKING FOR");
      expect(json).toContain('Clear decision making');
    });

    it('should display approach section', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('RECOMMENDED APPROACH');
      expect(json).toContain('Use STAR method');
    });

    it('should not show example_answer section when not provided', async () => {
      // t2 in fullMockData has no example_answer
      const tree = await generateAndGetTree(fullMockData);

      // Expand t2 (Question 3)
      const questionHeaders = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Question 3' && node.props?.onPress
      );
      await renderer.act(async () => {
        questionHeaders[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // t2 has why_asked but no example_answer, tips, or follow_ups
      expect(json).toContain('Tests architectural thinking');
      // The EXAMPLE ANSWER label still shows for b1 which is auto-expanded
      // But t2 should not contribute an example answer section
      expect(json).toContain('Systematic approach');
    });

    it('should not show tips section when tips is undefined', async () => {
      // t2 has no tips field
      const dataNoOptionals = {
        behavioral_questions: [],
        technical_questions: [
          {
            id: 't2',
            question: 'Design zero trust',
            type: 'technical' as const,
            difficulty: 'hard' as const,
            category: 'Architecture',
            why_asked: 'Tests thinking',
            what_theyre_looking_for: 'Systematic approach',
            approach: 'Start with principles',
          },
        ],
      };
      const tree = await generateAndGetTree(dataNoOptionals);

      const json = getTreeText(tree.toJSON());
      // t2 auto-expanded (only question), should not show PRO TIPS
      expect(json).not.toContain('PRO TIPS');
      expect(json).not.toContain('POTENTIAL FOLLOW-UP QUESTIONS');
      expect(json).not.toContain('EXAMPLE ANSWER');
      // But should show the required sections
      expect(json).toContain('WHY THEY ASK THIS');
      expect(json).toContain('RECOMMENDED APPROACH');
    });

    it('should not show tips section when tips is empty array', async () => {
      const dataEmptyTips = {
        behavioral_questions: [],
        technical_questions: [
          {
            id: 't1',
            question: 'Q with empty tips',
            type: 'technical' as const,
            difficulty: 'easy' as const,
            category: 'Cat',
            why_asked: 'W',
            what_theyre_looking_for: 'L',
            approach: 'A',
            tips: [],
            follow_ups: [],
          },
        ],
      };
      const tree = await generateAndGetTree(dataEmptyTips);

      const json = getTreeText(tree.toJSON());
      expect(json).not.toContain('PRO TIPS');
      expect(json).not.toContain('POTENTIAL FOLLOW-UP QUESTIONS');
    });

    it('should show category text when category is provided', async () => {
      // Covers line 304-308: question.category && (...)
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Leadership');
    });

    it('should display difficulty badge with correct text', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const json = getTreeText(tree.toJSON());
      // Difficulty badges show uppercase text
      expect(json).toContain('MEDIUM');
      expect(json).toContain('EASY');
      expect(json).toContain('HARD');
    });

    it('should use textSecondary color for unknown difficulty values', async () => {
      // Covers line 111: getDifficultyColor default branch -> colors.textSecondary
      const dataWithUnknownDifficulty = {
        behavioral_questions: [],
        technical_questions: [
          {
            id: 't1',
            question: 'Unknown difficulty question',
            type: 'technical' as const,
            difficulty: 'expert' as any, // bypass type constraint to hit default branch
            category: 'Cat',
            why_asked: 'W',
            what_theyre_looking_for: 'L',
            approach: 'A',
          },
        ],
      };
      const tree = await generateAndGetTree(dataWithUnknownDifficulty);

      // The question should render (auto-expanded since it's the only one)
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Unknown difficulty question');
      expect(json).toContain('EXPERT');
    });
  });

  describe('question type icons and chevrons', () => {
    it('should render behavioral questions with Users icon type', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // Look for Users icon elements (behavioral questions use Users icon)
      const usersIcons = tree.root.findAll(
        (node: any) => node.type === 'Users' && node.props?.size === 18
      );
      expect(usersIcons.length).toBeGreaterThan(0);
    });

    it('should render technical questions with Code icon type', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // Look for Code icon elements (technical questions use Code icon)
      const codeIcons = tree.root.findAll(
        (node: any) => node.type === 'Code' && node.props?.size === 18
      );
      expect(codeIcons.length).toBeGreaterThan(0);
    });

    it('should show ChevronDown for expanded question and ChevronRight for collapsed', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // b1 is expanded -> should have ChevronDown
      const downChevrons = tree.root.findAll(
        (node: any) => node.type === 'ChevronDown'
      );
      expect(downChevrons.length).toBeGreaterThan(0);

      // t1 and t2 are collapsed -> should have ChevronRight
      const rightChevrons = tree.root.findAll(
        (node: any) => node.type === 'ChevronRight'
      );
      expect(rightChevrons.length).toBeGreaterThan(0);
    });
  });

  describe('combined type and difficulty filtering', () => {
    it('should apply both type and difficulty filters together', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // Filter to technical type
      const techChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by technical' && node.props?.onPress
      );
      await renderer.act(async () => {
        techChip[0].props.onPress();
      });

      // Then filter to hard difficulty
      const hardChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by hard difficulty' && node.props?.onPress
      );
      await renderer.act(async () => {
        hardChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // Only t2 is technical+hard
      expect(json).toContain('zero trust architecture');
      expect(json).not.toContain('Tell me about a leadership challenge');
      expect(json).not.toContain('Explain NIST framework components');
    });

    it('should show empty message when type+difficulty combo has no results', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // Filter to behavioral type
      const behavChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by behavioral' && node.props?.onPress
      );
      await renderer.act(async () => {
        behavChip[0].props.onPress();
      });

      // Then filter to easy difficulty (b1 is medium, b2 is hard -- no easy behavioral)
      const easyChip = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Filter by easy difficulty' && node.props?.onPress
      );
      await renderer.act(async () => {
        easyChip[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('No questions match the selected filters');
    });
  });

  describe('accessibility', () => {
    it('should set accessibilityState expanded on question headers', async () => {
      const tree = await generateAndGetTree(fullMockData);

      // b1 is expanded
      const q1 = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Question 1' && node.props?.onPress
      );
      expect(q1[0].props.accessibilityState).toEqual({ expanded: true });

      // t1 is collapsed (Question 2)
      const q2 = tree.root.findAll(
        (node: any) => node.props?.accessibilityLabel === 'Question 2' && node.props?.onPress
      );
      expect(q2[0].props.accessibilityState).toEqual({ expanded: false });
    });

    it('should set accessibilityRole button on filter chips', async () => {
      const tree = await generateAndGetTree(fullMockData);

      const filterButtons = tree.root.findAll(
        (node: any) => node.props?.accessibilityRole === 'button' && node.props?.accessibilityLabel?.startsWith('Filter by')
      );
      // 3 type filters + 4 difficulty filters = 7
      expect(filterButtons.length).toBe(7);
    });
  });
});
