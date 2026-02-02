/**
 * Validated Input Component
 * TextInput with built-in validation feedback
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, COLORS, ALPHA_COLORS } from '../utils/constants';
import { ValidationResult } from '../utils/validation';

interface ValidatedInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  validate?: (value: string) => ValidationResult;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  showCharCount?: boolean;
  maxCharCount?: number;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

export function ValidatedInput({
  label,
  error: externalError,
  hint,
  validate,
  validateOnBlur = true,
  validateOnChange = false,
  showCharCount = false,
  maxCharCount,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  value,
  onChangeText,
  onBlur,
  ...rest
}: ValidatedInputProps) {
  const { colors, isDark } = useTheme();
  const [internalError, setInternalError] = useState<string | undefined>();
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

  const error = externalError || internalError;
  const charCount = value?.length || 0;

  const runValidation = useCallback(
    (text: string) => {
      if (validate) {
        const result = validate(text);
        setInternalError(result.valid ? undefined : result.error);
      }
    },
    [validate]
  );

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
      if (validateOnChange || (hasBeenBlurred && validate)) {
        runValidation(text);
      }
    },
    [onChangeText, validateOnChange, hasBeenBlurred, validate, runValidation]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      setHasBeenBlurred(true);
      if (validateOnBlur && value) {
        runValidation(value);
      }
      onBlur?.(e);
    },
    [validateOnBlur, value, runValidation, onBlur]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const getBorderColor = () => {
    if (error) return COLORS.danger;
    if (isFocused) return COLORS.primary;
    return colors.border;
  };

  const getBackgroundColor = () => {
    if (isDark) {
      return error
        ? ALPHA_COLORS.danger.bgSubtle
        : isFocused
        ? ALPHA_COLORS.primary.bgSubtle
        : ALPHA_COLORS.neutral.bg;
    }
    return error
      ? ALPHA_COLORS.danger.bgSubtle
      : isFocused
      ? ALPHA_COLORS.primary.bgSubtle
      : ALPHA_COLORS.neutralDark.bg;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? COLORS.danger : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              paddingLeft: leftIcon ? 0 : SPACING.md,
              paddingRight: rightIcon ? 0 : SPACING.md,
            },
          ]}
          value={value}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholderTextColor={colors.textTertiary}
          {...rest}
        />

        {/* Show validation status icon */}
        {hasBeenBlurred && !rightIcon && value && (
          <View style={styles.validationIcon}>
            {error ? (
              <Ionicons name="alert-circle" size={20} color={COLORS.danger} />
            ) : (
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            )}
          </View>
        )}

        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={colors.textSecondary}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>

      {/* Error message or hint */}
      <View style={styles.footer}>
        <View style={styles.messageContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning" size={14} color={COLORS.danger} />
              <Text style={[styles.errorText, { color: COLORS.danger }]}>
                {error}
              </Text>
            </View>
          ) : hint ? (
            <Text style={[styles.hintText, { color: colors.textTertiary }]}>
              {hint}
            </Text>
          ) : null}
        </View>

        {/* Character count */}
        {showCharCount && (
          <Text
            style={[
              styles.charCount,
              {
                color:
                  maxCharCount && charCount > maxCharCount
                    ? COLORS.danger
                    : colors.textTertiary,
              },
            ]}
          >
            {charCount}
            {maxCharCount ? `/${maxCharCount}` : ''}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  leftIcon: {
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginRight: SPACING.md,
    marginLeft: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    paddingVertical: SPACING.sm,
  },
  validationIcon: {
    marginRight: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: SPACING.xs,
    minHeight: 18,
  },
  messageContainer: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  charCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.sm,
  },
});

export default ValidatedInput;
