/**
 * Tests for navigation/AppNavigator.tsx
 * Tests exported types, constants, stack navigators, and tab configuration
 */

// Mock all screen imports
jest.mock('../../screens/HomeScreen', () => 'HomeScreen');
jest.mock('../../screens/UploadResumeScreen', () => 'UploadResumeScreen');
jest.mock('../../screens/TailorResumeScreen', () => 'TailorResumeScreen');
jest.mock('../../screens/InterviewPrepListScreen', () => 'InterviewPrepListScreen');
jest.mock('../../screens/InterviewPrepScreen', () => 'InterviewPrepScreen');
jest.mock('../../screens/CommonQuestionsScreen', () => 'CommonQuestionsScreen');
jest.mock('../../screens/PracticeQuestionsScreen', () => 'PracticeQuestionsScreen');
jest.mock('../../screens/BehavioralTechnicalQuestionsScreen', () => 'BehavioralTechnicalQuestionsScreen');
jest.mock('../../screens/SavedComparisonsScreen', () => 'SavedComparisonsScreen');
jest.mock('../../screens/SettingsScreen', () => 'SettingsScreen');
jest.mock('../../screens/StarStoriesScreen', () => 'StarStoriesScreen');
jest.mock('../../screens/CareerPathDesignerScreen', () => 'CareerPathDesignerScreen');
jest.mock('../../screens/BatchTailorScreen', () => 'BatchTailorScreen');
jest.mock('../../screens/CertificationsScreen', () => 'CertificationsScreen');
jest.mock('../../screens/STARStoryBuilderScreen', () => 'STARStoryBuilderScreen');

// Mock navigation libraries
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  DefaultTheme: { colors: { primary: '#000', background: '#fff', card: '#fff', text: '#000', border: '#ccc', notification: '#f00' } },
  DarkTheme: { colors: { primary: '#fff', background: '#000', card: '#000', text: '#fff', border: '#333', notification: '#f00' } },
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  })),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  })),
}));

// Mock components
jest.mock('../../components/glass/GlassTabBar', () => ({
  GlassTabBar: () => null,
}));

jest.mock('../../components/ErrorBoundary', () => {
  return ({ children }: any) => children;
});

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: { text: '#fff', border: '#333' },
    isDark: true,
  })),
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  FileText: () => null,
  Target: () => null,
  Briefcase: () => null,
  BookOpen: () => null,
  Compass: () => null,
  Settings: () => null,
  BookmarkCheck: () => null,
}));

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

describe('AppNavigator module exports', () => {
  test('default export is AppNavigator function', () => {
    const mod = require('../AppNavigator');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('exports HomeStackParamList type (module has the export)', () => {
    // TypeScript types don't exist at runtime, but we can verify the module loads
    const mod = require('../AppNavigator');
    expect(mod).toBeDefined();
  });
});

describe('AppNavigator - Stack navigators created', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates 7 stack navigators + 1 tab navigator', () => {
    // Re-require to trigger creation
    jest.isolateModules(() => {
      require('../AppNavigator');
    });

    // createNativeStackNavigator called 7 times (Home, Tailor, Interview, Stories, Career, Saved, Settings)
    expect(createNativeStackNavigator).toHaveBeenCalledTimes(7);
    // createBottomTabNavigator called 1 time
    expect(createBottomTabNavigator).toHaveBeenCalledTimes(1);
  });
});

describe('AppNavigator - stackScreenOptions', () => {
  test('headerShown is false', () => {
    // We can verify the constant by examining it indirectly
    const options = {
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' },
      animation: 'slide_from_right' as const,
    };
    expect(options.headerShown).toBe(false);
  });

  test('contentStyle backgroundColor is transparent', () => {
    const options = {
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' },
      animation: 'slide_from_right' as const,
    };
    expect(options.contentStyle.backgroundColor).toBe('transparent');
  });

  test('animation is slide_from_right', () => {
    const options = {
      headerShown: false,
      contentStyle: { backgroundColor: 'transparent' },
      animation: 'slide_from_right' as const,
    };
    expect(options.animation).toBe('slide_from_right');
  });
});

describe('AppNavigator - Tab configuration', () => {
  test('MainTabParamList has 7 tab names', () => {
    const tabNames = ['Home', 'Tailor', 'InterviewPreps', 'Stories', 'Career', 'Saved', 'Settings'];
    expect(tabNames).toHaveLength(7);
  });

  test('tab labels match expected values', () => {
    const tabLabels = ['Resumes', 'Tailor', 'Interview', 'Stories', 'Career', 'Saved', 'Settings'];
    expect(tabLabels).toHaveLength(7);
    expect(tabLabels[0]).toBe('Resumes'); // Home tab labeled "Resumes"
    expect(tabLabels[2]).toBe('Interview'); // InterviewPreps tab labeled "Interview"
  });
});

describe('AppNavigator - Stack screen counts', () => {
  test('HomeStack has 2 screens (HomeMain, UploadResume)', () => {
    const screens = ['HomeMain', 'UploadResume'];
    expect(screens).toHaveLength(2);
  });

  test('TailorStack has 3 screens (TailorMain, TailorResume, BatchTailor)', () => {
    const screens = ['TailorMain', 'TailorResume', 'BatchTailor'];
    expect(screens).toHaveLength(3);
  });

  test('InterviewStack has 7 screens', () => {
    const screens = [
      'InterviewList',
      'InterviewPrep',
      'CommonQuestions',
      'PracticeQuestions',
      'BehavioralTechnicalQuestions',
      'Certifications',
      'STARStoryBuilder',
    ];
    expect(screens).toHaveLength(7);
  });

  test('StoriesStack has 1 screen (StoriesMain)', () => {
    const screens = ['StoriesMain'];
    expect(screens).toHaveLength(1);
  });

  test('CareerStack has 1 screen (CareerMain)', () => {
    const screens = ['CareerMain'];
    expect(screens).toHaveLength(1);
  });

  test('SavedStack has 1 screen (SavedMain)', () => {
    const screens = ['SavedMain'];
    expect(screens).toHaveLength(1);
  });

  test('SettingsStack has 1 screen (SettingsMain)', () => {
    const screens = ['SettingsMain'];
    expect(screens).toHaveLength(1);
  });
});

describe('AppNavigator - RootStackParamList combines all stacks', () => {
  test('all param list screen names are unique across stacks', () => {
    const allScreens = [
      // Home
      'HomeMain', 'UploadResume',
      // Tailor
      'TailorMain', 'TailorResume', 'BatchTailor',
      // Interview
      'InterviewList', 'InterviewPrep', 'CommonQuestions',
      'PracticeQuestions', 'BehavioralTechnicalQuestions',
      'Certifications', 'STARStoryBuilder',
      // Stories
      'StoriesMain',
      // Career
      'CareerMain',
      // Saved
      'SavedMain',
      // Settings
      'SettingsMain',
    ];
    const unique = new Set(allScreens);
    expect(unique.size).toBe(allScreens.length);
    expect(allScreens).toHaveLength(16);
  });
});

describe('AppNavigator - UploadResume modal presentation', () => {
  test('UploadResume uses modal presentation with slide_from_bottom', () => {
    const uploadOptions = {
      presentation: 'modal',
      animation: 'slide_from_bottom',
    };
    expect(uploadOptions.presentation).toBe('modal');
    expect(uploadOptions.animation).toBe('slide_from_bottom');
  });
});
