/**
 * Resume Builder Screen
 * Build resume from scratch with guided flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  X,
  ChevronRight,
  Save,
  FileText,
} from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { TYPOGRAPHY, SPACING } from '../utils/constants';

type Section =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications';

export default function ResumeBuilderScreen() {
  const navigation = useNavigation();
  const [currentSection, setCurrentSection] = useState<Section>('contact');
  const [resumeData, setResumeData] = useState({
    contact: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  });

  const sections: { id: Section; title: string; icon: any }[] = [
    { id: 'contact', title: 'Contact Info', icon: User },
    { id: 'summary', title: 'Professional Summary', icon: FileText },
    { id: 'experience', title: 'Work Experience', icon: Briefcase },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'skills', title: 'Skills', icon: Award },
    { id: 'certifications', title: 'Certifications', icon: Award },
  ];

  const handleSave = async () => {
    // TODO: Save resume via API
    console.log('Saving resume:', resumeData);
  };

  const renderContactSection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Contact Information</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          value={resumeData.contact.name}
          onChangeText={(text) =>
            setResumeData({
              ...resumeData,
              contact: { ...resumeData.contact, name: text },
            })
          }
          placeholder="John Doe"
          placeholderTextColor="#9CA3AF"
          style={styles.textInput}
          caretHidden={true}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email *</Text>
        <TextInput
          value={resumeData.contact.email}
          onChangeText={(text) =>
            setResumeData({
              ...resumeData,
              contact: { ...resumeData.contact, email: text },
            })
          }
          placeholder="john@example.com"
          placeholderTextColor="#9CA3AF"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.textInput}
          caretHidden={true}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone *</Text>
        <TextInput
          value={resumeData.contact.phone}
          onChangeText={(text) =>
            setResumeData({
              ...resumeData,
              contact: { ...resumeData.contact, phone: text },
            })
          }
          placeholder="(555) 123-4567"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          style={styles.textInput}
          caretHidden={true}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Location</Text>
        <TextInput
          value={resumeData.contact.location}
          onChangeText={(text) =>
            setResumeData({
              ...resumeData,
              contact: { ...resumeData.contact, location: text },
            })
          }
          placeholder="San Francisco, CA"
          placeholderTextColor="#9CA3AF"
          style={styles.textInput}
          caretHidden={true}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>LinkedIn</Text>
        <TextInput
          value={resumeData.contact.linkedin}
          onChangeText={(text) =>
            setResumeData({
              ...resumeData,
              contact: { ...resumeData.contact, linkedin: text },
            })
          }
          placeholder="linkedin.com/in/johndoe"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          style={styles.textInput}
          caretHidden={true}
        />
      </View>
    </View>
  );

  const renderSummarySection = () => (
    <View style={styles.formSection}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.sectionDescription}>
        Write a brief summary highlighting your key qualifications and career goals
      </Text>
      <TextInput
        value={resumeData.summary}
        onChangeText={(text) => setResumeData({ ...resumeData, summary: text })}
        placeholder="Experienced software engineer with 5+ years..."
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={6}
        style={[styles.textInput, styles.textArea]}
        caretHidden={true}
      />
    </View>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'contact':
        return renderContactSection();
      case 'summary':
        return renderSummarySection();
      default:
        return (
          <View style={styles.comingSoon}>
            <FileText size={48} color="#9CA3AF" />
            <Text style={styles.comingSoonTitle}>
              {sections.find((s) => s.id === currentSection)?.title}
            </Text>
            <Text style={styles.comingSoonText}>
              This section is under construction. Continue building other sections.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Resume Builder</Text>
            <TouchableOpacity onPress={handleSave}>
              <Save size={24} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      ((sections.findIndex((s) => s.id === currentSection) + 1) /
                        sections.length) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              Step {sections.findIndex((s) => s.id === currentSection) + 1} of{' '}
              {sections.length}
            </Text>
          </View>

          {/* Section Navigation */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.sectionNav}
            contentContainerStyle={styles.sectionNavContent}
          >
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id;
              return (
                <TouchableOpacity
                  key={section.id}
                  onPress={() => setCurrentSection(section.id)}
                  style={[
                    styles.sectionTab,
                    isActive && styles.sectionTabActive,
                  ]}
                >
                  <Icon size={20} color={isActive ? '#3B82F6' : '#9CA3AF'} />
                  <Text
                    style={[
                      styles.sectionTabText,
                      isActive && styles.sectionTabTextActive,
                    ]}
                  >
                    {section.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Form Content */}
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
          >
            <GlassCard style={styles.formCard}>{renderContent()}</GlassCard>
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigation}>
            {sections.findIndex((s) => s.id === currentSection) > 0 && (
              <GlassButton
                onPress={() => {
                  const currentIndex = sections.findIndex(
                    (s) => s.id === currentSection
                  );
                  setCurrentSection(sections[currentIndex - 1].id);
                }}
                variant="secondary"
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </GlassButton>
            )}
            {sections.findIndex((s) => s.id === currentSection) <
              sections.length - 1 && (
              <GlassButton
                onPress={() => {
                  const currentIndex = sections.findIndex(
                    (s) => s.id === currentSection
                  );
                  setCurrentSection(sections[currentIndex + 1].id);
                }}
                variant="primary"
                style={styles.navButton}
              >
                <Text style={styles.navButtonText}>Next</Text>
                <ChevronRight size={20} color="#FFF" />
              </GlassButton>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 0,
    paddingBottom: SPACING.xs,
    marginTop: -SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.title3,
    color: '#FFF',
  },
  progressContainer: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 0,
    paddingBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption1,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  sectionNav: {
    maxHeight: 60,
  },
  sectionNavContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  sectionTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  sectionTabText: {
    ...TYPOGRAPHY.subhead,
    color: '#9CA3AF',
  },
  sectionTabTextActive: {
    color: '#3B82F6',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
  },
  formCard: {
    padding: 20,
  },
  formSection: {
    gap: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    color: '#FFF',
    marginBottom: 4,
  },
  sectionDescription: {
    ...TYPOGRAPHY.subhead,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    ...TYPOGRAPHY.subhead,
    color: '#9CA3AF',
  },
  textInput: {
    ...TYPOGRAPHY.callout,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  comingSoonTitle: {
    ...TYPOGRAPHY.headline,
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    ...TYPOGRAPHY.subhead,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    marginTop: -SPACING.md,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  navButtonText: {
    ...TYPOGRAPHY.callout,
    color: '#FFF',
    fontWeight: '600',
  },
});
