import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BackgroundLayer } from './src/components/glass/BackgroundLayer';
import { SupabaseAuthProvider } from './src/contexts/SupabaseAuthContext';
import { PostHogProvider } from './src/contexts/PostHogContext';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          // Urbanist for text/letters
          'Urbanist_200ExtraLight': require('@expo-google-fonts/urbanist/200ExtraLight/Urbanist_200ExtraLight.ttf'),
          'Urbanist_300Light': require('@expo-google-fonts/urbanist/300Light/Urbanist_300Light.ttf'),
          'Urbanist_400Regular': require('@expo-google-fonts/urbanist/400Regular/Urbanist_400Regular.ttf'),
          'Urbanist_500Medium': require('@expo-google-fonts/urbanist/500Medium/Urbanist_500Medium.ttf'),
          'Urbanist_600SemiBold': require('@expo-google-fonts/urbanist/600SemiBold/Urbanist_600SemiBold.ttf'),
          'Urbanist_700Bold': require('@expo-google-fonts/urbanist/700Bold/Urbanist_700Bold.ttf'),
          'Urbanist_800ExtraBold': require('@expo-google-fonts/urbanist/800ExtraBold/Urbanist_800ExtraBold.ttf'),

          // SF Pro Rounded for numbers
          'SFProRounded-Ultralight': require('./assets/fonts/SF-Pro-Rounded-Ultralight.otf'),
          'SFProRounded-Thin': require('./assets/fonts/SF-Pro-Rounded-Thin.otf'),
          'SFProRounded-Light': require('./assets/fonts/SF-Pro-Rounded-Light.otf'),
          'SFProRounded-Regular': require('./assets/fonts/SF-Pro-Rounded-Regular.otf'),
          'SFProRounded-Medium': require('./assets/fonts/SF-Pro-Rounded-Medium.otf'),
          'SFProRounded-Semibold': require('./assets/fonts/SF-Pro-Rounded-Semibold.otf'),
          'SFProRounded-Bold': require('./assets/fonts/SF-Pro-Rounded-Bold.otf'),
          'SFProRounded-Heavy': require('./assets/fonts/SF-Pro-Rounded-Heavy.otf'),
          'SFProRounded-Black': require('./assets/fonts/SF-Pro-Rounded-Black.otf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <SupabaseAuthProvider>
        <PostHogProvider>
          <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
            <SafeAreaProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </PostHogProvider>
      </SupabaseAuthProvider>
    </ErrorBoundary>
  );
}

// Separate component to access theme context
function AppContent() {
  const { isDark } = useTheme();

  return (
    <BackgroundLayer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </BackgroundLayer>
  );
}
