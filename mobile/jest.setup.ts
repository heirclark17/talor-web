/**
 * Jest Setup File
 *
 * This file runs before each test file
 */

// Set __DEV__ for security.ts
(global as any).__DEV__ = true;

// Mock expo module to prevent import scope issues
jest.mock('expo', () => ({}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock expo-crypto
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn((length: number) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return Promise.resolve(bytes);
  }),
  digestStringAsync: jest.fn(() => Promise.resolve('mock-hash')),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock react-native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios', select: jest.fn((obj: any) => obj.ios ?? obj.default) },
  Alert: { alert: jest.fn() },
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
    sharedAction: 'sharedAction',
    dismissedAction: 'dismissedAction',
  },
  Linking: {
    openURL: jest.fn(() => Promise.resolve()),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844 })),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  AccessibilityInfo: {
    isReduceMotionEnabled: jest.fn(() => Promise.resolve(false)),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  },
  Appearance: {
    getColorScheme: jest.fn(() => 'dark'),
    addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    absoluteFillObject: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SectionList: 'SectionList',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  TextInput: 'TextInput',
  Image: 'Image',
  ImageBackground: 'ImageBackground',
  Modal: 'Modal',
  ActivityIndicator: 'ActivityIndicator',
  Switch: 'Switch',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    ScrollView: 'Animated.ScrollView',
    FlatList: 'Animated.FlatList',
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => 0),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    timing: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    spring: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    parallel: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    sequence: jest.fn(() => ({ start: jest.fn((cb?: any) => cb && cb({ finished: true })) })),
    loop: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    event: jest.fn(),
    createAnimatedComponent: jest.fn((comp: any) => comp),
  },
  useColorScheme: jest.fn(() => 'dark'),
  useWindowDimensions: jest.fn(() => ({ width: 390, height: 844 })),
  Keyboard: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
    dismiss: jest.fn(),
  },
  StatusBar: { setBarStyle: jest.fn() },
  PixelRatio: { get: jest.fn(() => 2), roundToNearestPixel: jest.fn((n: number) => n) },
  I18nManager: { isRTL: false },
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn((init: any) => ({ value: init })),
  useAnimatedStyle: jest.fn(() => ({})),
  withSpring: jest.fn((val: any) => val),
  withTiming: jest.fn((val: any) => val),
  withDelay: jest.fn((_delay: any, val: any) => val),
  withSequence: jest.fn((...vals: any[]) => vals[vals.length - 1]),
  withRepeat: jest.fn((val: any) => val),
  interpolateColor: jest.fn(),
  interpolate: jest.fn(),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    bezier: jest.fn(),
    inOut: jest.fn(() => jest.fn()),
  },
  runOnJS: jest.fn((fn: any) => fn),
  cancelAnimation: jest.fn(),
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
  },
  default: {
    call: () => {},
    createAnimatedComponent: jest.fn((comp: any) => comp),
    View: 'Animated.View',
    Text: 'Animated.Text',
    ScrollView: 'Animated.ScrollView',
  },
  createAnimatedComponent: jest.fn((comp: any) => comp),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({ canceled: true, assets: null })
  ),
  launchCameraAsync: jest.fn(() =>
    Promise.resolve({ canceled: true, assets: null })
  ),
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true })
  ),
  MediaTypeOptions: { All: 'All', Images: 'Images', Videos: 'Videos' },
}));

// Mock expo-clipboard
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock expo-file-system/legacy
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  downloadAsync: jest.fn(() => Promise.resolve({ status: 200, uri: '/mock/file' })),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  deleteAsync: jest.fn(() => Promise.resolve()),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));

// Mock expo-file-system (non-legacy)
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  cacheDirectory: '/mock/cache/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false, isDirectory: false })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  downloadAsync: jest.fn(() => Promise.resolve({ status: 200, uri: '/mock/file' })),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  readDirectoryAsync: jest.fn(() => Promise.resolve([])),
  deleteAsync: jest.fn(() => Promise.resolve()),
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() =>
    Promise.resolve({ canceled: true, assets: null })
  ),
}));

// Mock expo-sharing (module may not be installed - use virtual mock)
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}), { virtual: true });

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Mock @callstack/liquid-glass
jest.mock('@callstack/liquid-glass', () => ({
  LiquidGlass: 'LiquidGlass',
  LiquidGlassView: 'LiquidGlassView',
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const createMockSvg = (name: string) => name;
  return {
    __esModule: true,
    default: createMockSvg('Svg'),
    Svg: createMockSvg('Svg'),
    Circle: createMockSvg('Circle'),
    Rect: createMockSvg('Rect'),
    Path: createMockSvg('Path'),
    Line: createMockSvg('Line'),
    G: createMockSvg('G'),
    Defs: createMockSvg('Defs'),
    Pattern: createMockSvg('Pattern'),
    Use: createMockSvg('Use'),
    Text: createMockSvg('SvgText'),
    TSpan: createMockSvg('TSpan'),
    LinearGradient: createMockSvg('SvgLinearGradient'),
    Stop: createMockSvg('Stop'),
    Ellipse: createMockSvg('Ellipse'),
    Polygon: createMockSvg('Polygon'),
    Polyline: createMockSvg('Polyline'),
    ClipPath: createMockSvg('ClipPath'),
    Mask: createMockSvg('Mask'),
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: 'Screen',
  ScreenContainer: 'ScreenContainer',
  NativeScreen: 'NativeScreen',
  NativeScreenContainer: 'NativeScreenContainer',
  ScreenStack: 'ScreenStack',
  ScreenStackHeaderConfig: 'ScreenStackHeaderConfig',
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    canGoBack: jest.fn(() => false),
  })),
  useRoute: jest.fn(() => ({ params: {} })),
  useFocusEffect: jest.fn((callback: any) => callback()),
  useIsFocused: jest.fn(() => true),
  CommonActions: {
    navigate: jest.fn(),
    reset: jest.fn(),
  },
}));

// Mock @react-navigation/native-stack
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: 'Screen',
    Group: 'Group',
  })),
}));

// Mock @react-navigation/bottom-tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: 'Screen',
  })),
}));

// Mock @expo-google-fonts/urbanist
jest.mock('@expo-google-fonts/urbanist', () => ({
  useFonts: jest.fn(() => [true, null]),
  Urbanist_200ExtraLight: 'Urbanist_200ExtraLight',
  Urbanist_300Light: 'Urbanist_300Light',
  Urbanist_400Regular: 'Urbanist_400Regular',
  Urbanist_500Medium: 'Urbanist_500Medium',
  Urbanist_600SemiBold: 'Urbanist_600SemiBold',
  Urbanist_700Bold: 'Urbanist_700Bold',
  Urbanist_800ExtraBold: 'Urbanist_800ExtraBold',
}));

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
  Swipeable: 'Swipeable',
  DrawerLayout: 'DrawerLayout',
  State: {},
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  FlatList: 'FlatList',
  ScrollView: 'ScrollView',
  gestureHandlerRootHOC: jest.fn((comp: any) => comp),
}));

// Mock lucide-react-native icons
jest.mock('lucide-react-native', () => {
  const createMockIcon = (name: string) => {
    const MockIcon = (props: { size?: number; color?: string }) => `${name}Icon`;
    MockIcon.displayName = name;
    return MockIcon;
  };

  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (typeof prop === 'string') {
          return createMockIcon(prop);
        }
        return undefined;
      },
    }
  );
});

// Silence console warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') ||
      args[0].includes('useNativeDriver') ||
      args[0].includes('componentWillReceiveProps') ||
      args[0].includes('SecureStore'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
    url: 'https://example.com',
  })
) as jest.Mock;

// Global AbortController mock (if not available in jsdom)
if (typeof AbortController === 'undefined') {
  (global as any).AbortController = class {
    signal = { aborted: false };
    abort() {
      (this.signal as any).aborted = true;
    }
  };
}

// Custom matchers are added in jest.setup.matchers.ts (setupFilesAfterFramework)
