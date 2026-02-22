import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Switch,
} from 'react-native';
import {
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  Mail,
  ExternalLink,
  Trash2,
  ChevronRight,
  BookOpen,
  TrendingUp,
  Palette,
  Image as ImageIcon,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { clearUserSession, getUserId } from '../utils/userSession';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/glass/GlassCard';
import { BackgroundSelector } from '../components/glass/BackgroundSelector';
import { getBackgroundById } from '../constants/backgrounds';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { isDark, themeMode, setThemeMode, colors, backgroundId, customBackgroundUri } = useTheme();
  const [userId, setUserId] = useState<string>('');
  const [notifications, setNotifications] = useState(true);
  const [showBackgroundSelector, setShowBackgroundSelector] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const id = await getUserId();
      setUserId(id);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all your local data including your user session. Your resumes and data stored on the server will not be affected. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearUserSession();
              Alert.alert('Success', 'Local data cleared. A new session will be created.');
              const newId = await getUserId();
              setUserId(newId);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleToggleTheme = () => {
    // Cycle through: dark -> light -> system -> dark
    if (themeMode === 'dark') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('system');
    } else {
      setThemeMode('dark');
    }
  };

  const getThemeModeLabel = () => {
    switch (themeMode) {
      case 'dark':
        return 'Dark';
      case 'light':
        return 'Light';
      case 'system':
        return 'System';
    }
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@talor.app?subject=Mobile App Support');
  };

  const handlePrivacy = () => {
    navigation.navigate('Privacy');
  };

  const handleTerms = () => {
    navigation.navigate('Terms');
  };

  // Get current background name
  const currentBackgroundName = customBackgroundUri
    ? 'Custom Photo'
    : getBackgroundById(backgroundId)?.name || 'Default';

  const renderSection = (title: string) => (
    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>{title}</Text>
  );

  const renderItem = (
    icon: React.ReactNode,
    label: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    destructive?: boolean,
    accessibilityHint?: string
  ) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.backgroundTertiary },
            destructive && { backgroundColor: ALPHA_COLORS.danger.bg },
          ]}
        >
          {icon}
        </View>
        <Text
          style={[
            styles.itemLabel,
            { color: colors.text },
            destructive && { color: COLORS.danger },
          ]}
        >
          {label}
        </Text>
      </View>
      {rightElement || (onPress && <ChevronRight color={colors.textTertiary} size={20} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Account Section */}
        {renderSection('ACCOUNT')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            <User color={colors.textSecondary} size={20} />,
            'User ID',
            undefined,
            <Text style={[styles.itemValue, { color: colors.textSecondary }]} numberOfLines={1}>
              {userId.slice(0, 16)}...
            </Text>
          )}
        </GlassCard>

        {/* Features Section */}
        {renderSection('FEATURES')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            <BookOpen color={colors.textSecondary} size={20} />,
            'STAR Stories',
            () => navigation.navigate('StoriesMain' as any),
            undefined,
            false,
            'Manage your behavioral interview stories'
          )}
          {renderItem(
            <TrendingUp color={colors.textSecondary} size={20} />,
            'Career Path Designer',
            () => navigation.navigate('CareerMain' as any),
            undefined,
            false,
            'Plan your career progression with AI guidance'
          )}
        </GlassCard>

        {/* Appearance Section */}
        {renderSection('APPEARANCE')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            isDark ? (
              <Moon color={colors.textSecondary} size={20} />
            ) : (
              <Sun color={colors.textSecondary} size={20} />
            ),
            'Theme',
            handleToggleTheme,
            <View style={styles.themeIndicator}>
              <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
                {getThemeModeLabel()}
              </Text>
              <ChevronRight color={colors.textTertiary} size={20} />
            </View>,
            false,
            'Toggle between dark, light, and system theme'
          )}
          {renderItem(
            <Palette color={colors.textSecondary} size={20} />,
            'Background',
            () => setShowBackgroundSelector(true),
            <View style={styles.themeIndicator}>
              <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>
                {currentBackgroundName}
              </Text>
              <ChevronRight color={colors.textTertiary} size={20} />
            </View>,
            false,
            'Choose a custom background'
          )}
        </GlassCard>

        {/* Preferences Section */}
        {renderSection('PREFERENCES')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            <Bell color={colors.textSecondary} size={20} />,
            'Notifications',
            undefined,
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.border, true: COLORS.primary }}
              thumbColor={colors.text}
              accessibilityLabel="Enable notifications"
              accessibilityHint={notifications ? "Notifications are currently enabled" : "Notifications are currently disabled"}
              accessibilityRole="switch"
            />,
            false,
            'Toggle push notifications on or off'
          )}
        </GlassCard>

        {/* Support Section */}
        {renderSection('SUPPORT')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            <HelpCircle color={colors.textSecondary} size={20} />,
            'Help Center',
            () => Linking.openURL('https://talor.app/help'),
            undefined,
            false,
            'Opens help documentation in browser'
          )}
          {renderItem(
            <Mail color={colors.textSecondary} size={20} />,
            'Contact Support',
            handleContact,
            undefined,
            false,
            'Send an email to support team'
          )}
        </GlassCard>

        {/* Legal Section */}
        {renderSection('LEGAL')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            <Shield color={colors.textSecondary} size={20} />,
            'Privacy Policy',
            handlePrivacy,
            undefined,
            false,
            'View privacy and data protection policy'
          )}
          {renderItem(
            <ExternalLink color={colors.textSecondary} size={20} />,
            'Terms of Service',
            handleTerms,
            undefined,
            false,
            'View terms and conditions of use'
          )}
        </GlassCard>

        {/* Data Section */}
        {renderSection('DATA')}
        <GlassCard padding={0} material="thin">
          {renderItem(
            <Trash2 color={COLORS.danger} size={20} />,
            'Clear Local Data',
            handleClearData,
            undefined,
            true,
            'Deletes all local session data and user ID'
          )}
        </GlassCard>

        {/* App Info */}
        <View style={styles.appInfo}>
          <GlassCard
            style={styles.appIcon}
            padding={SPACING.md}
            material="thin"
            shadow="none"
          >
            <Settings color={COLORS.primary} size={32} />
          </GlassCard>
          <Text style={[styles.appName, { color: colors.text }]}>Talor</Text>
          <Text style={[styles.appVersion, { color: colors.textSecondary }]}>
            Version 1.0.0
          </Text>
          <Text style={[styles.appCopyright, { color: colors.textTertiary }]}>
            {new Date().getFullYear()} Talor. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {/* Background Selector Modal */}
      <BackgroundSelector
        visible={showBackgroundSelector}
        onClose={() => setShowBackgroundSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 60,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    letterSpacing: 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    minHeight: 56,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemLabel: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  itemValue: {
    ...TYPOGRAPHY.subhead,
    maxWidth: 120,
  },
  themeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  themeLabel: {
    ...TYPOGRAPHY.subhead,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  appIcon: {
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.xs,
  },
  appVersion: {
    ...TYPOGRAPHY.subhead,
    marginBottom: SPACING.sm,
  },
  appCopyright: {
    ...TYPOGRAPHY.caption1,
  },
});
