import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { FONTS, SPACING } from '../utils/constants';
import { lightImpact } from '../utils/haptics';
import { FeatureGrid } from '../components/dashboard/FeatureGrid';
import { MainStackParamList } from '../navigation/AppNavigator';

export default function DashboardScreen() {
  const { colors, isDark, setThemeMode } = useTheme();
  const { user } = useSupabaseAuth();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const userInitial = user?.user_metadata?.full_name
    ? user.user_metadata.full_name[0].toUpperCase()
    : user?.email
      ? user.email[0].toUpperCase()
      : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.dashboard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Menu
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => {
                lightImpact();
                setThemeMode(isDark ? 'light' : 'dark');
              }}
              style={[styles.headerIcon, { backgroundColor: colors.backgroundTertiary }]}
            >
              {isDark ? (
                <Sun size={18} color={colors.text} />
              ) : (
                <Moon size={18} color={colors.text} />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('SettingsMain')}
              style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}
            >
              <Text style={[styles.avatarText, { color: colors.text }]}>
                {userInitial}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature grid */}
        <FeatureGrid />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashboard: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: FONTS.semibold,
    fontSize: 28,
    lineHeight: 34,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: FONTS.semibold,
    fontSize: 15,
  },
});
