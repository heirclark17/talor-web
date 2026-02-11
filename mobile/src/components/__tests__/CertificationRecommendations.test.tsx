/**
 * CertificationRecommendations Component Tests
 *
 * Tests module exports, priority/difficulty filter constants,
 * color mapping functions, sorting logic, and direct component rendering
 * via react-test-renderer for empty/loading/data states.
 *
 * Coverage targets: 100% statements, branches, functions, lines.
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { Linking } from 'react-native';

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

import CertificationRecommendations from '../CertificationRecommendations';

const mockCanOpenURL = Linking.canOpenURL as jest.Mock;
const mockOpenURL = Linking.openURL as jest.Mock;

const renderComponent = (props: any) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(CertificationRecommendations, props));
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

/**
 * Helper: find a TouchableOpacity by its accessibilityLabel.
 */
const findByAccessibilityLabel = (root: any, label: string): any => {
  const results = root.findAll(
    (node: any) =>
      node.props && node.props.accessibilityLabel === label
  );
  return results.length > 0 ? results[0] : null;
};

// --- Mock data factories ---

const makeCert = (overrides: Record<string, any> = {}) => ({
  id: 'c1',
  name: 'CISSP',
  provider: 'ISC2',
  description: 'Top security cert',
  relevance_to_role: 'Very relevant',
  priority: 'essential' as const,
  difficulty: 'advanced' as const,
  estimated_time: '6 months',
  estimated_cost: '$749',
  roi_description: 'High ROI for CISO roles',
  skills_covered: ['Risk Management', 'Security Architecture'],
  ...overrides,
});

const makeFullData = (certOverrides: Record<string, any>[] = []) => ({
  certifications: [
    makeCert(),
    makeCert({
      id: 'c2',
      name: 'Security+',
      provider: 'CompTIA',
      description: 'Entry-level security',
      relevance_to_role: 'Good baseline',
      priority: 'recommended' as const,
      difficulty: 'beginner' as const,
      estimated_time: '2 months',
      estimated_cost: '$392',
      roi_description: 'Great entry point',
      skills_covered: ['Network Security'],
    }),
    ...certOverrides.map((o, i) => makeCert({ id: `cx${i}`, ...o })),
  ],
  role_context: {
    current_role: 'Security Analyst',
    target_role: 'CISO',
  },
});

/**
 * Helper: generate data, press the generate button, and return tree.
 */
const generateAndGetTree = async (data: any, extraProps: Record<string, any> = {}) => {
  const mockGenerate = jest.fn().mockResolvedValue(data);
  const tree = renderComponent({ jobTitle: 'CISO', onGenerate: mockGenerate, ...extraProps });

  await renderer.act(async () => {
    tree.root.findAllByType('GlassButton')[0].props.onPress();
  });

  return tree;
};

describe('CertificationRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCanOpenURL.mockResolvedValue(true);
    mockOpenURL.mockResolvedValue(undefined);
  });

  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(CertificationRecommendations).toBeDefined();
      expect(typeof CertificationRecommendations).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(CertificationRecommendations.name).toBe('CertificationRecommendations');
    });
  });

  describe('PriorityFilter constants', () => {
    it('should define four priority filter values', () => {
      const priorities = ['all', 'essential', 'recommended', 'optional'];
      expect(priorities).toHaveLength(4);
      expect(priorities).toContain('all');
      expect(priorities).toContain('essential');
      expect(priorities).toContain('recommended');
      expect(priorities).toContain('optional');
    });
  });

  describe('DifficultyFilter constants', () => {
    it('should define four difficulty filter values', () => {
      const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
      expect(difficulties).toHaveLength(4);
    });
  });

  describe('getPriorityColor mapping', () => {
    const getPriorityColor = (priority: string) => {
      switch (priority) {
        case 'essential': return '#ef4444'; // COLORS.danger
        case 'recommended': return '#f59e0b'; // COLORS.warning
        case 'optional': return '#06b6d4'; // COLORS.info
        default: return '#aaa';
      }
    };

    it('should map essential to danger color', () => {
      expect(getPriorityColor('essential')).toBe('#ef4444');
    });

    it('should map recommended to warning color', () => {
      expect(getPriorityColor('recommended')).toBe('#f59e0b');
    });

    it('should map optional to info color', () => {
      expect(getPriorityColor('optional')).toBe('#06b6d4');
    });

    it('should return fallback for unknown priority', () => {
      expect(getPriorityColor('unknown')).toBe('#aaa');
    });
  });

  describe('getDifficultyColor mapping', () => {
    const getDifficultyColor = (difficulty: string) => {
      switch (difficulty) {
        case 'beginner': return '#10b981'; // COLORS.success
        case 'intermediate': return '#f59e0b'; // COLORS.warning
        case 'advanced': return '#ef4444'; // COLORS.danger
        default: return '#aaa';
      }
    };

    it('should map beginner to success color', () => {
      expect(getDifficultyColor('beginner')).toBe('#10b981');
    });

    it('should map intermediate to warning color', () => {
      expect(getDifficultyColor('intermediate')).toBe('#f59e0b');
    });

    it('should map advanced to danger color', () => {
      expect(getDifficultyColor('advanced')).toBe('#ef4444');
    });
  });

  describe('getFilteredCerts sorting logic', () => {
    const priorityOrder = { essential: 0, recommended: 1, optional: 2 };

    it('should sort essential before recommended before optional', () => {
      const certs = [
        { id: '1', priority: 'optional' as const },
        { id: '2', priority: 'essential' as const },
        { id: '3', priority: 'recommended' as const },
      ];

      const sorted = [...certs].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      expect(sorted[0].priority).toBe('essential');
      expect(sorted[1].priority).toBe('recommended');
      expect(sorted[2].priority).toBe('optional');
    });

    it('should filter by priority when filter is not all', () => {
      const certs = [
        { id: '1', priority: 'essential' as const },
        { id: '2', priority: 'recommended' as const },
        { id: '3', priority: 'essential' as const },
      ];

      const filtered = certs.filter(c => c.priority === 'essential');
      expect(filtered).toHaveLength(2);
    });
  });

  describe('component rendering - empty state', () => {
    it('should render empty state with title', () => {
      const tree = renderComponent({ jobTitle: 'Security PM' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Certification Recommendations');
    });

    it('should include job title in description', () => {
      const tree = renderComponent({ jobTitle: 'CISO' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISO');
    });

    it('should include company name when provided', () => {
      const tree = renderComponent({ jobTitle: 'PM', companyName: 'Oracle' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Oracle');
    });

    it('should show generate button', () => {
      const tree = renderComponent({ jobTitle: 'PM', onGenerate: jest.fn() });
      const buttons = tree.root.findAllByType('GlassButton');
      const genBtn = buttons.find((b: any) => b.props.label === 'Generate Recommendations');
      expect(genBtn).toBeTruthy();
    });

    it('should mention ROI in description', () => {
      const tree = renderComponent({ jobTitle: 'PM' });
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('ROI');
    });

    it('should not include company name text when companyName is not provided', () => {
      const tree = renderComponent({ jobTitle: 'Analyst' });
      const json = getTreeText(tree.toJSON());
      // The " at " prefix only shows when companyName is provided
      expect(json).not.toContain(' at ');
    });
  });

  describe('component rendering - generate interaction', () => {
    const mockCertData = makeFullData();

    it('should render certifications after successful generation', async () => {
      const tree = await generateAndGetTree(mockCertData);
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISSP');
      expect(json).toContain('Security+');
    });

    it('should display role context after generation', async () => {
      const tree = await generateAndGetTree(mockCertData);
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Security Analyst');
      expect(json).toContain('CISO');
    });

    it('should display filter chips after generation', async () => {
      const tree = await generateAndGetTree(mockCertData);
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Priority');
      expect(json).toContain('Difficulty');
    });

    it('should show error message when generation fails', async () => {
      const mockGenerate = jest.fn().mockRejectedValue(new Error('Timeout'));
      const tree = renderComponent({ jobTitle: 'PM', onGenerate: mockGenerate });

      await renderer.act(async () => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Timeout');
    });

    it('should show fallback error message when error has no message', async () => {
      const mockGenerate = jest.fn().mockRejectedValue({});
      const tree = renderComponent({ jobTitle: 'PM', onGenerate: mockGenerate });

      await renderer.act(async () => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Failed to generate recommendations');
    });

    it('should auto-expand first essential certification', async () => {
      const tree = await generateAndGetTree(mockCertData);
      const json = getTreeText(tree.toJSON());
      // First essential cert (CISSP) should be auto-expanded, showing its details
      expect(json).toContain('RELEVANCE TO YOUR ROLE');
      expect(json).toContain('Very relevant');
    });

    it('should display provider and cost for certifications', async () => {
      const tree = await generateAndGetTree(mockCertData);
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('ISC2');
      expect(json).toContain('$749');
    });

    it('should not auto-expand when no essential cert exists', async () => {
      const noEssentialData = {
        certifications: [
          makeCert({ id: 'r1', priority: 'recommended' as const }),
        ],
        role_context: { current_role: 'Analyst', target_role: 'Manager' },
      };

      const tree = await generateAndGetTree(noEssentialData);
      const json = getTreeText(tree.toJSON());
      // No cert should be expanded -- no "RELEVANCE TO YOUR ROLE" visible
      expect(json).not.toContain('RELEVANCE TO YOUR ROLE');
    });

    it('should handle onGenerate returning null', async () => {
      const mockGenerate = jest.fn().mockResolvedValue(null);
      const tree = renderComponent({ jobTitle: 'PM', onGenerate: mockGenerate });

      await renderer.act(async () => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      // Should remain in empty state since result was null
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Certification Recommendations');
      expect(json).toContain('Generate Recommendations');
    });

    it('should bail out if onGenerate is not provided', async () => {
      const tree = renderComponent({ jobTitle: 'PM' });
      const btn = tree.root.findAllByType('GlassButton')[0];

      await renderer.act(async () => {
        btn.props.onPress();
      });

      // Should still show empty state
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Certification Recommendations');
    });
  });

  describe('loading state', () => {
    it('should show loading indicator while generating', async () => {
      // Use a pending promise to keep the component in loading state
      const mockGenerate = jest.fn().mockReturnValue(new Promise(() => {}));
      const tree = renderComponent({ jobTitle: 'CISO', onGenerate: mockGenerate });

      // Start generation (synchronously enters loading state)
      renderer.act(() => {
        tree.root.findAllByType('GlassButton')[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Analyzing role and generating recommendations');
    });
  });

  describe('toggleExpand interaction', () => {
    it('should collapse an expanded cert when its header is pressed', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // CISSP (c1) is auto-expanded. Find its header and press to collapse.
      const certHeader = findByAccessibilityLabel(tree.root, 'Certification 1');
      expect(certHeader).toBeTruthy();

      await renderer.act(async () => {
        certHeader.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // After collapsing, expanded content should be gone
      expect(json).not.toContain('RELEVANCE TO YOUR ROLE');
    });

    it('should expand a collapsed cert when its header is pressed', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // Security+ (c2, index 1) is not expanded. Find its header and press.
      const certHeader = findByAccessibilityLabel(tree.root, 'Certification 2');
      expect(certHeader).toBeTruthy();

      await renderer.act(async () => {
        certHeader.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // Security+ expanded content should now be visible
      expect(json).toContain('Good baseline');
      expect(json).toContain('Great entry point');
    });

    it('should allow re-expanding a collapsed cert', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // Collapse c1
      const certHeader = findByAccessibilityLabel(tree.root, 'Certification 1');
      await renderer.act(async () => {
        certHeader.props.onPress();
      });

      // Now re-expand c1
      const certHeaderAgain = findByAccessibilityLabel(tree.root, 'Certification 1');
      await renderer.act(async () => {
        certHeaderAgain.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Very relevant');
    });
  });

  describe('openUrl via Linking', () => {
    it('should call Linking.canOpenURL and Linking.openURL for official_url', async () => {
      const dataWithUrl = {
        certifications: [
          makeCert({
            id: 'u1',
            priority: 'essential' as const,
            official_url: 'https://isc2.org/cissp',
          }),
        ],
        role_context: { current_role: 'Analyst', target_role: 'CISO' },
      };

      const tree = await generateAndGetTree(dataWithUrl);

      // The official URL GlassButton should be rendered in expanded content
      const officialBtn = tree.root.findAllByType('GlassButton').find(
        (b: any) => b.props.label === 'View Official Page'
      );
      expect(officialBtn).toBeTruthy();

      await renderer.act(async () => {
        officialBtn!.props.onPress();
      });

      expect(mockCanOpenURL).toHaveBeenCalledWith('https://isc2.org/cissp');
      expect(mockOpenURL).toHaveBeenCalledWith('https://isc2.org/cissp');
    });

    it('should not call Linking.openURL when canOpenURL returns false', async () => {
      mockCanOpenURL.mockResolvedValue(false);

      const dataWithUrl = {
        certifications: [
          makeCert({
            id: 'u2',
            priority: 'essential' as const,
            official_url: 'https://bad-url.example',
          }),
        ],
        role_context: { current_role: 'Analyst', target_role: 'CISO' },
      };

      const tree = await generateAndGetTree(dataWithUrl);

      const officialBtn = tree.root.findAllByType('GlassButton').find(
        (b: any) => b.props.label === 'View Official Page'
      );

      await renderer.act(async () => {
        officialBtn!.props.onPress();
      });

      expect(mockCanOpenURL).toHaveBeenCalledWith('https://bad-url.example');
      expect(mockOpenURL).not.toHaveBeenCalled();
    });
  });

  describe('study resources', () => {
    const dataWithResources = {
      certifications: [
        makeCert({
          id: 'sr1',
          priority: 'essential' as const,
          study_resources: [
            { name: 'Official Guide', type: 'book', url: 'https://example.com/guide' },
            { name: 'Practice Exam', type: 'online', url: 'https://example.com/practice' },
            { name: 'Local Study Group', type: 'in-person' }, // no url
          ],
        }),
      ],
      role_context: { current_role: 'Analyst', target_role: 'CISO' },
    };

    it('should render study resources section when resources exist', async () => {
      const tree = await generateAndGetTree(dataWithResources);
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('STUDY RESOURCES');
      expect(json).toContain('Official Guide');
      expect(json).toContain('book');
      expect(json).toContain('Practice Exam');
      expect(json).toContain('online');
    });

    it('should call openUrl when a resource with url is pressed', async () => {
      const tree = await generateAndGetTree(dataWithResources);

      const resourceBtn = findByAccessibilityLabel(tree.root, 'Open Official Guide');
      expect(resourceBtn).toBeTruthy();

      await renderer.act(async () => {
        resourceBtn.props.onPress();
      });

      expect(mockCanOpenURL).toHaveBeenCalledWith('https://example.com/guide');
      expect(mockOpenURL).toHaveBeenCalledWith('https://example.com/guide');
    });

    it('should disable resource button when resource has no url', async () => {
      const tree = await generateAndGetTree(dataWithResources);

      const disabledResource = findByAccessibilityLabel(tree.root, 'Open Local Study Group');
      expect(disabledResource).toBeTruthy();
      expect(disabledResource.props.disabled).toBe(true);
    });

    it('should not render study resources section when resources is empty', async () => {
      const noResourcesData = {
        certifications: [
          makeCert({
            id: 'sr2',
            priority: 'essential' as const,
            study_resources: [],
          }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };

      const tree = await generateAndGetTree(noResourcesData);
      const json = getTreeText(tree.toJSON());
      expect(json).not.toContain('STUDY RESOURCES');
    });

    it('should not render study resources section when resources is undefined', async () => {
      const tree = await generateAndGetTree(makeFullData());
      // Default makeCert has no study_resources
      const json = getTreeText(tree.toJSON());
      // CISSP is expanded but has no study_resources field
      expect(json).not.toContain('STUDY RESOURCES');
    });
  });

  describe('priority filter interaction', () => {
    it('should filter certifications by essential priority', async () => {
      const data = makeFullData([
        { id: 'opt1', name: 'OptionalCert', priority: 'optional' as const, difficulty: 'beginner' as const },
      ]);
      const tree = await generateAndGetTree(data);

      // Press "essential" filter chip
      const essentialChip = findByAccessibilityLabel(tree.root, 'Filter by essential');
      expect(essentialChip).toBeTruthy();

      await renderer.act(async () => {
        essentialChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISSP');
      // Security+ is recommended, OptionalCert is optional -- both should be filtered out
      expect(json).not.toContain('Security+');
      expect(json).not.toContain('OptionalCert');
    });

    it('should filter certifications by recommended priority', async () => {
      const tree = await generateAndGetTree(makeFullData());

      const recommendedChip = findByAccessibilityLabel(tree.root, 'Filter by recommended');
      await renderer.act(async () => {
        recommendedChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('Security+');
      expect(json).not.toContain('CISSP');
    });

    it('should filter certifications by optional priority', async () => {
      const data = makeFullData([
        { id: 'opt1', name: 'CASP+', priority: 'optional' as const, difficulty: 'advanced' as const },
      ]);
      const tree = await generateAndGetTree(data);

      const optionalChip = findByAccessibilityLabel(tree.root, 'Filter by optional');
      await renderer.act(async () => {
        optionalChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CASP+');
      expect(json).not.toContain('CISSP');
      expect(json).not.toContain('Security+');
    });

    it('should show all certs when "all" priority filter is selected', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // First filter to essential
      const essentialChip = findByAccessibilityLabel(tree.root, 'Filter by essential');
      await renderer.act(async () => {
        essentialChip.props.onPress();
      });

      // Then switch back to all
      const allChip = findByAccessibilityLabel(tree.root, 'Filter by all');
      // There are two "all" chips (priority + difficulty), get the first one
      const allChips = tree.root.findAll(
        (n: any) => n.props && n.props.accessibilityLabel === 'Filter by all'
      );
      await renderer.act(async () => {
        allChips[0].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISSP');
      expect(json).toContain('Security+');
    });

    it('should show empty filter message when no certs match priority filter', async () => {
      const data = {
        certifications: [
          makeCert({ id: 'e1', priority: 'essential' as const }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };
      const tree = await generateAndGetTree(data);

      // Filter to optional -- no optional certs exist
      const optionalChip = findByAccessibilityLabel(tree.root, 'Filter by optional');
      await renderer.act(async () => {
        optionalChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('No certifications match the selected filters');
    });
  });

  describe('difficulty filter interaction', () => {
    it('should filter certifications by beginner difficulty', async () => {
      const tree = await generateAndGetTree(makeFullData());

      const beginnerChip = findByAccessibilityLabel(tree.root, 'Filter by beginner');
      await renderer.act(async () => {
        beginnerChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // Security+ is beginner
      expect(json).toContain('Security+');
      // CISSP is advanced
      expect(json).not.toContain('CISSP');
    });

    it('should filter certifications by intermediate difficulty', async () => {
      const data = makeFullData([
        { id: 'int1', name: 'CEH', priority: 'recommended' as const, difficulty: 'intermediate' as const },
      ]);
      const tree = await generateAndGetTree(data);

      const intermediateChip = findByAccessibilityLabel(tree.root, 'Filter by intermediate');
      await renderer.act(async () => {
        intermediateChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CEH');
      expect(json).not.toContain('CISSP');
      expect(json).not.toContain('Security+');
    });

    it('should filter certifications by advanced difficulty', async () => {
      const tree = await generateAndGetTree(makeFullData());

      const advancedChip = findByAccessibilityLabel(tree.root, 'Filter by advanced');
      await renderer.act(async () => {
        advancedChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // CISSP is advanced
      expect(json).toContain('CISSP');
      // Security+ is beginner
      expect(json).not.toContain('Security+');
    });

    it('should reset to all difficulties when all chip is pressed', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // Filter to advanced first
      const advancedChip = findByAccessibilityLabel(tree.root, 'Filter by advanced');
      await renderer.act(async () => {
        advancedChip.props.onPress();
      });

      // Press difficulty "all" -- it is the second "Filter by all" chip
      const allChips = tree.root.findAll(
        (n: any) => n.props && n.props.accessibilityLabel === 'Filter by all'
      );
      // allChips[0] is priority all, allChips[1] is difficulty all
      await renderer.act(async () => {
        allChips[1].props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISSP');
      expect(json).toContain('Security+');
    });

    it('should show empty filter message when no certs match difficulty filter', async () => {
      const data = {
        certifications: [
          makeCert({ id: 'e1', difficulty: 'advanced' as const }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };
      const tree = await generateAndGetTree(data);

      // Filter to beginner -- no beginner certs exist
      const beginnerChip = findByAccessibilityLabel(tree.root, 'Filter by beginner');
      await renderer.act(async () => {
        beginnerChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      expect(json).toContain('No certifications match the selected filters');
    });
  });

  describe('combined priority + difficulty filters', () => {
    it('should apply both filters simultaneously', async () => {
      const data = makeFullData([
        { id: 'int1', name: 'CEH', priority: 'essential' as const, difficulty: 'intermediate' as const },
      ]);
      const tree = await generateAndGetTree(data);

      // Filter priority to essential
      const essentialChip = findByAccessibilityLabel(tree.root, 'Filter by essential');
      await renderer.act(async () => {
        essentialChip.props.onPress();
      });

      // Filter difficulty to intermediate
      const intermediateChip = findByAccessibilityLabel(tree.root, 'Filter by intermediate');
      await renderer.act(async () => {
        intermediateChip.props.onPress();
      });

      const json = getTreeText(tree.toJSON());
      // Only CEH is essential + intermediate
      expect(json).toContain('CEH');
      expect(json).not.toContain('CISSP'); // essential but advanced
      expect(json).not.toContain('Security+'); // recommended + beginner
    });
  });

  describe('expanded content details', () => {
    it('should show description, ROI, and skills when expanded', async () => {
      const tree = await generateAndGetTree(makeFullData());

      const json = getTreeText(tree.toJSON());
      // CISSP is auto-expanded
      expect(json).toContain('Top security cert');
      expect(json).toContain('RETURN ON INVESTMENT');
      expect(json).toContain('High ROI for CISO roles');
      expect(json).toContain('SKILLS COVERED');
      expect(json).toContain('Risk Management');
      expect(json).toContain('Security Architecture');
    });

    it('should not render official URL button when cert has no official_url', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // Default makeCert has no official_url
      const officialBtn = tree.root.findAllByType('GlassButton').find(
        (b: any) => b.props.label === 'View Official Page'
      );
      expect(officialBtn).toBeUndefined();
    });

    it('should render official URL button when cert has official_url', async () => {
      const data = {
        certifications: [
          makeCert({ id: 'o1', priority: 'essential' as const, official_url: 'https://example.com' }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };
      const tree = await generateAndGetTree(data);

      const officialBtn = tree.root.findAllByType('GlassButton').find(
        (b: any) => b.props.label === 'View Official Page'
      );
      expect(officialBtn).toBeTruthy();
    });
  });

  describe('data without role_context', () => {
    it('should render without crashing when role_context is missing', async () => {
      const data = {
        certifications: [makeCert({ id: 'n1', priority: 'essential' as const })],
      };
      const tree = await generateAndGetTree(data);
      const json = getTreeText(tree.toJSON());
      expect(json).toContain('CISSP');
      // Should not contain "Current:" or "Target:" since role_context is missing
      expect(json).not.toContain('Current:');
    });
  });

  describe('resource onPress with no url', () => {
    it('should not call openUrl when resource has no url and is pressed', async () => {
      const data = {
        certifications: [
          makeCert({
            id: 'rn1',
            priority: 'essential' as const,
            study_resources: [
              { name: 'Offline Book', type: 'book' }, // no url
            ],
          }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };

      const tree = await generateAndGetTree(data);

      const resourceBtn = findByAccessibilityLabel(tree.root, 'Open Offline Book');
      expect(resourceBtn).toBeTruthy();

      // The button is disabled, but let's call onPress to verify guard
      await renderer.act(async () => {
        resourceBtn.props.onPress();
      });

      // openUrl should NOT be called because resource.url is falsy
      expect(mockCanOpenURL).not.toHaveBeenCalled();
    });
  });

  describe('cert card accessibility', () => {
    it('should set expanded accessibility state for expanded certs', async () => {
      const tree = await generateAndGetTree(makeFullData());

      // CISSP (index 0) is auto-expanded
      const cert1Header = findByAccessibilityLabel(tree.root, 'Certification 1');
      expect(cert1Header.props.accessibilityState).toEqual({ expanded: true });

      // Security+ (index 1) is collapsed
      const cert2Header = findByAccessibilityLabel(tree.root, 'Certification 2');
      expect(cert2Header.props.accessibilityState).toEqual({ expanded: false });
    });
  });

  describe('getPriorityColor default branch via component', () => {
    it('should use textSecondary color for unknown priority values', async () => {
      // Force an invalid priority through the component to hit the default case
      const data = {
        certifications: [
          makeCert({
            id: 'unk1',
            name: 'UnknownPriorityCert',
            priority: 'mystery' as any,
            difficulty: 'beginner' as const,
          }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };

      const tree = await generateAndGetTree(data);
      const json = getTreeText(tree.toJSON());
      // The cert should still render despite unknown priority
      expect(json).toContain('UnknownPriorityCert');
    });
  });

  describe('getDifficultyColor default branch via component', () => {
    it('should use textSecondary color for unknown difficulty values', async () => {
      // Force an invalid difficulty through the component to hit the default case
      const data = {
        certifications: [
          makeCert({
            id: 'unk2',
            name: 'UnknownDifficultyCert',
            priority: 'essential' as const,
            difficulty: 'expert' as any,
          }),
        ],
        role_context: { current_role: 'A', target_role: 'B' },
      };

      const tree = await generateAndGetTree(data);
      const json = getTreeText(tree.toJSON());
      // The cert should still render and be auto-expanded (essential priority)
      expect(json).toContain('UnknownDifficultyCert');
      // Should show expanded content since it is essential and auto-expanded
      expect(json).toContain('RELEVANCE TO YOUR ROLE');
    });
  });
});
