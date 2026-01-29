import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FileText, Target, Briefcase, BookmarkCheck, Settings } from 'lucide-react-native';
import { COLORS, FONTS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { GlassTabBar } from '../components/glass/GlassTabBar';

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

// Navigation types
export type RootStackParamList = {
  Main: undefined;
  UploadResume: undefined;
  TailorResume: { resumeId?: number };
  InterviewPrep: { tailoredResumeId: number };
  CommonQuestions: { interviewPrepId: number };
  PracticeQuestions: { interviewPrepId: number; tailoredResumeId: number };
  BehavioralTechnicalQuestions: { interviewPrepId: number };
  StarStories: undefined;
  CareerPathDesigner: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tailor: undefined;
  InterviewPreps: undefined;
  Saved: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator with Glass Tab Bar
function MainTabs() {
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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
          tabBarLabel: 'Resumes',
        }}
      />
      <Tab.Screen
        name="Tailor"
        component={TailorResumeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Target color={color} size={size} />,
          tabBarLabel: 'Tailor',
        }}
      />
      <Tab.Screen
        name="InterviewPreps"
        component={InterviewPrepListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
          tabBarLabel: 'Interview',
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedComparisonsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <BookmarkCheck color={color} size={size} />,
          tabBarLabel: 'Saved',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { colors, isDark } = useTheme();

  // Create custom theme based on current theme mode
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: COLORS.primary,
      background: 'transparent', // Transparent to show background layer
      card: 'transparent',
      text: colors.text,
      border: colors.border,
      notification: COLORS.danger,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="UploadResume"
          component={UploadResumeScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="TailorResume"
          component={TailorResumeScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="InterviewPrep"
          component={InterviewPrepScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="CommonQuestions"
          component={CommonQuestionsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="PracticeQuestions"
          component={PracticeQuestionsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="BehavioralTechnicalQuestions"
          component={BehavioralTechnicalQuestionsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="StarStories"
          component={StarStoriesScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="CareerPathDesigner"
          component={CareerPathDesignerScreen}
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
