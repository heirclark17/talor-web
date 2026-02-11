/**
 * STARStoryBuilder Component Tests
 *
 * Comprehensive tests using react-test-renderer for full interactive coverage.
 * Covers all render branches:
 * - Create vs Edit mode (header title)
 * - Job title + company subtitle
 * - Error display
 * - AI generation (success, null result, error with/without message, no title, loading)
 * - STAR section expansion/collapse with guidance text
 * - Section completeness indicators (CheckCircle)
 * - Field updates for title and all STAR sections (updateStoryField)
 * - Save validation (missing fields vs complete, no onSave callback)
 * - Theme add/remove/empty/whitespace/trim/submitEditing
 * - Talking point add/remove/empty/whitespace/trim/submitEditing
 * - Cancel button conditional render
 * - Loading state (button label, disabled, icon)
 */

// Mock dependencies before imports
jest.mock('../glass/GlassCard', () => ({
  GlassCard: ({ children, ...props }: any) =>
    require('react').createElement('GlassCard', props, children),
}));

jest.mock('../glass/GlassButton', () => ({
  GlassButton: ({ children, ...props }: any) =>
    require('react').createElement('GlassButton', props, children),
}));

const mockColors = {
  text: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  border: '#374151',
  backgroundTertiary: '#2a2a2a',
};

jest.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    colors: mockColors,
    isDark: true,
  }),
}));

import React from 'react';
import renderer from 'react-test-renderer';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';
import STARStoryBuilder from '../STARStoryBuilder';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fullStory = () => ({
  id: 'story-1',
  title: 'Led incident response',
  situation: 'Major security breach detected',
  task: 'Coordinate response team',
  action: 'Implemented containment procedures',
  result: 'Reduced breach impact by 80%',
  key_themes: ['Leadership', 'Crisis Management'],
  talking_points: ['Reduced response time by 40%', 'Zero data loss'],
});

/** Render via react-test-renderer wrapped in act(). Returns renderer instance. */
const renderComponent = (props: any = {}) => {
  let tree: any;
  renderer.act(() => {
    tree = renderer.create(React.createElement(STARStoryBuilder, props));
  });
  return tree!;
};

/** Recursively extract all text and prop values from a JSON tree node */
const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(getTreeText).join(' ');

  let text = '';
  if (node.props) {
    const p = node.props;
    if (typeof p.children === 'string' || typeof p.children === 'number') {
      text += ' ' + p.children;
    } else if (Array.isArray(p.children)) {
      text += ' ' + getTreeText(p.children);
    } else if (p.children && typeof p.children === 'object') {
      text += ' ' + getTreeText(p.children);
    }
    if (p.label) text += ' ' + p.label;
    if (p.placeholder) text += ' ' + p.placeholder;
    if (typeof p.value === 'string') text += ' ' + p.value;
    if (p.accessibilityLabel) text += ' ' + p.accessibilityLabel;
    // Also capture style backgroundColor for color checks
    if (p.style) {
      const styles = Array.isArray(p.style) ? p.style : [p.style];
      styles.forEach((s: any) => {
        if (s && typeof s === 'object') {
          if (s.backgroundColor) text += ' ' + s.backgroundColor;
          if (s.borderColor) text += ' ' + s.borderColor;
          if (s.color) text += ' ' + s.color;
        }
      });
    }
  }
  if (node.children && Array.isArray(node.children)) {
    text += ' ' + node.children.map(getTreeText).join(' ');
  }
  return text;
};

/** Get full text + style info from the tree (safe against circular refs) */
const toStr = (inst: any) => getTreeText(inst.toJSON());

/** Find all by type string */
const findType = (root: any, type: string) => {
  try { return root.findAllByType(type); } catch { return []; }
};

/** Find all by props */
const findProps = (root: any, props: Record<string, any>) => {
  try { return root.findAllByProps(props); } catch { return []; }
};

/** Get GlassButton nodes by label */
const findBtn = (root: any, label: string) =>
  findType(root, 'GlassButton').filter((b: any) => b.props.label === label);

/** Get section header TouchableOpacity */
const sectionHeader = (root: any, name: string) =>
  findProps(root, { accessibilityLabel: `${name} section` });

/** Get all multiline TextInputs (STAR section inputs) */
const multilineInputs = (root: any) =>
  findType(root, 'TextInput').filter((ti: any) => ti.props.multiline === true);

/** Get the theme text input (by placeholder containing 'Leadership') */
const themeInput = (root: any) =>
  findType(root, 'TextInput').filter((ti: any) =>
    ti.props.placeholder?.includes('Leadership')
  );

/** Get the talking point text input (by placeholder containing 'Reduced incident') */
const tpInput = (root: any) =>
  findType(root, 'TextInput').filter((ti: any) =>
    ti.props.placeholder?.includes('Reduced incident response')
  );

// ===========================================================================
// Tests
// ===========================================================================

describe('STARStoryBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // Module exports
  // -----------------------------------------------------------------------
  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(STARStoryBuilder).toBeDefined();
      expect(typeof STARStoryBuilder).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(STARStoryBuilder.name).toBe('STARStoryBuilder');
    });

    it('should be the default export of the module', () => {
      const mod = require('../STARStoryBuilder');
      expect(mod.default).toBe(STARStoryBuilder);
    });
  });

  // -----------------------------------------------------------------------
  // Basic rendering
  // -----------------------------------------------------------------------
  describe('basic rendering', () => {
    it('should render without crashing with no props', () => {
      const tree = renderComponent();
      expect(tree.toJSON()).toBeTruthy();
    });

    it('should render a ScrollView as the root element', () => {
      const tree = renderComponent();
      expect(tree.toJSON().type).toBe('ScrollView');
    });

    it('should render 8 GlassCard sections', () => {
      const tree = renderComponent();
      // header + title + 4 STAR + themes + talking points = 8
      expect(findType(tree.root, 'GlassCard').length).toBe(8);
    });

    it('should render all four STAR section labels', () => {
      const str = toStr(renderComponent());
      expect(str).toContain('Situation');
      expect(str).toContain('Task');
      expect(str).toContain('Action');
      expect(str).toContain('Result');
    });

    it('should render Key Themes and Key Talking Points labels', () => {
      const str = toStr(renderComponent());
      expect(str).toContain('Key Themes');
      expect(str).toContain('Key Talking Points');
    });
  });

  // -----------------------------------------------------------------------
  // Create vs Edit mode
  // -----------------------------------------------------------------------
  describe('create vs edit mode', () => {
    it('should show "Create STAR Story" when no initialStory', () => {
      expect(toStr(renderComponent())).toContain('Create STAR Story');
    });

    it('should show "Edit STAR Story" when initialStory is provided', () => {
      expect(toStr(renderComponent({ initialStory: fullStory() }))).toContain('Edit STAR Story');
    });
  });

  // -----------------------------------------------------------------------
  // Job subtitle
  // -----------------------------------------------------------------------
  describe('job title and company subtitle', () => {
    it('should not show subtitle when jobTitle is missing', () => {
      const str = toStr(renderComponent({ companyName: 'Acme' }));
      expect(str).not.toContain('Acme');
    });

    it('should not show subtitle when companyName is missing', () => {
      const str = toStr(renderComponent({ jobTitle: 'PM' }));
      // 'For PM at' should not appear
      expect(str).not.toContain('For PM at');
    });

    it('should show subtitle when both jobTitle and companyName are provided', () => {
      const str = toStr(renderComponent({ jobTitle: 'CISO', companyName: 'Acme' }));
      expect(str).toContain('CISO');
      expect(str).toContain('Acme');
    });
  });

  // -----------------------------------------------------------------------
  // Error display
  // -----------------------------------------------------------------------
  describe('error display', () => {
    it('should not show error container initially', () => {
      const tree = renderComponent();
      const dangerIcons = findProps(tree.root, { color: COLORS.danger, size: 20 });
      expect(dangerIcons.length).toBe(0);
    });

    it('should show error with ALPHA_COLORS.danger.bg after failed save', () => {
      const tree = renderComponent();
      const saveBtn = findBtn(tree.root, 'Save Story')[0];
      renderer.act(() => { saveBtn.props.onPress(); });
      const str = toStr(tree);
      expect(str).toContain('Please fill in all STAR sections');
      expect(str).toContain(ALPHA_COLORS.danger.bg);
    });
  });

  // -----------------------------------------------------------------------
  // Title field
  // -----------------------------------------------------------------------
  describe('title field', () => {
    it('should have empty title for new story', () => {
      const tree = renderComponent();
      const inputs = findType(tree.root, 'TextInput');
      expect(inputs[0].props.value).toBe('');
    });

    it('should have pre-filled title for initialStory', () => {
      const tree = renderComponent({ initialStory: fullStory() });
      const inputs = findType(tree.root, 'TextInput');
      expect(inputs[0].props.value).toBe('Led incident response');
    });

    it('should update title via onChangeText (covers updateStoryField)', () => {
      const tree = renderComponent();
      const inputs = findType(tree.root, 'TextInput');
      renderer.act(() => { inputs[0].props.onChangeText('New Title'); });
      expect(findType(tree.root, 'TextInput')[0].props.value).toBe('New Title');
    });
  });

  // -----------------------------------------------------------------------
  // STAR section expansion/collapse
  // -----------------------------------------------------------------------
  describe('STAR section expansion and collapse', () => {
    it('should not show any guidance text by default (all collapsed)', () => {
      const str = toStr(renderComponent());
      expect(str).not.toContain('Describe the context and background');
    });

    it('should expand Situation section on press', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      expect(toStr(tree)).toContain('Describe the context and background');
    });

    it('should expand Task section on press', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Task')[0].props.onPress(); });
      expect(toStr(tree)).toContain('What was your specific responsibility');
    });

    it('should expand Action section on press', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Action')[0].props.onPress(); });
      expect(toStr(tree)).toContain('What steps did YOU take');
    });

    it('should expand Result section on press', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Result')[0].props.onPress(); });
      expect(toStr(tree)).toContain('What was the measurable outcome');
    });

    it('should collapse section when same header is pressed again', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      expect(toStr(tree)).toContain('Describe the context and background');
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      expect(toStr(tree)).not.toContain('Describe the context and background');
    });

    it('should switch between sections (only one expanded at a time)', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      renderer.act(() => { sectionHeader(tree.root, 'Task')[0].props.onPress(); });
      const str = toStr(tree);
      expect(str).not.toContain('Describe the context and background');
      expect(str).toContain('What was your specific responsibility');
    });

    it('should set accessibilityState expanded correctly', () => {
      const tree = renderComponent();
      expect(sectionHeader(tree.root, 'Situation')[0].props.accessibilityState).toEqual({ expanded: false });
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      expect(sectionHeader(tree.root, 'Situation')[0].props.accessibilityState).toEqual({ expanded: true });
    });

    it('should show ALPHA_COLORS.info.bg guidance box when expanded', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      expect(toStr(tree)).toContain(ALPHA_COLORS.info.bg);
    });

    it('should render multiline TextInput with correct placeholder when expanded', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      const ml = multilineInputs(tree.root);
      expect(ml.length).toBe(1);
      expect(ml[0].props.placeholder).toContain('situation');
    });
  });

  // -----------------------------------------------------------------------
  // STAR section field updates (covers updateStoryField for each section)
  // -----------------------------------------------------------------------
  describe('STAR section field updates', () => {
    it('should update situation via onChangeText', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      renderer.act(() => { multilineInputs(tree.root)[0].props.onChangeText('New situation'); });
      expect(multilineInputs(tree.root)[0].props.value).toBe('New situation');
    });

    it('should update task via onChangeText', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Task')[0].props.onPress(); });
      renderer.act(() => { multilineInputs(tree.root)[0].props.onChangeText('New task'); });
      expect(multilineInputs(tree.root)[0].props.value).toBe('New task');
    });

    it('should update action via onChangeText', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Action')[0].props.onPress(); });
      renderer.act(() => { multilineInputs(tree.root)[0].props.onChangeText('New action'); });
      expect(multilineInputs(tree.root)[0].props.value).toBe('New action');
    });

    it('should update result via onChangeText', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Result')[0].props.onPress(); });
      renderer.act(() => { multilineInputs(tree.root)[0].props.onChangeText('New result'); });
      expect(multilineInputs(tree.root)[0].props.value).toBe('New result');
    });

    it('should display pre-filled values when editing existing story', () => {
      const story = fullStory();
      const tree = renderComponent({ initialStory: story });

      // Check each section
      const pairs: Array<[string, string]> = [
        ['Situation', story.situation],
        ['Task', story.task],
        ['Action', story.action],
        ['Result', story.result],
      ];

      for (const [name, expected] of pairs) {
        renderer.act(() => { sectionHeader(tree.root, name)[0].props.onPress(); });
        expect(multilineInputs(tree.root)[0].props.value).toBe(expected);
        renderer.act(() => { sectionHeader(tree.root, name)[0].props.onPress(); }); // collapse
      }
    });
  });

  // -----------------------------------------------------------------------
  // Section completeness indicators
  // -----------------------------------------------------------------------
  describe('section completeness indicators', () => {
    it('should show no CheckCircle icons when all sections empty', () => {
      const tree = renderComponent();
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(0);
    });

    it('should show 4 CheckCircle icons when all sections have content', () => {
      const tree = renderComponent({ initialStory: fullStory() });
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(4);
    });

    it('should show partial completeness for partially filled story', () => {
      const partial = {
        title: 'T', situation: 'S', task: '', action: 'A', result: '',
        key_themes: [], talking_points: [],
      };
      const tree = renderComponent({ initialStory: partial });
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(2);
    });

    it('should update completeness after editing a section', () => {
      const tree = renderComponent();
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(0);
      // Fill situation
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      renderer.act(() => { multilineInputs(tree.root)[0].props.onChangeText('Content'); });
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(1);
    });
  });

  // -----------------------------------------------------------------------
  // Edit2 icon color
  // -----------------------------------------------------------------------
  describe('Edit2 icon styling', () => {
    it('should use primary color for expanded section icon', () => {
      const tree = renderComponent();
      renderer.act(() => { sectionHeader(tree.root, 'Situation')[0].props.onPress(); });
      const primaryIcons = findProps(tree.root, { color: COLORS.primary, size: 20 });
      expect(primaryIcons.length).toBeGreaterThanOrEqual(1);
    });

    it('should use textSecondary color for collapsed section icons', () => {
      const tree = renderComponent();
      const secIcons = findProps(tree.root, { color: mockColors.textSecondary, size: 20 });
      // All 4 sections collapsed = 4 Edit2 icons with textSecondary
      expect(secIcons.length).toBe(4);
    });
  });

  // -----------------------------------------------------------------------
  // Save validation
  // -----------------------------------------------------------------------
  describe('save validation', () => {
    it('should error when title is empty', () => {
      const onSave = jest.fn();
      const tree = renderComponent({ onSave });
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(toStr(tree)).toContain('Please fill in all STAR sections');
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should error when situation is empty', () => {
      const onSave = jest.fn();
      const story = { ...fullStory(), situation: '' };
      const tree = renderComponent({ onSave, initialStory: story });
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should error when task is empty', () => {
      const onSave = jest.fn();
      const story = { ...fullStory(), task: '' };
      const tree = renderComponent({ onSave, initialStory: story });
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should error when action is empty', () => {
      const onSave = jest.fn();
      const story = { ...fullStory(), action: '' };
      const tree = renderComponent({ onSave, initialStory: story });
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should error when result is empty', () => {
      const onSave = jest.fn();
      const story = { ...fullStory(), result: '' };
      const tree = renderComponent({ onSave, initialStory: story });
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).not.toHaveBeenCalled();
    });

    it('should call onSave with complete story when all fields filled', () => {
      const onSave = jest.fn();
      const story = fullStory();
      const tree = renderComponent({ onSave, initialStory: story });
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith(story);
    });

    it('should not crash when onSave is undefined and all fields are filled', () => {
      const story = fullStory();
      const tree = renderComponent({ initialStory: story });
      // onSave not provided -- handleSave should not throw
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(tree.toJSON()).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // AI generation
  // -----------------------------------------------------------------------
  describe('AI generation', () => {
    it('should not render Generate button when onGenerateAI absent', () => {
      const tree = renderComponent();
      expect(findBtn(tree.root, 'Generate with AI').length).toBe(0);
    });

    it('should render Generate button when onGenerateAI is provided', () => {
      const tree = renderComponent({ onGenerateAI: jest.fn() });
      expect(findBtn(tree.root, 'Generate with AI').length).toBe(1);
    });

    it('should disable Generate button when title is empty', () => {
      const tree = renderComponent({ onGenerateAI: jest.fn() });
      expect(findBtn(tree.root, 'Generate with AI')[0].props.disabled).toBe(true);
    });

    it('should enable Generate button when title has content', () => {
      const story = { ...fullStory(), situation: '', task: '', action: '', result: '' };
      const tree = renderComponent({ onGenerateAI: jest.fn(), initialStory: story });
      expect(findBtn(tree.root, 'Generate with AI')[0].props.disabled).toBe(false);
    });

    it('should set error when called with empty title (guard: !story.title)', async () => {
      const onGenerateAI = jest.fn();
      const tree = renderComponent({ onGenerateAI });
      // Force-call onPress even though button is disabled
      await renderer.act(async () => { findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });
      expect(toStr(tree)).toContain('Please enter a story title first');
      expect(onGenerateAI).not.toHaveBeenCalled();
    });

    it('should call onGenerateAI with title and update story on success', async () => {
      const generated = fullStory();
      const onGenerateAI = jest.fn().mockResolvedValue(generated);
      const initial = { title: 'My Title', situation: '', task: '', action: '', result: '', key_themes: [] as string[], talking_points: [] as string[] };
      const tree = renderComponent({ onGenerateAI, initialStory: initial });

      await renderer.act(async () => { await findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });

      expect(onGenerateAI).toHaveBeenCalledWith('My Title');
      // All 4 sections now complete
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(4);
    });

    it('should handle null result from onGenerateAI without updating story', async () => {
      const onGenerateAI = jest.fn().mockResolvedValue(null);
      const initial = { title: 'My Title', situation: '', task: '', action: '', result: '', key_themes: [] as string[], talking_points: [] as string[] };
      const tree = renderComponent({ onGenerateAI, initialStory: initial });

      await renderer.act(async () => { await findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });

      // Story remains unchanged; no error
      expect(findProps(tree.root, { color: COLORS.success, size: 16 }).length).toBe(0);
      expect(toStr(tree)).toContain('Generate with AI');
    });

    it('should show error message when onGenerateAI throws with message', async () => {
      const onGenerateAI = jest.fn().mockRejectedValue(new Error('API failure'));
      const initial = { title: 'My Title', situation: '', task: '', action: '', result: '', key_themes: [] as string[], talking_points: [] as string[] };
      const tree = renderComponent({ onGenerateAI, initialStory: initial });

      await renderer.act(async () => { await findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });

      expect(toStr(tree)).toContain('API failure');
    });

    it('should show fallback error when onGenerateAI throws without message', async () => {
      const onGenerateAI = jest.fn().mockRejectedValue({ code: 500 });
      const initial = { title: 'My Title', situation: '', task: '', action: '', result: '', key_themes: [] as string[], talking_points: [] as string[] };
      const tree = renderComponent({ onGenerateAI, initialStory: initial });

      await renderer.act(async () => { await findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });

      expect(toStr(tree)).toContain('Failed to generate story');
    });

    it('should show loading state while generating (Generating... label, disabled, no icon)', async () => {
      let resolvePromise: (v: any) => void;
      const pending = new Promise((r) => { resolvePromise = r; });
      const onGenerateAI = jest.fn().mockReturnValue(pending);
      const initial = { title: 'My Title', situation: '', task: '', action: '', result: '', key_themes: [] as string[], talking_points: [] as string[] };
      const tree = renderComponent({ onGenerateAI, initialStory: initial });

      let genPromise: any;
      renderer.act(() => { genPromise = findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });

      // Now in loading state
      const loadingBtn = findBtn(tree.root, 'Generating...');
      expect(loadingBtn.length).toBe(1);
      expect(loadingBtn[0].props.disabled).toBe(true);
      expect(loadingBtn[0].props.icon).toBeUndefined();

      // Resolve
      await renderer.act(async () => { resolvePromise!(null); await genPromise; });
      expect(findBtn(tree.root, 'Generate with AI').length).toBe(1);
    });

    it('should clear previous error when starting new generation', async () => {
      const onGenerateAI = jest.fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockResolvedValueOnce(fullStory());
      const initial = { title: 'My Title', situation: '', task: '', action: '', result: '', key_themes: [] as string[], talking_points: [] as string[] };
      const tree = renderComponent({ onGenerateAI, initialStory: initial });

      // First call: error
      await renderer.act(async () => { await findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });
      expect(toStr(tree)).toContain('Error 1');

      // Second call: clears error
      await renderer.act(async () => { await findBtn(tree.root, 'Generate with AI')[0].props.onPress(); });
      expect(toStr(tree)).not.toContain('Error 1');
    });
  });

  // -----------------------------------------------------------------------
  // Key themes management
  // -----------------------------------------------------------------------
  describe('key themes management', () => {
    it('should render existing themes from initialStory', () => {
      const str = toStr(renderComponent({ initialStory: fullStory() }));
      expect(str).toContain('Leadership');
      expect(str).toContain('Crisis Management');
    });

    it('should add a theme via Add button (covers addTheme)', () => {
      const tree = renderComponent();
      renderer.act(() => { themeInput(tree.root)[0].props.onChangeText('Teamwork'); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'secondary');
      renderer.act(() => { addBtn[0].props.onPress(); });
      expect(toStr(tree)).toContain('Teamwork');
    });

    it('should not add empty theme', () => {
      const tree = renderComponent();
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'secondary');
      renderer.act(() => { addBtn[0].props.onPress(); });
      // No remove buttons for themes
      const removeBtns = findProps(tree.root, { accessibilityRole: 'button' })
        .filter((b: any) => b.props.accessibilityLabel?.startsWith('Remove ') && !b.props.accessibilityLabel?.includes('talking'));
      expect(removeBtns.length).toBe(0);
    });

    it('should not add whitespace-only theme', () => {
      const tree = renderComponent();
      renderer.act(() => { themeInput(tree.root)[0].props.onChangeText('   '); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'secondary');
      renderer.act(() => { addBtn[0].props.onPress(); });
      const removeBtns = findProps(tree.root, { accessibilityRole: 'button' })
        .filter((b: any) => b.props.accessibilityLabel?.startsWith('Remove ') && !b.props.accessibilityLabel?.includes('talking'));
      expect(removeBtns.length).toBe(0);
    });

    it('should clear theme input after adding', () => {
      const tree = renderComponent();
      renderer.act(() => { themeInput(tree.root)[0].props.onChangeText('Teamwork'); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'secondary');
      renderer.act(() => { addBtn[0].props.onPress(); });
      expect(themeInput(tree.root)[0].props.value).toBe('');
    });

    it('should trim whitespace from theme before adding', () => {
      const tree = renderComponent();
      renderer.act(() => { themeInput(tree.root)[0].props.onChangeText('  Trimmed  '); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'secondary');
      renderer.act(() => { addBtn[0].props.onPress(); });
      expect(toStr(tree)).toContain('Trimmed');
    });

    it('should add theme via onSubmitEditing', () => {
      const tree = renderComponent();
      renderer.act(() => { themeInput(tree.root)[0].props.onChangeText('SubmitTheme'); });
      renderer.act(() => { themeInput(tree.root)[0].props.onSubmitEditing(); });
      expect(toStr(tree)).toContain('SubmitTheme');
    });

    it('should remove a theme by index (covers removeTheme)', () => {
      const tree = renderComponent({ initialStory: fullStory() });
      const removeBtn = findProps(tree.root, { accessibilityLabel: 'Remove Leadership' });
      expect(removeBtn.length).toBe(1);
      renderer.act(() => { removeBtn[0].props.onPress(); });
      // "Remove Leadership" button should no longer exist
      expect(findProps(tree.root, { accessibilityLabel: 'Remove Leadership' }).length).toBe(0);
      // "Remove Crisis Management" should still exist
      expect(findProps(tree.root, { accessibilityLabel: 'Remove Crisis Management' }).length).toBe(1);
    });

    it('should remove the correct theme from a list of 3', () => {
      const story = { ...fullStory(), key_themes: ['A', 'B', 'C'] };
      const tree = renderComponent({ initialStory: story });
      renderer.act(() => { findProps(tree.root, { accessibilityLabel: 'Remove B' })[0].props.onPress(); });
      const str = toStr(tree);
      // After removing B, only A and C remain as theme chips
      const removeLabels = findProps(tree.root, { accessibilityRole: 'button' })
        .filter((b: any) => b.props.accessibilityLabel?.startsWith('Remove ') && !b.props.accessibilityLabel?.includes('talking'))
        .map((b: any) => b.props.accessibilityLabel);
      expect(removeLabels).toContain('Remove A');
      expect(removeLabels).not.toContain('Remove B');
      expect(removeLabels).toContain('Remove C');
    });

    it('should apply ALPHA_COLORS.primary.bg to theme chips', () => {
      const tree = renderComponent({ initialStory: fullStory() });
      expect(toStr(tree)).toContain(ALPHA_COLORS.primary.bg);
    });
  });

  // -----------------------------------------------------------------------
  // Talking points management
  // -----------------------------------------------------------------------
  describe('talking points management', () => {
    it('should render existing talking points from initialStory', () => {
      const str = toStr(renderComponent({ initialStory: fullStory() }));
      expect(str).toContain('Reduced response time by 40%');
      expect(str).toContain('Zero data loss');
    });

    it('should add a talking point via Add button (covers addTalkingPoint)', () => {
      const tree = renderComponent();
      renderer.act(() => { tpInput(tree.root)[0].props.onChangeText('New point'); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'primary' && b.props.size === 'sm');
      renderer.act(() => { addBtn[0].props.onPress(); });
      expect(toStr(tree)).toContain('New point');
    });

    it('should not add empty talking point', () => {
      const tree = renderComponent();
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'primary' && b.props.size === 'sm');
      renderer.act(() => { addBtn[0].props.onPress(); });
      const removeBtns = findProps(tree.root, { accessibilityRole: 'button' })
        .filter((b: any) => b.props.accessibilityLabel?.startsWith('Remove talking'));
      expect(removeBtns.length).toBe(0);
    });

    it('should not add whitespace-only talking point', () => {
      const tree = renderComponent();
      renderer.act(() => { tpInput(tree.root)[0].props.onChangeText('   '); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'primary' && b.props.size === 'sm');
      renderer.act(() => { addBtn[0].props.onPress(); });
      const removeBtns = findProps(tree.root, { accessibilityRole: 'button' })
        .filter((b: any) => b.props.accessibilityLabel?.startsWith('Remove talking'));
      expect(removeBtns.length).toBe(0);
    });

    it('should clear talking point input after adding', () => {
      const tree = renderComponent();
      renderer.act(() => { tpInput(tree.root)[0].props.onChangeText('New point'); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'primary' && b.props.size === 'sm');
      renderer.act(() => { addBtn[0].props.onPress(); });
      expect(tpInput(tree.root)[0].props.value).toBe('');
    });

    it('should trim whitespace from talking point before adding', () => {
      const tree = renderComponent();
      renderer.act(() => { tpInput(tree.root)[0].props.onChangeText('  Trimmed  '); });
      const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'primary' && b.props.size === 'sm');
      renderer.act(() => { addBtn[0].props.onPress(); });
      expect(toStr(tree)).toContain('Trimmed');
    });

    it('should add talking point via onSubmitEditing', () => {
      const tree = renderComponent();
      renderer.act(() => { tpInput(tree.root)[0].props.onChangeText('SubmitPoint'); });
      renderer.act(() => { tpInput(tree.root)[0].props.onSubmitEditing(); });
      expect(toStr(tree)).toContain('SubmitPoint');
    });

    it('should remove a talking point by index (covers removeTalkingPoint)', () => {
      const tree = renderComponent({ initialStory: fullStory() });
      const removeBtn = findProps(tree.root, { accessibilityLabel: 'Remove talking point 1' });
      renderer.act(() => { removeBtn[0].props.onPress(); });
      const str = toStr(tree);
      expect(str).not.toContain('Reduced response time by 40%');
      expect(str).toContain('Zero data loss');
    });

    it('should remove correct talking point from a list of 3', () => {
      const story = { ...fullStory(), talking_points: ['First', 'Second', 'Third'] };
      const tree = renderComponent({ initialStory: story });
      // Remove "Second" (index 1 -> label "Remove talking point 2")
      renderer.act(() => { findProps(tree.root, { accessibilityLabel: 'Remove talking point 2' })[0].props.onPress(); });
      const str = toStr(tree);
      expect(str).toContain('First');
      expect(str).not.toContain('Second');
      expect(str).toContain('Third');
    });
  });

  // -----------------------------------------------------------------------
  // Cancel button
  // -----------------------------------------------------------------------
  describe('cancel button', () => {
    it('should render Cancel when onCancel is provided', () => {
      expect(findBtn(renderComponent({ onCancel: jest.fn() }).root, 'Cancel').length).toBe(1);
    });

    it('should not render Cancel when onCancel is absent', () => {
      expect(findBtn(renderComponent().root, 'Cancel').length).toBe(0);
    });

    it('should call onCancel when pressed', () => {
      const onCancel = jest.fn();
      const tree = renderComponent({ onCancel });
      renderer.act(() => { findBtn(tree.root, 'Cancel')[0].props.onPress(); });
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  // -----------------------------------------------------------------------
  // Save button
  // -----------------------------------------------------------------------
  describe('save button', () => {
    it('should always render Save Story button with primary variant', () => {
      const btn = findBtn(renderComponent().root, 'Save Story');
      expect(btn.length).toBe(1);
      expect(btn[0].props.variant).toBe('primary');
    });

    it('should have Save icon', () => {
      expect(findBtn(renderComponent().root, 'Save Story')[0].props.icon).toBeTruthy();
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases / integration
  // -----------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle adding multiple themes sequentially', () => {
      const tree = renderComponent();
      const add = (text: string) => {
        renderer.act(() => { themeInput(tree.root)[0].props.onChangeText(text); });
        const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'secondary');
        renderer.act(() => { addBtn[0].props.onPress(); });
      };
      add('T1'); add('T2'); add('T3');
      const str = toStr(tree);
      expect(str).toContain('T1');
      expect(str).toContain('T2');
      expect(str).toContain('T3');
    });

    it('should handle adding multiple talking points sequentially', () => {
      const tree = renderComponent();
      const add = (text: string) => {
        renderer.act(() => { tpInput(tree.root)[0].props.onChangeText(text); });
        const addBtn = findBtn(tree.root, 'Add').filter((b: any) => b.props.variant === 'primary' && b.props.size === 'sm');
        renderer.act(() => { addBtn[0].props.onPress(); });
      };
      add('P1'); add('P2');
      const str = toStr(tree);
      expect(str).toContain('P1');
      expect(str).toContain('P2');
    });

    it('should save correctly after editing fields of an existing story', () => {
      const onSave = jest.fn();
      const tree = renderComponent({ onSave, initialStory: fullStory() });

      // Update title
      renderer.act(() => { findType(tree.root, 'TextInput')[0].props.onChangeText('Updated Title'); });

      // Save
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave.mock.calls[0][0].title).toBe('Updated Title');
    });

    it('should handle rapid section toggles (only last expanded)', () => {
      const tree = renderComponent();
      ['Situation', 'Task', 'Action', 'Result'].forEach((name) => {
        renderer.act(() => { sectionHeader(tree.root, name)[0].props.onPress(); });
      });
      const str = toStr(tree);
      expect(str).toContain('What was the measurable outcome');
      expect(str).not.toContain('Describe the context and background');
    });

    it('should fill all fields interactively and save successfully', () => {
      const onSave = jest.fn();
      const tree = renderComponent({ onSave });

      // Fill title
      renderer.act(() => { findType(tree.root, 'TextInput')[0].props.onChangeText('Full Title'); });

      // Fill each STAR section
      const fields = ['Situation', 'Task', 'Action', 'Result'];
      fields.forEach((name) => {
        renderer.act(() => { sectionHeader(tree.root, name)[0].props.onPress(); });
        renderer.act(() => { multilineInputs(tree.root)[0].props.onChangeText(`${name} content`); });
        renderer.act(() => { sectionHeader(tree.root, name)[0].props.onPress(); });
      });

      // Save
      renderer.act(() => { findBtn(tree.root, 'Save Story')[0].props.onPress(); });
      expect(onSave).toHaveBeenCalledTimes(1);
      const saved = onSave.mock.calls[0][0];
      expect(saved.title).toBe('Full Title');
      expect(saved.situation).toBe('Situation content');
      expect(saved.task).toBe('Task content');
      expect(saved.action).toBe('Action content');
      expect(saved.result).toBe('Result content');
    });
  });
});
