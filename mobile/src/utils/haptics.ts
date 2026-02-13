/**
 * Haptics Utility
 *
 * Provides consistent haptic feedback across the app following iOS standards.
 * Uses Expo Haptics API for cross-platform haptic feedback.
 */

import * as Haptics from 'expo-haptics';

/**
 * Light impact feedback for button presses and selections
 * Use for: Button taps, item selections, toggle switches
 */
export const lightImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Medium impact feedback for confirming actions
 * Use for: Confirming selections, successful form submissions
 */
export const mediumImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Heavy impact feedback for significant actions
 * Use for: Completing major tasks, finalizing workflows
 */
export const heavyImpact = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Success notification feedback
 * Use for: Successful uploads, resume generation complete, saved successfully
 */
export const notifySuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Warning notification feedback
 * Use for: Destructive actions (delete, clear), requiring user attention
 */
export const notifyWarning = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};

/**
 * Error notification feedback
 * Use for: Failed operations, validation errors, network errors
 */
export const notifyError = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
};

/**
 * Selection changed feedback
 * Use for: Picker changes, segmented control changes, tab switches
 */
export const selectionChanged = () => {
  Haptics.selectionAsync();
};

/**
 * Standard haptic patterns for common UI interactions
 */
export const HapticPatterns = {
  // Button interactions
  buttonPress: lightImpact,
  buttonPressHeavy: mediumImpact,

  // Form interactions
  formSubmit: mediumImpact,
  formError: notifyError,

  // Navigation
  tabSwitch: selectionChanged,
  screenTransition: lightImpact,

  // Actions
  deleteAction: notifyWarning,
  uploadSuccess: notifySuccess,
  downloadComplete: notifySuccess,
  copyToClipboard: lightImpact,

  // Outcomes
  success: notifySuccess,
  warning: notifyWarning,
  error: notifyError,

  // Interactive elements
  toggleSwitch: lightImpact,
  sliderChange: selectionChanged,
  pickerChange: selectionChanged,

  // Lists and selections
  itemSelect: lightImpact,
  itemDeselect: lightImpact,
  refreshPull: mediumImpact,
} as const;

/**
 * Haptic feedback helper that respects user settings
 * Can be extended to check system haptic settings in the future
 */
export const triggerHaptic = (pattern: keyof typeof HapticPatterns) => {
  // Future: Check if haptics are enabled in user settings
  // For now, always trigger (user can disable system-wide in iOS settings)
  HapticPatterns[pattern]();
};

/**
 * Default export for convenience
 */
export default {
  light: lightImpact,
  medium: mediumImpact,
  heavy: heavyImpact,
  success: notifySuccess,
  warning: notifyWarning,
  error: notifyError,
  selection: selectionChanged,
  patterns: HapticPatterns,
  trigger: triggerHaptic,
};
