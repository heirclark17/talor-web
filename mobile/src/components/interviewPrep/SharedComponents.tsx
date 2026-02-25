import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronUp, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { ThemeColors } from './types';

// Expandable Section Component
interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  accentColor?: string;
  colors: ThemeColors;
}

export const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  accentColor = COLORS.primary,
  colors,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${title} section, ${expanded ? 'expanded' : 'collapsed'}`}
      >
        <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}20` }]}>
          {icon}
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {expanded ? (
          <ChevronUp color={colors.textSecondary} size={20} />
        ) : (
          <ChevronDown color={colors.textSecondary} size={20} />
        )}
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// Bullet List Component
interface BulletListProps {
  items: any[];
  icon?: React.ReactNode;
  textColor?: string;
}

export const BulletList: React.FC<BulletListProps> = ({ items, icon, textColor }) => {
  if (!items || !Array.isArray(items)) {
    return null;
  }

  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => {
        let displayText: string;
        if (typeof item === 'string') {
          displayText = item;
        } else if (item && typeof item === 'object') {
          displayText = item.title || item.name || item.text || item.description || JSON.stringify(item);
        } else {
          displayText = String(item || '');
        }

        return (
          <View key={index} style={styles.bulletItem}>
            {icon || <View style={styles.bulletDot} />}
            <Text style={[styles.bulletText, textColor ? { color: textColor } : undefined]}>{displayText}</Text>
          </View>
        );
      })}
    </View>
  );
};

// Chip/Badge Component
interface ChipProps {
  label: string;
  color?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, color = COLORS.primary }) => (
  <View style={[styles.chip, { backgroundColor: `${color}20` }]}>
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </View>
);

// Confidence Level Progress Bar Component
interface ConfidenceBarProps {
  level: number;
  color: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({ level, color }) => {
  const { isDark } = useTheme();
  return (
    <View style={styles.confidenceBarContainer}>
      <View style={[styles.confidenceBarBackground, { borderColor: `${color}40`, backgroundColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[5] }]}>
        <View
          style={[
            styles.confidenceBarFill,
            { width: `${level}%`, backgroundColor: color }
          ]}
        />
      </View>
      <Text style={[styles.confidenceBarLabel, { color }]}>{level}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Section styles
  sectionCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    minHeight: 60,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  sectionContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  // Bullet list styles
  bulletList: {
    gap: SPACING.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  bulletText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    flex: 1,
  },
  // Chip styles
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  chipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  // Confidence bar styles
  confidenceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  confidenceBarLabel: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    minWidth: 48,
    textAlign: 'right',
  },
});
