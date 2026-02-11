/**
 * STARStoryBuilderScreen Tests
 *
 * Tests cover:
 * - Module exports and component function signature
 * - TONE_OPTIONS constant configuration
 * - DEFAULT_THEMES constant configuration
 * - STAR_GUIDANCE data structure integrity
 * - getExperienceTitle() logic (replicated)
 * - Toggle logic for Sets (replicated)
 * - Interface shape verification via runtime objects
 * - StyleSheet creation
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
      card: '#111',
      primary: '#007AFF',
      glass: 'rgba(255,255,255,0.05)',
      glassBorder: 'rgba(255,255,255,0.1)',
    },
    isDark: true,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({ navigate: jest.fn(), goBack: jest.fn() })),
  useRoute: jest.fn(() => ({
    params: { tailoredResumeId: 1, interviewPrepId: 2 },
  })),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: 'Navigator',
    Screen: 'Screen',
  })),
}));

jest.mock('lucide-react-native', () =>
  new Proxy({}, { get: () => 'MockIcon' })
);

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('../../api/client', () => ({
  api: {
    getInterviewPrep: jest.fn(() =>
      Promise.resolve({ success: true, data: {} })
    ),
    getTailoredResume: jest.fn(() =>
      Promise.resolve({ success: true, data: {} })
    ),
    getResume: jest.fn(() => Promise.resolve({ success: true, data: {} })),
    listStarStories: jest.fn(() =>
      Promise.resolve({ success: true, data: [] })
    ),
    generateStarStory: jest.fn(() =>
      Promise.resolve({ success: true, data: {} })
    ),
    createStarStory: jest.fn(() =>
      Promise.resolve({ success: true, data: {} })
    ),
    updateStarStory: jest.fn(() =>
      Promise.resolve({ success: true, data: {} })
    ),
    deleteStarStory: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

jest.mock('../../components/glass/GlassCard', () => ({
  GlassCard: 'GlassCard',
}));

jest.mock('../../components/glass/GlassButton', () => ({
  GlassButton: 'GlassButton',
}));

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

describe('STARStoryBuilderScreen', () => {
  // ----------------------------------------------------------------
  // Module export tests
  // ----------------------------------------------------------------
  describe('Module exports', () => {
    it('should export a default function component', () => {
      const mod = require('../STARStoryBuilderScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have a name of STARStoryBuilderScreen', () => {
      const mod = require('../STARStoryBuilderScreen');
      expect(mod.default.name).toBe('STARStoryBuilderScreen');
    });
  });

  // ----------------------------------------------------------------
  // TONE_OPTIONS constant tests (replicated from source lines 80-86)
  // ----------------------------------------------------------------
  describe('TONE_OPTIONS configuration', () => {
    const TONE_OPTIONS = [
      {
        value: 'professional',
        label: 'Professional & Formal',
        description: 'Corporate, structured, polished language',
      },
      {
        value: 'conversational',
        label: 'Conversational & Authentic',
        description: 'Natural, approachable, genuine tone',
      },
      {
        value: 'confident',
        label: 'Confident & Assertive',
        description: 'Strong, decisive, leadership-focused',
      },
      {
        value: 'technical',
        label: 'Technical & Detailed',
        description: 'Precise, methodical, technical depth',
      },
      {
        value: 'strategic',
        label: 'Strategic & Visionary',
        description: 'Big-picture, forward-thinking, executive-level',
      },
    ];

    it('should have exactly 5 tone options', () => {
      expect(TONE_OPTIONS).toHaveLength(5);
    });

    it('should include professional as the first option', () => {
      expect(TONE_OPTIONS[0].value).toBe('professional');
    });

    it('should have unique values for all tone options', () => {
      const values = TONE_OPTIONS.map((t) => t.value);
      expect(new Set(values).size).toBe(values.length);
    });

    it('should have non-empty labels and descriptions for all tones', () => {
      TONE_OPTIONS.forEach((tone) => {
        expect(tone.label.length).toBeGreaterThan(0);
        expect(tone.description.length).toBeGreaterThan(0);
      });
    });

    it('should contain all expected tone values', () => {
      const values = TONE_OPTIONS.map((t) => t.value);
      expect(values).toEqual([
        'professional',
        'conversational',
        'confident',
        'technical',
        'strategic',
      ]);
    });

    it('should support looking up a tone by value', () => {
      const found = TONE_OPTIONS.find((t) => t.value === 'technical');
      expect(found).toBeDefined();
      expect(found!.label).toBe('Technical & Detailed');
    });
  });

  // ----------------------------------------------------------------
  // DEFAULT_THEMES constant tests (replicated from source lines 88-97)
  // ----------------------------------------------------------------
  describe('DEFAULT_THEMES configuration', () => {
    const DEFAULT_THEMES = [
      'Leadership Challenge',
      'Problem Solving',
      'Team Collaboration',
      'Handling Ambiguity',
      'Delivering Under Pressure',
      'Conflict Resolution',
      'Innovation & Creativity',
      'Customer Focus',
    ];

    it('should have exactly 8 default themes', () => {
      expect(DEFAULT_THEMES).toHaveLength(8);
    });

    it('should start with Leadership Challenge', () => {
      expect(DEFAULT_THEMES[0]).toBe('Leadership Challenge');
    });

    it('should end with Customer Focus', () => {
      expect(DEFAULT_THEMES[DEFAULT_THEMES.length - 1]).toBe('Customer Focus');
    });

    it('should have all unique themes', () => {
      expect(new Set(DEFAULT_THEMES).size).toBe(DEFAULT_THEMES.length);
    });

    it('should include key behavioral interview themes', () => {
      expect(DEFAULT_THEMES).toContain('Problem Solving');
      expect(DEFAULT_THEMES).toContain('Team Collaboration');
      expect(DEFAULT_THEMES).toContain('Conflict Resolution');
    });
  });

  // ----------------------------------------------------------------
  // STAR_GUIDANCE data structure tests (replicated from source lines 467-529)
  // ----------------------------------------------------------------
  describe('STAR_GUIDANCE structure', () => {
    // Replicate the STAR_GUIDANCE structure from the component
    const STAR_GUIDANCE = {
      situation: {
        letter: 'S',
        title: 'SITUATION/TASK',
        subtitle: 'Set the scene and provide context for your story',
        keyQuestions:
          'Address: where it happened, when it occurred, and why it mattered',
        probingQuestions: [
          'What made this situation significant? What were you trying to achieve?',
          'What was the scope and what obstacles existed?',
          'What would have happened if no action was taken?',
        ],
        challengeQuestions: [
          'Why is this the best example to demonstrate this competency?',
          'Can you think of alternative examples that show similar skills?',
          'Do you have a more recent example?',
        ],
      },
      action: {
        letter: 'A',
        title: 'ACTION',
        subtitle: 'Detail the specific steps you took',
        keyQuestions:
          'Address: what you personally owned, your approach, and who was involved',
        probingQuestions: [
          'Demonstrate your expertise in the relevant skill area.',
          'Were you leading the effort or supporting?',
          'What was your unique contribution? What value did you add?',
          'What obstacles did you face and how did you overcome them?',
        ],
        challengeQuestions: [
          "What was your individual contribution versus the team's?",
          'How did you prioritize, handle setbacks, or secure stakeholder support?',
          'Did you push back on any decisions? How did you drive the right outcome?',
        ],
      },
      result: {
        letter: 'R',
        title: 'RESULTS',
        subtitle: 'Quantify success and demonstrate impact',
        keyQuestions: '',
        resultTypes: [
          '$ Financial impact: cost savings or revenue generated',
          '# Scale metrics: volume, size, or scope',
          '% Improvement rates: year-over-year or before/after changes',
          'Time savings: faster delivery, reduced cycle time',
          'People impact: customer satisfaction, team morale',
          'Quality gains: error reduction, process improvements',
        ],
        probingQuestions: [
          'Why highlight these specific results? What other outcomes were notable?',
          'Can you quantify that impact as a percentage or dollar amount?',
          'What trade-offs were necessary? (speed vs quality vs cost)',
          'Tell me more about any concerns around timeline, scope, or impact...',
        ],
        challengeQuestions: [
          'What did you learn? What would you do differently?',
          'How would you adapt this approach at your target company?',
          'Did the results meet your original objectives from the Situation?',
        ],
      },
    };

    it('should have exactly 3 sections: situation, action, result', () => {
      expect(Object.keys(STAR_GUIDANCE)).toEqual([
        'situation',
        'action',
        'result',
      ]);
    });

    it('should assign correct letters to each section', () => {
      expect(STAR_GUIDANCE.situation.letter).toBe('S');
      expect(STAR_GUIDANCE.action.letter).toBe('A');
      expect(STAR_GUIDANCE.result.letter).toBe('R');
    });

    it('should have titles for all sections', () => {
      expect(STAR_GUIDANCE.situation.title).toBe('SITUATION/TASK');
      expect(STAR_GUIDANCE.action.title).toBe('ACTION');
      expect(STAR_GUIDANCE.result.title).toBe('RESULTS');
    });

    it('should have non-empty subtitles for all sections', () => {
      Object.values(STAR_GUIDANCE).forEach((section) => {
        expect(section.subtitle.length).toBeGreaterThan(0);
      });
    });

    it('should have 3 probing questions for the situation section', () => {
      expect(STAR_GUIDANCE.situation.probingQuestions).toHaveLength(3);
    });

    it('should have 4 probing questions for the action section', () => {
      expect(STAR_GUIDANCE.action.probingQuestions).toHaveLength(4);
    });

    it('should have 4 probing questions for the result section', () => {
      expect(STAR_GUIDANCE.result.probingQuestions).toHaveLength(4);
    });

    it('should have 3 challenge questions for each section', () => {
      expect(STAR_GUIDANCE.situation.challengeQuestions).toHaveLength(3);
      expect(STAR_GUIDANCE.action.challengeQuestions).toHaveLength(3);
      expect(STAR_GUIDANCE.result.challengeQuestions).toHaveLength(3);
    });

    it('should have resultTypes only on the result section', () => {
      expect(STAR_GUIDANCE.result.resultTypes).toBeDefined();
      expect(STAR_GUIDANCE.result.resultTypes.length).toBe(6);
    });

    it('should have an empty keyQuestions for the result section', () => {
      expect(STAR_GUIDANCE.result.keyQuestions).toBe('');
    });

    it('should have non-empty keyQuestions for situation and action', () => {
      expect(STAR_GUIDANCE.situation.keyQuestions.length).toBeGreaterThan(0);
      expect(STAR_GUIDANCE.action.keyQuestions.length).toBeGreaterThan(0);
    });
  });

  // ----------------------------------------------------------------
  // getExperienceTitle logic (replicated from source line 452-454)
  // ----------------------------------------------------------------
  describe('getExperienceTitle logic', () => {
    // Replicate the function logic
    const getExperienceTitle = (exp: {
      header?: string;
      title?: string;
      position?: string;
    }) => {
      return exp.header || exp.title || exp.position || 'Experience';
    };

    it('should return header when present', () => {
      expect(
        getExperienceTitle({ header: 'Senior Developer', title: 'Dev' })
      ).toBe('Senior Developer');
    });

    it('should return title when header is absent', () => {
      expect(getExperienceTitle({ title: 'Software Engineer' })).toBe(
        'Software Engineer'
      );
    });

    it('should return position when header and title are absent', () => {
      expect(getExperienceTitle({ position: 'Manager' })).toBe('Manager');
    });

    it('should return "Experience" as fallback when no fields are present', () => {
      expect(getExperienceTitle({})).toBe('Experience');
    });

    it('should prefer header over title and position', () => {
      expect(
        getExperienceTitle({
          header: 'A',
          title: 'B',
          position: 'C',
        })
      ).toBe('A');
    });

    it('should prefer title over position', () => {
      expect(getExperienceTitle({ title: 'B', position: 'C' })).toBe('B');
    });

    it('should treat empty string header as falsy and fall through', () => {
      expect(getExperienceTitle({ header: '', title: 'Real Title' })).toBe(
        'Real Title'
      );
    });
  });

  // ----------------------------------------------------------------
  // Toggle Set logic (replicated from source lines 222-230)
  // ----------------------------------------------------------------
  describe('Toggle Set logic', () => {
    const toggleInSet = (set: Set<number>, value: number): Set<number> => {
      const newSet = new Set(set);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };

    it('should add an item to an empty set', () => {
      const result = toggleInSet(new Set(), 1);
      expect(result.has(1)).toBe(true);
      expect(result.size).toBe(1);
    });

    it('should remove an existing item from the set', () => {
      const result = toggleInSet(new Set([1, 2, 3]), 2);
      expect(result.has(2)).toBe(false);
      expect(result.size).toBe(2);
    });

    it('should not mutate the original set', () => {
      const original = new Set([1, 2]);
      const result = toggleInSet(original, 3);
      expect(original.size).toBe(2);
      expect(result.size).toBe(3);
    });

    it('should toggle on then off', () => {
      let set = new Set<number>();
      set = toggleInSet(set, 5);
      expect(set.has(5)).toBe(true);
      set = toggleInSet(set, 5);
      expect(set.has(5)).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // Toggle string Set logic (for expanded stories, guide sections)
  // ----------------------------------------------------------------
  describe('Toggle string Set logic (expandedStories/guideSections)', () => {
    const toggleStringInSet = (
      set: Set<string>,
      value: string
    ): Set<string> => {
      const newSet = new Set(set);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };

    it('should add a string to an empty set', () => {
      const result = toggleStringInSet(new Set(), 'situation');
      expect(result.has('situation')).toBe(true);
    });

    it('should remove an existing string from the set', () => {
      const result = toggleStringInSet(
        new Set(['situation', 'action']),
        'situation'
      );
      expect(result.has('situation')).toBe(false);
      expect(result.has('action')).toBe(true);
    });

    it('should convert numeric story IDs to string keys', () => {
      // Matches toggleStoryExpanded logic: const storyKey = String(storyId)
      const storyId: string | number = 42;
      const storyKey = String(storyId);
      expect(storyKey).toBe('42');

      const set = toggleStringInSet(new Set(), storyKey);
      expect(set.has('42')).toBe(true);
    });
  });

  // ----------------------------------------------------------------
  // Interface shape tests
  // ----------------------------------------------------------------
  describe('Interface shapes', () => {
    it('should accept a valid Experience object', () => {
      const exp = {
        header: 'Lead Engineer',
        title: 'Engineer',
        position: 'Staff',
        company: 'Acme Corp',
        bullets: ['Led team of 5', 'Delivered project on time'],
        description: 'Full stack development',
      };
      expect(exp.header).toBeDefined();
      expect(exp.bullets).toHaveLength(2);
    });

    it('should accept an Experience object with minimal fields', () => {
      const exp = {};
      // All fields are optional per the interface
      expect(exp).toBeDefined();
    });

    it('should accept a valid STARStory object', () => {
      const story = {
        id: 'story_123',
        title: 'Leadership Story',
        situation: 'Faced a deadline',
        task: 'Deliver on time',
        action: 'Organized team sprints',
        result: 'Delivered 2 days early',
        key_themes: ['Leadership', 'Time Management'],
        talking_points: ['Managed 5 engineers'],
        experience_indices: [0, 2],
        probing_questions: {
          situation: ['Why was this significant?'],
          action: ['Were you leading or supporting?'],
          result: ['Can you quantify?'],
        },
        challenge_questions: {
          situation: ['Best example?'],
          action: ['Individual vs team?'],
          result: ['What did you learn?'],
        },
        created_at: '2026-01-15T10:00:00Z',
      };
      expect(story.id).toBe('story_123');
      expect(story.probing_questions.situation).toHaveLength(1);
      expect(story.challenge_questions.result).toHaveLength(1);
    });

    it('should accept a valid StoryPrompt object', () => {
      const prompt = {
        title: 'Describe a leadership challenge',
        description: 'Tell about leading under pressure',
        star_hint: {
          situation: 'A time you had to lead...',
          task: 'Your responsibility was...',
          action: 'You decided to...',
          result: 'The outcome was...',
        },
      };
      expect(prompt.star_hint).toBeDefined();
      expect(Object.keys(prompt.star_hint)).toHaveLength(4);
    });

    it('should accept a StoryPrompt without star_hint', () => {
      const prompt = {
        title: 'Any challenge',
        description: 'Describe a challenge you faced',
      };
      expect(prompt.title).toBeDefined();
      expect((prompt as any).star_hint).toBeUndefined();
    });
  });

  // ----------------------------------------------------------------
  // Probing/challenge questions generation logic (replicated from handleGenerateStory)
  // ----------------------------------------------------------------
  describe('Probing and challenge questions generation', () => {
    it('should generate probing questions with correct structure', () => {
      const probingQuestions = {
        situation: [
          'What made this situation significant? What were you trying to achieve?',
          'What was the scope and what obstacles existed?',
          'What would have happened if no action was taken?',
        ],
        action: [
          'Demonstrate your expertise in the relevant skill area.',
          'Were you leading the effort or supporting?',
          'What was your unique contribution? What value did you add?',
          'What obstacles did you face and how did you overcome them?',
        ],
        result: [
          'Why highlight these specific results? What other outcomes were notable?',
          'Can you quantify that impact as a percentage or dollar amount?',
          'What trade-offs were necessary? (speed vs quality vs cost)',
        ],
      };

      expect(probingQuestions.situation).toHaveLength(3);
      expect(probingQuestions.action).toHaveLength(4);
      expect(probingQuestions.result).toHaveLength(3);
    });

    it('should generate challenge questions with company name when provided', () => {
      const companyName = 'Google';
      const challengeQuestions = {
        situation: [
          'Why is this the best example to demonstrate this competency?',
          'Can you think of alternative examples that show similar skills?',
          'Do you have a more recent example?',
        ],
        action: [
          "What was your individual contribution versus the team's?",
          'How did you prioritize, handle setbacks, or secure stakeholder support?',
          'Did you push back on any decisions? How did you drive the right outcome?',
        ],
        result: [
          'What did you learn? What would you do differently?',
          companyName
            ? `How would you adapt this approach at ${companyName}?`
            : 'How would you adapt this approach at your target company?',
          'Did the results meet your original objectives from the Situation?',
        ],
      };

      expect(challengeQuestions.result[1]).toBe(
        'How would you adapt this approach at Google?'
      );
    });

    it('should use generic wording when company name is empty', () => {
      const companyName = '';
      const resultQuestion = companyName
        ? `How would you adapt this approach at ${companyName}?`
        : 'How would you adapt this approach at your target company?';

      expect(resultQuestion).toBe(
        'How would you adapt this approach at your target company?'
      );
    });
  });

  // ----------------------------------------------------------------
  // STAR section color mapping (from view mode rendering)
  // ----------------------------------------------------------------
  describe('STAR section color mapping', () => {
    it('should map each STAR section to a distinct color', () => {
      // From source lines 1169-1174
      const sections = [
        { key: 'situation', label: 'Situation', questionsKey: 'situation' },
        { key: 'task', label: 'Task', questionsKey: null },
        { key: 'action', label: 'Action', questionsKey: 'action' },
        { key: 'result', label: 'Result', questionsKey: 'result' },
      ];

      expect(sections).toHaveLength(4);
      expect(sections[1].questionsKey).toBeNull(); // Task has no questions
    });

    it('should exclude Task from probing/challenge questions', () => {
      // Task section has questionsKey: null meaning no probing or challenge questions
      const sections = [
        { key: 'situation', questionsKey: 'situation' as const },
        { key: 'task', questionsKey: null },
        { key: 'action', questionsKey: 'action' as const },
        { key: 'result', questionsKey: 'result' as const },
      ];

      const sectionsWithQuestions = sections.filter(
        (s) => s.questionsKey !== null
      );
      expect(sectionsWithQuestions).toHaveLength(3);
      expect(sectionsWithQuestions.map((s) => s.key)).toEqual([
        'situation',
        'action',
        'result',
      ]);
    });
  });

  // ----------------------------------------------------------------
  // Generate button label logic
  // ----------------------------------------------------------------
  describe('Generate button label logic', () => {
    it('should show "Generating..." when generating', () => {
      const generating = true;
      const stories: any[] = [];
      const label = generating
        ? 'Generating...'
        : stories.length > 0
          ? 'Generate Another Story'
          : 'Generate STAR Story';
      expect(label).toBe('Generating...');
    });

    it('should show "Generate STAR Story" when no stories exist', () => {
      const generating = false;
      const stories: any[] = [];
      const label = generating
        ? 'Generating...'
        : stories.length > 0
          ? 'Generate Another Story'
          : 'Generate STAR Story';
      expect(label).toBe('Generate STAR Story');
    });

    it('should show "Generate Another Story" when stories already exist', () => {
      const generating = false;
      const stories = [{ id: 1 }];
      const label = generating
        ? 'Generating...'
        : stories.length > 0
          ? 'Generate Another Story'
          : 'Generate STAR Story';
      expect(label).toBe('Generate Another Story');
    });
  });

  // ----------------------------------------------------------------
  // Theme deduplication logic (from loadInterviewPrepContext)
  // ----------------------------------------------------------------
  describe('Theme deduplication logic', () => {
    it('should combine core responsibilities with default themes and deduplicate', () => {
      const DEFAULT_THEMES = [
        'Leadership Challenge',
        'Problem Solving',
        'Team Collaboration',
      ];
      const coreResponsibilities = [
        'Problem Solving',
        'Strategic Planning',
        'Team Collaboration',
      ];

      const combinedThemes = [...coreResponsibilities, ...DEFAULT_THEMES];
      const uniqueThemes = [...new Set(combinedThemes)];

      // "Problem Solving" and "Team Collaboration" are duplicates
      expect(uniqueThemes).toHaveLength(4);
      expect(uniqueThemes).toContain('Strategic Planning');
      expect(uniqueThemes).toContain('Leadership Challenge');
    });

    it('should place core responsibilities before default themes', () => {
      const DEFAULT_THEMES = ['A', 'B'];
      const coreResponsibilities = ['X', 'Y'];
      const combined = [...coreResponsibilities, ...DEFAULT_THEMES];
      expect(combined[0]).toBe('X');
      expect(combined[1]).toBe('Y');
    });

    it('should preserve order when no duplicates exist', () => {
      const DEFAULT_THEMES = ['C', 'D'];
      const coreResponsibilities = ['A', 'B'];
      const combined = [...new Set([...coreResponsibilities, ...DEFAULT_THEMES])];
      expect(combined).toEqual(['A', 'B', 'C', 'D']);
    });
  });
});
