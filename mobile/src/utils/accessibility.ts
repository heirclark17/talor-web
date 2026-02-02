/**
 * Accessibility Utilities
 * Provides consistent accessibility attributes across the app
 */

export interface AccessibilityProps {
  accessibilityRole?: 'button' | 'link' | 'text' | 'image' | 'header' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
  };
  accessibilityValue?: {
    text?: string;
    min?: number;
    max?: number;
    now?: number;
  };
}

/**
 * Creates accessibility props for a button
 */
export const buttonA11y = (
  label: string,
  hint?: string,
  disabled?: boolean
): AccessibilityProps => ({
  accessibilityRole: 'button',
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: disabled !== undefined ? { disabled } : undefined,
});

/**
 * Creates accessibility props for a link
 */
export const linkA11y = (label: string, hint?: string): AccessibilityProps => ({
  accessibilityRole: 'link',
  accessibilityLabel: label,
  accessibilityHint: hint,
});

/**
 * Creates accessibility props for a text input
 */
export const inputA11y = (
  label: string,
  hint?: string,
  value?: string
): AccessibilityProps => ({
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityValue: value ? { text: value } : undefined,
});

/**
 * Creates accessibility props for a header
 */
export const headerA11y = (text: string): AccessibilityProps => ({
  accessibilityRole: 'header',
  accessibilityLabel: text,
});
