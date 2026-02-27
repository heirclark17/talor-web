import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, FONTS } from '../utils/constants';

export default function PrivacyPolicyScreen() {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={GLASS.getBlurIntensity('regular')} tint={isDark ? 'dark' : 'light'} style={styles.contentBlur}>
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
            <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>Last Updated: January 2026</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Information We Collect</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We collect information you provide directly to us, including:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Account information (name, email address)</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Resume and career information</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Job application tracking data</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Cover letters and related documents</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. How We Use Your Information</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We use the information we collect to:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Provide, maintain, and improve our services</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Generate tailored resumes and cover letters</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Track your job applications</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Communicate with you about our services</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Information Sharing</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We do not sell your personal information. We may share your information with:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Service providers who assist in our operations</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Third-party AI services (OpenAI) for resume generation</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Law enforcement when required by law</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Data Security</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Your Rights</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You have the right to:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Access your personal information</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Request correction of your data</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Request deletion of your account</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Opt-out of marketing communications</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Cookies and Tracking</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We use cookies and similar technologies to enhance your experience and analyze usage patterns.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Children's Privacy</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Our service is not intended for users under 18 years of age. We do not knowingly collect information from children.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Changes to This Policy</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Contact Us</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              If you have questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Email: support@talorme.com</Text>
          </View>
        </BlurView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  contentBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('medium'),
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  lastUpdated: {
    ...TYPOGRAPHY.caption,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  paragraph: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.md,
    lineHeight: 24,
  },
  bulletPoint: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.md,
    lineHeight: 24,
  },
});
