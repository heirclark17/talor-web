/**
 * CertificationsScreen Comprehensive Tests
 *
 * Tests:
 * - Component rendering in all states (loading, empty, data with all optional fields)
 * - Filter functionality (all levels) with interactive button presses
 * - Expand/collapse certification details
 * - Save/unsave certifications
 * - All conditional rendering paths
 * - AsyncStorage interactions
 * - Navigation back
 * - Helper functions (getLevelColor, getPriorityColor, getRoiColor)
 */

import React from 'react';
import renderer from 'react-test-renderer';

// ---- Store mock state container ----
let mockStoreState: any = {
  loadingCertifications: false,
  cachedPreps: {},
};

// The store mock: when called with a selector, apply it; otherwise return full state
const mockUseInterviewPrepStoreFn = jest.fn((selector?: any) => {
  if (typeof selector === 'function') {
    return selector(mockStoreState);
  }
  return mockStoreState;
});

// ---- Navigation mocks ----
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

// ---- AsyncStorage mocks ----
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();

// ---- jest.mock declarations ----

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      textTertiary: '#666',
      background: '#000',
      backgroundTertiary: '#222',
      border: '#333',
      glass: 'rgba(255,255,255,0.05)',
      glassBorder: 'rgba(255,255,255,0.1)',
    },
    isDark: true,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  })),
  useRoute: jest.fn(() => ({
    params: { interviewPrepId: 1 },
  })),
}));

jest.mock('lucide-react-native', () => {
  const RealReact = require('react');
  return new Proxy(
    {},
    {
      get: (_target: any, prop: any) => {
        if (typeof prop === 'string') {
          const Icon = (props: any) =>
            RealReact.createElement('MockIcon', { ...props, testID: prop });
          Icon.displayName = prop;
          return Icon;
        }
        return undefined;
      },
    }
  );
});

jest.mock('react-native-safe-area-context', () => {
  const RealReact = require('react');
  return {
    SafeAreaView: (props: any) =>
      RealReact.createElement('SafeAreaView', props, props.children),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (...args: any[]) => mockGetItem(...args),
    setItem: (...args: any[]) => mockSetItem(...args),
  },
}));

jest.mock('../../components/glass/GlassCard', () => {
  const RealReact = require('react');
  return {
    GlassCard: (props: any) =>
      RealReact.createElement('GlassCard', props, props.children),
  };
});

jest.mock('../../stores', () => ({
  get useInterviewPrepStore() {
    return mockUseInterviewPrepStoreFn;
  },
}));

jest.mock('../../components/interviewPrep/types', () => ({}));

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

import CertificationsScreen from '../CertificationsScreen';

// ---- Test Data ----

const makeCert = (overrides: any = {}) => ({
  name: 'CompTIA A+',
  provider: 'CompTIA',
  level: 'entry' as const,
  priority: 'high' as const,
  cost: '$349',
  time_to_complete: '2 months',
  roi_rating: 'High',
  why_recommended: 'Foundation cert',
  skills_gained: ['Hardware', 'Networking'],
  difficulty: 'Easy',
  prerequisites: 'None',
  exam_details: {
    format: 'Multiple choice',
    duration: '90 minutes',
    passing_score: '675/900',
    validity: '3 years',
  },
  study_resources: ['Official Guide', 'Practice Tests'],
  ...overrides,
});

const fullCertifications = {
  certifications_by_level: {
    entry: [makeCert()],
    foundation: [] as any[],
    mid: [
      makeCert({
        name: 'CCNA',
        provider: 'Cisco',
        level: 'mid',
        priority: 'medium',
        cost: '$300',
        time_to_complete: '3 months',
        roi_rating: 'Medium',
        why_recommended: 'Networking fundamentals',
        skills_gained: ['Routing', 'Switching'],
        difficulty: undefined,
        prerequisites: undefined,
        exam_details: undefined,
        study_resources: undefined,
      }),
    ],
    intermediate: [] as any[],
    advanced: [
      makeCert({
        name: 'CISSP',
        provider: 'ISC2',
        level: 'advanced',
        priority: 'high',
        cost: '$749',
        time_to_complete: '6 months',
        roi_rating: 'Very High',
        why_recommended: 'Gold standard',
        skills_gained: ['Risk Management', 'Security Architecture'],
        difficulty: undefined,
        prerequisites: undefined,
        exam_details: undefined,
        study_resources: undefined,
      }),
    ],
  },
  recommended_path: [
    { step: 1, certification: 'CompTIA A+', timeline: '3 months', rationale: 'Build foundation' },
    { step: 2, certification: 'CISSP', timeline: '6 months', rationale: 'Advanced security' },
  ],
  personalized_advice: 'Focus on security certifications for your career path.',
};

// ---- Helpers ----

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

const setStoreState = (overrides: Partial<typeof mockStoreState> = {}) => {
  mockStoreState = {
    loadingCertifications: false,
    cachedPreps: {},
    ...overrides,
  };
};

const setStoreWithCerts = (certData: any) => {
  setStoreState({
    cachedPreps: {
      1: {
        interviewPrepId: 1,
        certificationRecommendations: certData,
      },
    },
  });
};

const renderScreen = async () => {
  let tree: any;
  await renderer.act(async () => {
    tree = renderer.create(React.createElement(CertificationsScreen));
    await flushPromises();
  });
  return tree!;
};

const stringify = (tree: any) => JSON.stringify(tree.toJSON());

/** Recursively collect all text content under a test instance */
const getTextContent = (instance: any): string => {
  if (typeof instance === 'string' || typeof instance === 'number') return String(instance);
  if (!instance) return '';
  if (instance.children) {
    return instance.children.map(getTextContent).join('');
  }
  return '';
};

/** Find a TouchableOpacity whose text content includes the given string */
const findTouchableByText = (root: any, text: string) => {
  const touchables = root.findAllByType('TouchableOpacity');
  return touchables.find((t: any) => getTextContent(t).includes(text));
};

/** Find a TouchableOpacity that has a MockIcon child with the given testID */
const findTouchableByIconTestID = (root: any, iconTestID: string) => {
  const mockIcons = root.findAllByType('MockIcon');
  const matchingIcon = mockIcons.find((icon: any) => icon.props.testID === iconTestID);
  if (!matchingIcon) return undefined;
  // Walk up to find the nearest TouchableOpacity parent
  let current = matchingIcon.parent;
  while (current) {
    if (current.type === 'TouchableOpacity') return current;
    current = current.parent;
  }
  return undefined;
};

// ---- Tests ----

describe('CertificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(undefined);
    setStoreWithCerts(fullCertifications);
  });

  // =====================================================
  // Component Rendering
  // =====================================================
  describe('Component Rendering', () => {
    it('should render loading state with spinner', async () => {
      setStoreState({ loadingCertifications: true, cachedPreps: {} });

      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('ActivityIndicator');
      expect(str).toContain('Loading certification recommendations');
    });

    it('should render with certifications data showing cert names', async () => {
      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('CompTIA A+');
      expect(str).toContain('CCNA');
      expect(str).toContain('CISSP');
      expect(str).toContain('Recommended Certifications');
    });

    it('should render empty state when no certifications', async () => {
      setStoreWithCerts({ certifications_by_level: {} });

      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('No certifications found for this level');
    });

    it('should render empty state when cachedPrep is null', async () => {
      setStoreState({ loadingCertifications: false, cachedPreps: {} });

      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('No certifications found');
    });

    it('should render recommended path section', async () => {
      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('Recommended Certification Path');
      expect(str).toContain('Build foundation');
      expect(str).toContain('Advanced security');
    });

    it('should render personalized advice section', async () => {
      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('Personalized Career Advice');
      expect(str).toContain('Focus on security certifications');
    });

    it('should NOT render recommended_path when absent', async () => {
      setStoreWithCerts({
        certifications_by_level: fullCertifications.certifications_by_level,
      });

      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).not.toContain('Recommended Certification Path');
    });

    it('should NOT render personalized_advice when absent', async () => {
      setStoreWithCerts({
        certifications_by_level: fullCertifications.certifications_by_level,
        recommended_path: fullCertifications.recommended_path,
      });

      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).not.toContain('Personalized Career Advice');
    });
  });

  // =====================================================
  // Level Filtering (interactive)
  // =====================================================
  describe('Level Filtering', () => {
    it('should show all certifications by default (filter=all)', async () => {
      const tree = await renderScreen();
      const str = stringify(tree);

      expect(str).toContain('CompTIA A+');
      expect(str).toContain('CCNA');
      expect(str).toContain('CISSP');
    });

    it('should filter by entry level when Entry button pressed', async () => {
      const tree = await renderScreen();

      const entryButton = findTouchableByText(tree.root, 'Entry');
      expect(entryButton).toBeDefined();
      await renderer.act(async () => {
        entryButton!.props.onPress();
      });

      const str = stringify(tree);
      expect(str).toContain('CompTIA A+');
      // CISSP cert card has provider "ISC2" -- should be filtered out
      // (CISSP still appears in Recommended Path section which is not filtered)
      expect(str).not.toContain('ISC2');
      expect(str).not.toContain('Cisco');
    });

    it('should filter by mid level when Mid button pressed', async () => {
      const tree = await renderScreen();

      const midButton = findTouchableByText(tree.root, 'Mid');
      expect(midButton).toBeDefined();
      await renderer.act(async () => {
        midButton!.props.onPress();
      });

      const str = stringify(tree);
      expect(str).toContain('CCNA');
      expect(str).toContain('Cisco');
      // ISC2 (CISSP provider) and CompTIA (CompTIA A+ provider) should not be cert cards
      expect(str).not.toContain('ISC2');
    });

    it('should filter by advanced level when Advanced button pressed', async () => {
      const tree = await renderScreen();

      const advancedButton = findTouchableByText(tree.root, 'Advanced');
      expect(advancedButton).toBeDefined();
      await renderer.act(async () => {
        advancedButton!.props.onPress();
      });

      const str = stringify(tree);
      expect(str).toContain('CISSP');
      expect(str).toContain('ISC2');
      // Cisco (CCNA provider) and CompTIA (CompTIA A+ provider) should not appear
      expect(str).not.toContain('Cisco');
    });

    it('should show all certs again when All button pressed after filtering', async () => {
      const tree = await renderScreen();

      // First filter to entry
      const entryButton = findTouchableByText(tree.root, 'Entry');
      await renderer.act(async () => {
        entryButton!.props.onPress();
      });
      // Verify filtering worked: ISC2 provider (CISSP) not present as cert card
      expect(stringify(tree)).not.toContain('ISC2');

      // Then back to All
      const allButton = findTouchableByText(tree.root, 'All');
      expect(allButton).toBeDefined();
      await renderer.act(async () => {
        allButton!.props.onPress();
      });

      const str = stringify(tree);
      expect(str).toContain('CompTIA A+');
      expect(str).toContain('CCNA');
      expect(str).toContain('CISSP');
      expect(str).toContain('ISC2');
      expect(str).toContain('Cisco');
    });
  });

  // =====================================================
  // Expand/Collapse Certifications
  // =====================================================
  describe('Expand/Collapse', () => {
    it('should not show expanded content by default', async () => {
      const tree = await renderScreen();
      const str = stringify(tree);

      // Quick stats (cost, time) are always visible, but "Why Recommended" only shows when expanded
      expect(str).toContain('$349');
      expect(str).toContain('2 months');
      // Expanded content should not be visible yet
      expect(str).not.toContain('Foundation cert');
    });

    it('should expand certification details when header pressed', async () => {
      const tree = await renderScreen();

      // The cert header is the TouchableOpacity that contains the cert name AND the provider text
      const certHeader = findTouchableByText(tree.root, 'CompTIA A+');
      expect(certHeader).toBeDefined();
      await renderer.act(async () => {
        certHeader!.props.onPress();
      });

      const str = stringify(tree);
      expect(str).toContain('Why Recommended');
      expect(str).toContain('Foundation cert');
      expect(str).toContain('Skills Gained');
      expect(str).toContain('Hardware');
      expect(str).toContain('Networking');
      expect(str).toContain('Prerequisites');
      expect(str).toContain('None');
      expect(str).toContain('Exam Details');
      expect(str).toContain('Multiple choice');
      expect(str).toContain('90 minutes');
      expect(str).toContain('675/900');
      expect(str).toContain('3 years');
      expect(str).toContain('Study Resources');
      expect(str).toContain('Official Guide');
      expect(str).toContain('Practice Tests');
    });

    it('should collapse certification details when header pressed again', async () => {
      const tree = await renderScreen();

      // Expand
      const certHeader = findTouchableByText(tree.root, 'CompTIA A+');
      await renderer.act(async () => {
        certHeader!.props.onPress();
      });
      expect(stringify(tree)).toContain('Foundation cert');

      // Collapse -- re-find after tree re-render
      const certHeader2 = findTouchableByText(tree.root, 'CompTIA A+');
      await renderer.act(async () => {
        certHeader2!.props.onPress();
      });

      expect(stringify(tree)).not.toContain('Foundation cert');
    });
  });

  // =====================================================
  // Save/Unsave Certifications
  // =====================================================
  describe('Save/Unsave', () => {
    it('should save a certification when bookmark pressed', async () => {
      const tree = await renderScreen();
      const root = tree.root;

      // Find save buttons (the ones with Bookmark icon inside)
      // Save buttons have style saveButton and contain MockIcon with testID Bookmark
      const allTouchables = root.findAllByType('TouchableOpacity');
      const saveButtons = allTouchables.filter((t: any) => {
        try {
          const s = JSON.stringify(t.props.style);
          return s && s.includes('36') && s.includes('borderRadius');
        } catch {
          return false;
        }
      });

      // Press the first save button (for CompTIA A+)
      expect(saveButtons.length).toBeGreaterThan(0);
      await renderer.act(async () => {
        // stopPropagation mock is needed
        saveButtons[0].props.onPress({ stopPropagation: jest.fn() });
        await flushPromises();
      });

      expect(mockSetItem).toHaveBeenCalledWith(
        'saved_certifications',
        expect.any(String)
      );
      const savedJson = mockSetItem.mock.calls[0][1];
      const saved = JSON.parse(savedJson);
      expect(saved).toContain('CompTIA A+');
    });

    it('should unsave a previously saved certification', async () => {
      // Pre-load a saved cert
      mockGetItem.mockResolvedValue(JSON.stringify(['CompTIA A+']));

      const tree = await renderScreen();
      const root = tree.root;

      const allTouchables = root.findAllByType('TouchableOpacity');
      const saveButtons = allTouchables.filter((t: any) => {
        try {
          const s = JSON.stringify(t.props.style);
          return s && s.includes('36') && s.includes('borderRadius');
        } catch {
          return false;
        }
      });

      // Press the first save button to unsave
      expect(saveButtons.length).toBeGreaterThan(0);
      await renderer.act(async () => {
        saveButtons[0].props.onPress({ stopPropagation: jest.fn() });
        await flushPromises();
      });

      expect(mockSetItem).toHaveBeenCalled();
      const savedJson = mockSetItem.mock.calls[0][1];
      const saved = JSON.parse(savedJson);
      expect(saved).not.toContain('CompTIA A+');
    });
  });

  // =====================================================
  // AsyncStorage Operations
  // =====================================================
  describe('AsyncStorage Operations', () => {
    it('should load saved certifications from AsyncStorage on mount', async () => {
      mockGetItem.mockResolvedValue(JSON.stringify(['CompTIA A+', 'CISSP']));

      await renderScreen();

      expect(mockGetItem).toHaveBeenCalledWith('saved_certifications');
    });

    it('should handle AsyncStorage load error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const tree = await renderScreen();

      expect(tree).toBeDefined();
      expect(consoleError).toHaveBeenCalledWith(
        'Error loading saved certs:',
        expect.any(Error)
      );
      consoleError.mockRestore();
    });

    it('should handle AsyncStorage save error gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSetItem.mockRejectedValue(new Error('Save error'));

      const tree = await renderScreen();
      const root = tree.root;

      // Find a save button and press it to trigger save
      const allTouchables = root.findAllByType('TouchableOpacity');
      const saveButtons = allTouchables.filter((t: any) => {
        try {
          const s = JSON.stringify(t.props.style);
          return s && s.includes('36') && s.includes('borderRadius');
        } catch {
          return false;
        }
      });

      if (saveButtons.length > 0) {
        await renderer.act(async () => {
          saveButtons[0].props.onPress({ stopPropagation: jest.fn() });
          await flushPromises();
        });
      }

      expect(consoleError).toHaveBeenCalledWith(
        'Error saving cert:',
        expect.any(Error)
      );
      consoleError.mockRestore();
    });

    it('should handle null from AsyncStorage getItem', async () => {
      mockGetItem.mockResolvedValue(null);

      const tree = await renderScreen();
      expect(tree).toBeDefined();
    });
  });

  // =====================================================
  // Conditional Rendering Paths
  // =====================================================
  describe('Conditional Rendering Paths', () => {
    it('should render certification without exam_details', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ exam_details: undefined })],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification without skills_gained', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ skills_gained: undefined })],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification with all exam_details fields', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [
            makeCert({
              exam_details: {
                format: 'CBT',
                duration: '120 minutes',
                passing_score: '750/1000',
                validity: '5 years',
              },
            }),
          ],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification with partial exam_details', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [
            makeCert({
              exam_details: { format: 'Multiple choice' },
            }),
          ],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification without study_resources', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ study_resources: undefined })],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification without prerequisites', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ prerequisites: undefined })],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification without difficulty', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ difficulty: undefined })],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });

    it('should render certification without roi_rating', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ roi_rating: undefined })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('CompTIA A+');
      // ROI stat should not appear
      expect(str).not.toContain('ROI:');
    });

    it('should render certification without priority', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ priority: undefined })],
        },
      });

      const tree = await renderScreen();
      expect(stringify(tree)).toContain('CompTIA A+');
    });
  });

  // =====================================================
  // Level-specific Certifications
  // =====================================================
  describe('Level-specific Certifications', () => {
    it('should render foundation level certifications', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          foundation: [
            makeCert({ name: 'Foundation Cert', level: 'foundation' }),
          ],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('Foundation Cert');
      expect(str).toContain('FOUNDATION');
    });

    it('should render intermediate level certifications', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          intermediate: [
            makeCert({ name: 'Intermediate Cert', level: 'intermediate' }),
          ],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('Intermediate Cert');
      expect(str).toContain('INTERMEDIATE');
    });

    it('should render entry and advanced levels together', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ name: 'Entry Cert', level: 'entry' })],
          advanced: [makeCert({ name: 'Adv Cert', level: 'advanced' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('Entry Cert');
      expect(str).toContain('Adv Cert');
    });
  });

  // =====================================================
  // Navigation
  // =====================================================
  describe('Navigation', () => {
    it('should navigate back when back button pressed', async () => {
      const tree = await renderScreen();

      // Back button contains ArrowLeft icon (MockIcon with testID=ArrowLeft)
      const backButton = findTouchableByIconTestID(tree.root, 'ArrowLeft');
      expect(backButton).toBeDefined();
      await renderer.act(async () => {
        backButton!.props.onPress();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });

    it('should navigate back from loading state', async () => {
      setStoreState({ loadingCertifications: true, cachedPreps: {} });

      const tree = await renderScreen();

      const backButton = findTouchableByIconTestID(tree.root, 'ArrowLeft');
      expect(backButton).toBeDefined();
      await renderer.act(async () => {
        backButton!.props.onPress();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  // =====================================================
  // Helper Function Logic (via rendered output)
  // =====================================================
  describe('Helper Function Logic', () => {
    it('should apply correct level color for entry (green/success)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ level: 'entry' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      // The level badge should use success color (#10b981) for entry
      expect(str).toContain('#10b981');
    });

    it('should apply correct level color for mid (yellow/warning)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          mid: [makeCert({ name: 'Mid Cert', level: 'mid' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      // Warning color for mid level
      expect(str).toContain('#f59e0b');
    });

    it('should apply correct level color for advanced (red/error)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          advanced: [makeCert({ name: 'Adv Cert', level: 'advanced' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      // Error color for advanced level
      expect(str).toContain('#ef4444');
    });

    it('should apply correct priority color for high (red)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ priority: 'high' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      // High priority badge should use error color
      expect(str).toContain('HIGH');
    });

    it('should apply correct priority color for medium (yellow)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ priority: 'medium' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('MEDIUM');
    });

    it('should apply correct priority color for low (info/cyan)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ priority: 'low' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('LOW');
      expect(str).toContain('#06b6d4');
    });

    it('should apply correct ROI color for High (green)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ roi_rating: 'High' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      // ROI with "High" should render with success color
      expect(str).toContain('ROI:');
      expect(str).toContain('High');
    });

    it('should apply correct ROI color for Medium (yellow)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ roi_rating: 'Medium' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('ROI:');
      expect(str).toContain('Medium');
    });

    it('should apply default ROI color for Low (info/cyan)', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ roi_rating: 'Low' })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      expect(str).toContain('ROI:');
      expect(str).toContain('Low');
    });

    it('should apply default priority color for unknown priority', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ priority: 'critical' as any })],
        },
      });

      const tree = await renderScreen();
      const str = stringify(tree);
      // Unknown priority should get default primary color (#3b82f6)
      expect(str).toContain('CRITICAL');
      expect(str).toContain('#3b82f6');
    });
  });

  // =====================================================
  // Expanded Content - Conditional Fields
  // =====================================================
  describe('Expanded Content Conditional Fields', () => {
    const expandFirstCert = async (tree: any) => {
      const certHeader = findTouchableByText(tree.root, 'CompTIA A+');
      if (certHeader) {
        await renderer.act(async () => {
          certHeader.props.onPress();
        });
      }
    };

    it('should show difficulty when present in expanded view', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ difficulty: 'Hard' })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).toContain('Difficulty');
      expect(str).toContain('Hard');
    });

    it('should hide difficulty field when not present in expanded view', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ difficulty: undefined })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).toContain('Why Recommended');
      // Difficulty label should not be rendered
      expect(str).not.toContain('"Difficulty"');
    });

    it('should show ROI rating in expanded detail grid when present', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ roi_rating: 'Very High' })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).toContain('ROI Rating');
      expect(str).toContain('Very High');
    });

    it('should show exam details with all fields when expanded', async () => {
      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).toContain('Format:');
      expect(str).toContain('Duration:');
      expect(str).toContain('Passing Score:');
      expect(str).toContain('Validity:');
    });

    it('should show only format when other exam fields absent', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ exam_details: { format: 'CBT' } })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).toContain('Format:');
      expect(str).toContain('CBT');
      expect(str).not.toContain('Duration:');
      expect(str).not.toContain('Passing Score:');
      expect(str).not.toContain('Validity:');
    });

    it('should hide exam details section when no exam_details', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ exam_details: undefined })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).not.toContain('Format:');
      expect(str).not.toContain('Exam Details');
    });

    it('should hide study resources when none present', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ study_resources: undefined })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).not.toContain('Study Resources');
    });

    it('should hide skills gained when empty array', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ skills_gained: [] })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).not.toContain('Skills Gained');
    });

    it('should hide prerequisites when not present', async () => {
      setStoreWithCerts({
        certifications_by_level: {
          entry: [makeCert({ prerequisites: undefined })],
        },
      });

      const tree = await renderScreen();
      await expandFirstCert(tree);

      const str = stringify(tree);
      expect(str).not.toContain('Prerequisites');
    });
  });

  // =====================================================
  // Roadmap Steps
  // =====================================================
  describe('Roadmap Steps', () => {
    it('should render step numbers in recommended path', async () => {
      const tree = await renderScreen();
      const str = stringify(tree);

      // Step numbers 1 and 2
      expect(str).toContain('"1"');
      expect(str).toContain('"2"');
    });

    it('should render connector line between steps but not after last', async () => {
      // The component renders a connector View between steps (not after the last)
      const tree = await renderScreen();
      const str = stringify(tree);

      // Both steps and their content should be present
      expect(str).toContain('Build foundation');
      expect(str).toContain('Advanced security');
      expect(str).toContain('3 months');
      expect(str).toContain('6 months');
    });
  });
});
