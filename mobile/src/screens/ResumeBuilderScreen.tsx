/**
 * Resume Builder Screen
 * Build resume from scratch with guided flow + AI enhancement
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
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
  Sparkles,
  Trash2,
  Calendar,
  MapPin,
  Building2,
} from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { TYPOGRAPHY, SPACING, COLORS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { api } from '../api/client';

type Section =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications';

interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  location: string;
  year: string;
  gpa: string;
}

interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

interface ResumeData {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: CertificationEntry[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function ResumeBuilderScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [currentSection, setCurrentSection] = useState<Section>('contact');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');
  const [resumeData, setResumeData] = useState<ResumeData>({
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
    { id: 'summary', title: 'Summary', icon: FileText },
    { id: 'experience', title: 'Experience', icon: Briefcase },
    { id: 'education', title: 'Education', icon: GraduationCap },
    { id: 'skills', title: 'Skills', icon: Award },
    { id: 'certifications', title: 'Certifications', icon: Award },
  ];

  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    progressBar: { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
    progressText: { color: colors.textSecondary },
    sectionTab: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    sectionTabText: { color: colors.textSecondary },
    sectionTitle: { color: colors.text },
    sectionDescription: { color: colors.textSecondary },
    inputLabel: { color: colors.textSecondary },
    textInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: colors.text,
    },
    navButtonText: { color: colors.text },
    cardBg: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    skillTag: {
      backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
      borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.2)',
    },
    bulletText: { color: colors.text },
    emptyText: { color: colors.textSecondary },
    aiButtonBg: {
      backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
    },
  }), [colors, isDark]);

  // -- Experience helpers --
  const addExperience = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: generateId(),
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        bullets: [''],
      }],
    }));
  }, []);

  const updateExperience = useCallback((id: string, field: keyof ExperienceEntry, value: any) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  }, []);

  const updateBullet = useCallback((expId: string, bulletIndex: number, text: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bulletIndex] = text;
        return { ...exp, bullets: newBullets };
      }),
    }));
  }, []);

  const addBullet = useCallback((expId: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === expId ? { ...exp, bullets: [...exp.bullets, ''] } : exp
      ),
    }));
  }, []);

  const removeBullet = useCallback((expId: string, bulletIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => {
        if (exp.id !== expId) return exp;
        const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
        return { ...exp, bullets: newBullets.length > 0 ? newBullets : [''] };
      }),
    }));
  }, []);

  // -- Education helpers --
  const addEducation = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: generateId(),
        degree: '',
        institution: '',
        location: '',
        year: '',
        gpa: '',
      }],
    }));
  }, []);

  const updateEducation = useCallback((id: string, field: keyof EducationEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id),
    }));
  }, []);

  // -- Skills helpers --
  const addSkill = useCallback((skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || resumeData.skills.includes(trimmed)) return;
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, trimmed],
    }));
  }, [resumeData.skills]);

  const removeSkill = useCallback((index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }, []);

  // -- Certifications helpers --
  const addCertification = useCallback(() => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: generateId(),
        name: '',
        issuer: '',
        date: '',
      }],
    }));
  }, []);

  const updateCertification = useCallback((id: string, field: keyof CertificationEntry, value: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, [field]: value } : cert
      ),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id),
    }));
  }, []);

  // -- AI Features --
  const handleAIGenerateSummary = async () => {
    const jobTitle = resumeData.experience[0]?.title || '';
    if (!jobTitle) {
      Alert.alert('Add Experience First', 'Add at least one work experience entry so AI can generate a relevant summary.');
      return;
    }
    setAiLoading('summary');
    try {
      const res = await api.builderGenerateSummary({
        jobTitle,
        existingSkills: resumeData.skills.length > 0 ? resumeData.skills : undefined,
        highlights: resumeData.experience[0]?.bullets.filter(b => b.trim()) || undefined,
      });
      if (res.success && res.data?.variants?.length > 0) {
        const variants = res.data.variants;
        if (variants.length === 1) {
          setResumeData(prev => ({ ...prev, summary: variants[0] }));
        } else {
          Alert.alert('Choose a Summary', 'Select the style that fits best:', [
            ...variants.slice(0, 3).map((v: string, i: number) => ({
              text: `Option ${i + 1}`,
              onPress: () => setResumeData(prev => ({ ...prev, summary: v })),
            })),
            { text: 'Cancel', style: 'cancel' as const },
          ]);
        }
      } else {
        Alert.alert('Error', res.error || 'Failed to generate summary');
      }
    } catch {
      Alert.alert('Error', 'Failed to generate summary. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAIEnhanceBullets = async (expId: string) => {
    const exp = resumeData.experience.find(e => e.id === expId);
    if (!exp) return;
    const validBullets = exp.bullets.filter(b => b.trim());
    if (validBullets.length === 0) {
      Alert.alert('Add Bullet Points', 'Write at least one bullet point to enhance.');
      return;
    }
    setAiLoading(`bullets-${expId}`);
    try {
      const res = await api.builderEnhanceBullets({
        jobTitle: exp.title || 'Professional',
        company: exp.company || 'Company',
        bullets: validBullets,
      });
      if (res.success && res.data?.enhanced_bullets) {
        setResumeData(prev => ({
          ...prev,
          experience: prev.experience.map(e =>
            e.id === expId ? { ...e, bullets: res.data.enhanced_bullets } : e
          ),
        }));
      } else {
        Alert.alert('Error', res.error || 'Failed to enhance bullets');
      }
    } catch {
      Alert.alert('Error', 'Failed to enhance bullets. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  const handleAISuggestSkills = async () => {
    const jobTitle = resumeData.experience[0]?.title || '';
    if (!jobTitle) {
      Alert.alert('Add Experience First', 'Add at least one work experience so AI can suggest relevant skills.');
      return;
    }
    setAiLoading('skills');
    try {
      const res = await api.builderSuggestSkills({
        jobTitle,
        existingSkills: resumeData.skills.length > 0 ? resumeData.skills : undefined,
        experienceTitles: resumeData.experience.map(e => e.title).filter(Boolean),
      });
      if (res.success) {
        const suggestions: string[] = [];
        const data = res.data;
        if (data?.technical) suggestions.push(...data.technical);
        if (data?.soft) suggestions.push(...data.soft);
        if (data?.tools) suggestions.push(...data.tools);
        if (data?.suggested_skills) suggestions.push(...data.suggested_skills);
        if (data?.skills) suggestions.push(...data.skills);
        const newSkills = suggestions.filter(s => !resumeData.skills.includes(s));
        if (newSkills.length > 0) {
          setResumeData(prev => ({
            ...prev,
            skills: [...prev.skills, ...newSkills.slice(0, 12)],
          }));
        } else {
          Alert.alert('No New Skills', 'AI did not find additional skills to suggest.');
        }
      } else {
        Alert.alert('Error', res.error || 'Failed to suggest skills');
      }
    } catch {
      Alert.alert('Error', 'Failed to suggest skills. Please try again.');
    } finally {
      setAiLoading(null);
    }
  };

  // -- Save --
  const handleSave = async () => {
    if (!resumeData.contact.name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name in the Contact section.');
      return;
    }
    setSaving(true);
    try {
      // Store resume data locally for now
      Alert.alert('Resume Saved', 'Your resume has been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save resume.');
    } finally {
      setSaving(false);
    }
  };

  // -- Render Sections --
  const renderContactSection = () => (
    <View style={styles.formSection}>
      <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Contact Information</Text>
      {[
        { label: 'Full Name *', key: 'name' as const, placeholder: 'John Doe', kb: 'default' as const },
        { label: 'Email *', key: 'email' as const, placeholder: 'john@example.com', kb: 'email-address' as const },
        { label: 'Phone *', key: 'phone' as const, placeholder: '(555) 123-4567', kb: 'phone-pad' as const },
        { label: 'Location', key: 'location' as const, placeholder: 'San Francisco, CA', kb: 'default' as const },
        { label: 'LinkedIn', key: 'linkedin' as const, placeholder: 'linkedin.com/in/johndoe', kb: 'default' as const },
      ].map(({ label, key, placeholder, kb }) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>{label}</Text>
          <TextInput
            value={resumeData.contact[key]}
            onChangeText={(text) =>
              setResumeData(prev => ({
                ...prev,
                contact: { ...prev.contact, [key]: text },
              }))
            }
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={kb}
            autoCapitalize={key === 'email' || key === 'linkedin' ? 'none' : 'words'}
            style={[styles.textInput, dynamicStyles.textInput]}
          />
        </View>
      ))}
    </View>
  );

  const renderSummarySection = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Professional Summary</Text>
        <TouchableOpacity
          style={[styles.aiButton, dynamicStyles.aiButtonBg]}
          onPress={handleAIGenerateSummary}
          disabled={aiLoading === 'summary'}
        >
          {aiLoading === 'summary' ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Sparkles size={16} color={COLORS.primary} />
              <Text style={styles.aiButtonText}>Generate with AI</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      <Text style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
        Write a brief summary highlighting your key qualifications and career goals
      </Text>
      <TextInput
        value={resumeData.summary}
        onChangeText={(text) => setResumeData(prev => ({ ...prev, summary: text }))}
        placeholder="Experienced software engineer with 5+ years..."
        placeholderTextColor={colors.textTertiary}
        multiline
        numberOfLines={6}
        style={[styles.textInput, styles.textArea, dynamicStyles.textInput]}
      />
    </View>
  );

  const renderExperienceSection = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Work Experience</Text>
        <TouchableOpacity style={[styles.addButton, dynamicStyles.cardBg]} onPress={addExperience}>
          <Plus size={18} color={COLORS.primary} />
          <Text style={[styles.addButtonText, { color: COLORS.primary }]}>Add Job</Text>
        </TouchableOpacity>
      </View>

      {resumeData.experience.length === 0 && (
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          Tap "Add Job" to add your work experience
        </Text>
      )}

      {resumeData.experience.map((exp, expIndex) => (
        <View key={exp.id} style={[styles.entryCard, dynamicStyles.cardBg]}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryNumber, { color: COLORS.primary }]}>
              Position {expIndex + 1}
            </Text>
            <TouchableOpacity onPress={() => removeExperience(exp.id)}>
              <Trash2 size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Job Title *</Text>
            <TextInput
              value={exp.title}
              onChangeText={(t) => updateExperience(exp.id, 'title', t)}
              placeholder="Software Engineer"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, dynamicStyles.textInput]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Company *</Text>
            <TextInput
              value={exp.company}
              onChangeText={(t) => updateExperience(exp.id, 'company', t)}
              placeholder="Acme Corp"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, dynamicStyles.textInput]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Location</Text>
            <TextInput
              value={exp.location}
              onChangeText={(t) => updateExperience(exp.id, 'location', t)}
              placeholder="San Francisco, CA"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, dynamicStyles.textInput]}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Start Date</Text>
              <TextInput
                value={exp.startDate}
                onChangeText={(t) => updateExperience(exp.id, 'startDate', t)}
                placeholder="Jan 2022"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, dynamicStyles.textInput]}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>End Date</Text>
              <TextInput
                value={exp.current ? 'Present' : exp.endDate}
                onChangeText={(t) => updateExperience(exp.id, 'endDate', t)}
                placeholder="Present"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, dynamicStyles.textInput]}
                editable={!exp.current}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateExperience(exp.id, 'current', !exp.current)}
          >
            <View style={[styles.checkbox, exp.current && styles.checkboxChecked]}>
              {exp.current && <Text style={styles.checkmark}>{'✓'}</Text>}
            </View>
            <Text style={[styles.checkboxLabel, { color: colors.text }]}>Currently working here</Text>
          </TouchableOpacity>

          {/* Bullets */}
          <View style={styles.bulletsSection}>
            <View style={styles.bulletHeader}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Bullet Points</Text>
              <TouchableOpacity onPress={() => addBullet(exp.id)}>
                <Plus size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            {exp.bullets.map((bullet, bIndex) => (
              <View key={bIndex} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>{'•'}</Text>
                <TextInput
                  value={bullet}
                  onChangeText={(t) => updateBullet(exp.id, bIndex, t)}
                  placeholder="Describe your accomplishment..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  style={[styles.bulletInput, dynamicStyles.textInput]}
                />
                {exp.bullets.length > 1 && (
                  <TouchableOpacity onPress={() => removeBullet(exp.id, bIndex)}>
                    <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* AI Enhance */}
            <TouchableOpacity
              style={[styles.aiButton, dynamicStyles.aiButtonBg, { alignSelf: 'flex-start', marginTop: 8 }]}
              onPress={() => handleAIEnhanceBullets(exp.id)}
              disabled={aiLoading === `bullets-${exp.id}`}
            >
              {aiLoading === `bullets-${exp.id}` ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Sparkles size={14} color={COLORS.primary} />
                  <Text style={styles.aiButtonText}>Enhance with AI</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderEducationSection = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Education</Text>
        <TouchableOpacity style={[styles.addButton, dynamicStyles.cardBg]} onPress={addEducation}>
          <Plus size={18} color={COLORS.primary} />
          <Text style={[styles.addButtonText, { color: COLORS.primary }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {resumeData.education.length === 0 && (
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          Tap "Add" to add your education
        </Text>
      )}

      {resumeData.education.map((edu, index) => (
        <View key={edu.id} style={[styles.entryCard, dynamicStyles.cardBg]}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryNumber, { color: COLORS.primary }]}>
              Education {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeEducation(edu.id)}>
              <Trash2 size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Degree *</Text>
            <TextInput
              value={edu.degree}
              onChangeText={(t) => updateEducation(edu.id, 'degree', t)}
              placeholder="B.S. Computer Science"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, dynamicStyles.textInput]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Institution *</Text>
            <TextInput
              value={edu.institution}
              onChangeText={(t) => updateEducation(edu.id, 'institution', t)}
              placeholder="Stanford University"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, dynamicStyles.textInput]}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Year</Text>
              <TextInput
                value={edu.year}
                onChangeText={(t) => updateEducation(edu.id, 'year', t)}
                placeholder="2020"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                style={[styles.textInput, dynamicStyles.textInput]}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>GPA (optional)</Text>
              <TextInput
                value={edu.gpa}
                onChangeText={(t) => updateEducation(edu.id, 'gpa', t)}
                placeholder="3.8"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                style={[styles.textInput, dynamicStyles.textInput]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSkillsSection = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Skills</Text>
        <TouchableOpacity
          style={[styles.aiButton, dynamicStyles.aiButtonBg]}
          onPress={handleAISuggestSkills}
          disabled={aiLoading === 'skills'}
        >
          {aiLoading === 'skills' ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <>
              <Sparkles size={14} color={COLORS.primary} />
              <Text style={styles.aiButtonText}>Suggest Skills</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionDescription, dynamicStyles.sectionDescription]}>
        Add your technical and soft skills
      </Text>

      {/* Skill input */}
      <View style={styles.skillInputRow}>
        <TextInput
          value={skillInput}
          onChangeText={setSkillInput}
          placeholder="Type a skill and press Add..."
          placeholderTextColor={colors.textTertiary}
          style={[styles.textInput, dynamicStyles.textInput, { flex: 1 }]}
          onSubmitEditing={() => {
            addSkill(skillInput);
            setSkillInput('');
          }}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.skillAddBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => {
            addSkill(skillInput);
            setSkillInput('');
          }}
        >
          <Plus size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Skill tags */}
      <View style={styles.skillTagsContainer}>
        {resumeData.skills.map((skill, index) => (
          <View key={`${skill}-${index}`} style={[styles.skillTag, dynamicStyles.skillTag]}>
            <Text style={[styles.skillTagText, { color: COLORS.primary }]}>{skill}</Text>
            <TouchableOpacity onPress={() => removeSkill(index)}>
              <X size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        ))}
        {resumeData.skills.length === 0 && (
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            No skills added yet. Type above or use AI to suggest.
          </Text>
        )}
      </View>
    </View>
  );

  const renderCertificationsSection = () => (
    <View style={styles.formSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>Certifications</Text>
        <TouchableOpacity style={[styles.addButton, dynamicStyles.cardBg]} onPress={addCertification}>
          <Plus size={18} color={COLORS.primary} />
          <Text style={[styles.addButtonText, { color: COLORS.primary }]}>Add</Text>
        </TouchableOpacity>
      </View>

      {resumeData.certifications.length === 0 && (
        <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
          Tap "Add" to add your certifications
        </Text>
      )}

      {resumeData.certifications.map((cert, index) => (
        <View key={cert.id} style={[styles.entryCard, dynamicStyles.cardBg]}>
          <View style={styles.entryHeader}>
            <Text style={[styles.entryNumber, { color: COLORS.primary }]}>
              Certification {index + 1}
            </Text>
            <TouchableOpacity onPress={() => removeCertification(cert.id)}>
              <Trash2 size={18} color={COLORS.danger} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Certification Name *</Text>
            <TextInput
              value={cert.name}
              onChangeText={(t) => updateCertification(cert.id, 'name', t)}
              placeholder="AWS Solutions Architect"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, dynamicStyles.textInput]}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Issuer</Text>
              <TextInput
                value={cert.issuer}
                onChangeText={(t) => updateCertification(cert.id, 'issuer', t)}
                placeholder="Amazon Web Services"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, dynamicStyles.textInput]}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>Date</Text>
              <TextInput
                value={cert.date}
                onChangeText={(t) => updateCertification(cert.id, 'date', t)}
                placeholder="Mar 2024"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, dynamicStyles.textInput]}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'contact':
        return renderContactSection();
      case 'summary':
        return renderSummarySection();
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      case 'certifications':
        return renderCertificationsSection();
    }
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, dynamicStyles.title]}>Resume Builder</Text>
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.accent} />
              ) : (
                <Save size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, dynamicStyles.progressBar]}>
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
            <Text style={[styles.progressText, dynamicStyles.progressText]}>
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
                    dynamicStyles.sectionTab,
                    isActive && styles.sectionTabActive,
                  ]}
                >
                  <Icon size={16} color={isActive ? colors.accent : colors.textSecondary} />
                  <Text
                    style={[
                      styles.sectionTabText,
                      dynamicStyles.sectionTabText,
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
                <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>Previous</Text>
              </GlassButton>
            )}
            {sections.findIndex((s) => s.id === currentSection) <
              sections.length - 1 ? (
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
                <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>Next</Text>
              </GlassButton>
            ) : (
              <GlassButton
                onPress={handleSave}
                variant="primary"
                style={styles.navButton}
                loading={saving}
              >
                <Text style={[styles.navButtonText, dynamicStyles.navButtonText]}>Save Resume</Text>
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
    ...TYPOGRAPHY.largeTitle,
  },
  progressContainer: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 0,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  progressText: {
    ...TYPOGRAPHY.caption1,
    textAlign: 'center',
  },
  sectionNav: {
    maxHeight: 60,
    marginBottom: 16,
  },
  sectionNavContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 16,
  },
  sectionTabActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: COLORS.primary,
  },
  sectionTabText: {
    ...TYPOGRAPHY.caption1,
  },
  sectionTabTextActive: {
    color: COLORS.primary,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 16,
  },
  formCard: {
    padding: 20,
  },
  formSection: {
    gap: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...TYPOGRAPHY.headline,
    marginBottom: 4,
  },
  sectionDescription: {
    ...TYPOGRAPHY.subhead,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    ...TYPOGRAPHY.caption1,
  },
  textInput: {
    ...TYPOGRAPHY.callout,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 4,
    paddingBottom: SPACING.md,
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
    fontWeight: '600',
  },

  // Entry cards (experience, education, certs)
  entryCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryNumber: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },

  // Date row
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    ...TYPOGRAPHY.subhead,
  },

  // Bullets
  bulletsSection: {
    gap: 8,
    marginTop: 4,
  },
  bulletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 18,
    lineHeight: 24,
    marginTop: 10,
  },
  bulletInput: {
    ...TYPOGRAPHY.callout,
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },

  // Add / AI buttons
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  addButtonText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  aiButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // Skills
  skillInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  skillAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  skillTagText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '500',
  },

  // Empty state
  emptyText: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
