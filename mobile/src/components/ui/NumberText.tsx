import React from 'react';
import { Text, TextProps, Platform, StyleSheet } from 'react-native';
import { FONTS } from '../../utils/constants';

interface NumberTextProps extends TextProps {
  /**
   * Font weight variant for numbers
   * @default 'regular'
   */
  weight?: 'ultralight' | 'thin' | 'light' | 'regular' | 'medium' | 'semiBold' | 'bold' | 'heavy' | 'black';

  /**
   * Children should be numeric content (numbers, currency, percentages, etc.)
   */
  children: React.ReactNode;
}

/**
 * NumberText Component
 *
 * Wrapper for Text component optimized for numeric display.
 * Uses numeric font variants (currently Urbanist, can be replaced with SF Pro Rounded).
 * Automatically applies tabular-nums for monospaced number alignment on iOS.
 *
 * @example
 * ```tsx
 * <NumberText weight="bold">$190,000</NumberText>
 * <NumberText weight="semiBold" style={{ fontSize: 24 }}>1,450</NumberText>
 * ```
 */
export const NumberText: React.FC<NumberTextProps> = ({
  weight = 'regular',
  style,
  children,
  ...rest
}) => {
  // Map weight to numeric font family
  const fontFamilyMap: Record<string, string> = {
    ultralight: FONTS.numericUltralight,
    thin: FONTS.numericThin,
    light: FONTS.numericLight,
    regular: FONTS.numericRegular,
    medium: FONTS.numericMedium,
    semiBold: FONTS.numericSemiBold,
    bold: FONTS.numericBold,
    heavy: FONTS.numericHeavy,
    black: FONTS.numericBlack,
  };

  const fontFamily = fontFamilyMap[weight] || FONTS.numericRegular;

  return (
    <Text
      {...rest}
      style={[
        { fontFamily },
        Platform.OS === 'ios' && styles.tabularNums,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  tabularNums: {
    // iOS-specific: Use tabular (monospaced) numbers for alignment
    // This ensures numbers of different widths align properly in tables/lists
    fontVariant: ['tabular-nums'],
  },
});
