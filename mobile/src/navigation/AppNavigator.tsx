import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  FileText,
  Target,
  Briefcase,
  BookOpen,
  Compass,
  Settings,
  BookmarkCheck,
  Search,
} from 'lucide-react-native';
import { COLORS, FONTS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { GlassTabBar } from '../components/glass/GlassTabBar';
import ErrorBoundary from '../components/ErrorBoundary';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

// Auth Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Screens
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
import BatchTailorScreen from '../screens/BatchTailorScreen';
import CertificationsScreen from '../screens/CertificationsScreen';
import STARStoryBuilderScreen from '../screens/STARStoryBuilderScreen';

// New Screens
import JobSearchScreen from '../screens/JobSearchScreen';
import MockInterviewScreen from '../screens/MockInterviewScreen';
import ResumeBuilderScreen from '../screens/ResumeBuilderScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import PricingScreen from '../screens/PricingScreen';
import NotFoundScreen from '../screens/NotFoundScreen';

// Auth Stack param list
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

// Stack param lists for each tab
export type HomeStackParamList = {
  HomeMain: undefined;
  UploadResume: undefined;
  ResumeBuilder: { templateId?: string };
  Templates: undefined;
};

export type TailorStackParamList = {
  TailorMain: undefined;
  TailorResume: { resumeId?: number };
  BatchTailor: undefined;
};

export type InterviewStackParamList = {
  InterviewList: undefined;
  InterviewPrep: { tailoredResumeId: number };
  CommonQuestions: { interviewPrepId: number };
  PracticeQuestions: { interviewPrepId: number; tailoredResumeId: number };
  BehavioralTechnicalQuestions: { interviewPrepId: number };
  Certifications: { interviewPrepId: number };
  STARStoryBuilder: { interviewPrepId: number; tailoredResumeId: number };
  MockInterview: undefined;
};

export type StoriesStackParamList = {
  StoriesMain: undefined;
};

export type CareerStackParamList = {
  CareerMain: undefined;
};

export type SavedStackParamList = {
  SavedMain: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Pricing: undefined;
};

export type JobsStackParamList = {
  JobSearch: undefined;
};

// Combined navigation types for useNavigation
export type RootStackParamList =
  & HomeStackParamList
  & TailorStackParamList
  & InterviewStackParamList
  & StoriesStackParamList
  & CareerStackParamList
  & SavedStackParamList
  & SettingsStackParamList
  & JobsStackParamList
  & { NotFound: undefined };

export type MainTabParamList = {
  Home: undefined;
  Jobs: undefined;
  Tailor: undefined;
  InterviewPreps: undefined;
  Stories: undefined;
  Career: undefined;
  Saved: undefined;
  Settings: undefined;
};

// Create stack navigators
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const JobsStack = createNativeStackNavigator<JobsStackParamList>();
const TailorStack = createNativeStackNavigator<TailorStackParamList>();
const InterviewStack = createNativeStackNavigator<InterviewStackParamList>();
const StoriesStack = createNativeStackNavigator<StoriesStackParamList>();
const CareerStack = createNativeStackNavigator<CareerStackParamList>();
const SavedStack = createNativeStackNavigator<SavedStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

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

// Home Stack
function HomeStackNavigator() {
  return (
    <ErrorBoundary screenName="Home">
      <HomeStack.Navigator screenOptions={stackScreenOptions}>
        <HomeStack.Screen name="HomeMain" component={HomeScreen} />
        <HomeStack.Screen
          name="UploadResume"
          component={UploadResumeScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <HomeStack.Screen name="Templates" component={TemplatesScreen} />
        <HomeStack.Screen name="ResumeBuilder" component={ResumeBuilderScreen} />
      </HomeStack.Navigator>
    </ErrorBoundary>
  );
}

// Jobs Stack
function JobsStackNavigator() {
  return (
    <ErrorBoundary screenName="Jobs">
      <JobsStack.Navigator screenOptions={stackScreenOptions}>
        <JobsStack.Screen name="JobSearch" component={JobSearchScreen} />
      </JobsStack.Navigator>
    </ErrorBoundary>
  );
}

// Tailor Stack
function TailorStackNavigator() {
  return (
    <ErrorBoundary screenName="Tailor">
      <TailorStack.Navigator screenOptions={stackScreenOptions}>
        <TailorStack.Screen name="TailorMain" component={TailorResumeScreen} />
        <TailorStack.Screen name="TailorResume" component={TailorResumeScreen} />
        <TailorStack.Screen name="BatchTailor" component={BatchTailorScreen} />
      </TailorStack.Navigator>
    </ErrorBoundary>
  );
}

// Interview Stack - contains all interview-related screens
function InterviewStackNavigator() {
  return (
    <ErrorBoundary screenName="Interview">
      <InterviewStack.Navigator screenOptions={stackScreenOptions}>
        <InterviewStack.Screen name="InterviewList" component={InterviewPrepListScreen} />
        <InterviewStack.Screen name="InterviewPrep" component={InterviewPrepScreen} />
        <InterviewStack.Screen name="CommonQuestions" component={CommonQuestionsScreen} />
        <InterviewStack.Screen name="PracticeQuestions" component={PracticeQuestionsScreen} />
        <InterviewStack.Screen name="BehavioralTechnicalQuestions" component={BehavioralTechnicalQuestionsScreen} />
        <InterviewStack.Screen name="Certifications" component={CertificationsScreen} />
        <InterviewStack.Screen name="STARStoryBuilder" component={STARStoryBuilderScreen} />
        <InterviewStack.Screen name="MockInterview" component={MockInterviewScreen} />
      </InterviewStack.Navigator>
    </ErrorBoundary>
  );
}

// Stories Stack
function StoriesStackNavigator() {
  return (
    <ErrorBoundary screenName="Stories">
      <StoriesStack.Navigator screenOptions={stackScreenOptions}>
        <StoriesStack.Screen name="StoriesMain" component={StarStoriesScreen} />
      </StoriesStack.Navigator>
    </ErrorBoundary>
  );
}

// Career Stack
function CareerStackNavigator() {
  return (
    <ErrorBoundary screenName="Career">
      <CareerStack.Navigator screenOptions={stackScreenOptions}>
        <CareerStack.Screen name="CareerMain" component={CareerPathDesignerScreen} />
      </CareerStack.Navigator>
    </ErrorBoundary>
  );
}

// Saved Stack
function SavedStackNavigator() {
  return (
    <ErrorBoundary screenName="Saved">
      <SavedStack.Navigator screenOptions={stackScreenOptions}>
        <SavedStack.Screen name="SavedMain" component={SavedComparisonsScreen} />
      </SavedStack.Navigator>
    </ErrorBoundary>
  );
}

// Settings Stack
function SettingsStackNavigator() {
  return (
    <ErrorBoundary screenName="Settings">
      <SettingsStack.Navigator screenOptions={stackScreenOptions}>
        <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
        <SettingsStack.Screen name="Pricing" component={PricingScreen} />
      </SettingsStack.Navigator>
    </ErrorBoundary>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          tabBarLabel: 'Resumes',
        }}
      />
      <Tab.Screen
        name="Jobs"
        component={JobsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          tabBarLabel: 'Jobs',
        }}
      />
      <Tab.Screen
        name="Tailor"
        component={TailorStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
          tabBarLabel: 'Tailor',
        }}
      />
      <Tab.Screen
        name="InterviewPreps"
        component={InterviewStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
          tabBarLabel: 'Interview',
        }}
      />
      <Tab.Screen
        name="Stories"
        component={StoriesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
          tabBarLabel: 'Stories',
        }}
      />
      <Tab.Screen
        name="Career"
        component={CareerStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
          tabBarLabel: 'Career',
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <BookmarkCheck color={color} size={size} />,
          tabBarLabel: 'Saved',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator with Auth Flow
export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  const { user, isLoading, isSignedIn } = useSupabaseAuth();

  // Enhanced logging to track auth state changes
  React.useEffect(() => {
    console.log('[AppNavigator] Auth state changed:', {
      isSignedIn,
      userEmail: user?.email || 'none',
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

  // Show nothing while auth is loading
  if (isLoading) {
    console.log('[AppNavigator] Supabase auth loading...');
    return null;
  }

  console.log('[AppNavigator] Supabase ready - isSignedIn:', isSignedIn, 'user:', user?.email || 'none', '→ showing:', isSignedIn ? 'MAIN APP' : 'AUTH SCREEN');

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main">
          {() => (isSignedIn ? <MainTabNavigator /> : <AuthStackNavigator />)}
        </RootStack.Screen>
        <RootStack.Screen
          name="NotFound"
          component={NotFoundScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
