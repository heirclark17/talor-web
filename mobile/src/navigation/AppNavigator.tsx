import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets, SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { AppHeader } from '../components/navigation/AppHeader';

// Auth Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadResumeScreen from '../screens/UploadResumeScreen';
import TailorResumeScreen from '../screens/TailorResumeScreen';
import InterviewPrepListScreen from '../screens/InterviewPrepListScreen';
import InterviewPrepScreen from '../screens/InterviewPrepScreen';
import CommonQuestionsScreen from '../screens/CommonQuestionsScreen';
import PracticeQuestionsScreen from '../screens/PracticeQuestionsScreen';
import BehavioralTechnicalQuestionsScreen from '../screens/BehavioralTechnicalQuestionsScreen';
import SavedComparisonsScreen from '../screens/SavedComparisonsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StarStoriesScreen from '../screens/StarStoriesScreen';
import CareerPathDesignerScreen from '../screens/CareerPathDesignerScreen';
import SavedCareerPathsScreen from '../screens/SavedCareerPathsScreen';
import SavedCareerPlanDetailScreen from '../screens/SavedCareerPlanDetailScreen';
import BatchTailorScreen from '../screens/BatchTailorScreen';
import TailoredResumesScreen from '../screens/TailoredResumesScreen';
import CertificationsScreen from '../screens/CertificationsScreen';
import STARStoryBuilderScreen from '../screens/STARStoryBuilderScreen';
import CoverLetterGeneratorScreen from '../screens/CoverLetterGeneratorScreen';
import ApplicationTrackerScreen from '../screens/ApplicationTrackerScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import JobSearchScreen from '../screens/JobSearchScreen';
import MockInterviewScreen from '../screens/MockInterviewScreen';
import ResumeBuilderScreen from '../screens/ResumeBuilderScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import PricingScreen from '../screens/PricingScreen';
import PracticeHistoryScreen from '../screens/PracticeHistoryScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

// Auth Stack param list
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

// Main Stack param list - all screens in one stack
export type MainStackParamList = {
  // Dashboard
  Dashboard: { skipGreeting?: boolean } | undefined;

  // Home / Resumes
  HomeMain: undefined;
  UploadResume: undefined;
  ResumeBuilder: { templateId?: string };
  Templates: undefined;

  // Tailor
  TailorMain: undefined;
  TailorResume: { resumeId?: number };
  BatchTailor: undefined;
  TailoredResumes: undefined;

  // Interview
  InterviewList: undefined;
  InterviewPrep: { tailoredResumeId: number };
  CommonQuestions: { interviewPrepId: number };
  PracticeQuestions: { interviewPrepId: number; tailoredResumeId: number };
  BehavioralTechnicalQuestions: { interviewPrepId: number };
  Certifications: { interviewPrepId: number };
  STARStoryBuilder: { interviewPrepId: number; tailoredResumeId: number };
  MockInterview: { interviewPrepId?: number; company?: string; jobTitle?: string } | undefined;
  PracticeHistory: undefined;

  // Stories
  StoriesMain: undefined;

  // Career
  CareerMain: undefined;
  SavedCareerPaths: undefined;
  SavedCareerPlanDetail: { planId: number };
  CoverLetters: undefined;

  // Saved
  SavedMain: undefined;
  Applications: undefined;

  // Jobs
  JobSearch: undefined;

  // Settings
  SettingsMain: undefined;
  Pricing: undefined;
  Privacy: undefined;
  Terms: undefined;

  // Not Found
  NotFound: undefined;
};

// Legacy type exports for backwards compatibility
export type HomeStackParamList = Pick<MainStackParamList, 'HomeMain' | 'UploadResume' | 'ResumeBuilder' | 'Templates'>;
export type TailorStackParamList = Pick<MainStackParamList, 'TailorMain' | 'TailorResume' | 'BatchTailor' | 'TailoredResumes'>;
export type InterviewStackParamList = Pick<MainStackParamList, 'InterviewList' | 'InterviewPrep' | 'CommonQuestions' | 'PracticeQuestions' | 'BehavioralTechnicalQuestions' | 'Certifications' | 'STARStoryBuilder' | 'MockInterview' | 'PracticeHistory'>;
export type StoriesStackParamList = Pick<MainStackParamList, 'StoriesMain'>;
export type CareerStackParamList = Pick<MainStackParamList, 'CareerMain' | 'SavedCareerPaths' | 'SavedCareerPlanDetail' | 'CoverLetters'>;
export type SavedStackParamList = Pick<MainStackParamList, 'SavedMain' | 'Applications'>;
export type JobsStackParamList = Pick<MainStackParamList, 'JobSearch'>;
export type SettingsStackParamList = Pick<MainStackParamList, 'SettingsMain' | 'Pricing' | 'Privacy' | 'Terms'>;
export type RootStackParamList = MainStackParamList;

// Create stack navigators
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// Stack screen options
const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: 'transparent' },
  animation: 'slide_from_right' as const,
};

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <ErrorBoundary screenName="Auth">
      <AuthStack.Navigator screenOptions={stackScreenOptions}>
        <AuthStack.Screen name="SignIn" component={SignInScreen} />
        <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      </AuthStack.Navigator>
    </ErrorBoundary>
  );
}

// Screen layout wrapper - renders AppHeader and zeroes out top safe area for children
function ScreenLayoutWrapper({ children, hideHeader }: { children: React.ReactNode; hideHeader: boolean }) {
  const insets = useSafeAreaInsets();

  if (hideHeader) {
    return <>{children}</>;
  }

  return (
    <View style={{ flex: 1 }}>
      <AppHeader />
      <SafeAreaInsetsContext.Provider value={{ ...insets, top: 0 }}>
        {children}
      </SafeAreaInsetsContext.Provider>
    </View>
  );
}

// Main Stack Navigator with AppHeader
function MainStackNavigator() {
  return (
    <ErrorBoundary screenName="Main">
      <MainStack.Navigator
        screenOptions={stackScreenOptions}
        screenLayout={({ children, route }) => (
          <ScreenLayoutWrapper hideHeader={route.name === 'Dashboard'}>
            {children}
          </ScreenLayoutWrapper>
        )}
      >
        {/* Dashboard - initial route */}
        <MainStack.Screen name="Dashboard" component={DashboardScreen} />

        {/* Home / Resumes */}
        <MainStack.Screen name="HomeMain" component={HomeScreen} />
        <MainStack.Screen
          name="UploadResume"
          component={UploadResumeScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <MainStack.Screen name="Templates" component={TemplatesScreen} />
        <MainStack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />

        {/* Jobs */}
        <MainStack.Screen name="JobSearch" component={JobSearchScreen} />

        {/* Tailor */}
        <MainStack.Screen name="TailorMain" component={TailorResumeScreen} />
        <MainStack.Screen name="TailorResume" component={TailorResumeScreen} />
        <MainStack.Screen name="BatchTailor" component={BatchTailorScreen} />
        <MainStack.Screen name="TailoredResumes" component={TailoredResumesScreen} />

        {/* Interview */}
        <MainStack.Screen name="InterviewList" component={InterviewPrepListScreen} />
        <MainStack.Screen name="InterviewPrep" component={InterviewPrepScreen} />
        <MainStack.Screen name="CommonQuestions" component={CommonQuestionsScreen} />
        <MainStack.Screen name="PracticeQuestions" component={PracticeQuestionsScreen} />
        <MainStack.Screen name="BehavioralTechnicalQuestions" component={BehavioralTechnicalQuestionsScreen} />
        <MainStack.Screen name="Certifications" component={CertificationsScreen} />
        <MainStack.Screen name="STARStoryBuilder" component={STARStoryBuilderScreen} />
        <MainStack.Screen name="MockInterview" component={MockInterviewScreen} />
        <MainStack.Screen name="PracticeHistory" component={PracticeHistoryScreen} />

        {/* Stories */}
        <MainStack.Screen name="StoriesMain" component={StarStoriesScreen} />

        {/* Career */}
        <MainStack.Screen name="CareerMain" component={CareerPathDesignerScreen} />
        <MainStack.Screen name="SavedCareerPaths" component={SavedCareerPathsScreen} />
        <MainStack.Screen name="SavedCareerPlanDetail" component={SavedCareerPlanDetailScreen} />
        <MainStack.Screen name="CoverLetters" component={CoverLetterGeneratorScreen} />

        {/* Saved */}
        <MainStack.Screen name="SavedMain" component={SavedComparisonsScreen} />
        <MainStack.Screen name="Applications" component={ApplicationTrackerScreen} />

        {/* Settings */}
        <MainStack.Screen name="SettingsMain" component={SettingsScreen} />
        <MainStack.Screen name="Pricing" component={PricingScreen} />
        <MainStack.Screen name="Privacy" component={PrivacyPolicyScreen} />
        <MainStack.Screen name="Terms" component={TermsOfServiceScreen} />

        {/* 404 */}
        <MainStack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </MainStack.Navigator>
    </ErrorBoundary>
  );
}

// Main App Navigator with Auth Flow
export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { user, isLoading, isSignedIn } = useSupabaseAuth();

  // Enhanced logging to track auth state changes
  React.useEffect(() => {
    if (__DEV__) console.log('[AppNavigator] Auth state changed:', {
      isSignedIn,
      willShow: isSignedIn ? 'MAIN APP' : 'AUTH SCREEN',
    });
  }, [isSignedIn, user]);

  // Create custom theme based on current theme mode
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: COLORS.primary,
      background: 'transparent',
      card: 'transparent',
      text: colors.text,
      border: colors.border,
      notification: COLORS.danger,
    },
  };

  // Show themed loading screen while auth is loading
  if (isLoading) {
    if (__DEV__) console.log('[AppNavigator] Supabase auth loading...');
    return (
      <View style={[loadingStyles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (__DEV__) console.log('[AppNavigator] Supabase ready - isSignedIn:', isSignedIn, '→ showing:', isSignedIn ? 'MAIN APP' : 'AUTH SCREEN');

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main">
          {() => (isSignedIn ? <MainStackNavigator /> : <AuthStackNavigator />)}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const loadingStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
