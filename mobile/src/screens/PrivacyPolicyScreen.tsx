import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, GLASS } from '../theme';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={GLASS.getBlurIntensity('regular')} tint="light" style={styles.contentBlur}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.paragraph}>
              We collect information you provide directly to us, including:
            </Text>
            <Text style={styles.bulletPoint}>• Account information (name, email address)</Text>
            <Text style={styles.bulletPoint}>• Resume and career information</Text>
            <Text style={styles.bulletPoint}>• Job application tracking data</Text>
            <Text style={styles.bulletPoint}>• Cover letters and related documents</Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.paragraph}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletPoint}>• Generate tailored resumes and cover letters</Text>
            <Text style={styles.bulletPoint}>• Track your job applications</Text>
            <Text style={styles.bulletPoint}>• Communicate with you about our services</Text>

            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.paragraph}>
              We do not sell your personal information. We may share your information with:
            </Text>
            <Text style={styles.bulletPoint}>• Service providers who assist in our operations</Text>
            <Text style={styles.bulletPoint}>• Third-party AI services (OpenAI) for resume generation</Text>
            <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>

            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.paragraph}>
              We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or destruction.
            </Text>

            <Text style={styles.sectionTitle}>5. Your Rights</Text>
            <Text style={styles.paragraph}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Request correction of your data</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your account</Text>
            <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>

            <Text style={styles.sectionTitle}>6. Cookies and Tracking</Text>
            <Text style={styles.paragraph}>
              We use cookies and similar technologies to enhance your experience and analyze usage patterns.
            </Text>

            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.paragraph}>
              Our service is not intended for users under 18 years of age. We do not knowingly collect information from children.
            </Text>

            <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
            <Text style={styles.paragraph}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
            </Text>

            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about this Privacy Policy, please contact us at:
            </Text>
            <Text style={styles.bulletPoint}>• Email: privacy@talor-ai.com</Text>
          </View>
        </BlurView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  contentBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('medium'),
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  title: {
    ...Typography.heading1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  lastUpdated: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  paragraph: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  bulletPoint: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.md,
    lineHeight: 24,
  },
});
