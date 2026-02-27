/**
 * SharedStyles Pattern Library
 *
 * Reusable style patterns aligned with iOS 26 design system.
 * All components should use these patterns for consistency.
 */

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SPACING, RADIUS, TYPOGRAPHY, ALPHA_COLORS, SHADOWS, FONTS } from '../utils/constants';

/**
 * Card Styles
 * Consistent glass card patterns used throughout the app
 */
export const CardStyles = StyleSheet.create({
  // Base card with glass background
  base: {
    borderRadius: RADIUS.lg,
    padding: SPACING.cardPadding,
    overflow: 'hidden',
  } as ViewStyle,

  // Card with extra padding
  spacious: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    overflow: 'hidden',
  } as ViewStyle,

  // Compact card with minimal padding
  compact: {
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    overflow: 'hidden',
  } as ViewStyle,

  // Interactive card (pressable)
  interactive: {
    borderRadius: RADIUS.lg,
    padding: SPACING.cardPadding,
    overflow: 'hidden',
  } as ViewStyle,

  // Card with bottom margin for stacking
  stacked: {
    borderRadius: RADIUS.lg,
    padding: SPACING.cardPadding,
    marginBottom: SPACING.cardGap,
    overflow: 'hidden',
  } as ViewStyle,
});

/**
 * List Styles
 * Consistent list item patterns
 */
export const ListStyles = StyleSheet.create({
  // Base list item
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: SPACING.touchTarget,
  } as ViewStyle,

  // List item with separator
  itemWithSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: SPACING.touchTarget,
    borderBottomWidth: StyleSheet.hairlineWidth,
  } as ViewStyle,

  // List item title
  itemTitle: {
    ...TYPOGRAPHY.body,
    flex: 1,
  } as TextStyle,

  // List item subtitle
  itemSubtitle: {
    ...TYPOGRAPHY.footnote,
    marginTop: 2,
  } as TextStyle,

  // List section header
  sectionHeader: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  } as ViewStyle,

  // List section header text
  sectionHeaderText: {
    ...TYPOGRAPHY.caption1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: FONTS.semibold,
  } as TextStyle,
});

/**
 * Input Styles
 * Consistent text input patterns
 */
export const InputStyles = StyleSheet.create({
  // Base input container
  container: {
    marginBottom: SPACING.md,
  } as ViewStyle,

  // Input label
  label: {
    ...TYPOGRAPHY.subhead,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.semibold,
  } as TextStyle,

  // Text input field
  input: {
    ...TYPOGRAPHY.body,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: SPACING.touchTarget,
  } as ViewStyle & TextStyle,

  // Input with icon
  inputWithIcon: {
    ...TYPOGRAPHY.body,
    paddingLeft: SPACING.xl + SPACING.sm, // Space for icon
    paddingRight: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: SPACING.touchTarget,
  } as ViewStyle & TextStyle,

  // Icon container (positioned absolutely)
  iconContainer: {
    position: 'absolute',
    left: SPACING.md,
    top: '50%',
    marginTop: -12, // Half icon size (24px / 2)
  } as ViewStyle,

  // Error message
  error: {
    ...TYPOGRAPHY.caption1,
    marginTop: SPACING.xs,
  } as TextStyle,

  // Helper text
  helper: {
    ...TYPOGRAPHY.caption1,
    marginTop: SPACING.xs,
  } as TextStyle,
});

/**
 * Section Styles
 * Consistent section spacing and layout
 */
export const SectionStyles = StyleSheet.create({
  // Screen-level section
  section: {
    marginBottom: SPACING.sectionGap,
  } as ViewStyle,

  // Section with horizontal padding
  sectionWithPadding: {
    paddingHorizontal: SPACING.screenMargin,
    marginBottom: SPACING.sectionGap,
  } as ViewStyle,

  // Section title
  title: {
    ...TYPOGRAPHY.title2,
    marginBottom: SPACING.md,
  } as TextStyle,

  // Section subtitle
  subtitle: {
    ...TYPOGRAPHY.callout,
    marginBottom: SPACING.md,
  } as TextStyle,

  // Section header (uppercase, small)
  header: {
    ...TYPOGRAPHY.caption1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  } as TextStyle,
});

/**
 * Button Styles
 * Consistent button patterns (complement GlassButton)
 */
export const ButtonStyles = StyleSheet.create({
  // Base button
  base: {
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: SPACING.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Large button
  large: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: SPACING.touchTargetLarge,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Small button
  small: {
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  // Button text
  text: {
    ...TYPOGRAPHY.headline,
    fontFamily: FONTS.semibold,
  } as TextStyle,

  // Small button text
  textSmall: {
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.semibold,
  } as TextStyle,
});

/**
 * Badge Styles
 * Consistent badge patterns
 */
export const BadgeStyles = StyleSheet.create({
  // Base badge
  base: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: SPACING.radiusXS,
    borderWidth: 1,
    alignSelf: 'flex-start',
  } as ViewStyle,

  // Badge text
  text: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.semibold,
  } as TextStyle,

  // Success badge
  success: {
    backgroundColor: ALPHA_COLORS.success.bgSubtle,
    borderColor: ALPHA_COLORS.success.border,
  } as ViewStyle,

  // Error badge
  error: {
    backgroundColor: ALPHA_COLORS.danger.bgSubtle,
    borderColor: ALPHA_COLORS.danger.border,
  } as ViewStyle,

  // Warning badge
  warning: {
    backgroundColor: ALPHA_COLORS.warning.bgSubtle,
    borderColor: ALPHA_COLORS.warning.border,
  } as ViewStyle,

  // Info badge
  info: {
    backgroundColor: ALPHA_COLORS.info.bgSubtle,
    borderColor: ALPHA_COLORS.info.border,
  } as ViewStyle,

  // Primary badge
  primary: {
    backgroundColor: ALPHA_COLORS.primary.bgSubtle,
    borderColor: ALPHA_COLORS.primary.border,
  } as ViewStyle,
});

/**
 * Modal Styles
 * Consistent modal patterns
 */
export const ModalStyles = StyleSheet.create({
  // Modal backdrop
  backdrop: {
    flex: 1,
    backgroundColor: ALPHA_COLORS.overlay.heavy,
    justifyContent: 'flex-end',
  } as ViewStyle,

  // Modal container (bottom sheet style)
  container: {
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.screenMargin,
    maxHeight: '90%',
  } as ViewStyle,

  // Modal handle (drag indicator)
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  } as ViewStyle,

  // Modal title
  title: {
    ...TYPOGRAPHY.title2,
    marginBottom: SPACING.md,
    textAlign: 'center',
  } as TextStyle,

  // Modal content
  content: {
    flex: 1,
  } as ViewStyle,
});

/**
 * Screen Styles
 * Consistent screen-level layouts
 */
export const ScreenStyles = StyleSheet.create({
  // Standard screen container
  container: {
    flex: 1,
  } as ViewStyle,

  // Screen with horizontal padding
  contentWithPadding: {
    paddingHorizontal: SPACING.screenMargin,
  } as ViewStyle,

  // Screen content (for ScrollView)
  scrollContent: {
    paddingBottom: SPACING.xxl,
  } as ViewStyle,

  // Screen with tab bar (add bottom padding)
  withTabBar: {
    paddingBottom: 100, // TAB_BAR_HEIGHT
  } as ViewStyle,
});
