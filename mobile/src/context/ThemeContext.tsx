import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useColorScheme, ViewStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, STORAGE_KEYS, GLASS, SHADOWS, ALPHA_COLORS } from '../utils/constants';
import { DEFAULT_BACKGROUND_ID, BackgroundId } from '../constants/backgrounds';

// Storage keys for theme preferences
const BACKGROUND_STORAGE_KEY = 'talor_background';
const CUSTOM_BG_STORAGE_KEY = 'talor_custom_bg';

// Theme mode options
export type ThemeMode = 'light' | 'dark' | 'sand-tan' | 'system';

// Theme context type
interface ThemeContextType {
  // Theme state
  isDark: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof COLORS.dark;

  // Background state
  backgroundId: string;
  setBackgroundImage: (id: string) => void;
  customBackgroundUri: string | null;
  setCustomBackgroundUri: (uri: string | null) => void;

  // Glass design system
  glass: typeof GLASS;
  shadows: typeof SHADOWS;
  alphaColors: typeof ALPHA_COLORS;

  // Helper functions
  getGlassBackground: (material?: keyof typeof GLASS.materials) => ViewStyle;
  getGlassCardStyle: (material?: keyof typeof GLASS.materials) => ViewStyle;
}

// Default context value
const defaultContext: ThemeContextType = {
  isDark: true,
  themeMode: 'dark',
  setThemeMode: () => {},
  colors: COLORS.dark,
  backgroundId: DEFAULT_BACKGROUND_ID,
  setBackgroundImage: () => {},
  customBackgroundUri: null,
  setCustomBackgroundUri: () => {},
  glass: GLASS,
  shadows: SHADOWS,
  alphaColors: ALPHA_COLORS,
  getGlassBackground: () => ({}),
  getGlassCardStyle: () => ({}),
};

// Create context
const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [backgroundId, setBackgroundIdState] = useState<string>(DEFAULT_BACKGROUND_ID);
  const [customBackgroundUri, setCustomBackgroundUriState] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Compute if dark mode based on theme mode and system preference
  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark';
    }
    // Treat sand-tan as dark mode for glass effects
    return themeMode === 'dark' || themeMode === 'sand-tan';
  }, [themeMode, systemColorScheme]);

  // Get colors based on theme
  const colors = useMemo(() => {
    if (themeMode === 'sand-tan') {
      return COLORS.sandDark;
    }
    return isDark ? COLORS.dark : COLORS.light;
  }, [isDark, themeMode]);

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const [savedTheme, savedBackground, savedCustomBg] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
          AsyncStorage.getItem(BACKGROUND_STORAGE_KEY),
          AsyncStorage.getItem(CUSTOM_BG_STORAGE_KEY),
        ]);

        if (savedTheme && ['light', 'dark', 'sand-tan', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }

        if (savedBackground) {
          setBackgroundIdState(savedBackground);
        }

        if (savedCustomBg) {
          setCustomBackgroundUriState(savedCustomBg);
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadPreferences();
  }, []);

  // Set theme mode and persist
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  }, []);

  // Set background and persist
  const setBackgroundImage = useCallback(async (id: string) => {
    setBackgroundIdState(id);
    try {
      await AsyncStorage.setItem(BACKGROUND_STORAGE_KEY, id);
    } catch (error) {
      console.error('Error saving background:', error);
    }
  }, []);

  // Set custom background URI and persist
  const setCustomBackgroundUri = useCallback(async (uri: string | null) => {
    setCustomBackgroundUriState(uri);
    try {
      if (uri) {
        await AsyncStorage.setItem(CUSTOM_BG_STORAGE_KEY, uri);
      } else {
        await AsyncStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving custom background:', error);
    }
  }, []);

  // Helper to get glass background style
  const getGlassBackground = useCallback(
    (material: keyof typeof GLASS.materials = 'regular'): ViewStyle => {
      const { opacity } = GLASS.materials[material];
      return {
        backgroundColor: isDark
          ? `rgba(255, 255, 255, ${opacity * 0.3})`
          : `rgba(255, 255, 255, ${opacity})`,
      };
    },
    [isDark]
  );

  // Helper to get complete glass card style
  const getGlassCardStyle = useCallback(
    (material: keyof typeof GLASS.materials = 'regular'): ViewStyle => {
      return {
        ...getGlassBackground(material),
        borderWidth: 1,
        borderColor: isDark
          ? ALPHA_COLORS.white[10]
          : ALPHA_COLORS.black[10],
        borderRadius: 16,
        overflow: 'hidden' as const,
      };
    },
    [isDark, getGlassBackground]
  );

  // Context value
  const contextValue = useMemo<ThemeContextType>(
    () => ({
      isDark,
      themeMode,
      setThemeMode,
      colors,
      backgroundId,
      setBackgroundImage,
      customBackgroundUri,
      setCustomBackgroundUri,
      glass: GLASS,
      shadows: SHADOWS,
      alphaColors: ALPHA_COLORS,
      getGlassBackground,
      getGlassCardStyle,
    }),
    [
      isDark,
      themeMode,
      setThemeMode,
      colors,
      backgroundId,
      setBackgroundImage,
      customBackgroundUri,
      setCustomBackgroundUri,
      getGlassBackground,
      getGlassCardStyle,
    ]
  );

  // Don't render until preferences are loaded
  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for just colors
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

// Convenience hook for background controls
export function useBackground() {
  const {
    backgroundId,
    setBackgroundImage,
    customBackgroundUri,
    setCustomBackgroundUri,
  } = useTheme();

  return {
    backgroundId,
    setBackgroundImage,
    customBackgroundUri,
    setCustomBackgroundUri,
  };
}

// Convenience hook for glass helpers
export function useGlass() {
  const { glass, getGlassBackground, getGlassCardStyle, isDark } = useTheme();
  return { glass, getGlassBackground, getGlassCardStyle, isDark };
}

export default ThemeContext;
