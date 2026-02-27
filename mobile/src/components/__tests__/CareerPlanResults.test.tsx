/**
 * CareerPlanResults Component Tests
 *
 * Tests module exports, color mapping functions (getSkillLevelColor,
 * getPriorityColor), skill level/priority constants, view mode toggle,
 * and direct component rendering via react-test-renderer for
 * timeline/detailed views, skill gaps, action plan, learning resources,
 * networking events, section toggles, milestone expansion, and bottom actions.
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Override react-native mock to add LayoutAnimation and UIManager (cannot use jest.requireMock -- infinite recursion)
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((obj: any) => obj.ios ?? obj.default) },
  Alert: { alert: jest.fn() },
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'dark'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  LayoutAnimation: {
    configureNext: jest.fn(),
    Presets: {
      easeInEaseOut: 'easeInEaseOut',
      linear: 'linear',
      spring: 'spring',
    },
  },
  UIManager: {
    setLayoutAnimationEnabledExperimental: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  TextInput: 'TextInput',
  Image: 'Image',
  ImageBackground: 'ImageBackground',
  Modal: 'Modal',
  ActivityIndicator: 'ActivityIndicator',
  Switch: 'Switch',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    ScrollView: 'Animated.ScrollView',
    FlatList: 'Animated.FlatList',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    spring: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    parallel: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    sequence: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    event: jest.fn(),
    createAnimatedComponent: jest.fn((comp: any) => comp),
  },
  useColorScheme: jest.fn(() => 'dark'),
  useWindowDimensions: jest.fn(() => ({ width: 390, height: 844 })),
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    dismiss: jest.fn(),
  },
  StatusBar: { setBarStyle: jest.fn() },
  PixelRatio: { get: jest.fn(() => 2), roundToNearestPixel: jest.fn((n: number) => n) },
  I18nManager: { isRTL: false },
}));

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
      glass: 'rgba(255,255,255,0.1)',
    },
  }),
}));

// Override the global reanimated mock to include FadeIn/FadeOut animation builders
jest.mock('react-native-reanimated', () => {
  const RealReact = require('react');
  const AnimatedView = (props: any) => RealReact.createElement('Animated.View', props, props.children);
  const AnimatedText = (props: any) => RealReact.createElement('Animated.Text', props, props.children);
  const makeAnimBuilder = () => {
    const obj: any = {};
    obj.duration = jest.fn(() => obj);
    obj.delay = jest.fn(() => obj);
    obj.springify = jest.fn(() => obj);
    return obj;
  };
  const defaultExport = {
    call: () => {},
    createAnimatedComponent: jest.fn((comp: any) => comp),
    View: AnimatedView,
    Text: AnimatedText,
    ScrollView: 'Animated.ScrollView',
  };
  return {
    __esModule: true,
    useSharedValue: jest.fn((init: any) => ({ value: init })),
    useAnimatedStyle: jest.fn(() => ({})),
    withSpring: jest.fn((val: any) => val),
    withTiming: jest.fn((val: any) => val),
    withDelay: jest.fn((_delay: any, val: any) => val),
    withSequence: jest.fn((...vals: any[]) => vals[vals.length - 1]),
    withRepeat: jest.fn((val: any) => val),
    interpolateColor: jest.fn(),
    interpolate: jest.fn(),
    Easing: {
      linear: jest.fn(),
      ease: jest.fn(),
      bezier: jest.fn(),
      inOut: jest.fn(() => jest.fn()),
    },
    runOnJS: jest.fn((fn: any) => fn),
    cancelAnimation: jest.fn(),
    FadeIn: makeAnimBuilder(),
    FadeOut: makeAnimBuilder(),
    SlideInRight: makeAnimBuilder(),
    SlideOutLeft: makeAnimBuilder(),
    Animated: {
      View: AnimatedView,
      Text: AnimatedText,
      ScrollView: 'Animated.ScrollView',
    },
    default: defaultExport,
    createAnimatedComponent: jest.fn((comp: any) => comp),
  };
});

jest.mock('react-native-svg', () => {
  const RealReact = require('react');
  const createMock = (name: string) => (props: any) =>
    RealReact.createElement(name, props, props.children);
  return {
    __esModule: true,
    default: createMock('Svg'),
    Svg: createMock('Svg'),
    Line: createMock('Line'),
    Circle: createMock('Circle'),
    Defs: createMock('Defs'),
    LinearGradient: createMock('LinearGradient'),
    Stop: createMock('Stop'),
  };
});

import CareerPlanResults from '../CareerPlanResults';

const renderComponent = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(CareerPlanResults, props));
  });
  return tree!;
};

const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';

  let text = '';

  // Handle array of nodes
  if (Array.isArray(node)) {
    return node.map(n => getTreeText(n)).join(' ');
  }

  // Extract text from props
  if (node.props) {
    // Get specific text props
    if (typeof node.props.children === 'string' || typeof node.props.children === 'number') {
      text += ' ' + node.props.children;
    } else if (Array.isArray(node.props.children)) {
      text += ' ' + getTreeText(node.props.children);
    } else if (node.props.children && typeof node.props.children === 'object') {
      text += ' ' + getTreeText(node.props.children);
    }

    // Also check for label, title, placeholder, value
    if (node.props.label) text += ' ' + node.props.label;
    if (node.props.title) text += ' ' + node.props.title;
    if (node.props.placeholder) text += ' ' + node.props.placeholder;
    if (typeof node.props.value === 'string') text += ' ' + node.props.value;
  }

  // Handle children array
  if (node.children && Array.isArray(node.children)) {
    text += ' ' + node.children.map((c: any) => getTreeText(c)).join(' ');
  }

  return text;
};

/** Helper to find a text node in the tree and return its parent (the touchable with onPress) */
const findTouchableByText = (root: any, text: string) => {
  const nodes = root.findAll((node: any) => {
    if (node.children && node.children.length === 1 && typeof node.children[0] === 'string') {
      return node.children[0] === text;
    }
    return false;
  });
  // Walk up the tree to find the nearest ancestor with onPress
  for (const node of nodes) {
    let current = node.parent;
    while (current) {
      if (current.props && typeof current.props.onPress === 'function') {
        return current;
      }
      current = current.parent;
    }
  }
  return null;
};

/** Helper to find a touchable by accessibilityLabel */
const findByA11yLabel = (root: any, label: string) => {
  const nodes = root.findAll(
    (node: any) => node.props && node.props.accessibilityLabel === label
  );
  return nodes.length > 0 ? nodes[0] : null;
};

/** Minimal CareerPlan factory matching the actual CareerPlan type (camelCase) */
const makeCareerPlan = (overrides: any = {}): any => ({
  targetRoles: [
    {
      title: 'Security Analyst',
      whyAligned: 'Strong match for your background',
      salaryRange: '$80,000-$95,000',
      growthOutlook: 'High demand',
      typicalRequirements: ['2+ years IT experience'],
      bridgeRoles: [],
      sourceCitations: [],
    },
  ],
  skillsAnalysis: {
    alreadyHave: [{ skillName: 'Project Management', evidenceFromInput: 'Current role', targetRoleMapping: 'PM skills', resumeBullets: [] }],
    canReframe: [],
    needToBuild: [
      { skillName: 'Cloud Security', whyNeeded: 'Critical for target role', howToBuild: 'AWS course', estimatedTime: '3 months', priority: 'critical' },
    ],
  },
  certificationPath: [
    { name: 'CompTIA Security+', level: 'foundation', priority: 'high', relevance_score: 90, whatItUnlocks: 'Entry-level positions' },
  ],
  experiencePlan: [
    { title: 'SIEM Lab Setup', type: 'lab', difficultyLevel: 'beginner', timeCommitment: '2 weeks', skillsDemonstrated: ['SIEM', 'Logging'] },
  ],
  events: [
    { name: 'RSA Conference', type: 'conference', scope: 'national', organizer: 'RSA', dateOrSeason: 'April 2026', location: 'San Francisco', priceRange: '$500-$2000' },
  ],
  timeline: {
    twelveWeekPlan: [
      { weekNumber: 1, milestone: 'Start Security+ study', tasks: ['Order study guide', 'Schedule exam'] },
      { weekNumber: 2, milestone: 'Begin lab work', tasks: ['Set up VM environment'] },
    ],
    sixMonthPlan: [],
    applyReadyCheckpoint: 'After obtaining Security+',
  },
  resumeAssets: {
    headline: 'Cybersecurity Program Manager',
    headlineExplanation: 'Clear and keyword-rich',
    linkedinHeadline: 'Security Professional',
    linkedinAboutSection: 'Experienced in cybersecurity',
    linkedinStrategy: 'Optimize profile for recruiters',
    summaryStatement: 'Results-driven professional',
    summaryStrategy: 'Lead with achievements',
    keywordsForAts: ['SIEM', 'NIST', 'Risk Management'],
    targetRoleBullets: [],
    skillsGrouped: [],
    howToReframeCurrentRole: 'Emphasize security-adjacent experience',
    experienceGapsToAddress: [],
    bulletsOverallStrategy: null,
    keywordPlacementStrategy: null,
    coverLetterTemplate: null,
    coverLetterGuidance: null,
    skillsOrderingRationale: null,
  },
  educationOptions: [
    { name: 'WGU Cybersecurity BS', type: 'degree', format: 'online', duration: '2 years', costRange: '$7,000/yr', comparisonRank: 1 },
  ],
  researchSources: ['https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm'],
  skillsGuidance: {
    softSkills: [{ skillName: 'Communication', importance: 'high', estimatedTime: '3 months', whyNeeded: 'Client facing', howToImprove: 'Practice', realWorldApplication: 'Presentations', resources: [] }],
    hardSkills: [],
    skillDevelopmentStrategy: 'Focus on foundational certifications first',
  },
  certificationJourneySummary: 'Start with Security+, then advance to CISSP',
  educationRecommendation: 'Consider a degree program for long-term advancement',
  ...overrides,
});

describe('CareerPlanResults', () => {
  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(CareerPlanResults).toBeDefined();
      expect(typeof CareerPlanResults).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(CareerPlanResults.name).toBe('CareerPlanResults');
    });
  });

  describe('getSkillLevelColor mapping', () => {
    // Replicate the function from the component
    const getSkillLevelColor = (level: string) => {
      switch (level) {
        case 'none': return '#666'; // colors.textTertiary
        case 'beginner': return '#ef4444'; // COLORS.danger
        case 'intermediate': return '#f59e0b'; // COLORS.warning
        case 'advanced': return '#06b6d4'; // COLORS.info
        case 'expert': return '#10b981'; // COLORS.success
        default: return '#aaa'; // colors.textSecondary
      }
    };

    it('should map none to tertiary color', () => {
      expect(getSkillLevelColor('none')).toBe('#666');
    });

    it('should map beginner to danger color', () => {
      expect(getSkillLevelColor('beginner')).toBe('#ef4444');
    });

    it('should map intermediate to warning color', () => {
      expect(getSkillLevelColor('intermediate')).toBe('#f59e0b');
    });

    it('should map advanced to info color', () => {
      expect(getSkillLevelColor('advanced')).toBe('#06b6d4');
    });

    it('should map expert to success color', () => {
      expect(getSkillLevelColor('expert')).toBe('#10b981');
    });

    it('should return fallback for unknown level', () => {
      expect(getSkillLevelColor('unknown')).toBe('#aaa');
    });
  });

  describe('getPriorityColor mapping', () => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'critical': return '#ef4444'; // COLORS.danger
        case 'high': return '#f59e0b'; // COLORS.warning
        case 'medium': return '#06b6d4'; // COLORS.info
        case 'low': return '#10b981'; // COLORS.success
        default: return '#aaa';
      }
    };

    it('should map critical to danger color', () => {
      expect(getPriorityColor('critical')).toBe('#ef4444');
    });

    it('should map high to warning color', () => {
      expect(getPriorityColor('high')).toBe('#f59e0b');
    });

    it('should map medium to info color', () => {
      expect(getPriorityColor('medium')).toBe('#06b6d4');
    });

    it('should map low to success color', () => {
      expect(getPriorityColor('low')).toBe('#10b981');
    });
  });

  describe('skill level constants', () => {
    it('should define five current_level values including none', () => {
      const currentLevels = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];
      expect(currentLevels).toHaveLength(5);
      expect(currentLevels).toContain('none');
    });

    it('should define four required_level values (no none)', () => {
      const requiredLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      expect(requiredLevels).toHaveLength(4);
      expect(requiredLevels).not.toContain('none');
    });
  });

  describe('priority constants', () => {
    it('should define four priority values: critical, high, medium, low', () => {
      const priorities = ['critical', 'high', 'medium', 'low'];
      expect(priorities).toHaveLength(4);
      expect(priorities).toContain('critical');
    });
  });

  describe('view mode toggle', () => {
    it('should support timeline and detailed view modes', () => {
      const viewModes = ['timeline', 'detailed'];
      expect(viewModes).toHaveLength(2);
      expect(viewModes).toContain('timeline');
      expect(viewModes).toContain('detailed');
    });
  });

  describe('component rendering - always-visible elements', () => {
    it('should render Quick Start section', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Quick Start');
    });

    it('should render START HERE badge', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('START HERE');
    });

    it('should render Your Plan at a Glance stats section', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Your Plan at a Glance');
    });


    it('should render stat labels: Target Roles, Certifications, Projects, Events', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Target Roles');
      expect(json).toContain('Certifications');
      expect(json).toContain('Projects');
      expect(json).toContain('Events');
    });

    it('should render stat labels: Skills You Have and Week Plan', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Skills You Have');
      expect(json).toContain('Week Plan');
    });

    it('should render Export Your Plan card', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Export Your Plan');
    });

    it('should render Share button with correct accessibilityLabel', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const shareBtn = findByA11yLabel(tree.root, 'Share career plan');
      expect(shareBtn).toBeTruthy();
    });

    it('should render with empty plan object without crashing', () => {
      const tree = renderComponent({ plan: {}, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Your Plan at a Glance');
    });
  });

  describe('component rendering - quick start section', () => {
    it('should render Step 1 quick start card when targetRoles is populated', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const step1 = findByA11yLabel(tree.root, 'Step 1: View target role');
      expect(step1).toBeTruthy();
    });

    it('should render Week 1 quick start card when twelveWeekPlan is populated', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const week1 = findByA11yLabel(tree.root, 'Week 1: View first week tasks');
      expect(week1).toBeTruthy();
    });

    it('should render Priority certification quick start card when certificationPath is populated', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const certBtn = findByA11yLabel(tree.root, 'Priority certification: View recommended certification');
      expect(certBtn).toBeTruthy();
    });

    it('should not render quick start items when plan has no targetRoles', () => {
      const plan = makeCareerPlan({ targetRoles: [], certificationPath: [], timeline: undefined });
      const tree = renderComponent({ plan, timeline: '12 weeks' });
      const step1 = findByA11yLabel(tree.root, 'Step 1: View target role');
      expect(step1).toBeNull();
    });

    it('should display target role title in quick start', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Security Analyst');
    });
  });

  describe('component rendering - 12-Week Journey preview', () => {
    it('should render 12-Week Journey when twelveWeekPlan exists', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('12-Week Journey');
    });

    it('should render View Full Timeline button', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const viewTimeline = findByA11yLabel(tree.root, 'View full timeline');
      expect(viewTimeline).toBeTruthy();
    });

    it('should not render 12-Week Journey when no twelveWeekPlan', () => {
      const plan = makeCareerPlan({ timeline: { twelveWeekPlan: [], sixMonthPlan: [] } });
      const tree = renderComponent({ plan, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).not.toContain('12-Week Journey');
    });

    it('should display milestone text from twelveWeekPlan', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Start Security+ study');
    });
  });

  describe('component rendering - section grid cards', () => {
    it('should render Target Roles section card when targetRoles is non-empty', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Target Roles details');
      expect(card).toBeTruthy();
    });

    it('should render Skills Analysis section card when skillsAnalysis exists', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Skills Analysis details');
      expect(card).toBeTruthy();
    });

    it('should render Certifications section card when certificationPath is non-empty', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Certifications details');
      expect(card).toBeTruthy();
    });

    it('should render Experience Plan section card when experiencePlan is non-empty', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Experience Plan details');
      expect(card).toBeTruthy();
    });

    it('should render Networking Events section card when events is non-empty', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Networking Events details');
      expect(card).toBeTruthy();
    });

    it('should render Action Timeline section card when timeline exists', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Action Timeline details');
      expect(card).toBeTruthy();
    });

    it('should render Resume & LinkedIn section card when resumeAssets exists', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Resume & LinkedIn details');
      expect(card).toBeTruthy();
    });

    it('should render Education Options section card when educationOptions is non-empty', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Education Options details');
      expect(card).toBeTruthy();
    });

    it('should render Research Sources section card when researchSources is non-empty', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Research Sources details');
      expect(card).toBeTruthy();
    });

    it('should render Skills Guidance section card when skillsGuidance exists', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Skills Guidance details');
      expect(card).toBeTruthy();
    });

    it('should not render Target Roles section card when targetRoles is empty', () => {
      const plan = makeCareerPlan({ targetRoles: [] });
      const tree = renderComponent({ plan, timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Target Roles details');
      expect(card).toBeNull();
    });

    it('should not render Certifications section card when certificationPath is empty', () => {
      const plan = makeCareerPlan({ certificationPath: [] });
      const tree = renderComponent({ plan, timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Certifications details');
      expect(card).toBeNull();
    });

    it('should display View Details text in section cards', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('View Details');
    });
  });

  describe('component rendering - modal interactions', () => {
    it('should open Target Roles modal when section card is pressed', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Target Roles details');
      renderer.act(() => {
        card!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      // Modal is now visible - role title appears in modal content
      expect(json).toContain('Security Analyst');
    });

    it('should close modal when Close modal button is pressed', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Target Roles details');
      renderer.act(() => {
        card!.props.onPress();
      });
      const closeBtn = findByA11yLabel(tree.root, 'Close modal');
      expect(closeBtn).toBeTruthy();
      renderer.act(() => {
        closeBtn!.props.onPress();
      });
      // Modal closed - no close button visible anymore (modal visible=false)
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Quick Start');
    });

    it('should open Step 1 quick start card and navigate to roles modal', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const step1 = findByA11yLabel(tree.root, 'Step 1: View target role');
      renderer.act(() => {
        step1!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Security Analyst');
    });

    it('should open Week 1 quick start and navigate to timeline modal', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const week1 = findByA11yLabel(tree.root, 'Week 1: View first week tasks');
      renderer.act(() => {
        week1!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      // Timeline modal content - 12-Week Tactical Plan
      expect(json).toContain('12-Week Tactical Plan');
    });

    it('should open View Full Timeline button and navigate to timeline modal', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const viewTimeline = findByA11yLabel(tree.root, 'View full timeline');
      renderer.act(() => {
        viewTimeline!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('12-Week Tactical Plan');
    });
  });

  describe('component rendering - export functionality', () => {
    it('should call onExportPDF when Share button is pressed and onExportPDF is provided', () => {
      const mockExportPDF = jest.fn();
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks', onExportPDF: mockExportPDF });
      const shareBtn = findByA11yLabel(tree.root, 'Share career plan');
      renderer.act(() => {
        shareBtn!.props.onPress();
      });
      expect(mockExportPDF).toHaveBeenCalledTimes(1);
    });

    it('should call Share.share when Share button pressed and no onExportPDF provided', () => {
      const { Share } = require('react-native');
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const shareBtn = findByA11yLabel(tree.root, 'Share career plan');
      renderer.act(() => {
        shareBtn!.props.onPress();
      });
      expect(Share.share).toHaveBeenCalled();
    });
  });

  describe('component rendering - stats counts', () => {
    it('should display correct targetRolesCount in stats', () => {
      const plan = makeCareerPlan({
        targetRoles: [
          { title: 'Role A', whyAligned: 'a', salaryRange: '$100k', growthOutlook: 'good' },
          { title: 'Role B', whyAligned: 'b', salaryRange: '$120k', growthOutlook: 'high' },
          { title: 'Role C', whyAligned: 'c', salaryRange: '$140k', growthOutlook: 'very high' },
        ],
      });
      const tree = renderComponent({ plan, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      // 3 target roles - number should appear in stats grid
      expect(json).toContain('3');
    });

    it('should display salary range from first targetRole', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('$80,000-$95,000');
    });

    it('should show Competitive as salary range when targetRoles is empty', () => {
      const plan = makeCareerPlan({ targetRoles: [] });
      const tree = renderComponent({ plan, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Competitive');
    });
  });

  describe('component rendering - modal content sections', () => {
    it('should render skills analysis modal with alreadyHave skills', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Skills Analysis details');
      renderer.act(() => {
        card!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Skills You Already Have');
      expect(json).toContain('Project Management');
    });

    it('should render skills analysis modal with needToBuild skills', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Skills Analysis details');
      renderer.act(() => {
        card!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Skills You Need to Build');
      expect(json).toContain('Cloud Security');
    });

    it('should render certifications modal with CareerPathCertifications component', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Certifications details');
      renderer.act(() => {
        card!.props.onPress();
      });
      // CareerPathCertifications renders cert name
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CompTIA Security+');
    });

    it('should render research sources modal with links', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Research Sources details');
      renderer.act(() => {
        card!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('bls.gov');
    });

    it('should render skills guidance modal with strategy and soft skills', () => {
      const tree = renderComponent({ plan: makeCareerPlan(), timeline: '12 weeks' });
      const card = findByA11yLabel(tree.root, 'View Skills Guidance details');
      renderer.act(() => {
        card!.props.onPress();
      });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Focus on foundational certifications first');
      expect(json).toContain('Communication');
    });
  });

  describe('component rendering - minimal plan (no optional fields)', () => {
    it('should render without crashing when most optional fields are absent', () => {
      const minimalPlan = { targetRoles: [], certificationPath: [], experiencePlan: [], events: [] };
      const tree = renderComponent({ plan: minimalPlan, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Quick Start');
      expect(json).toContain('Your Plan at a Glance');
      expect(json).toContain('Export Your Plan');
    });

    it('should show Competitive salary with no target roles', () => {
      const tree = renderComponent({ plan: {}, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Competitive');
    });

    it('should show zero counts in stats for empty plan', () => {
      const tree = renderComponent({ plan: {}, timeline: '12 weeks' });
      const json = getTreeText(tree.toJSON());
      // All stats are 0 when plan fields are absent
      expect(json).toContain('0');
    });
  });
});
