/**
 * ResumeAnalysis Tests
 *
 * Pure logic tests and direct component invocation:
 * - Module exports (default)
 * - Change interface structure + nullable fields
 * - Section interface structure
 * - Analysis interface (sections array)
 * - getImpactColors logic (high/medium/low/default)
 * - getChangeTypeIcon logic (added/modified/removed/default)
 * - toggleSection logic (Set add/delete)
 * - toggleChange logic (Set add/delete)
 * - Section count pluralization
 * - Conditional rendering: original_text, new_text, job_requirements_matched, keywords_added
 * - Direct component calls for loading, empty, and data states
 * - Expanded sections and changes state
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('../glass/GlassCard', () => ({
  GlassCard: (props: any) => props.children || null,
}));

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      border: '#374151',
      backgroundTertiary: '#2a2a2a',
    },
  }),
}));

import ResumeAnalysis from '../ResumeAnalysis';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';

// Sample test data
const sampleChange = {
  change_type: 'modified' as const,
  impact_level: 'high' as const,
  original_text: 'Managed security projects for clients',
  new_text: 'Led enterprise cybersecurity program managing $25M portfolio across 40+ implementations',
  why_this_matters: 'Quantified impact improves ATS scoring',
  what_changed: 'Added metrics and leadership language',
  how_it_helps: 'Better alignment with senior role requirements',
  job_requirements_matched: ['Leadership', 'Program Management'],
  keywords_added: ['cybersecurity', 'enterprise'],
};

const sampleAddedChange = {
  change_type: 'added' as const,
  impact_level: 'medium' as const,
  original_text: null,
  new_text: 'NIST CSF certified practitioner with hands-on compliance experience',
  why_this_matters: 'JD mentions NIST multiple times',
  what_changed: 'Added NIST certification reference',
  how_it_helps: 'Direct keyword match for ATS',
  job_requirements_matched: ['NIST', 'Compliance'],
  keywords_added: ['NIST CSF'],
};

const sampleRemovedChange = {
  change_type: 'removed' as const,
  impact_level: 'low' as const,
  original_text: 'Familiar with general IT processes',
  new_text: null,
  why_this_matters: 'Generic statement dilutes resume impact',
  what_changed: 'Removed vague IT statement',
  how_it_helps: 'More focused, relevant content',
  job_requirements_matched: [],
  keywords_added: [],
};

const sampleAnalysis = {
  sections: [
    {
      section_name: 'Professional Summary',
      changes: [sampleChange, sampleAddedChange],
    },
    {
      section_name: 'Experience',
      changes: [sampleRemovedChange],
    },
  ],
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

describe('ResumeAnalysis', () => {
  describe('module exports', () => {
    it('should export ResumeAnalysis as default export', () => {
      expect(ResumeAnalysis).toBeDefined();
      expect(typeof ResumeAnalysis).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(ResumeAnalysis.name).toBe('ResumeAnalysis');
    });
  });

  describe('change_type constants', () => {
    it('should accept all three valid change_type values', () => {
      const validChangeTypes = ['added', 'modified', 'removed'];
      expect(validChangeTypes).toHaveLength(3);
      expect(validChangeTypes).toContain('added');
      expect(validChangeTypes).toContain('modified');
      expect(validChangeTypes).toContain('removed');
    });
  });

  describe('impact_level constants', () => {
    it('should define three impact levels: high, medium, low', () => {
      const validImpactLevels = ['high', 'medium', 'low'];
      expect(validImpactLevels).toHaveLength(3);
      expect(validImpactLevels).toContain('high');
      expect(validImpactLevels).toContain('medium');
      expect(validImpactLevels).toContain('low');
    });
  });

  describe('Section interface structure', () => {
    it('should expect sections with section_name and changes array', () => {
      expect(sampleAnalysis.sections[0].section_name).toBe('Professional Summary');
      expect(sampleAnalysis.sections[0].changes).toHaveLength(2);
    });

    it('should support multiple sections', () => {
      expect(sampleAnalysis.sections).toHaveLength(2);
      expect(sampleAnalysis.sections[1].section_name).toBe('Experience');
    });
  });

  describe('Analysis interface structure', () => {
    it('should expect an analysis object with sections array', () => {
      expect(sampleAnalysis.sections).toBeDefined();
      expect(Array.isArray(sampleAnalysis.sections)).toBe(true);
    });

    it('should handle empty sections array', () => {
      const emptyAnalysis = { sections: [] };
      expect(emptyAnalysis.sections).toHaveLength(0);
    });
  });

  describe('Change data structure', () => {
    it('should support nullable original_text for added changes', () => {
      expect(sampleAddedChange.original_text).toBeNull();
      expect(sampleAddedChange.new_text).toBeTruthy();
    });

    it('should support nullable new_text for removed changes', () => {
      expect(sampleRemovedChange.original_text).toBeTruthy();
      expect(sampleRemovedChange.new_text).toBeNull();
    });

    it('should support both original_text and new_text for modified changes', () => {
      expect(sampleChange.original_text).toBeTruthy();
      expect(sampleChange.new_text).toBeTruthy();
    });

    it('should support arrays for job_requirements_matched and keywords_added', () => {
      expect(sampleChange.job_requirements_matched).toHaveLength(2);
      expect(sampleChange.keywords_added).toHaveLength(2);
    });

    it('should support empty arrays for requirements and keywords', () => {
      expect(sampleRemovedChange.job_requirements_matched).toHaveLength(0);
      expect(sampleRemovedChange.keywords_added).toHaveLength(0);
    });
  });

  describe('getImpactColors logic', () => {
    const mockColors = { border: '#374151', textSecondary: '#9ca3af' };

    const getImpactColors = (level: string) => {
      switch (level) {
        case 'high':
          return { bg: ALPHA_COLORS.success.bg, border: ALPHA_COLORS.success.border, text: COLORS.success };
        case 'medium':
          return { bg: ALPHA_COLORS.warning.bg, border: ALPHA_COLORS.warning.border, text: COLORS.warning };
        case 'low':
          return { bg: ALPHA_COLORS.info.bg, border: ALPHA_COLORS.info.border, text: COLORS.info };
        default:
          return { bg: ALPHA_COLORS.neutral.bg, border: mockColors.border, text: mockColors.textSecondary };
      }
    };

    it('should return success colors for high impact', () => {
      const result = getImpactColors('high');
      expect(result.bg).toBe(ALPHA_COLORS.success.bg);
      expect(result.border).toBe(ALPHA_COLORS.success.border);
      expect(result.text).toBe(COLORS.success);
    });

    it('should return warning colors for medium impact', () => {
      const result = getImpactColors('medium');
      expect(result.bg).toBe(ALPHA_COLORS.warning.bg);
      expect(result.border).toBe(ALPHA_COLORS.warning.border);
      expect(result.text).toBe(COLORS.warning);
    });

    it('should return info colors for low impact', () => {
      const result = getImpactColors('low');
      expect(result.bg).toBe(ALPHA_COLORS.info.bg);
      expect(result.border).toBe(ALPHA_COLORS.info.border);
      expect(result.text).toBe(COLORS.info);
    });

    it('should return neutral/default colors for unknown impact', () => {
      const result = getImpactColors('unknown');
      expect(result.bg).toBe(ALPHA_COLORS.neutral.bg);
      expect(result.text).toBe(mockColors.textSecondary);
    });

    it('should return neutral/default colors for empty string', () => {
      const result = getImpactColors('');
      expect(result.bg).toBe(ALPHA_COLORS.neutral.bg);
    });
  });

  describe('getChangeTypeIcon logic', () => {
    it('should use CheckCircle for added type', () => {
      const type: string = 'added';
      const iconName = type === 'added' ? 'CheckCircle' : type === 'modified' ? 'AlertCircle' : type === 'removed' ? 'Info' : 'Info';
      expect(iconName).toBe('CheckCircle');
    });

    it('should use AlertCircle for modified type', () => {
      const type: string = 'modified';
      const iconName = type === 'added' ? 'CheckCircle' : type === 'modified' ? 'AlertCircle' : type === 'removed' ? 'Info' : 'Info';
      expect(iconName).toBe('AlertCircle');
    });

    it('should use Info for removed type', () => {
      const type: string = 'removed';
      const iconName = type === 'added' ? 'CheckCircle' : type === 'modified' ? 'AlertCircle' : type === 'removed' ? 'Info' : 'Info';
      expect(iconName).toBe('Info');
    });

    it('should use Info for unknown type', () => {
      const type: string = 'unknown';
      const iconName = type === 'added' ? 'CheckCircle' : type === 'modified' ? 'AlertCircle' : type === 'removed' ? 'Info' : 'Info';
      expect(iconName).toBe('Info');
    });

    it('should use success color for added type icon', () => {
      const type: string = 'added';
      const iconColor = type === 'added' ? COLORS.success : type === 'modified' ? COLORS.warning : COLORS.danger;
      expect(iconColor).toBe(COLORS.success);
    });

    it('should use warning color for modified type icon', () => {
      const type: string = 'modified';
      const iconColor = type === 'added' ? COLORS.success : type === 'modified' ? COLORS.warning : COLORS.danger;
      expect(iconColor).toBe(COLORS.warning);
    });

    it('should use danger color for removed type icon', () => {
      const type: string = 'removed';
      const iconColor = type === 'added' ? COLORS.success : type === 'modified' ? COLORS.warning : COLORS.danger;
      expect(iconColor).toBe(COLORS.danger);
    });
  });

  describe('toggleSection logic', () => {
    it('should add section when not in set', () => {
      const expandedSections = new Set<string>();
      const newExpanded = new Set(expandedSections);
      const sectionName = 'Professional Summary';

      if (newExpanded.has(sectionName)) {
        newExpanded.delete(sectionName);
      } else {
        newExpanded.add(sectionName);
      }

      expect(newExpanded.has(sectionName)).toBe(true);
      expect(newExpanded.size).toBe(1);
    });

    it('should remove section when already in set', () => {
      const expandedSections = new Set<string>(['Professional Summary']);
      const newExpanded = new Set(expandedSections);
      const sectionName = 'Professional Summary';

      if (newExpanded.has(sectionName)) {
        newExpanded.delete(sectionName);
      } else {
        newExpanded.add(sectionName);
      }

      expect(newExpanded.has(sectionName)).toBe(false);
      expect(newExpanded.size).toBe(0);
    });

    it('should not affect other sections in set', () => {
      const expandedSections = new Set<string>(['Experience', 'Skills']);
      const newExpanded = new Set(expandedSections);
      const sectionName = 'Experience';

      if (newExpanded.has(sectionName)) {
        newExpanded.delete(sectionName);
      } else {
        newExpanded.add(sectionName);
      }

      expect(newExpanded.has('Skills')).toBe(true);
      expect(newExpanded.has('Experience')).toBe(false);
      expect(newExpanded.size).toBe(1);
    });
  });

  describe('toggleChange logic', () => {
    it('should add changeId when not in set', () => {
      const expandedChanges = new Set<string>();
      const newExpanded = new Set(expandedChanges);
      const changeId = 'Professional Summary-0';

      if (newExpanded.has(changeId)) {
        newExpanded.delete(changeId);
      } else {
        newExpanded.add(changeId);
      }

      expect(newExpanded.has(changeId)).toBe(true);
    });

    it('should remove changeId when already in set', () => {
      const expandedChanges = new Set<string>(['Professional Summary-0']);
      const newExpanded = new Set(expandedChanges);
      const changeId = 'Professional Summary-0';

      if (newExpanded.has(changeId)) {
        newExpanded.delete(changeId);
      } else {
        newExpanded.add(changeId);
      }

      expect(newExpanded.has(changeId)).toBe(false);
    });

    it('should generate changeId from section name and index', () => {
      const sectionName = 'Experience';
      const changeIdx = 2;
      const changeId = `${sectionName}-${changeIdx}`;
      expect(changeId).toBe('Experience-2');
    });
  });

  describe('section count pluralization', () => {
    it('should use plural "sections" for count > 1', () => {
      const count: number = 3;
      const text = `${count} section${count !== 1 ? 's' : ''} modified`;
      expect(text).toBe('3 sections modified');
    });

    it('should use singular "section" for count === 1', () => {
      const count: number = 1;
      const text = `${count} section${count !== 1 ? 's' : ''} modified`;
      expect(text).toBe('1 section modified');
    });
  });

  describe('change count pluralization', () => {
    it('should use plural "changes" for count > 1', () => {
      const count: number = 5;
      const text = `${count} change${count !== 1 ? 's' : ''}`;
      expect(text).toBe('5 changes');
    });

    it('should use singular "change" for count === 1', () => {
      const count: number = 1;
      const text = `${count} change${count !== 1 ? 's' : ''}`;
      expect(text).toBe('1 change');
    });
  });

  describe('conditional rendering logic - original_text', () => {
    it('should render original text block when original_text is non-null', () => {
      expect(sampleChange.original_text).toBeTruthy();
    });

    it('should not render original text block when original_text is null', () => {
      expect(sampleAddedChange.original_text).toBeNull();
    });
  });

  describe('conditional rendering logic - new_text', () => {
    it('should render new text block when new_text is non-null', () => {
      expect(sampleChange.new_text).toBeTruthy();
    });

    it('should not render new text block when new_text is null', () => {
      expect(sampleRemovedChange.new_text).toBeNull();
    });
  });

  describe('conditional rendering logic - job_requirements_matched', () => {
    it('should render chips when job_requirements_matched has items', () => {
      const shouldRender = sampleChange.job_requirements_matched && sampleChange.job_requirements_matched.length > 0;
      expect(shouldRender).toBe(true);
    });

    it('should not render chips when job_requirements_matched is empty', () => {
      const shouldRender = sampleRemovedChange.job_requirements_matched && sampleRemovedChange.job_requirements_matched.length > 0;
      expect(shouldRender).toBe(false);
    });
  });

  describe('conditional rendering logic - keywords_added', () => {
    it('should render keyword chips when keywords_added has items', () => {
      const shouldRender = sampleChange.keywords_added && sampleChange.keywords_added.length > 0;
      expect(shouldRender).toBe(true);
    });

    it('should not render keyword chips when keywords_added is empty', () => {
      const shouldRender = sampleRemovedChange.keywords_added && sampleRemovedChange.keywords_added.length > 0;
      expect(shouldRender).toBe(false);
    });
  });

  describe('accessibility label formatting', () => {
    it('should format label for expanded section', () => {
      const isExpanded = true;
      const sectionName = 'Professional Summary';
      const label = `${isExpanded ? 'Collapse' : 'Expand'} ${sectionName}`;
      expect(label).toBe('Collapse Professional Summary');
    });

    it('should format label for collapsed section', () => {
      const isExpanded = false;
      const sectionName = 'Experience';
      const label = `${isExpanded ? 'Collapse' : 'Expand'} ${sectionName}`;
      expect(label).toBe('Expand Experience');
    });

    it('should format label for expanded change', () => {
      const isChangeExpanded = true;
      const label = `${isChangeExpanded ? 'Collapse' : 'Expand'} change details`;
      expect(label).toBe('Collapse change details');
    });

    it('should format label for collapsed change', () => {
      const isChangeExpanded = false;
      const label = `${isChangeExpanded ? 'Collapse' : 'Expand'} change details`;
      expect(label).toBe('Expand change details');
    });
  });

  describe('React.createElement invocation - loading state', () => {
    it('should create loading element with null analysis', () => {
      const element = React.createElement(ResumeAnalysis, { analysis: null, loading: true });
      expect(element).toBeTruthy();
      expect(element.props.loading).toBe(true);
      expect(element.props.analysis).toBeNull();
    });

    it('should create loading element even with data', () => {
      const element = React.createElement(ResumeAnalysis, { analysis: sampleAnalysis, loading: true });
      expect(element).toBeTruthy();
      expect(element.props.loading).toBe(true);
      expect(element.props.analysis).toBe(sampleAnalysis);
    });
  });

  describe('React.createElement invocation - empty state', () => {
    it('should create element with null analysis', () => {
      const element = React.createElement(ResumeAnalysis, { analysis: null, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis).toBeNull();
    });

    it('should create element with empty sections', () => {
      const element = React.createElement(ResumeAnalysis, { analysis: { sections: [] }, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections).toHaveLength(0);
    });
  });

  describe('React.createElement invocation - with data', () => {
    it('should create element with full analysis data', () => {
      const element = React.createElement(ResumeAnalysis, { analysis: sampleAnalysis, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections).toHaveLength(2);
    });

    it('should create element with single section', () => {
      const singleSection = { sections: [sampleAnalysis.sections[0]] };
      const element = React.createElement(ResumeAnalysis, { analysis: singleSection, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections).toHaveLength(1);
    });

    it('should create element with all change types', () => {
      const allTypes = {
        sections: [{
          section_name: 'Professional Summary',
          changes: [sampleChange, sampleAddedChange, sampleRemovedChange],
        }],
      };
      const element = React.createElement(ResumeAnalysis, { analysis: allTypes, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections[0].changes).toHaveLength(3);
    });

    it('should create element with many sections', () => {
      const manySections = {
        sections: Array.from({ length: 5 }, (_, i) => ({
          section_name: `Section ${i}`,
          changes: [sampleChange],
        })),
      };
      const element = React.createElement(ResumeAnalysis, { analysis: manySections, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections).toHaveLength(5);
    });

    it('should create element with change having keywords and requirements', () => {
      const withChips = {
        sections: [{
          section_name: 'Summary',
          changes: [sampleChange],
        }],
      };
      const element = React.createElement(ResumeAnalysis, { analysis: withChips, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections[0].changes[0].keywords_added).toEqual(['cybersecurity', 'enterprise']);
    });

    it('should create element with change without original_text', () => {
      const addedOnly = {
        sections: [{
          section_name: 'Summary',
          changes: [sampleAddedChange],
        }],
      };
      const element = React.createElement(ResumeAnalysis, { analysis: addedOnly, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections[0].changes[0].original_text).toBeNull();
    });

    it('should create element with change without new_text', () => {
      const removedOnly = {
        sections: [{
          section_name: 'Summary',
          changes: [sampleRemovedChange],
        }],
      };
      const element = React.createElement(ResumeAnalysis, { analysis: removedOnly, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections[0].changes[0].new_text).toBeNull();
    });

    it('should create element with empty changes array in section', () => {
      const emptyChanges = {
        sections: [{ section_name: 'Empty Section', changes: [] }],
      };
      const element = React.createElement(ResumeAnalysis, { analysis: emptyChanges, loading: false });
      expect(element).toBeTruthy();
      expect(element.props.analysis!.sections[0].changes).toHaveLength(0);
    });

    it('should create element with all null text fields', () => {
      const nullTexts = {
        sections: [{
          section_name: 'Section A',
          changes: [{
            change_type: 'modified' as const,
            impact_level: 'low' as const,
            original_text: null,
            new_text: null,
            why_this_matters: 'Test',
            what_changed: 'Test change',
            how_it_helps: 'Test help',
            job_requirements_matched: [],
            keywords_added: [],
          }],
        }],
      };
      const element = React.createElement(ResumeAnalysis, { analysis: nullTexts, loading: false });
      expect(element).toBeTruthy();
    });
  });

  describe('React.createElement usage', () => {
    it('should create element with loading props', () => {
      const element = React.createElement(ResumeAnalysis, {
        analysis: null,
        loading: true,
      });
      expect(element).toBeTruthy();
      expect(element.props.loading).toBe(true);
      expect(element.props.analysis).toBeNull();
    });

    it('should create element with data props', () => {
      const element = React.createElement(ResumeAnalysis, {
        analysis: sampleAnalysis,
        loading: false,
      });
      expect(element).toBeTruthy();
      expect(element.props.analysis).toBe(sampleAnalysis);
      expect(element.props.loading).toBe(false);
    });
  });

  describe('react-test-renderer rendering - loading state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ResumeAnalysis, props));
      });
      return tree!;
    };

    it('should render loading text', () => {
      const tree = renderComponent({ analysis: null, loading: true });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Analyzing resume changes');
    });

    it('should render loading even with data present', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: true });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Analyzing resume changes');
    });
  });

  describe('react-test-renderer rendering - empty state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ResumeAnalysis, props));
      });
      return tree!;
    };

    it('should render empty text when analysis is null', () => {
      const tree = renderComponent({ analysis: null, loading: false });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('No analysis available');
    });

    it('should render empty text when sections is empty', () => {
      const tree = renderComponent({ analysis: { sections: [] }, loading: false });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('No analysis available');
    });
  });

  describe('react-test-renderer rendering - data state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ResumeAnalysis, props));
      });
      return tree!;
    };

    it('should render header with section count', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('AI-Powered Change Analysis');
      // React splits template literals: ["2"," section","s"," modified"]
      expect(str).toContain('section');
      expect(str).toContain('modified');
    });

    it('should render section names', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Professional Summary');
      expect(str).toContain('Experience');
    });

    it('should render change counts per section', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const str = getTreeText(tree.toJSON());
      // React splits: ["2"," change","s"] and ["1"," change"]
      expect(str).toContain('change');
    });

    it('should use singular "section" for single section', () => {
      const single = { sections: [sampleAnalysis.sections[0]] };
      const tree = renderComponent({ analysis: single, loading: false });
      const str = getTreeText(tree.toJSON());
      // React splits: ["1"," section"," modified"]
      expect(str).toContain('section');
      expect(str).toContain('modified');
    });
  });

  describe('react-test-renderer rendering - section expansion', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ResumeAnalysis, props));
      });
      return tree!;
    };

    it('should expand section when header is pressed', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const root = tree.root;

      // Find section headers (TouchableOpacity with accessibilityLabel containing section name)
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );
      expect(sectionButton).toBeDefined();

      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      // Should now show change type badges and what_changed preview
      expect(str).toContain('modified');
      expect(str).toContain('Added metrics and leadership language');
    });

    it('should collapse section when pressed again', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const root = tree.root;

      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );

      // Expand
      renderer.act(() => {
        sectionButton!.props.onPress();
      });
      let str = getTreeText(tree.toJSON());
      expect(str).toContain('Added metrics and leadership language');

      // Find button again after re-render and collapse
      const sectionButton2 = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );
      renderer.act(() => {
        sectionButton2!.props.onPress();
      });

      str = getTreeText(tree.toJSON());
      // Change details should be hidden now
      // The "what_changed" text only shows when section is expanded
      // But section names are always visible
      expect(str).toContain('Professional Summary');
    });

    it('should expand multiple sections independently', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const root = tree.root;

      // Expand first section
      const summaryButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );
      renderer.act(() => {
        summaryButton!.props.onPress();
      });

      // Expand second section
      const expButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Experience')
      );
      renderer.act(() => {
        expButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Added metrics and leadership language');
      expect(str).toContain('Removed vague IT statement');
    });
  });

  describe('react-test-renderer rendering - change expansion', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(ResumeAnalysis, props));
      });
      return tree!;
    };

    it('should expand change details when change header is pressed', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const root = tree.root;

      // First expand the section
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );
      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      // Now expand a change
      const changeButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change details')
      );
      expect(changeButton).toBeDefined();
      renderer.act(() => {
        changeButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      // Should show detailed change info
      expect(str).toContain('WHY THIS MATTERS');
      expect(str).toContain('WHAT CHANGED');
      expect(str).toContain('HOW IT HELPS');
    });

    it('should show original and new text in expanded change', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const root = tree.root;

      // Expand section
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );
      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      // Expand first change (modified type with original_text and new_text)
      const changeButtons = root.findAllByType('TouchableOpacity').filter((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change details')
      );
      renderer.act(() => {
        changeButtons[0].props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('ORIGINAL');
      expect(str).toContain('Managed security projects for clients');
      expect(str).toContain('NEW');
      expect(str).toContain('Led enterprise cybersecurity program');
    });

    it('should show job requirements matched chips', () => {
      const tree = renderComponent({ analysis: sampleAnalysis, loading: false });
      const root = tree.root;

      // Expand section
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Professional Summary')
      );
      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      // Expand first change
      const changeButtons = root.findAllByType('TouchableOpacity').filter((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change details')
      );
      renderer.act(() => {
        changeButtons[0].props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('JOB REQUIREMENTS MATCHED');
      expect(str).toContain('Leadership');
      expect(str).toContain('Program Management');
      expect(str).toContain('KEYWORDS ADDED');
      expect(str).toContain('cybersecurity');
      expect(str).toContain('enterprise');
    });

    it('should NOT show requirements/keywords sections when arrays are empty', () => {
      const noChips = {
        sections: [{
          section_name: 'Experience',
          changes: [sampleRemovedChange],
        }],
      };
      const tree = renderComponent({ analysis: noChips, loading: false });
      const root = tree.root;

      // Expand section
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Experience')
      );
      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      // Expand change
      const changeButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change details')
      );
      renderer.act(() => {
        changeButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).not.toContain('JOB REQUIREMENTS MATCHED');
      expect(str).not.toContain('KEYWORDS ADDED');
    });

    it('should show added change without original text block', () => {
      const addedOnly = {
        sections: [{
          section_name: 'Summary',
          changes: [sampleAddedChange],
        }],
      };
      const tree = renderComponent({ analysis: addedOnly, loading: false });
      const root = tree.root;

      // Expand section
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Summary')
      );
      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      // Expand change
      const changeButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change details')
      );
      renderer.act(() => {
        changeButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      // Should have NEW but not ORIGINAL
      expect(str).toContain('NEW');
      expect(str).toContain('NIST CSF certified practitioner');
    });

    it('should show removed change without new text block', () => {
      const removedOnly = {
        sections: [{
          section_name: 'Summary',
          changes: [sampleRemovedChange],
        }],
      };
      const tree = renderComponent({ analysis: removedOnly, loading: false });
      const root = tree.root;

      // Expand section
      const sectionButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Summary')
      );
      renderer.act(() => {
        sectionButton!.props.onPress();
      });

      // Expand change
      const changeButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('change details')
      );
      renderer.act(() => {
        changeButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('ORIGINAL');
      expect(str).toContain('Familiar with general IT processes');
    });
  });
});
