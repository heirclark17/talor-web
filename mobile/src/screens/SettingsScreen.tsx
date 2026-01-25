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
  Shield,
  HelpCircle,
  Mail,
  ExternalLink,
  Trash2,
  LogOut,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearUserSession, getUserId } from '../utils/userSession';
import { COLORS, SPACING, RADIUS, STORAGE_KEYS } from '../utils/constants';

export default function SettingsScreen() {
  const [userId, setUserId] = useState<string>('');
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

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

  const handleContact = () => {
    Linking.openURL('mailto:support@talor.app?subject=Mobile App Support');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://talor.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://talor.app/terms');
  };

  const renderSection = (title: string) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  const renderItem = (
    icon: React.ReactNode,
    label: string,
    onPress?: () => void,
    rightElement?: React.ReactNode,
    destructive?: boolean
  ) => (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconContainer, destructive && styles.iconContainerDestructive]}>
          {icon}
        </View>
        <Text style={[styles.itemLabel, destructive && styles.itemLabelDestructive]}>
          {label}
        </Text>
      </View>
      {rightElement || (onPress && <ChevronRight color={COLORS.dark.textTertiary} size={20} />)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Account Section */}
        {renderSection('ACCOUNT')}
        <View style={styles.card}>
          {renderItem(
            <User color={COLORS.dark.textSecondary} size={20} />,
            'User ID',
            undefined,
            <Text style={styles.itemValue} numberOfLines={1}>
              {userId.slice(0, 16)}...
            </Text>
          )}
        </View>

        {/* Preferences Section */}
        {renderSection('PREFERENCES')}
        <View style={styles.card}>
          {renderItem(
            <Moon color={COLORS.dark.textSecondary} size={20} />,
            'Dark Mode',
            undefined,
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.dark.border, true: COLORS.primary }}
              thumbColor={COLORS.dark.text}
            />
          )}
          {renderItem(
            <Bell color={COLORS.dark.textSecondary} size={20} />,
            'Notifications',
            undefined,
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.dark.border, true: COLORS.primary }}
              thumbColor={COLORS.dark.text}
            />
          )}
        </View>

        {/* Support Section */}
        {renderSection('SUPPORT')}
        <View style={styles.card}>
          {renderItem(
            <HelpCircle color={COLORS.dark.textSecondary} size={20} />,
            'Help Center',
            () => Linking.openURL('https://talor.app/help')
          )}
          {renderItem(
            <Mail color={COLORS.dark.textSecondary} size={20} />,
            'Contact Support',
            handleContact
          )}
        </View>

        {/* Legal Section */}
        {renderSection('LEGAL')}
        <View style={styles.card}>
          {renderItem(
            <Shield color={COLORS.dark.textSecondary} size={20} />,
            'Privacy Policy',
            handlePrivacy
          )}
          {renderItem(
            <ExternalLink color={COLORS.dark.textSecondary} size={20} />,
            'Terms of Service',
            handleTerms
          )}
        </View>

        {/* Data Section */}
        {renderSection('DATA')}
        <View style={styles.card}>
          {renderItem(
            <Trash2 color={COLORS.danger} size={20} />,
            'Clear Local Data',
            handleClearData,
            undefined,
            true
          )}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <View style={styles.appIcon}>
            <Settings color={COLORS.primary} size={32} />
          </View>
          <Text style={styles.appName}>Talor</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appCopyright}>
            {new Date().getFullYear()} Talor. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.dark.textTertiary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconContainerDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  itemLabel: {
    fontSize: 16,
    color: COLORS.dark.text,
    flex: 1,
  },
  itemLabelDestructive: {
    color: COLORS.danger,
  },
  itemValue: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    maxWidth: 120,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    marginTop: SPACING.lg,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.dark.glass,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.sm,
  },
  appCopyright: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
  },
});
