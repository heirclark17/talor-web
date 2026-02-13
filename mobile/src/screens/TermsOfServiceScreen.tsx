import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Typography, Spacing, GLASS } from '../theme';

export default function TermsOfServiceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <BlurView intensity={GLASS.getBlurIntensity('regular')} tint="light" style={styles.contentBlur}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>

            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.paragraph}>
              By accessing and using Talor ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement.
            </Text>

            <Text style={styles.sectionTitle}>2. Description of Service</Text>
            <Text style={styles.paragraph}>
              Talor provides AI-powered resume tailoring, cover letter generation, and job application tracking services.
            </Text>

            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.paragraph}>
              You are responsible for:
            </Text>
            <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account</Text>
            <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
            <Text style={styles.bulletPoint}>• Notifying us of any unauthorized use</Text>

            <Text style={styles.sectionTitle}>4. User Content</Text>
            <Text style={styles.paragraph}>
              You retain ownership of your content (resumes, cover letters, etc.). By using our Service, you grant us a license to:
            </Text>
            <Text style={styles.bulletPoint}>• Process your content to provide our services</Text>
            <Text style={styles.bulletPoint}>• Store your content on our servers</Text>
            <Text style={styles.bulletPoint}>• Generate AI-powered suggestions and tailoring</Text>

            <Text style={styles.sectionTitle}>5. Prohibited Uses</Text>
            <Text style={styles.paragraph}>
              You agree not to:
            </Text>
            <Text style={styles.bulletPoint}>• Use the Service for any illegal purpose</Text>
            <Text style={styles.bulletPoint}>• Submit false or misleading information</Text>
            <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to our systems</Text>
            <Text style={styles.bulletPoint}>• Resell or redistribute our services</Text>

            <Text style={styles.sectionTitle}>6. AI-Generated Content</Text>
            <Text style={styles.paragraph}>
              Our Service uses AI to generate resume suggestions and cover letters. While we strive for accuracy, you are responsible for reviewing and verifying all AI-generated content before use.
            </Text>

            <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
            <Text style={styles.paragraph}>
              The Service and its original content, features, and functionality are owned by Talor and are protected by international copyright, trademark, and other intellectual property laws.
            </Text>

            <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
            <Text style={styles.paragraph}>
              The Service is provided "as is" and "as available" without warranties of any kind, either express or implied.
            </Text>

            <Text style={styles.sectionTitle}>9. Limitation of Liability</Text>
            <Text style={styles.paragraph}>
              Talor shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </Text>

            <Text style={styles.sectionTitle}>10. Termination</Text>
            <Text style={styles.paragraph}>
              We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms.
            </Text>

            <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
            <Text style={styles.paragraph}>
              We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page.
            </Text>

            <Text style={styles.sectionTitle}>12. Governing Law</Text>
            <Text style={styles.paragraph}>
              These Terms shall be governed by and construed in accordance with the laws of the United States.
            </Text>

            <Text style={styles.sectionTitle}>13. Contact Us</Text>
            <Text style={styles.paragraph}>
              If you have questions about these Terms, please contact us at:
            </Text>
            <Text style={styles.bulletPoint}>• Email: support@talor-ai.com</Text>
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
