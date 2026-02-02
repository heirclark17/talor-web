import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, ALPHA_COLORS } from '../utils/constants';

export default function ThemeToggle() {
  const { isDark, themeMode, setThemeMode } = useTheme();

  const handleToggle = () => {
    // Cycle through: light -> dark -> system
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={[
        styles.button,
        { backgroundColor: isDark ? ALPHA_COLORS.neutral.bg : ALPHA_COLORS.black[10] },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch theme. Current: ${themeMode}`}
      accessibilityHint="Cycles between light, dark, and system theme"
    >
      {isDark ? (
        <Sun color={COLORS.warning} size={20} />
      ) : (
        <Moon color={COLORS.info} size={20} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
