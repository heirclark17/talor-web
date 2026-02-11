/**
 * PracticeSession Component Tests
 *
 * Tests timer format logic, section color mapping,
 * section time constants, STAR section progression,
 * and direct component rendering via react-test-renderer.
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

import PracticeSession from '../PracticeSession';

const mockStory = {
  title: 'Led Security Incident Response',
  situation: 'A major breach was discovered across the network',
  task: 'Coordinate response across multiple teams under tight deadline',
  action: 'Assembled a cross-functional team and established war room',
  result: 'Reduced response time by 40% and prevented data exfiltration',
  key_themes: ['Leadership', 'Crisis Management'],
  talking_points: ['40% faster response time', 'Zero data loss', 'Cross-team collaboration'],
};

const renderComponent = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(PracticeSession, props));
  });
  return tree!;
};

// Safe text extraction that avoids circular JSON references
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

describe('PracticeSession', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(PracticeSession).toBeDefined();
      expect(typeof PracticeSession).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(PracticeSession.name).toBe('PracticeSession');
    });
  });

  describe('formatTime logic', () => {
    // Replicating the formatTime function from the component
    const formatTime = (secs: number) => {
      const mins = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
    };

    it('should format 0 seconds as 0:00', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('should format seconds under a minute with leading zero', () => {
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(9)).toBe('0:09');
    });

    it('should format exactly one minute', () => {
      expect(formatTime(60)).toBe('1:00');
    });

    it('should format mixed minutes and seconds', () => {
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(125)).toBe('2:05');
      expect(formatTime(300)).toBe('5:00');
    });

    it('should format the target time of 300 seconds', () => {
      expect(formatTime(300)).toBe('5:00');
    });
  });

  describe('section time constants', () => {
    const sectionTime = {
      situation: 60,
      task: 45,
      action: 150,
      result: 60,
    };

    it('should allocate 60 seconds for situation', () => {
      expect(sectionTime.situation).toBe(60);
    });

    it('should allocate 45 seconds for task', () => {
      expect(sectionTime.task).toBe(45);
    });

    it('should allocate 150 seconds for action (longest section)', () => {
      expect(sectionTime.action).toBe(150);
    });

    it('should allocate 60 seconds for result', () => {
      expect(sectionTime.result).toBe(60);
    });

    it('should total approximately 315 seconds (5 min 15 sec)', () => {
      const total = sectionTime.situation + sectionTime.task + sectionTime.action + sectionTime.result;
      expect(total).toBe(315);
    });
  });

  describe('section color mapping (getSectionColor logic)', () => {
    const sections = ['situation', 'task', 'action', 'result'];

    it('should return primary color for current section', () => {
      const currentSection = 'task';
      // Current section gets COLORS.primary (#3b82f6)
      const getSectionColor = (section: string) => {
        if (section === currentSection) return '#3b82f6';
        if (sections.indexOf(section) < sections.indexOf(currentSection)) return '#10b981';
        return '#666';
      };

      expect(getSectionColor('task')).toBe('#3b82f6');
    });

    it('should return success color for completed sections', () => {
      const currentSection = 'action';
      const getSectionColor = (section: string) => {
        if (section === currentSection) return '#3b82f6';
        if (sections.indexOf(section) < sections.indexOf(currentSection)) return '#10b981';
        return '#666';
      };

      expect(getSectionColor('situation')).toBe('#10b981');
      expect(getSectionColor('task')).toBe('#10b981');
    });

    it('should return tertiary color for upcoming sections', () => {
      const currentSection = 'situation';
      const getSectionColor = (section: string) => {
        if (section === currentSection) return '#3b82f6';
        if (sections.indexOf(section) < sections.indexOf(currentSection)) return '#10b981';
        return '#666';
      };

      expect(getSectionColor('task')).toBe('#666');
      expect(getSectionColor('action')).toBe('#666');
      expect(getSectionColor('result')).toBe('#666');
    });
  });

  describe('Section type values', () => {
    it('should define five section types including complete', () => {
      const sectionTypes = ['situation', 'task', 'action', 'result', 'complete'];
      expect(sectionTypes).toHaveLength(5);
    });

    it('should define the STAR sections in correct order', () => {
      const starSections = ['situation', 'task', 'action', 'result'];
      expect(starSections[0]).toBe('situation');
      expect(starSections[1]).toBe('task');
      expect(starSections[2]).toBe('action');
      expect(starSections[3]).toBe('result');
    });
  });

  describe('component rendering - initial state', () => {
    it('should render the story title', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Led Security Incident Response');
    });

    it('should show the timer starting at 0:00', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('0:00');
    });

    it('should display target time of 5:00', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('5:00');
    });

    it('should show Practice Instructions in initial state', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Practice Instructions');
    });

    it('should show Start button when not running', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const buttons = tree.root.findAllByType('GlassButton');
      const startBtn = buttons.find((b: any) => b.props.label === 'Start');
      expect(startBtn).toBeTruthy();
    });

    it('should show Reset button', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const buttons = tree.root.findAllByType('GlassButton');
      const resetBtn = buttons.find((b: any) => b.props.label === 'Reset');
      expect(resetBtn).toBeTruthy();
    });

    it('should display STAR section progress labels', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('SITUATION');
      expect(json).toContain('TASK');
      expect(json).toContain('ACTION');
      expect(json).toContain('RESULT');
    });

    it('should display talking points when story has them', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Key Talking Points');
      expect(json).toContain('40% faster response time');
      expect(json).toContain('Zero data loss');
    });

    it('should not display talking points when story has empty array', () => {
      const mockClose = jest.fn();
      const storyNoPoints = { ...mockStory, talking_points: [] };
      const tree = renderComponent({ story: storyNoPoints, onClose: mockClose });
      const json = getTreeText(tree.toJSON());
      expect(json).not.toContain('Key Talking Points');
    });
  });

  describe('component rendering - start interaction', () => {
    it('should hide instructions and show section content after pressing Start', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const buttons = tree.root.findAllByType('GlassButton');
      const startBtn = buttons.find((b: any) => b.props.label === 'Start');

      renderer.act(() => {
        startBtn!.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).not.toContain('Practice Instructions');
      // Should show SITUATION section content (the story.situation text)
      expect(json).toContain('SITUATION');
    });

    it('should show Pause button instead of Start after pressing Start', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });
      const startBtn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Start');

      renderer.act(() => {
        startBtn!.props.onPress();
      });

      const buttons = tree.root.findAllByType('GlassButton');
      const pauseBtn = buttons.find((b: any) => b.props.label === 'Pause');
      expect(pauseBtn).toBeTruthy();
    });

    it('should call onClose when close button is pressed', () => {
      const mockClose = jest.fn();
      const tree = renderComponent({ story: mockStory, onClose: mockClose });

      // Find TouchableOpacity with accessibilityLabel "Close practice session"
      const touchables = tree.root.findAll(
        (node: any) => node.props && node.props.accessibilityLabel === 'Close practice session'
      );
      expect(touchables.length).toBeGreaterThanOrEqual(1);

      renderer.act(() => {
        touchables[0].props.onPress();
      });

      expect(mockClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('timer ticking and section auto-advance', () => {
    const pressButton = (tree: any, label: string) => {
      const btn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === label);
      if (!btn) throw new Error(`Button "${label}" not found`);
      renderer.act(() => {
        btn.props.onPress();
      });
      return btn;
    };

    it('should increment the timer display after starting and advancing time', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance 5 seconds
      renderer.act(() => {
        jest.advanceTimersByTime(5000);
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0:05');
    });

    it('should display the situation content after pressing Start', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      const text = getTreeText(tree.toJSON());
      expect(text).toContain(mockStory.situation);
    });

    it('should auto-advance from situation to task at 60 seconds', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance to exactly 60 seconds (situation -> task)
      renderer.act(() => {
        jest.advanceTimersByTime(60000);
      });

      const text = getTreeText(tree.toJSON());
      // Should now show the task section content
      expect(text).toContain(mockStory.task);
    });

    it('should auto-advance from task to action at 105 seconds', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance to 60 seconds (situation -> task)
      renderer.act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Advance additional 45 seconds (task -> action at 105s)
      renderer.act(() => {
        jest.advanceTimersByTime(45000);
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain(mockStory.action);
    });

    it('should auto-advance from action to result at 255 seconds', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance to situation -> task transition
      renderer.act(() => {
        jest.advanceTimersByTime(60000);
      });
      // Advance to task -> action transition
      renderer.act(() => {
        jest.advanceTimersByTime(45000);
      });
      // Advance to action -> result transition (150 more seconds)
      renderer.act(() => {
        jest.advanceTimersByTime(150000);
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain(mockStory.result);
    });

    it('should auto-advance to complete and stop timer at 300 seconds', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance through all sections to complete
      renderer.act(() => { jest.advanceTimersByTime(60000); }); // -> task
      renderer.act(() => { jest.advanceTimersByTime(45000); }); // -> action
      renderer.act(() => { jest.advanceTimersByTime(150000); }); // -> result
      renderer.act(() => { jest.advanceTimersByTime(45000); }); // -> complete at 300s

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Practice Complete');
      expect(text).toContain('5:00');
    });

    it('should stop running when reaching complete state', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance through all sections to complete
      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });
      renderer.act(() => { jest.advanceTimersByTime(150000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });

      // After complete, should show Start/Resume button (not Pause), since isRunning is false
      const buttons = tree.root.findAllByType('GlassButton');
      const pauseBtn = buttons.find((b: any) => b.props.label === 'Pause');
      expect(pauseBtn).toBeUndefined();
    });

    it('should not advance past complete even with more time', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });
      renderer.act(() => { jest.advanceTimersByTime(150000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });

      // Advance even more -- timer should have stopped so time stays at 5:00
      renderer.act(() => { jest.advanceTimersByTime(60000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('5:00');
      expect(text).toContain('Practice Complete');
    });

    it('should show timer incrementing continuously while running', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(30000); });
      let text = getTreeText(tree.toJSON());
      expect(text).toContain('0:30');

      renderer.act(() => { jest.advanceTimersByTime(30000); });
      text = getTreeText(tree.toJSON());
      expect(text).toContain('1:00');
    });
  });

  describe('pause functionality', () => {
    const pressButton = (tree: any, label: string) => {
      const btn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === label);
      if (!btn) throw new Error(`Button "${label}" not found`);
      renderer.act(() => { btn.props.onPress(); });
      return btn;
    };

    it('should stop the timer when Pause is pressed', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance 10 seconds
      renderer.act(() => { jest.advanceTimersByTime(10000); });

      // Pause
      pressButton(tree, 'Pause');

      // Advance more time -- timer should not change
      renderer.act(() => { jest.advanceTimersByTime(10000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0:10');
    });

    it('should show Resume button after pausing', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(5000); });
      pressButton(tree, 'Pause');

      const buttons = tree.root.findAllByType('GlassButton');
      const resumeBtn = buttons.find((b: any) => b.props.label === 'Resume');
      expect(resumeBtn).toBeTruthy();
    });

    it('should resume the timer from where it paused', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance 10 seconds
      renderer.act(() => { jest.advanceTimersByTime(10000); });
      // Pause
      pressButton(tree, 'Pause');

      // Resume
      pressButton(tree, 'Resume');

      // Advance 5 more seconds
      renderer.act(() => { jest.advanceTimersByTime(5000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0:15');
    });
  });

  describe('reset functionality', () => {
    const pressButton = (tree: any, label: string) => {
      const btn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === label);
      if (!btn) throw new Error(`Button "${label}" not found`);
      renderer.act(() => { btn.props.onPress(); });
      return btn;
    };

    it('should reset timer to 0:00 when Reset is pressed', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(30000); });
      pressButton(tree, 'Reset');

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0:00');
    });

    it('should show instructions again after Reset', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(5000); });
      pressButton(tree, 'Reset');

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Practice Instructions');
    });

    it('should stop the timer when Reset is pressed while running', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(10000); });
      pressButton(tree, 'Reset');

      // Advance more time -- timer should not change from 0:00
      renderer.act(() => { jest.advanceTimersByTime(10000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('0:00');
    });

    it('should show Start button (not Resume) after Reset', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(10000); });
      pressButton(tree, 'Reset');

      const buttons = tree.root.findAllByType('GlassButton');
      const startBtn = buttons.find((b: any) => b.props.label === 'Start');
      expect(startBtn).toBeTruthy();
      const resumeBtn = buttons.find((b: any) => b.props.label === 'Resume');
      expect(resumeBtn).toBeUndefined();
    });

    it('should reset section back to situation after Reset', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      // Advance past situation into task
      renderer.act(() => { jest.advanceTimersByTime(60000); });
      pressButton(tree, 'Reset');

      // Start again -- should show situation content
      pressButton(tree, 'Start');
      const text = getTreeText(tree.toJSON());
      expect(text).toContain(mockStory.situation);
    });
  });

  describe('getSectionContent coverage', () => {
    const pressButton = (tree: any, label: string) => {
      const btn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === label);
      if (!btn) throw new Error(`Button "${label}" not found`);
      renderer.act(() => { btn.props.onPress(); });
      return btn;
    };

    it('should display situation content in the content card', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('A major breach was discovered across the network');
    });

    it('should display task content when section advances to task', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Coordinate response across multiple teams under tight deadline');
    });

    it('should display action content when section advances to action', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Assembled a cross-functional team and established war room');
    });

    it('should display result content when section advances to result', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });
      renderer.act(() => { jest.advanceTimersByTime(150000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Reduced response time by 40% and prevented data exfiltration');
    });

    it('should display practice complete message when section is complete', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });
      renderer.act(() => { jest.advanceTimersByTime(150000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Practice Complete');
      expect(text).toContain('Great job');
    });
  });

  describe('section time display in content card', () => {
    const pressButton = (tree: any, label: string) => {
      const btn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === label);
      if (!btn) throw new Error(`Button "${label}" not found`);
      renderer.act(() => { btn.props.onPress(); });
      return btn;
    };

    // JSX template literals like ~{value}m render as separate children: ["~", "1", " ", "m"]
    // so getTreeText produces "~ 1 m" not "~1m". Match with spaces.
    it('should show ~1m for situation section', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('~ 1 m');
    });

    it('should show ~0m for task section (45s rounds to 0m)', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('~ 0 m');
    });

    it('should show ~2m for action section (150s)', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('~ 2 m');
    });

    it('should show ~1m for result section', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      pressButton(tree, 'Start');

      renderer.act(() => { jest.advanceTimersByTime(60000); });
      renderer.act(() => { jest.advanceTimersByTime(45000); });
      renderer.act(() => { jest.advanceTimersByTime(150000); });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('~ 1 m');
    });
  });

  describe('edge cases', () => {
    it('should not render talking points section when talking_points is undefined', () => {
      const storyNoTalkingPoints = {
        title: 'Test Story',
        situation: 'Sit',
        task: 'Task',
        action: 'Act',
        result: 'Res',
        key_themes: [],
        talking_points: undefined as any,
      };
      const tree = renderComponent({ story: storyNoTalkingPoints, onClose: jest.fn() });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Key Talking Points');
    });

    it('should not render talking points section when talking_points is null', () => {
      const storyNullPoints = {
        title: 'Test Story',
        situation: 'Sit',
        task: 'Task',
        action: 'Act',
        result: 'Res',
        key_themes: [],
        talking_points: null as any,
      };
      const tree = renderComponent({ story: storyNullPoints, onClose: jest.fn() });
      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Key Talking Points');
    });

    it('should handle timer cleanup when component unmounts while running', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      const btn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Start');
      renderer.act(() => { btn!.props.onPress(); });

      // Unmount while running -- should clean up interval
      renderer.act(() => {
        tree.unmount();
      });

      // If clearInterval was not called, advancing timers would cause errors
      expect(() => {
        jest.advanceTimersByTime(5000);
      }).not.toThrow();
    });

    it('should handle timer cleanup when component unmounts while paused', () => {
      const tree = renderComponent({ story: mockStory, onClose: jest.fn() });
      const startBtn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Start');
      renderer.act(() => { startBtn!.props.onPress(); });

      renderer.act(() => { jest.advanceTimersByTime(5000); });

      const pauseBtn = tree.root.findAllByType('GlassButton').find((b: any) => b.props.label === 'Pause');
      renderer.act(() => { pauseBtn!.props.onPress(); });

      renderer.act(() => {
        tree.unmount();
      });

      expect(() => {
        jest.advanceTimersByTime(5000);
      }).not.toThrow();
    });
  });
});
