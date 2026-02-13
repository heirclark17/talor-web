import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { BackgroundLayer } from './src/components/glass/BackgroundLayer';
import { CLERK_PUBLISHABLE_KEY } from './src/utils/constants';

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('SecureStore get error:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('SecureStore save error:', err);
    }
  },
};

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Urbanist_200ExtraLight': require('@expo-google-fonts/urbanist/200ExtraLight/Urbanist_200ExtraLight.ttf'),
          'Urbanist_300Light': require('@expo-google-fonts/urbanist/300Light/Urbanist_300Light.ttf'),
          'Urbanist_400Regular': require('@expo-google-fonts/urbanist/400Regular/Urbanist_400Regular.ttf'),
          'Urbanist_500Medium': require('@expo-google-fonts/urbanist/500Medium/Urbanist_500Medium.ttf'),
          'Urbanist_600SemiBold': require('@expo-google-fonts/urbanist/600SemiBold/Urbanist_600SemiBold.ttf'),
          'Urbanist_700Bold': require('@expo-google-fonts/urbanist/700Bold/Urbanist_700Bold.ttf'),
          'Urbanist_800ExtraBold': require('@expo-google-fonts/urbanist/800ExtraBold/Urbanist_800ExtraBold.ttf'),
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
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ClerkProvider>
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
