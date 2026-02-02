import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, Check, X } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface EditableResumeCardProps {
  title: string;
  content: string;
  isEditable?: boolean;
  onSave?: (newContent: string) => void;
}

export default function EditableResumeCard({
  title,
  content,
  isEditable = false,
  onSave,
}: EditableResumeCardProps) {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    if (onSave) {
      onSave(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
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

      {/* Content */}
      {isEditing ? (
        <TextInput
          value={editedContent}
          onChangeText={setEditedContent}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          style={[
            styles.textInput,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholderTextColor={colors.textTertiary}
          autoFocus
        />
      ) : (
        <Text style={[styles.contentText, { color: colors.textSecondary }]}>{content}</Text>
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
  textInput: {
    minHeight: 150,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  contentText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
});
