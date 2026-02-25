import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, FONTS } from '../utils/constants';

export default function TermsOfServiceScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={GLASS.getBlurIntensity('regular')} tint="light" style={styles.contentBlur}>
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Terms of Service</Text>
            <Text style={[styles.lastUpdated, { color: colors.textTertiary }]}>Last Updated: January 2026</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Acceptance of Terms</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              By accessing and using Talor ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Description of Service</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Talor provides AI-powered resume tailoring, cover letter generation, and job application tracking services.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>3. User Accounts</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You are responsible for:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Maintaining the confidentiality of your account</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• All activities that occur under your account</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Notifying us of any unauthorized use</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>4. User Content</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You retain ownership of your content (resumes, cover letters, etc.). By using our Service, you grant us a license to:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Process your content to provide our services</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Store your content on our servers</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Generate AI-powered suggestions and tailoring</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Prohibited Uses</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              You agree not to:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Use the Service for any illegal purpose</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Submit false or misleading information</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Attempt to gain unauthorized access to our systems</Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Resell or redistribute our services</Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>6. AI-Generated Content</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Our Service uses AI to generate resume suggestions and cover letters. While we strive for accuracy, you are responsible for reviewing and verifying all AI-generated content before use.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Intellectual Property</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              The Service and its original content, features, and functionality are owned by Talor and are protected by international copyright, trademark, and other intellectual property laws.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Disclaimer of Warranties</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>9. Limitation of Liability</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              Talor shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>10. Termination</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>11. Changes to Terms</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>12. Governing Law</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              These Terms shall be governed by and construed in accordance with the laws of the United States.
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>13. Contact Us</Text>
            <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
              If you have questions about these Terms, please contact us at:
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.textSecondary }]}>• Email: support@talor-ai.com</Text>
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
