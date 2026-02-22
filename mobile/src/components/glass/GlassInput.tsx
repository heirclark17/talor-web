import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  Text,
  Animated,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, TYPOGRAPHY, ALPHA_COLORS } from '../../utils/constants';
import { InputStyles } from '../../constants/SharedStyles';

type GlassMaterial = 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chrome';

interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label displayed above the field
   */
  label?: string;

  /**
   * Error message displayed below the field
   */
  error?: string;

  /**
   * Helper text displayed below the field (when no error)
   */
  helper?: string;

  /**
   * Glass material variant
   * @default 'thin'
   */
  material?: GlassMaterial;

  /**
   * Container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Input style
   */
  inputStyle?: StyleProp<TextStyle>;

  /**
   * Icon element to display on the left side of input
   */
  leftIcon?: React.ReactNode;

  /**
   * Icon element to display on the right side of input
   */
  rightIcon?: React.ReactNode;
}

/**
 * GlassInput Component
 *
 * TextInput with glass background effect, label, error message, and focus states.
 * Wraps GlassCard for consistent glass aesthetic.
 *
 * @example
 * ```tsx
 * <GlassInput
 *   label="Email Address"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   keyboardType="email-address"
 * />
 * ```
 */
export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  helper,
  material = 'thin',
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  const hasError = !!error;
  const hasIcon = !!leftIcon || !!rightIcon;

  return (
    <View style={[InputStyles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[InputStyles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}

      {/* Input Container with Glass Background */}
      <GlassCard
        material={material}
        shadow="subtle"
        padding={0}
        borderRadius={SPACING.radiusMD}
        bordered
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          isFocused && !hasError && { borderColor: ALPHA_COLORS.primary.border },
          hasError && { borderColor: ALPHA_COLORS.danger.border },
        ]}
      >
        <View style={styles.inputWrapper}>
          {/* Left Icon */}
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}

          {/* Text Input */}
          <TextInput
            {...textInputProps}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              InputStyles.input,
              { color: colors.text },
              leftIcon ? { paddingLeft: SPACING.xl + SPACING.sm } : undefined,
              rightIcon ? { paddingRight: SPACING.xl + SPACING.sm } : undefined,
              inputStyle,
            ]}
            placeholderTextColor={colors.textTertiary}
          />

          {/* Right Icon */}
          {rightIcon && (
            <View style={styles.rightIconContainer}>
              {rightIcon}
            </View>
          )}
        </View>
      </GlassCard>

      {/* Error or Helper Text */}
      {error && (
        <Text style={[InputStyles.error, { color: ALPHA_COLORS.danger.text }]}>
          {error}
        </Text>
      )}
      {!error && helper && (
        <Text style={[InputStyles.helper, { color: colors.textSecondary }]}>
          {helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderWidth: 2,
  },
  inputContainerError: {
    borderWidth: 1.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  leftIconContainer: {
    position: 'absolute',
    left: SPACING.md,
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: SPACING.md,
    zIndex: 1,
  },
});
