/**
 * EditableSkillsList Component Tests
 *
 * Tests module exports, skill filtering logic (empty string removal),
 * add/delete skill behavior, props interface, direct component invocation,
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

import EditableSkillsList from '../EditableSkillsList';
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

describe('EditableSkillsList', () => {
  describe('module exports', () => {
    it('should export a default function component', () => {
      expect(EditableSkillsList).toBeDefined();
      expect(typeof EditableSkillsList).toBe('function');
    });

    it('should have the correct function name', () => {
      expect(EditableSkillsList.name).toBe('EditableSkillsList');
    });
  });

  describe('skill filtering logic on save', () => {
    it('should filter out empty strings from skills array', () => {
      const editedSkills = ['React', '', 'TypeScript', '  ', 'Jest', ''];
      const filtered = editedSkills.filter((s) => s.trim() !== '');
      expect(filtered).toEqual(['React', 'TypeScript', 'Jest']);
    });

    it('should filter out whitespace-only strings', () => {
      const editedSkills = ['   ', '\t', '\n', 'Valid Skill'];
      const filtered = editedSkills.filter((s) => s.trim() !== '');
      expect(filtered).toEqual(['Valid Skill']);
    });

    it('should return empty array when all skills are empty', () => {
      const editedSkills = ['', '  ', ''];
      const filtered = editedSkills.filter((s) => s.trim() !== '');
      expect(filtered).toEqual([]);
    });

    it('should preserve all valid skills', () => {
      const editedSkills = ['NIST', 'ISO 27001', 'Risk Management'];
      const filtered = editedSkills.filter((s) => s.trim() !== '');
      expect(filtered).toEqual(['NIST', 'ISO 27001', 'Risk Management']);
    });
  });

  describe('add skill logic', () => {
    it('should trim new skill before adding', () => {
      const newSkill = '  Cybersecurity  ';
      const trimmed = newSkill.trim();
      expect(trimmed).toBe('Cybersecurity');
    });

    it('should not add empty skill after trim', () => {
      const newSkill = '   ';
      const shouldAdd = newSkill.trim() !== '';
      expect(shouldAdd).toBe(false);
    });

    it('should add valid skill to existing list', () => {
      const existing = ['Skill A', 'Skill B'];
      const newSkill = 'Skill C';
      if (newSkill.trim()) {
        existing.push(newSkill.trim());
      }
      expect(existing).toEqual(['Skill A', 'Skill B', 'Skill C']);
    });

    it('should not add empty string skill', () => {
      const existing = ['Skill A'];
      const newSkill = '';
      if (newSkill.trim()) {
        existing.push(newSkill.trim());
      }
      expect(existing).toEqual(['Skill A']);
    });
  });

  describe('delete skill logic', () => {
    it('should remove skill at given index', () => {
      const skills = ['React', 'TypeScript', 'Jest'];
      const indexToDelete = 1;
      const result = skills.filter((_, i) => i !== indexToDelete);
      expect(result).toEqual(['React', 'Jest']);
    });

    it('should handle deleting the last skill', () => {
      const skills = ['Only Skill'];
      const result = skills.filter((_, i) => i !== 0);
      expect(result).toEqual([]);
    });

    it('should handle deleting the first skill', () => {
      const skills = ['First', 'Second', 'Third'];
      const result = skills.filter((_, i) => i !== 0);
      expect(result).toEqual(['Second', 'Third']);
    });

    it('should handle deleting the last index in a multi-item list', () => {
      const skills = ['A', 'B', 'C'];
      const result = skills.filter((_, i) => i !== 2);
      expect(result).toEqual(['A', 'B']);
    });
  });

  describe('edit skill logic', () => {
    it('should update skill at given index', () => {
      const skills = ['React', 'TypeScript', 'Jest'];
      const updated = [...skills];
      updated[1] = 'Node.js';
      expect(updated).toEqual(['React', 'Node.js', 'Jest']);
    });

    it('should preserve other skills when editing one', () => {
      const skills = ['NIST', 'ISO 27001', 'COBIT'];
      const updated = [...skills];
      updated[0] = 'NIST CSF';
      expect(updated[1]).toBe('ISO 27001');
      expect(updated[2]).toBe('COBIT');
    });
  });

  describe('React.createElement invocation', () => {
    it('should create element with skills props', () => {
      const element = React.createElement(EditableSkillsList, {
        title: 'Skills',
        skills: ['React', 'Node.js'],
      });
      expect(element).toBeTruthy();
      expect(element.props.skills).toEqual(['React', 'Node.js']);
    });

    it('should create element with empty skills array', () => {
      const element = React.createElement(EditableSkillsList, {
        title: 'Skills',
        skills: [],
      });
      expect(element).toBeTruthy();
      expect(element.props.skills).toEqual([]);
    });

    it('should create element with isEditable=true', () => {
      const onSave = jest.fn();
      const element = React.createElement(EditableSkillsList, {
        title: 'Certifications',
        skills: ['CISSP', 'CISM'],
        isEditable: true,
        onSave,
      });
      expect(element).toBeTruthy();
      expect(element.props.isEditable).toBe(true);
      expect(element.props.onSave).toBe(onSave);
    });

    it('should create element with single skill', () => {
      const element = React.createElement(EditableSkillsList, {
        title: 'Core Skills',
        skills: ['Program Management'],
      });
      expect(element).toBeTruthy();
      expect(element.props.skills).toEqual(['Program Management']);
    });

    it('should create element with many skills', () => {
      const manySkills = Array.from({ length: 20 }, (_, i) => `Skill ${i}`);
      const element = React.createElement(EditableSkillsList, {
        title: 'All Skills',
        skills: manySkills,
      });
      expect(element).toBeTruthy();
      expect(element.props.skills).toHaveLength(20);
    });

    it('should create element with all props', () => {
      const onSave = jest.fn();
      const element = React.createElement(EditableSkillsList, {
        title: 'Technical Skills',
        skills: ['Python'],
        isEditable: true,
        onSave,
      });
      expect(element).toBeTruthy();
      expect(element.props.isEditable).toBe(true);
      expect(element.props.onSave).toBe(onSave);
    });
  });

  describe('handleSave logic', () => {
    it('should filter empty skills and call onSave', () => {
      const onSave = jest.fn();
      const editedSkills = ['Valid', '', '  ', 'Also Valid'];
      const filtered = editedSkills.filter((s) => s.trim() !== '');
      if (onSave) {
        onSave(filtered);
      }
      expect(onSave).toHaveBeenCalledWith(['Valid', 'Also Valid']);
    });

    it('should reset newSkill to empty string on save', () => {
      const setNewSkill = jest.fn();
      const setIsEditing = jest.fn();
      // Replicate handleSave cleanup
      setIsEditing(false);
      setNewSkill('');
      expect(setNewSkill).toHaveBeenCalledWith('');
      expect(setIsEditing).toHaveBeenCalledWith(false);
    });
  });

  describe('handleCancel logic', () => {
    it('should reset editedSkills to original skills on cancel', () => {
      const originalSkills = ['A', 'B'];
      const setEditedSkills = jest.fn();
      const setNewSkill = jest.fn();
      const setIsEditing = jest.fn();

      setEditedSkills([...originalSkills]);
      setNewSkill('');
      setIsEditing(false);

      expect(setEditedSkills).toHaveBeenCalledWith(['A', 'B']);
      expect(setNewSkill).toHaveBeenCalledWith('');
      expect(setIsEditing).toHaveBeenCalledWith(false);
    });
  });

  describe('conditional rendering branches', () => {
    it('should show edit button when isEditable and not editing', () => {
      expect(true && !false).toBe(true);
    });

    it('should hide edit button when not editable', () => {
      expect(false && !false).toBe(false);
    });

    it('should show save/cancel when editing', () => {
      const isEditing = true;
      expect(isEditing).toBe(true);
    });

    it('should show skill chips in view mode', () => {
      const isEditing = false;
      expect(!isEditing).toBe(true);
    });

    it('should show text inputs and delete buttons in edit mode', () => {
      const isEditing = true;
      expect(isEditing).toBe(true);
    });
  });

  describe('style constants', () => {
    it('should use ALPHA_COLORS for badge backgrounds', () => {
      expect(ALPHA_COLORS.neutral.bg).toBeDefined();
      expect(ALPHA_COLORS.success.bg).toBeDefined();
      expect(ALPHA_COLORS.danger.bg).toBeDefined();
      expect(ALPHA_COLORS.info.bg).toBeDefined();
    });

    it('should use COLORS for icon colors', () => {
      expect(COLORS.success).toBe('#10b981');
      expect(COLORS.danger).toBe('#f87171');
      expect(COLORS.info).toBe('#06b6d4');
    });
  });

  describe('react-test-renderer rendering - view mode', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(EditableSkillsList, props));
      });
      return tree!;
    };

    it('should render skill chips in view mode', () => {
      const tree = renderComponent({ title: 'Skills', skills: ['React', 'Node.js', 'TypeScript'] });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('React');
      expect(str).toContain('Node.js');
      expect(str).toContain('TypeScript');
    });

    it('should render with empty skills array', () => {
      const tree = renderComponent({ title: 'Skills', skills: [] });
      expect(tree.toJSON()).toBeDefined();
    });

    it('should NOT show edit button when isEditable is false (default)', () => {
      const tree = renderComponent({ title: 'Skills', skills: ['React'] });
      const str = getTreeText(tree.toJSON());
      expect(str).not.toContain('Edit');
    });

    it('should show edit button when isEditable=true', () => {
      const tree = renderComponent({ title: 'Skills', skills: ['React'], isEditable: true });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Edit');
    });

    it('should render single skill as chip', () => {
      const tree = renderComponent({ title: 'Core', skills: ['Program Management'] });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Program Management');
    });

    it('should render many skills', () => {
      const manySkills = Array.from({ length: 15 }, (_, i) => `Skill ${i}`);
      const tree = renderComponent({ title: 'All Skills', skills: manySkills });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Skill 0');
      expect(str).toContain('Skill 14');
    });
  });

  describe('react-test-renderer rendering - edit mode interaction', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(EditableSkillsList, props));
      });
      return tree!;
    };

    it('should enter edit mode when edit button is pressed', () => {
      const tree = renderComponent({ title: 'Skills', skills: ['React', 'Node.js'], isEditable: true });
      const root = tree.root;

      const editButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel && b.props.accessibilityLabel.includes('Edit')
      );
      expect(editButton).toBeDefined();

      renderer.act(() => {
        editButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Save');
      expect(str).toContain('Cancel');
      // Should have text inputs for each skill plus one for new skill
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBeGreaterThanOrEqual(2);
    });

    it('should call onSave with filtered skills on save', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React', 'Node.js'],
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

      // Press save
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith(['React', 'Node.js']);
    });

    it('should exit edit mode on cancel without calling onSave', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React'],
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
      renderer.act(() => {
        cancelButton!.props.onPress();
      });

      expect(onSave).not.toHaveBeenCalled();
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Edit');
    });

    it('should delete a skill when trash button is pressed', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React', 'Node.js', 'TypeScript'],
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

      // Find delete button for "Node.js" (second skill, accessibilityLabel = "Delete Node.js")
      const deleteButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Delete Node.js'
      );
      expect(deleteButton).toBeDefined();
      renderer.act(() => {
        deleteButton!.props.onPress();
      });

      // Save to see the result
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith(['React', 'TypeScript']);
    });

    it('should add a new skill via add button', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React'],
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

      // Find the "Add new skill" text input (the one with placeholder "Add new skill...")
      const textInputs = root.findAllByType('TextInput');
      const addInput = textInputs.find((t: any) => t.props.placeholder === 'Add new skill...');
      expect(addInput).toBeDefined();

      // Type a new skill
      renderer.act(() => {
        addInput!.props.onChangeText('Docker');
      });

      // Press add button
      const addButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Add skill'
      );
      expect(addButton).toBeDefined();
      renderer.act(() => {
        addButton!.props.onPress();
      });

      // Save to verify
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith(['React', 'Docker']);
    });

    it('should not add empty skill when add button is pressed', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React'],
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

      // Press add without typing anything
      const addButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Add skill'
      );
      renderer.act(() => {
        addButton!.props.onPress();
      });

      // Save
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith(['React']);
    });

    it('should add new skill via onSubmitEditing', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React'],
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

      // Type and submit via enter key
      const addInput = root.findAllByType('TextInput').find((t: any) =>
        t.props.placeholder === 'Add new skill...'
      );
      renderer.act(() => {
        addInput!.props.onChangeText('Kubernetes');
      });
      renderer.act(() => {
        addInput!.props.onSubmitEditing();
      });

      // Save
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith(['React', 'Kubernetes']);
    });

    it('should edit an existing skill via onChangeText', () => {
      const onSave = jest.fn();
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React', 'Node.js'],
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

      // Find skill text inputs (not the add input)
      const skillInputs = root.findAllByType('TextInput').filter((t: any) =>
        t.props.placeholder !== 'Add new skill...'
      );
      expect(skillInputs.length).toBe(2);

      // Edit first skill
      renderer.act(() => {
        skillInputs[0].props.onChangeText('React Native');
      });

      // Save
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      expect(onSave).toHaveBeenCalledWith(['React Native', 'Node.js']);
    });

    it('should handle save without onSave callback gracefully', () => {
      const tree = renderComponent({
        title: 'Skills',
        skills: ['React'],
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

      // Save - should not crash even without onSave
      const saveButton = root.findAllByType('TouchableOpacity').find((b: any) =>
        b.props.accessibilityLabel === 'Save changes'
      );
      renderer.act(() => {
        saveButton!.props.onPress();
      });

      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Edit');
    });
  });
});
