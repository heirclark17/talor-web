import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FileText, Target, Briefcase, BookmarkCheck, Settings } from 'lucide-react-native';
import { COLORS, FONTS } from '../utils/constants';

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

// Custom dark theme
const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.dark.background,
    card: COLORS.dark.backgroundSecondary,
    text: COLORS.dark.text,
    border: COLORS.dark.border,
    notification: COLORS.danger,
  },
};

// Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.dark.backgroundSecondary,
          borderTopColor: COLORS.dark.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.dark.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: FONTS.semibold,
          marginTop: 4,
        },
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
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.dark.background },
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
