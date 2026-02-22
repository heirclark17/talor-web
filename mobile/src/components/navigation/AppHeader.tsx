import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { BlurView } from 'expo-blur';
import {
  FileText,
  Menu,
  X,
  Upload,
  Target,
  Layers,
  Search,
  Briefcase,
  BookOpen,
  Sparkles,
  FileEdit,
  Bookmark,
  TrendingUp,
  CreditCard,
  Settings,
  Plus,
  PenTool,
  Sun,
  Moon,
  User,
  LogOut,
} from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS } from '../../utils/constants';

interface MenuItem {
  to: string;
  screen: string;
  stack?: string;
  icon: any;
  label: string;
  desc: string;
  iconColor: string;
}

interface MenuSection {
  label: string;
  links: MenuItem[];
}

export function AppHeader() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useSupabaseAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuSections: MenuSection[] = [
    {
      label: 'Resume Tools',
      links: [
        { to: '/resumes', screen: 'HomeMain', stack: 'Home', icon: FileText, label: 'My Resumes', desc: 'View and manage all resumes', iconColor: '#60A5FA' },
        { to: '/resume-builder', screen: 'ResumeBuilder', stack: 'Home', icon: Plus, label: 'Build Resume', desc: 'Start from scratch', iconColor: '#34D399' },
        { to: '/templates', screen: 'Templates', stack: 'Home', icon: PenTool, label: 'Templates', desc: 'Browse resume templates', iconColor: '#A78BFA' },
        { to: '/upload', screen: 'UploadResume', stack: 'Home', icon: Upload, label: 'Upload', desc: 'Upload a new base resume', iconColor: '#10B981' },
        { to: '/tailor', screen: 'TailorMain', stack: 'Tailor', icon: Target, label: 'Tailor', desc: 'Customize for a specific job', iconColor: '#FB7185' },
        { to: '/batch-tailor', screen: 'BatchTailor', stack: 'Tailor', icon: Layers, label: 'Batch Tailor', desc: 'Tailor for multiple jobs at once', iconColor: '#8B5CF6' },
      ],
    },
    {
      label: 'Career Prep',
      links: [
        { to: '/job-search', screen: 'JobSearch', stack: 'Jobs', icon: Search, label: 'Job Search', desc: 'Find and tailor for jobs', iconColor: '#10B981' },
        { to: '/applications', screen: 'Applications', stack: 'Saved', icon: Briefcase, label: 'Applications', desc: 'Track your job applications', iconColor: '#F59E0B' },
        { to: '/interview-preps', screen: 'InterviewList', stack: 'InterviewPreps', icon: BookOpen, label: 'Interview Prep', desc: 'Practice for upcoming interviews', iconColor: '#06B6D4' },
        { to: '/star-stories', screen: 'StoriesMain', stack: 'Stories', icon: Sparkles, label: 'STAR Stories', desc: 'Build behavioral interview answers', iconColor: '#FBBF24' },
        { to: '/cover-letters', screen: 'CoverLetters', stack: 'Career', icon: FileEdit, label: 'Cover Letters', desc: 'Generate tailored cover letters', iconColor: '#6366F1' },
      ],
    },
    {
      label: 'Growth',
      links: [
        { to: '/saved-comparisons', screen: 'SavedMain', stack: 'Saved', icon: Bookmark, label: 'Saved', desc: 'Bookmarked comparisons', iconColor: '#F97316' },
        { to: '/career-path', screen: 'CareerMain', stack: 'Career', icon: TrendingUp, label: 'Career Path', desc: 'Plan your career trajectory', iconColor: '#22C55E' },
        { to: '/pricing', screen: 'Pricing', stack: 'Settings', icon: CreditCard, label: 'Pricing', desc: 'View plans and upgrade', iconColor: '#A78BFA' },
        { to: '/settings', screen: 'SettingsMain', stack: 'Settings', icon: Settings, label: 'Settings', desc: 'Preferences and account', iconColor: '#94A3B8' },
      ],
    },
  ];

  const handleNavigate = (link: MenuItem) => {
    setMenuOpen(false);
    (navigation as any).navigate(link.screen);
  };

  const isActive = (link: MenuItem) => {
    return route.name === link.screen;
  };

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const getUserInitial = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };

  return (
    <>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
        <View style={styles.headerContent}>
          {/* Logo */}
          <View style={styles.logo}>
            <FileText color={COLORS.primary} size={28} />
            <Text style={[styles.logoText, { color: colors.text }]}>Talor</Text>
          </View>

          {/* Right actions */}
          <View style={styles.actions}>
            {/* Theme Toggle */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              {isDark ? (
                <Sun color={colors.textSecondary} size={20} />
              ) : (
                <Moon color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>

            {/* User Menu */}
            {user && (
              <TouchableOpacity
                style={styles.userButton}
                onPress={() => setUserMenuOpen(!userMenuOpen)}
                activeOpacity={0.7}
              >
                <Text style={styles.userInitial}>{getUserInitial()}</Text>
              </TouchableOpacity>
            )}

            {/* Menu Button */}
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen(!menuOpen)}
              activeOpacity={0.7}
            >
              {menuOpen ? (
                <X color={colors.text} size={24} />
              ) : (
                <Menu color={colors.text} size={24} />
              )}
              <Text style={[styles.menuButtonText, { color: colors.text }]}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Dropdown Menu */}
        {userMenuOpen && (
          <BlurView
            intensity={GLASS.getBlurIntensity('regular')}
            tint={isDark ? 'dark' : 'light'}
            style={styles.userDropdown}
          >
            <View style={[styles.userDropdownContent, { borderColor: colors.glassBorder }]}>
              <View style={[styles.userDropdownHeader, { borderBottomColor: colors.glassBorder }]}>
                {user?.user_metadata?.full_name && (
                  <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                    {user.user_metadata.full_name}
                  </Text>
                )}
                <Text style={[styles.userEmail, { color: colors.textTertiary }]} numberOfLines={1}>
                  {user?.email}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.signOutButton, { borderTopColor: colors.glassBorder }]}
                onPress={handleSignOut}
                activeOpacity={0.7}
              >
                <LogOut color={colors.textSecondary} size={16} />
                <Text style={[styles.signOutText, { color: colors.textSecondary }]}>Sign out</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
      </View>

      {/* Navigation Dropdown Menu */}
      <Modal
        visible={menuOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.menuContainer}>
          {/* Backdrop */}
          <Pressable
            style={styles.backdrop}
            onPress={() => setMenuOpen(false)}
          >
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>

          {/* Menu Panel */}
          <BlurView
            intensity={GLASS.getBlurIntensity('strong')}
            tint={isDark ? 'dark' : 'light'}
            style={styles.menuPanel}
          >
            {/* Menu Header with Close Button */}
            <View style={styles.menuHeader}>
              <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
              <TouchableOpacity
                style={styles.menuCloseButton}
                onPress={() => setMenuOpen(false)}
                activeOpacity={0.7}
              >
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.menuScroll}
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              {menuSections.map((section) => (
                <View key={section.label} style={styles.menuSection}>
                  <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
                    {section.label}
                  </Text>
                  <View style={styles.sectionLinks}>
                    {section.links.map((link) => {
                      const isLinkActive = isActive(link);
                      return (
                        <TouchableOpacity
                          key={link.to}
                          style={[
                            styles.menuItem,
                            {
                              backgroundColor: isLinkActive
                                ? COLORS.primary + '20'
                                : colors.backgroundSecondary + '40',
                              borderColor: isLinkActive ? COLORS.primary : colors.glassBorder,
                            },
                          ]}
                          onPress={() => handleNavigate(link)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.menuItemIcon}>
                            <link.icon
                              color={isLinkActive ? COLORS.primary : link.iconColor}
                              size={18}
                            />
                          </View>
                          <View style={styles.menuItemText}>
                            <Text
                              style={[
                                styles.menuItemLabel,
                                { color: isLinkActive ? COLORS.primary : colors.text },
                              ]}
                            >
                              {link.label}
                            </Text>
                            <Text style={[styles.menuItemDesc, { color: colors.textTertiary }]}>
                              {link.desc}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))}
            </ScrollView>
          </BlurView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 75,
    paddingBottom: SPACING.md,
    borderBottomWidth: GLASS.getBorderWidth(),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoText: {
    ...TYPOGRAPHY.heading2,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  userButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInitial: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.primary,
    fontSize: 14,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  menuButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
  },
  userDropdown: {
    position: 'absolute',
    top: 60,
    right: SPACING.lg,
    width: 240,
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('large'),
  },
  userDropdownContent: {
    borderWidth: GLASS.getBorderWidth(),
  },
  userDropdownHeader: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: GLASS.getBorderWidth(),
  },
  userName: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  signOutText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    marginTop: 65,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  menuPanel: {
    flex: 1,
    borderTopLeftRadius: GLASS.getCornerRadius('large'),
    borderTopRightRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  menuTitle: {
    ...TYPOGRAPHY.heading2,
    fontSize: 20,
    fontWeight: '700',
  },
  menuCloseButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.xl,
  },
  menuSection: {
    gap: SPACING.md,
  },
  sectionLabel: {
    ...TYPOGRAPHY.caption,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  sectionLinks: {
    gap: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: GLASS.getCornerRadius('small'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    flex: 1,
  },
  menuItemLabel: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    marginBottom: 2,
  },
  menuItemDesc: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
  },
});
