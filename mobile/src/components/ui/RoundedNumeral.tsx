import React from 'react';
import { TextProps } from 'react-native';
import { NumberText } from './NumberText';

interface RoundedNumeralProps extends Omit<TextProps, 'children'> {
  /**
   * Numeric value to display
   */
  value: number;

  /**
   * Font weight variant for numbers
   * @default 'regular'
   */
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'heavy' | 'black';

  /**
   * Prefix to display before the number (e.g., '$', '€')
   */
  prefix?: string;

  /**
   * Suffix to display after the number (e.g., '%', 'kg', 'lbs')
   */
  suffix?: string;

  /**
   * Number of decimal places to display
   * @default 0
   */
  decimals?: number;

  /**
   * Whether to add thousand separators (commas)
   * @default true
   */
  separators?: boolean;

  /**
   * Custom thousand separator character
   * @default ','
   */
  separatorChar?: string;

  /**
   * Custom decimal separator character
   * @default '.'
   */
  decimalChar?: string;
}

/**
 * RoundedNumeral Component
 *
 * Formatted numeric display with separators, prefix/suffix support.
 * Uses NumberText component for proper font rendering.
 *
 * @example
 * ```tsx
 * // Currency
 * <RoundedNumeral value={190000} prefix="$" separators />
 * // Output: $190,000
 *
 * // Percentage
 * <RoundedNumeral value={23.5} suffix="%" decimals={1} />
 * // Output: 23.5%
 *
 * // Weight
 * <RoundedNumeral value={1450} suffix=" lbs" separators />
 * // Output: 1,450 lbs
 *
 * // Count with decimals
 * <RoundedNumeral value={1234.567} decimals={2} separators />
 * // Output: 1,234.57
 * ```
 */
export const RoundedNumeral: React.FC<RoundedNumeralProps> = ({
  value,
  weight = 'regular',
  prefix = '',
  suffix = '',
  decimals = 0,
  separators = true,
  separatorChar = ',',
  decimalChar = '.',
  style,
  ...rest
}) => {
  /**
   * Format number with thousand separators
   */
  const formatWithSeparators = (num: number): string => {
    const parts = num.toFixed(decimals).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    // Add thousand separators to integer part
    const formattedInteger = separators
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separatorChar)
      : integerPart;

    // Combine with decimal part if decimals > 0
    if (decimals > 0 && decimalPart) {
      return `${formattedInteger}${decimalChar}${decimalPart}`;
    }

    return formattedInteger;
  };

  const formattedValue = formatWithSeparators(value);
  const displayText = `${prefix}${formattedValue}${suffix}`;

  return (
    <NumberText weight={weight} style={style} {...rest}>
      {displayText}
    </NumberText>
  );
};
