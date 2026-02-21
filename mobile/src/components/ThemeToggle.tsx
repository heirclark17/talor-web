import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Palette } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, ALPHA_COLORS } from '../utils/constants';

export default function ThemeToggle() {
  const { isDark, themeMode, setThemeMode } = useTheme();

  const handleToggle = () => {
    // Cycle through: light -> dark -> sand-tan -> system
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('sand-tan');
    } else if (themeMode === 'sand-tan') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  // Determine icon based on theme mode
  const getIcon = () => {
    if (themeMode === 'sand-tan') {
      return <Palette color="#B8860B" size={20} />;
    }
    return isDark ? (
      <Sun color={COLORS.warning} size={20} />
    ) : (
      <Moon color={COLORS.info} size={20} />
    );
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
      accessibilityHint="Cycles between light, dark, sand-tan, and system theme"
    >
      {getIcon()}
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
