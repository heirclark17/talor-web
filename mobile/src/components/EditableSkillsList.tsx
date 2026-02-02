import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Check, X, Plus, Trash2 } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface EditableSkillsListProps {
  title: string;
  skills: string[];
  isEditable?: boolean;
  onSave?: (newSkills: string[]) => void;
}

export default function EditableSkillsList({
  title,
  skills,
  isEditable = false,
  onSave,
}: EditableSkillsListProps) {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([...skills]);
  const [newSkill, setNewSkill] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave(editedSkills.filter((s) => s.trim() !== ''));
    }
    setIsEditing(false);
    setNewSkill('');
  };

  const handleCancel = () => {
    setEditedSkills([...skills]);
    setNewSkill('');
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setEditedSkills([...editedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleDeleteSkill = (index: number) => {
    setEditedSkills(editedSkills.filter((_, i) => i !== index));
  };

  const handleEditSkill = (index: number, value: string) => {
    const updated = [...editedSkills];
    updated[index] = value;
    setEditedSkills(updated);
  };

  return (
    <GlassCard material="regular" shadow="subtle" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {isEditable && !isEditing && (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={[styles.editButton, { backgroundColor: colors.backgroundTertiary }]}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${title}`}
          >
            <Edit2 color={colors.textSecondary} size={16} />
            <Text style={[styles.editButtonText, { color: colors.textSecondary }]}>Edit</Text>
          </TouchableOpacity>
        )}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.saveButton,
                {
                  backgroundColor: ALPHA_COLORS.success.bg,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save changes"
            >
              <Check color={COLORS.success} size={16} />
              <Text style={[styles.saveButtonText, { color: COLORS.success }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: ALPHA_COLORS.danger.bg,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <X color={COLORS.danger} size={16} />
              <Text style={[styles.cancelButtonText, { color: COLORS.danger }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Skills */}
      {isEditing ? (
        <View style={styles.editContainer}>
          {/* Existing Skills */}
          {editedSkills.map((skill, index) => (
            <View key={index} style={styles.skillRow}>
              <TextInput
                value={skill}
                onChangeText={(value) => handleEditSkill(index, value)}
                style={[
                  styles.skillInput,
                  {
                    backgroundColor: colors.backgroundTertiary,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholderTextColor={colors.textTertiary}
              />
              <TouchableOpacity
                onPress={() => handleDeleteSkill(index)}
                style={[styles.deleteButton, { backgroundColor: ALPHA_COLORS.danger.bg }]}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${skill}`}
              >
                <Trash2 color={COLORS.danger} size={16} />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add New Skill */}
          <View style={[styles.addRow, { borderTopColor: colors.border }]}>
            <TextInput
              value={newSkill}
              onChangeText={setNewSkill}
              onSubmitEditing={handleAddSkill}
              placeholder="Add new skill..."
              placeholderTextColor={colors.textTertiary}
              style={[
                styles.skillInput,
                {
                  backgroundColor: colors.backgroundTertiary,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
            <TouchableOpacity
              onPress={handleAddSkill}
              style={[styles.addButton, { backgroundColor: ALPHA_COLORS.info.bg }]}
              accessibilityRole="button"
              accessibilityLabel="Add skill"
            >
              <Plus color={COLORS.info} size={16} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.skillsContainer}>
          {skills.map((skill, index) => (
            <View
              key={index}
              style={[styles.skillChip, { backgroundColor: ALPHA_COLORS.neutral.bg }]}
            >
              <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  editButtonText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  saveButtonText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  editContainer: {
    gap: SPACING.sm,
  },
  skillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  skillInput: {
    flex: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  addRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    marginTop: SPACING.xs,
  },
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  skillText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
});
