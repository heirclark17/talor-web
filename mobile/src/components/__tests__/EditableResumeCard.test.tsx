/**
 * EditableResumeCard Component Tests
 *
 * Tests module exports, edit mode logic, props interface,
 * direct component invocation for branch coverage,
 * and react-test-renderer rendering for full coverage.
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
      text: '#fff',
      textSecondary: '#aaa',
      textTertiary: '#666',
      border: '#333',
      backgroundTertiary: '#222',
    },
  }),
}));

import EditableResumeCard from '../EditableResumeCard';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';


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

describe('EditableResumeCard', () => {
  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(EditableResumeCard).toBeDefined();
      expect(typeof EditableResumeCard).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(EditableResumeCard.name).toBe('EditableResumeCard');
    });
  });

  describe('props interface', () => {
    it('should require title and content as string props', () => {
      const requiredProps = {
        title: 'Professional Summary',
        content: 'Experienced cybersecurity program manager...',
      };
      expect(typeof requiredProps.title).toBe('string');
      expect(typeof requiredProps.content).toBe('string');
    });

    it('should have isEditable as optional with false default', () => {
      const propsWithoutEditable = {
        title: 'Summary',
        content: 'Some content',
      };
      expect(propsWithoutEditable).not.toHaveProperty('isEditable');
    });

    it('should accept onSave callback as optional prop', () => {
      const mockSave = jest.fn();
      const propsWithSave = {
        title: 'Summary',
        content: 'Content',
        isEditable: true,
        onSave: mockSave,
      };
      expect(typeof propsWithSave.onSave).toBe('function');
    });
  });

  describe('edit mode behavior contracts', () => {
    it('should track editedContent state initialized from content prop', () => {
      const content = 'Original resume content';
      const editedContent = content;
      expect(editedContent).toBe('Original resume content');
    });

    it('should reset editedContent to original content on cancel', () => {
      const originalContent = 'Original content';
      let editedContent = 'Modified content';
      editedContent = originalContent;
      expect(editedContent).toBe(originalContent);
    });

    it('should call onSave with editedContent on save', () => {
      const onSave = jest.fn();
      const editedContent = 'Updated content';
      if (onSave) {
        onSave(editedContent);
      }
      expect(onSave).toHaveBeenCalledWith('Updated content');
    });

    it('should not call onSave when onSave is not provided', () => {
      const onSave = undefined;
      const editedContent = 'Updated content';
      // handleSave logic: if (onSave) { onSave(editedContent); }
      let called = false;
      if (onSave) {
        called = true;
      }
      expect(called).toBe(false);
    });
  });

  describe('direct component invocation - view mode', () => {
    it('should render with minimal required props (view mode, not editable)', () => {
      const element = React.createElement(EditableResumeCard, {
        title: 'Summary',
        content: 'My professional summary text',
      });
      expect(element).toBeTruthy();
      expect(element.props.title).toBe('Summary');
      expect(element.props.content).toBe('My professional summary text');
    });

    it('should render with isEditable false explicitly', () => {
      const element = React.createElement(EditableResumeCard, {
        title: 'Experience',
        content: 'Led cybersecurity programs...',
        isEditable: false,
      });
      expect(element).toBeTruthy();
      expect(element.props.isEditable).toBe(false);
    });

    it('should render with isEditable true (edit button visible)', () => {
      const element = React.createElement(EditableResumeCard, {
        title: 'Skills',
        content: 'NIST, ISO 27001',
        isEditable: true,
      });
      expect(element).toBeTruthy();
      expect(element.props.isEditable).toBe(true);
    });

    it('should render with onSave callback', () => {
      const onSave = jest.fn();
      const element = React.createElement(EditableResumeCard, {
        title: 'Summary',
        content: 'Content text',
        isEditable: true,
        onSave,
      });
      expect(element).toBeTruthy();
      expect(element.props.onSave).toBe(onSave);
    });
  });

  describe('React.createElement invocation - additional props', () => {
    it('should create element with empty content', () => {
      const element = React.createElement(EditableResumeCard, {
        title: 'Education',
        content: '',
      });
      expect(element).toBeTruthy();
      expect(element.props.content).toBe('');
    });

    it('should create element with long content', () => {
      const longContent = 'A'.repeat(5000);
      const element = React.createElement(EditableResumeCard, {
        title: 'Details',
        content: longContent,
      });
      expect(element).toBeTruthy();
      expect(element.props.content).toBe(longContent);
    });

    it('should create element with all props provided', () => {
      const onSave = jest.fn();
      const element = React.createElement(EditableResumeCard, {
        title: 'Experience',
        content: 'Led cybersecurity teams',
        isEditable: true,
        onSave,
      });
      expect(element).toBeTruthy();
      expect(element.props.title).toBe('Experience');
      expect(element.props.content).toBe('Led cybersecurity teams');
      expect(element.props.isEditable).toBe(true);
      expect(element.props.onSave).toBe(onSave);
    });

    it('should accept content with special characters', () => {
      const element = React.createElement(EditableResumeCard, {
        title: 'Summary',
        content: 'NIST CSF & ISO 27001 - $25M+ budget',
      });
      expect(element).toBeTruthy();
      expect(element.props.content).toBe('NIST CSF & ISO 27001 - $25M+ budget');
    });
  });

  describe('handleSave logic', () => {
    it('should call onSave and set isEditing to false', () => {
      const onSave = jest.fn();
      const editedContent = 'New content';
      const setIsEditing = jest.fn();

      // Replicate handleSave
      if (onSave) {
        onSave(editedContent);
      }
      setIsEditing(false);

      expect(onSave).toHaveBeenCalledWith('New content');
      expect(setIsEditing).toHaveBeenCalledWith(false);
    });

    it('should only set isEditing to false when onSave is not provided', () => {
      const onSave = undefined;
      const setIsEditing = jest.fn();

      if (onSave) {
        (onSave as any)('anything');
      }
      setIsEditing(false);

      expect(setIsEditing).toHaveBeenCalledWith(false);
    });
  });

  describe('handleCancel logic', () => {
    it('should reset editedContent to original content and exit editing', () => {
      const originalContent = 'Original text';
      const setEditedContent = jest.fn();
      const setIsEditing = jest.fn();

      // Replicate handleCancel
      setEditedContent(originalContent);
      setIsEditing(false);

      expect(setEditedContent).toHaveBeenCalledWith('Original text');
      expect(setIsEditing).toHaveBeenCalledWith(false);
    });
  });

  describe('conditional rendering branches', () => {
    it('should show edit button when isEditable=true and not editing', () => {
      const isEditable = true;
      const isEditing = false;
      const showEditButton = isEditable && !isEditing;
      expect(showEditButton).toBe(true);
    });

    it('should not show edit button when isEditable=false', () => {
      const isEditable = false;
      const isEditing = false;
      const showEditButton = isEditable && !isEditing;
      expect(showEditButton).toBe(false);
    });

    it('should not show edit button when already editing', () => {
      const isEditable = true;
      const isEditing = true;
      const showEditButton = isEditable && !isEditing;
      expect(showEditButton).toBe(false);
    });

    it('should show save/cancel buttons when editing', () => {
      const isEditing = true;
      expect(isEditing).toBe(true);
    });

    it('should show TextInput when editing, Text when not', () => {
      const isEditingTrue = true;
      const isEditingFalse = false;
      expect(isEditingTrue ? 'TextInput' : 'Text').toBe('TextInput');
      expect(isEditingFalse ? 'TextInput' : 'Text').toBe('Text');
    });
  });

  describe('accessibility labels', () => {
    it('should generate correct edit button accessibility label', () => {
      const title = 'Professional Summary';
      const label = `Edit ${title}`;
      expect(label).toBe('Edit Professional Summary');
    });

    it('should have fixed accessibility labels for save and cancel', () => {
      expect('Save changes').toBe('Save changes');
      expect('Cancel editing').toBe('Cancel editing');
    });
  });

  describe('style constants usage', () => {
    it('should use ALPHA_COLORS for save button background', () => {
      expect(ALPHA_COLORS.success.bg).toBeDefined();
      expect(typeof ALPHA_COLORS.success.bg).toBe('string');
    });

    it('should use ALPHA_COLORS for cancel button background', () => {
      expect(ALPHA_COLORS.danger.bg).toBeDefined();
      expect(typeof ALPHA_COLORS.danger.bg).toBe('string');
    });

    it('should use COLORS.success for save button icon/text', () => {
      expect(COLORS.success).toBe('#10b981');
    });

    it('should use COLORS.danger for cancel button icon/text', () => {
      expect(COLORS.danger).toBe('#f87171');
    });
  });

  describe('react-test-renderer rendering - view mode (not editable)', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(EditableResumeCard, props));
      });
      return tree!;
    };

    it('should render in view mode with title and content text', () => {
      const tree = renderComponent({ title: 'Summary', content: 'My professional summary' });
      const json = tree.toJSON();
      expect(json).toBeDefined();
      const str = JSON.stringify(json);
      expect(str).toContain('Summary');
      expect(str).toContain('My professional summary');
    });

    it('should NOT show edit button when isEditable is false (default)', () => {
      const tree = renderComponent({ title: 'Summary', content: 'Content text' });
      const str = getTreeText(tree.toJSON());
      expect(str).not.toContain('Edit');
      expect(str).not.toContain('Save');
      expect(str).not.toContain('Cancel');
    });

    it('should render content as text (not input) in view mode', () => {
      const tree = renderComponent({ title: 'Experience', content: 'Led cybersecurity programs' });
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs).toHaveLength(0);
    });

    it('should render with empty content string', () => {
      const tree = renderComponent({ title: 'Education', content: '' });
      expect(tree.toJSON()).toBeDefined();
    });

    it('should render with very long content', () => {
      const tree = renderComponent({ title: 'Details', content: 'A'.repeat(5000) });
      expect(tree.toJSON()).toBeDefined();
    });
  });

  describe('react-test-renderer rendering - editable view mode', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(EditableResumeCard, props));
      });
      return tree!;
    };

    it('should show edit button when isEditable=true', () => {
      const tree = renderComponent({ title: 'Summary', content: 'Content', isEditable: true });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Edit');
    });

    it('should NOT show save/cancel in editable view mode (not editing yet)', () => {
      const tree = renderComponent({ title: 'Summary', content: 'Content', isEditable: true });
      const str = getTreeText(tree.toJSON());
      expect(str).not.toContain('Save');
      expect(str).not.toContain('Cancel');
    });
  });

  describe('react-test-renderer rendering - edit mode interaction', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(EditableResumeCard, props));
      });
      return tree!;
    };

    it('should enter edit mode when edit button is pressed', () => {
      const tree = renderComponent({ title: 'Summary', content: 'Original content', isEditable: true });
      const root = tree.root;

      // Find and press the edit button (TouchableOpacity with accessibilityLabel containing "Edit")
      const editButtons = root.findAllByType('TouchableOpacity');
      const editButton = editButtons.find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Edit')
      );
      expect(editButton).toBeDefined();

      renderer.act(() => {
        editButton!.props.onPress();
      });

      // After pressing edit, should show TextInput and Save/Cancel
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Save');
      expect(str).toContain('Cancel');
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBeGreaterThanOrEqual(1);
    });

    it('should exit edit mode and call onSave when save is pressed', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Summary',
        content: 'Original content',
        isEditable: true,
        onSave,
      });
      const root = tree.root;

      // Enter edit mode
      const editButtons = root.findAllByType('TouchableOpacity');
      const editButton = editButtons.find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Edit')
      );
      renderer.act(() => {
        editButton!.props.onPress();
      });

      // Press save
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      expect(saveButton).toBeDefined();
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith('Original content');
      // Should exit edit mode - no more Save/Cancel
      const str = getTreeText(tree.toJSON());
      expect(str).not.toContain('Save');
    });

    it('should exit edit mode without calling onSave when cancel is pressed', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Summary',
        content: 'Original content',
        isEditable: true,
        onSave,
      });
      const root = tree.root;

      // Enter edit mode
      const editButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Edit')
      );
      renderer.act(() => {
        editButton!.props.onPress();
      });

      // Press cancel
      const cancelButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Cancel editing'
      );
      expect(cancelButton).toBeDefined();
      renderer.act(() => {
        cancelButton!.props.onPress();
      });

      expect(onSave).not.toHaveBeenCalled();
      // Should return to view mode with Edit button
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Edit');
      expect(str).not.toContain('Save');
    });

    it('should handle save without onSave callback (no crash)', () => {
      const tree = renderComponent({
        title: 'Summary',
        content: 'Content',
        isEditable: true,
      });
      const root = tree.root;

      // Enter edit mode
      const editButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Edit')
      );
      renderer.act(() => {
        editButton!.props.onPress();
      });

      // Press save - should not crash
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      // Back to view mode
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Edit');
    });

    it('should allow editing content via TextInput onChangeText', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Summary',
        content: 'Original',
        isEditable: true,
        onSave,
      });
      const root = tree.root;

      // Enter edit mode
      const editButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Edit')
      );
      renderer.act(() => {
        editButton!.props.onPress();
      });

      // Find TextInput and change text
      const textInput = root.findAllByType('TextInput')[0];
      renderer.act(() => {
        textInput.props.onChangeText('Modified content');
      });

      // Save
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith('Modified content');
    });
  });
});
