import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY } from '../../utils/constants';
import { SectionStyles } from '../../constants/SharedStyles';

interface SectionHeaderProps {
  /**
   * Section title (will be displayed in uppercase)
   */
  title: string;

  /**
   * Optional subtitle displayed below title
   */
  subtitle?: string;

  /**
   * Optional right element (e.g., button, action)
   */
  rightElement?: React.ReactNode;

  /**
   * Whether to use large title style
   * @default false
   */
  large?: boolean;

  /**
   * Container style
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Title text style
   */
  titleStyle?: StyleProp<TextStyle>;

  /**
   * Subtitle text style
   */
  subtitleStyle?: StyleProp<TextStyle>;
}

/**
 * SectionHeader Component
 *
 * Section title component with uppercase title, optional subtitle, and optional right element.
 * Used to organize screens into logical sections.
 *
 * @example
 * ```tsx
 * // Basic section header
 * <SectionHeader title="MY RESUMES" />
 *
 * // With subtitle and count
 * <SectionHeader
 *   title="SAVED COMPARISONS"
 *   subtitle={`${count} comparisons`}
 * />
 *
 * // With right action button
 * <SectionHeader
 *   title="INTERVIEW PREPS"
 *   rightElement={<GlassButton title="View All" onPress={...} />}
 * />
 *
 * // Large title variant
 * <SectionHeader title="Settings" large />
 * ```
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  rightElement,
  large = false,
  style,
  titleStyle,
  subtitleStyle,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        {/* Title */}
        <Text
          style={[
            large ? styles.titleLarge : styles.title,
            { color: colors.text },
            titleStyle,
          ]}
        >
          {large ? title : title.toUpperCase()}
        </Text>

        {/* Subtitle */}
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary },
              subtitleStyle,
            ]}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Element */}
      {rightElement && (
        <View style={styles.rightContainer}>
          {rightElement}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...SectionStyles.header,
  },
  titleLarge: {
    ...TYPOGRAPHY.title2,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.footnote,
    marginTop: SPACING.xs,
  },
  rightContainer: {
    marginLeft: SPACING.md,
  },
});
