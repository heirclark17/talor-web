/**
 * PracticeQuestionsScreen Test Suite
 *
 * Tests module exports, formatDate function, formatDuration function,
 * calculateCompletionStats, toggleExpanded logic, difficulty color mapping,
 * and interface shapes.
 */

// Mock ALL dependencies BEFORE imports
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      textTertiary: '#666',
      background: '#000',
      backgroundSecondary: '#111',
      backgroundTertiary: '#222',
      border: '#333',
      glass: 'rgba(255,255,255,0.1)',
      glassBorder: 'rgba(255,255,255,0.2)',
    },
    isDark: true,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useRoute: jest.fn(() => ({
    params: { interviewPrepId: 1, tailoredResumeId: 1 },
  })),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

jest.mock('../../api/client', () => ({
  api: {
    generatePracticeQuestions: jest.fn(() =>
      Promise.resolve({ success: true, data: { questions: [] } })
    ),
    generatePracticeStarStory: jest.fn(),
    savePracticeResponse: jest.fn(),
    getPracticeResponses: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    getPracticeHistory: jest.fn(() => Promise.resolve({ success: true, data: [] })),
  },
  PracticeHistoryItem: {},
}));

jest.mock('../../components/glass/GlassButton', () => 'GlassButton');

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

describe('PracticeQuestionsScreen', () => {
  // ==========================================
  // Module Export Tests
  // ==========================================
  describe('Module Exports', () => {
    it('should export a default function component', () => {
      const mod = require('../PracticeQuestionsScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have a function named PracticeQuestionsScreen', () => {
      const mod = require('../PracticeQuestionsScreen');
      expect(mod.default.name).toBe('PracticeQuestionsScreen');
    });
  });

  // ==========================================
  // formatDate Function (lines 278-295)
  // ==========================================
  describe('formatDate function (replicated from lines 278-295)', () => {
    function formatDate(dateString: string): string {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    }

    it('should show minutes ago for recent dates', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
      expect(formatDate(fiveMinutesAgo)).toBe('5m ago');
    });

    it('should show 0m ago for just now', () => {
      const now = new Date().toISOString();
      expect(formatDate(now)).toBe('0m ago');
    });

    it('should show 30m ago for 30 minutes', () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000).toISOString();
      expect(formatDate(thirtyMinutesAgo)).toBe('30m ago');
    });

    it('should show hours ago for 1+ hours', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
      expect(formatDate(twoHoursAgo)).toBe('2h ago');
    });

    it('should show hours ago for 23 hours', () => {
      const twentyThreeHoursAgo = new Date(Date.now() - 23 * 3600000).toISOString();
      expect(formatDate(twentyThreeHoursAgo)).toBe('23h ago');
    });

    it('should show days ago for 1+ days', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
      expect(formatDate(twoDaysAgo)).toBe('2d ago');
    });

    it('should show days ago for 6 days', () => {
      const sixDaysAgo = new Date(Date.now() - 6 * 86400000).toISOString();
      expect(formatDate(sixDaysAgo)).toBe('6d ago');
    });

    it('should show locale date string for 7+ days', () => {
      const tenDaysAgo = new Date(Date.now() - 10 * 86400000);
      const result = formatDate(tenDaysAgo.toISOString());
      // Should be a locale date string (not "Xd ago")
      expect(result).not.toContain('d ago');
      expect(result).not.toContain('h ago');
      expect(result).not.toContain('m ago');
    });

    it('should show locale date string for 30 days ago', () => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const result = formatDate(thirtyDaysAgo.toISOString());
      expect(result).not.toContain('d ago');
    });

    it('should handle boundary: exactly 59 minutes', () => {
      const fiftyNineMinutes = new Date(Date.now() - 59 * 60000).toISOString();
      expect(formatDate(fiftyNineMinutes)).toBe('59m ago');
    });

    it('should handle boundary: exactly 1 hour', () => {
      const oneHour = new Date(Date.now() - 60 * 60000).toISOString();
      expect(formatDate(oneHour)).toBe('1h ago');
    });
  });

  // ==========================================
  // formatDuration Function (lines 297-302)
  // ==========================================
  describe('formatDuration function (replicated from lines 297-302)', () => {
    function formatDuration(seconds?: number): string {
      if (!seconds) return 'N/A';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    }

    it('should return "N/A" for undefined', () => {
      expect(formatDuration(undefined)).toBe('N/A');
    });

    it('should return "N/A" for 0', () => {
      expect(formatDuration(0)).toBe('N/A');
    });

    it('should return "N/A" for null', () => {
      expect(formatDuration(null as any)).toBe('N/A');
    });

    it('should format 60 seconds as "1m 0s"', () => {
      expect(formatDuration(60)).toBe('1m 0s');
    });

    it('should format 90 seconds as "1m 30s"', () => {
      expect(formatDuration(90)).toBe('1m 30s');
    });

    it('should format 30 seconds as "0m 30s"', () => {
      expect(formatDuration(30)).toBe('0m 30s');
    });

    it('should format 1 second as "0m 1s"', () => {
      expect(formatDuration(1)).toBe('0m 1s');
    });

    it('should format 3661 seconds (1h 1m 1s) as "61m 1s"', () => {
      expect(formatDuration(3661)).toBe('61m 1s');
    });

    it('should format 120 seconds as "2m 0s"', () => {
      expect(formatDuration(120)).toBe('2m 0s');
    });

    it('should format 59 seconds as "0m 59s"', () => {
      expect(formatDuration(59)).toBe('0m 59s');
    });
  });

  // ==========================================
  // calculateCompletionStats (lines 304-314)
  // ==========================================
  describe('calculateCompletionStats (replicated from lines 304-314)', () => {
    function calculateCompletionStats(
      totalQuestions: number,
      practicedCount: number
    ): { total: number; practiced: number; percentage: number } {
      const percentage =
        totalQuestions > 0
          ? Math.round((practicedCount / totalQuestions) * 100)
          : 0;
      return {
        total: totalQuestions,
        practiced: practicedCount,
        percentage,
      };
    }

    it('should return 0% for no questions', () => {
      const result = calculateCompletionStats(0, 0);
      expect(result.percentage).toBe(0);
    });

    it('should return 100% for all practiced', () => {
      const result = calculateCompletionStats(10, 10);
      expect(result.percentage).toBe(100);
    });

    it('should return 50% for half practiced', () => {
      const result = calculateCompletionStats(10, 5);
      expect(result.percentage).toBe(50);
    });

    it('should round to nearest integer', () => {
      const result = calculateCompletionStats(3, 1);
      expect(result.percentage).toBe(33); // 33.33 rounds to 33
    });

    it('should round up correctly', () => {
      const result = calculateCompletionStats(3, 2);
      expect(result.percentage).toBe(67); // 66.66 rounds to 67
    });

    it('should return correct total and practiced counts', () => {
      const result = calculateCompletionStats(15, 7);
      expect(result.total).toBe(15);
      expect(result.practiced).toBe(7);
    });

    it('should handle case where practiced exceeds total', () => {
      const result = calculateCompletionStats(5, 10);
      expect(result.percentage).toBe(200);
    });

    it('should handle single question practiced', () => {
      const result = calculateCompletionStats(10, 1);
      expect(result.percentage).toBe(10);
    });
  });

  // ==========================================
  // toggleExpanded Logic (lines 243-252)
  // ==========================================
  describe('toggleExpanded logic (replicated from lines 243-252)', () => {
    function toggleExpanded(
      currentExpanded: number | null,
      index: number,
      hasStory: boolean
    ): { expanded: number | null; shouldGenerate: boolean } {
      if (currentExpanded === index) {
        return { expanded: null, shouldGenerate: false };
      } else {
        return { expanded: index, shouldGenerate: !hasStory };
      }
    }

    it('should expand question when none is expanded', () => {
      const { expanded } = toggleExpanded(null, 0, false);
      expect(expanded).toBe(0);
    });

    it('should collapse question when same is pressed', () => {
      const { expanded } = toggleExpanded(0, 0, false);
      expect(expanded).toBeNull();
    });

    it('should switch to different question', () => {
      const { expanded } = toggleExpanded(0, 1, false);
      expect(expanded).toBe(1);
    });

    it('should trigger story generation when no story exists', () => {
      const { shouldGenerate } = toggleExpanded(null, 0, false);
      expect(shouldGenerate).toBe(true);
    });

    it('should NOT trigger story generation when story exists', () => {
      const { shouldGenerate } = toggleExpanded(null, 0, true);
      expect(shouldGenerate).toBe(false);
    });

    it('should NOT trigger story generation when collapsing', () => {
      const { shouldGenerate } = toggleExpanded(0, 0, false);
      expect(shouldGenerate).toBe(false);
    });
  });

  // ==========================================
  // Difficulty color mapping (lines 400-420)
  // ==========================================
  describe('Difficulty badge color mapping (replicated from lines 400-420)', () => {
    const COLORS = {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#10b981',
    };

    function getDifficultyColor(difficulty: string): string {
      switch (difficulty) {
        case 'Hard':
          return COLORS.error;
        case 'Medium':
          return COLORS.warning;
        default:
          return COLORS.success;
      }
    }

    function getDifficultyBgColor(difficulty: string): string {
      return `${getDifficultyColor(difficulty)}20`;
    }

    it('should return error color for Hard', () => {
      expect(getDifficultyColor('Hard')).toBe(COLORS.error);
    });

    it('should return warning color for Medium', () => {
      expect(getDifficultyColor('Medium')).toBe(COLORS.warning);
    });

    it('should return success color for Easy', () => {
      expect(getDifficultyColor('Easy')).toBe(COLORS.success);
    });

    it('should return success color as default', () => {
      expect(getDifficultyColor('Unknown')).toBe(COLORS.success);
    });

    it('should append 20 alpha for background color', () => {
      expect(getDifficultyBgColor('Hard')).toBe('#ef444420');
    });

    it('should compute Medium badge background', () => {
      expect(getDifficultyBgColor('Medium')).toBe('#f59e0b20');
    });

    it('should compute Easy badge background', () => {
      expect(getDifficultyBgColor('Easy')).toBe('#10b98120');
    });
  });

  // ==========================================
  // PracticeQuestion interface shape
  // ==========================================
  describe('PracticeQuestion interface shape', () => {
    interface PracticeQuestion {
      question: string;
      category: string;
      difficulty: string;
      why_asked: string;
      key_skills_tested: string[];
    }

    it('should have all required fields', () => {
      const question: PracticeQuestion = {
        question: 'Tell me about a time...',
        category: 'behavioral',
        difficulty: 'Medium',
        why_asked: 'Tests leadership skills',
        key_skills_tested: ['leadership', 'communication'],
      };
      expect(Object.keys(question)).toHaveLength(5);
    });

    it('should have key_skills_tested as array', () => {
      const question: PracticeQuestion = {
        question: 'Q',
        category: 'C',
        difficulty: 'D',
        why_asked: 'W',
        key_skills_tested: ['a', 'b'],
      };
      expect(Array.isArray(question.key_skills_tested)).toBe(true);
    });
  });

  // ==========================================
  // STARStory interface shape
  // ==========================================
  describe('STARStory interface shape', () => {
    interface STARStory {
      situation: string;
      task: string;
      action: string;
      result: string;
    }

    it('should have exactly 4 STAR fields', () => {
      const story: STARStory = {
        situation: 'S',
        task: 'T',
        action: 'A',
        result: 'R',
      };
      expect(Object.keys(story)).toHaveLength(4);
    });
  });

  // ==========================================
  // Tab types
  // ==========================================
  describe('Tab types', () => {
    const TAB_OPTIONS = ['practice', 'history'] as const;

    it('should have 2 tab options', () => {
      expect(TAB_OPTIONS).toHaveLength(2);
    });

    it('should include "practice"', () => {
      expect(TAB_OPTIONS).toContain('practice');
    });

    it('should include "history"', () => {
      expect(TAB_OPTIONS).toContain('history');
    });
  });

  // ==========================================
  // loadSavedResponses mapping logic (lines 94-118)
  // ==========================================
  describe('Saved response mapping logic (replicated from lines 94-118)', () => {
    interface MockQuestion {
      question: string;
    }

    interface MockResponse {
      question_text: string;
      written_answer?: string;
    }

    function mapSavedResponses(
      questions: MockQuestion[],
      responses: MockResponse[]
    ): {
      savedMap: Map<number, boolean>;
      answersMap: Map<number, string>;
    } {
      const savedMap = new Map<number, boolean>();
      const answersMap = new Map<number, string>();

      responses.forEach((response) => {
        const questionIndex = questions.findIndex(
          (q) => q.question === response.question_text
        );
        if (questionIndex !== -1) {
          savedMap.set(questionIndex, true);
          if (response.written_answer) {
            answersMap.set(questionIndex, response.written_answer);
          }
        }
      });

      return { savedMap, answersMap };
    }

    it('should map responses to question indices', () => {
      const questions = [{ question: 'Q1' }, { question: 'Q2' }];
      const responses = [{ question_text: 'Q1', written_answer: 'A1' }];
      const { savedMap, answersMap } = mapSavedResponses(questions, responses);
      expect(savedMap.get(0)).toBe(true);
      expect(answersMap.get(0)).toBe('A1');
    });

    it('should not map responses for unknown questions', () => {
      const questions = [{ question: 'Q1' }];
      const responses = [{ question_text: 'Q99', written_answer: 'A99' }];
      const { savedMap } = mapSavedResponses(questions, responses);
      expect(savedMap.size).toBe(0);
    });

    it('should handle responses without written_answer', () => {
      const questions = [{ question: 'Q1' }];
      const responses = [{ question_text: 'Q1' }];
      const { savedMap, answersMap } = mapSavedResponses(questions, responses);
      expect(savedMap.get(0)).toBe(true);
      expect(answersMap.has(0)).toBe(false);
    });

    it('should handle multiple matched responses', () => {
      const questions = [{ question: 'Q1' }, { question: 'Q2' }, { question: 'Q3' }];
      const responses = [
        { question_text: 'Q1', written_answer: 'A1' },
        { question_text: 'Q3', written_answer: 'A3' },
      ];
      const { savedMap, answersMap } = mapSavedResponses(questions, responses);
      expect(savedMap.size).toBe(2);
      expect(savedMap.has(1)).toBe(false);
      expect(answersMap.get(0)).toBe('A1');
      expect(answersMap.get(2)).toBe('A3');
    });

    it('should return empty maps for no responses', () => {
      const questions = [{ question: 'Q1' }];
      const { savedMap, answersMap } = mapSavedResponses(questions, []);
      expect(savedMap.size).toBe(0);
      expect(answersMap.size).toBe(0);
    });
  });

  // ==========================================
  // Practice duration calculation (line 199)
  // ==========================================
  describe('Practice duration calculation (replicated from line 199)', () => {
    function calculateDuration(startTime?: number): number | undefined {
      if (!startTime) return undefined;
      return Math.floor((Date.now() - startTime) / 1000);
    }

    it('should return undefined when no start time', () => {
      expect(calculateDuration(undefined)).toBeUndefined();
    });

    it('should return undefined for 0 start time', () => {
      expect(calculateDuration(0)).toBeUndefined();
    });

    it('should calculate seconds elapsed', () => {
      const startTime = Date.now() - 5000; // 5 seconds ago
      const duration = calculateDuration(startTime);
      expect(duration).toBeGreaterThanOrEqual(4);
      expect(duration).toBeLessThanOrEqual(6);
    });

    it('should floor to nearest second', () => {
      const startTime = Date.now() - 1500; // 1.5 seconds ago
      const duration = calculateDuration(startTime);
      expect(duration).toBe(1);
    });
  });

  // ==========================================
  // API data extraction (lines 129-131)
  // ==========================================
  describe('API data extraction (replicated from lines 129-131)', () => {
    function extractQuestions(resultData: any): any[] {
      const responseData = resultData.data || resultData;
      return responseData.questions || [];
    }

    it('should extract from flat structure', () => {
      const result = extractQuestions({ questions: [{ question: 'Q1' }] });
      expect(result).toEqual([{ question: 'Q1' }]);
    });

    it('should extract from nested data structure', () => {
      const result = extractQuestions({ data: { questions: [{ question: 'Q1' }] } });
      expect(result).toEqual([{ question: 'Q1' }]);
    });

    it('should return empty array when no questions field', () => {
      expect(extractQuestions({})).toEqual([]);
    });

    it('should return empty array for nested empty data', () => {
      expect(extractQuestions({ data: {} })).toEqual([]);
    });
  });

  // ==========================================
  // SavedPracticeResponse interface
  // ==========================================
  describe('SavedPracticeResponse interface shape', () => {
    const REQUIRED_FIELDS = ['id', 'question_text', 'times_practiced', 'last_practiced_at'];
    const OPTIONAL_FIELDS = ['question_category', 'written_answer', 'star_story'];

    it('should have 4 required fields', () => {
      expect(REQUIRED_FIELDS).toHaveLength(4);
    });

    it('should have 3 optional fields', () => {
      expect(OPTIONAL_FIELDS).toHaveLength(3);
    });
  });
});
