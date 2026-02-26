/**
 * Templates Screen
 * Browse and select resume templates
 * Updated: Fixed FileText reference error with custom renderer
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Eye, Crown, Info, Upload, FileText, ChevronDown } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS, TYPOGRAPHY, SPACING, FONTS, ALPHA_COLORS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { api } from '../api/client';

const { width } = Dimensions.get('window');
const TEMPLATE_WIDTH = (width - 48) / 2;

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  headerStyle: 'centered' | 'left' | 'sidebar' | 'bold' | 'split' | 'minimal';
  atsScore: number;
  isPremium: boolean;
}

interface ResumeOption {
  id: number;
  label: string;
  type: 'base' | 'tailored';
  filename?: string;
  company?: string;
  jobTitle?: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Professional',
    category: 'Classic',
    description: 'Clean and professional design suitable for any industry',
    accentColor: '#2563EB',
    headerStyle: 'centered',
    atsScore: 10,
    isPremium: false,
  },
  {
    id: '2',
    name: 'Modern',
    category: 'Contemporary',
    description: 'Modern design with bold typography and clean layout',
    accentColor: '#7C3AED',
    headerStyle: 'left',
    atsScore: 9,
    isPremium: false,
  },
  {
    id: '3',
    name: 'Technical',
    category: 'Tech',
    description: 'Optimized for software engineers and technical roles',
    accentColor: '#059669',
    headerStyle: 'sidebar',
    atsScore: 8,
    isPremium: false,
  },
  {
    id: '4',
    name: 'Creative',
    category: 'Design',
    description: 'Eye-catching design for creative professionals',
    accentColor: '#DC2626',
    headerStyle: 'bold',
    atsScore: 7,
    isPremium: true,
  },
  {
    id: '5',
    name: 'Executive',
    category: 'Leadership',
    description: 'Sophisticated design for senior-level positions',
    accentColor: '#1E293B',
    headerStyle: 'split',
    atsScore: 9,
    isPremium: true,
  },
  {
    id: '6',
    name: 'Minimal',
    category: 'Simple',
    description: 'Minimalist design that focuses on content',
    accentColor: '#6B7280',
    headerStyle: 'minimal',
    atsScore: 10,
    isPremium: false,
  },
];

function getAtsColor(score: number): string {
  if (score >= 9) return COLORS.success;
  if (score >= 7) return COLORS.primary;
  return '#EAB308';
}

// Live resume preview renderer matching web's ResumePreview component.
// Renders actual text content (sample resume) scaled to fit thumbnail/modal.
function TemplatePreviewRenderer({
  template,
  large = false,
}: {
  template: Template;
  large?: boolean;
}) {
  const accent = template.accentColor;
  const bg = '#FFFFFF';
  const textDark = '#1F2937';
  const textMid = '#6B7280';
  const textLight = '#9CA3AF';
  const borderColor = '#E5E7EB';

  // Scale factors for thumbnail vs modal
  const f = large ? 1.8 : 1;
  const nameSize = 11 * f;
  const sectionSize = 6 * f;
  const bodySize = 4.5 * f;
  const contactSize = 4 * f;
  const bulletSize = 4 * f;
  const pad = 8 * f;
  const sectionGap = 6 * f;
  const lineGap = 2 * f;

  // Sample resume content
  const name = 'John Doe';
  const contact = 'john@email.com | (555) 123-4567 | San Francisco, CA';
  const summaryText = 'Results-driven professional with 8+ years of experience in software development and project management. Proven track record of delivering high-impact solutions.';
  const sections = [
    {
      title: 'EXPERIENCE',
      items: [
        { role: 'Senior Software Engineer', company: 'Tech Corp', date: '2021 – Present', loc: 'San Francisco, CA',
          bullets: ['Led development of microservices architecture serving 2M+ users', 'Reduced deployment time by 40% through CI/CD pipeline optimization', 'Mentored team of 5 junior engineers on best practices'] },
        { role: 'Software Engineer', company: 'StartupCo', date: '2018 – 2021', loc: 'New York, NY',
          bullets: ['Built RESTful APIs handling 10K+ requests/min', 'Improved test coverage from 45% to 92%'] },
      ],
    },
    { title: 'EDUCATION', items: [{ role: 'B.S. Computer Science', company: 'Stanford University', date: '2018', loc: '', bullets: [] }] },
  ];
  const skills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'SQL'];

  // --- Professional: centered header, section dividers ---
  if (template.headerStyle === 'centered') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg, padding: pad }]}>
        <View style={{ alignItems: 'center', paddingBottom: pad * 0.6, borderBottomWidth: 1.5 * f, borderBottomColor: accent, marginBottom: sectionGap }}>
          <Text style={{ fontSize: nameSize, fontWeight: '700', color: textDark, letterSpacing: 1 }}>{name}</Text>
          <Text style={{ fontSize: contactSize, color: textMid, marginTop: lineGap }}>{contact}</Text>
        </View>
        <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5, marginBottom: sectionGap }}>{summaryText}</Text>
        {sections.map((sec, si) => (
          <View key={si} style={{ marginBottom: sectionGap }}>
            <Text style={{ fontSize: sectionSize, fontWeight: '700', color: accent, letterSpacing: 1, textTransform: 'uppercase', borderBottomWidth: 0.5 * f, borderBottomColor: borderColor, paddingBottom: lineGap }}>{sec.title}</Text>
            {sec.items.map((item, ii) => (
              <View key={ii} style={{ marginTop: lineGap * 1.5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: bulletSize + 0.5 * f, fontWeight: '600', color: textDark }}>{item.role}</Text>
                  <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                </View>
                <Text style={{ fontSize: bulletSize, color: textMid, fontStyle: 'italic' }}>{item.company}{item.loc ? ` | ${item.loc}` : ''}</Text>
                {item.bullets.map((b, bi) => (
                  <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.5, paddingLeft: pad * 0.5 }}>{'\u2022'} {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <View style={{ marginBottom: sectionGap }}>
          <Text style={{ fontSize: sectionSize, fontWeight: '700', color: accent, letterSpacing: 1, textTransform: 'uppercase', borderBottomWidth: 0.5 * f, borderBottomColor: borderColor, paddingBottom: lineGap }}>SKILLS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 * f, marginTop: lineGap * 1.5 }}>
            {skills.map((sk, i) => (
              <View key={i} style={{ backgroundColor: accent + '12', paddingHorizontal: 4 * f, paddingVertical: 1.5 * f, borderRadius: 2 * f }}>
                <Text style={{ fontSize: bulletSize - 0.5 * f, color: accent }}>{sk}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // --- Modern: left-aligned, accent left border on sections ---
  if (template.headerStyle === 'left') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg, padding: pad }]}>
        <Text style={{ fontSize: nameSize * 1.1, fontWeight: '700', color: accent }}>{name}</Text>
        <Text style={{ fontSize: contactSize, color: textMid, marginTop: lineGap }}>{contact}</Text>
        <View style={{ height: 0.5 * f, backgroundColor: borderColor, marginVertical: sectionGap }} />
        <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5, marginBottom: sectionGap }}>{summaryText}</Text>
        {sections.map((sec, si) => (
          <View key={si} style={{ borderLeftWidth: 2 * f, borderLeftColor: accent, paddingLeft: pad * 0.7, marginBottom: sectionGap }}>
            <Text style={{ fontSize: sectionSize, fontWeight: '700', color: textDark, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap * 1.5 }}>{sec.title}</Text>
            {sec.items.map((item, ii) => (
              <View key={ii} style={{ marginBottom: lineGap * 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: bulletSize + 0.5 * f, fontWeight: '600', color: textDark }}>{item.role}</Text>
                  <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                </View>
                <Text style={{ fontSize: bulletSize, color: accent, marginTop: lineGap * 0.3 }}>{item.company}{item.loc ? ` \u2022 ${item.loc}` : ''}</Text>
                {item.bullets.map((b, bi) => (
                  <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.5, paddingLeft: pad * 0.3 }}>{'\u2022'} {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <View style={{ borderLeftWidth: 2 * f, borderLeftColor: accent, paddingLeft: pad * 0.7 }}>
          <Text style={{ fontSize: sectionSize, fontWeight: '700', color: textDark, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap * 1.5 }}>SKILLS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 * f }}>
            {skills.map((sk, i) => (
              <View key={i} style={{ backgroundColor: accent + '15', paddingHorizontal: 5 * f, paddingVertical: 2 * f, borderRadius: 10 * f }}>
                <Text style={{ fontSize: bulletSize - 0.5 * f, color: accent, fontWeight: '500' }}>{sk}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // --- Technical: sidebar left, content right ---
  if (template.headerStyle === 'sidebar') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg, flexDirection: 'row' }]}>
        {/* Sidebar */}
        <View style={{ width: '32%', backgroundColor: accent + '0D', borderRightWidth: 2 * f, borderRightColor: accent + '30', padding: pad * 0.8 }}>
          <Text style={{ fontSize: nameSize * 0.75, fontWeight: '700', color: textDark, lineHeight: nameSize * 0.9, marginBottom: sectionGap * 0.5 }}>{name}</Text>
          {/* Contact */}
          <Text style={{ fontSize: sectionSize * 0.75, fontWeight: '700', color: accent, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: lineGap }}>CONTACT</Text>
          {['john@email.com', '(555) 123-4567', 'San Francisco, CA'].map((c, i) => (
            <Text key={i} style={{ fontSize: bulletSize * 0.85, color: textMid, marginBottom: lineGap * 0.5 }}>{c}</Text>
          ))}
          {/* Skills in sidebar */}
          <Text style={{ fontSize: sectionSize * 0.75, fontWeight: '700', color: accent, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: sectionGap * 0.6, marginBottom: lineGap }}>SKILLS</Text>
          {skills.slice(0, 6).map((sk, i) => (
            <Text key={i} style={{ fontSize: bulletSize * 0.85, color: textDark, marginBottom: lineGap * 0.3 }}>{'\u2022'} {sk}</Text>
          ))}
          {/* Education in sidebar */}
          <Text style={{ fontSize: sectionSize * 0.75, fontWeight: '700', color: accent, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: sectionGap * 0.6, marginBottom: lineGap }}>EDUCATION</Text>
          <Text style={{ fontSize: bulletSize * 0.85, fontWeight: '600', color: textDark }}>B.S. Computer Science</Text>
          <Text style={{ fontSize: bulletSize * 0.75, color: textMid }}>Stanford University</Text>
          <Text style={{ fontSize: bulletSize * 0.75, color: textMid }}>2018</Text>
        </View>
        {/* Main content */}
        <View style={{ flex: 1, padding: pad * 0.8 }}>
          <Text style={{ fontSize: sectionSize, fontWeight: '700', color: accent, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap }}>PROFILE</Text>
          <Text style={{ fontSize: bodySize * 0.9, color: textMid, lineHeight: bodySize * 1.4, marginBottom: sectionGap }}>{summaryText}</Text>
          <Text style={{ fontSize: sectionSize, fontWeight: '700', color: accent, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap }}>EXPERIENCE</Text>
          {sections[0].items.map((item, ii) => (
            <View key={ii} style={{ marginBottom: lineGap * 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: bulletSize, fontWeight: '600', color: textDark }}>{item.role}</Text>
              </View>
              <Text style={{ fontSize: bulletSize * 0.85, color: textMid }}>{item.company} | {item.date}</Text>
              {item.bullets.slice(0, 2).map((b, bi) => (
                <Text key={bi} style={{ fontSize: bulletSize * 0.85, color: textDark, marginTop: lineGap * 0.3 }}>{'\u2022'} {b}</Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Creative: bold full-width gradient header ---
  if (template.headerStyle === 'bold') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg }]}>
        <View style={{ backgroundColor: accent, paddingVertical: pad * 1.2, paddingHorizontal: pad }}>
          <Text style={{ fontSize: nameSize * 1.2, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1.5, textTransform: 'uppercase' }}>{name}</Text>
          <Text style={{ fontSize: contactSize, color: 'rgba(255,255,255,0.7)', marginTop: lineGap }}>{contact}</Text>
        </View>
        <View style={{ padding: pad }}>
          <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5, marginBottom: sectionGap }}>{summaryText}</Text>
          {sections.map((sec, si) => (
            <View key={si} style={{ marginBottom: sectionGap }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: lineGap * 1.5 }}>
                <View style={{ width: 4 * f, height: 4 * f, borderRadius: 2 * f, backgroundColor: accent, marginRight: 4 * f }} />
                <Text style={{ fontSize: sectionSize, fontWeight: '700', color: textDark, letterSpacing: 0.8, textTransform: 'uppercase' }}>{sec.title}</Text>
              </View>
              {sec.items.map((item, ii) => (
                <View key={ii} style={{ marginBottom: lineGap * 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: bulletSize + 0.5 * f, fontWeight: '600', color: textDark }}>{item.role}</Text>
                    <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                  </View>
                  <Text style={{ fontSize: bulletSize, color: accent }}>{item.company}</Text>
                  {item.bullets.map((b, bi) => (
                    <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.4 }}>{'\u2022'} {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Executive: two-tone split header ---
  if (template.headerStyle === 'split') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg }]}>
        <View style={{ backgroundColor: accent, paddingVertical: pad, paddingHorizontal: pad * 1.2 }}>
          <Text style={{ fontSize: nameSize, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.5 }}>{name}</Text>
          <Text style={{ fontSize: contactSize, color: 'rgba(255,255,255,0.6)', marginTop: lineGap }}>{contact}</Text>
        </View>
        <View style={{ paddingHorizontal: pad * 1.2, paddingVertical: sectionGap * 0.6, borderBottomWidth: 1 * f, borderBottomColor: accent + '40' }}>
          <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5 }}>{summaryText}</Text>
        </View>
        <View style={{ padding: pad * 1.2, paddingTop: sectionGap }}>
          {sections.map((sec, si) => (
            <View key={si} style={{ marginBottom: sectionGap }}>
              <Text style={{ fontSize: sectionSize, fontWeight: '700', color: accent, letterSpacing: 1, textTransform: 'uppercase' }}>{sec.title}</Text>
              <View style={{ height: 0.5 * f, backgroundColor: borderColor, marginTop: lineGap, marginBottom: lineGap * 1.5 }} />
              {sec.items.map((item, ii) => (
                <View key={ii} style={{ marginBottom: lineGap * 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: bulletSize + 0.5 * f, fontWeight: '600', color: textDark }}>{item.role}</Text>
                    <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                  </View>
                  <Text style={{ fontSize: bulletSize, color: textMid, fontStyle: 'italic' }}>{item.company}</Text>
                  {item.bullets.map((b, bi) => (
                    <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.4 }}>{'\u2022'} {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Minimal: ultra-clean, maximum whitespace ---
  return (
    <View style={[pv.canvas, { backgroundColor: bg, padding: pad * 1.2 }]}>
      <Text style={{ fontSize: nameSize * 0.9, fontWeight: '300', color: textDark, letterSpacing: 0.5 }}>{name}</Text>
      <Text style={{ fontSize: contactSize, color: textLight, marginTop: lineGap }}>{contact}</Text>
      <View style={{ height: 0.5 * f, backgroundColor: borderColor, marginVertical: sectionGap }} />
      <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.6, marginBottom: sectionGap }}>{summaryText}</Text>
      {sections.map((sec, si) => (
        <View key={si} style={{ marginBottom: sectionGap * 1.2 }}>
          <Text style={{ fontSize: sectionSize * 0.9, fontWeight: '500', color: textDark, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: lineGap * 2 }}>{sec.title}</Text>
          {sec.items.map((item, ii) => (
            <View key={ii} style={{ marginBottom: lineGap * 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: bulletSize + 0.5 * f, fontWeight: '500', color: textDark }}>{item.role}</Text>
                <Text style={{ fontSize: bulletSize, color: textLight }}>{item.date}</Text>
              </View>
              <Text style={{ fontSize: bulletSize, color: textLight }}>{item.company}</Text>
              {item.bullets.map((b, bi) => (
                <Text key={bi} style={{ fontSize: bulletSize, color: textMid, marginTop: lineGap * 0.4 }}>{'\u2022'} {b}</Text>
              ))}
            </View>
          ))}
        </View>
      ))}
      <Text style={{ fontSize: sectionSize * 0.9, fontWeight: '500', color: textDark, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: lineGap * 2 }}>SKILLS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 * f }}>
        {skills.map((sk, i) => (
          <Text key={i} style={{ fontSize: bulletSize - 0.5 * f, color: textMid, paddingHorizontal: 4 * f, paddingVertical: 1.5 * f, borderWidth: 0.5, borderColor: borderColor, borderRadius: 2 * f }}>{sk}</Text>
        ))}
      </View>
    </View>
  );
}

const pv = StyleSheet.create({
  canvas: { flex: 1, overflow: 'hidden' },
});

const categories = ['All', 'Classic', 'Contemporary', 'Tech', 'Design', 'Leadership', 'Simple'];

export default function TemplatesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Resume selector state
  const [resumeOptions, setResumeOptions] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumeType, setResumeType] = useState<'base' | 'tailored'>('base');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumeSelectorOpen, setResumeSelectorOpen] = useState(false);

  // Load resumes on mount
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        // Fetch base resumes
        const baseResult = await api.getResumes();
        const baseResumes: ResumeOption[] = [];
        if (baseResult.success && Array.isArray(baseResult.data)) {
          baseResult.data.forEach((r: any) => {
            baseResumes.push({
              id: r.resume_id || r.id,
              label: r.filename || r.original_filename || 'Resume',
              type: 'base',
              filename: r.filename || r.original_filename,
            });
          });
        }

        // Fetch tailored resumes
        const tailoredResult = await api.listTailoredResumes();
        const tailoredResumes: ResumeOption[] = [];
        if (tailoredResult.success && Array.isArray(tailoredResult.data)) {
          tailoredResult.data.forEach((r: any) => {
            tailoredResumes.push({
              id: r.id || r.tailored_resume_id,
              label: `${r.job_title || r.jobTitle || 'Job'} - ${r.company || 'Company'}`,
              type: 'tailored',
              company: r.company,
              jobTitle: r.job_title || r.jobTitle,
            });
          });
        }

        const allOptions = [...baseResumes, ...tailoredResumes];
        setResumeOptions(allOptions);

        // Check if we have a resumeId from navigation params (e.g., from batch tailor)
        const params = route.params as any;
        if (params?.resumeId) {
          const targetId = Number(params.resumeId);
          const match = allOptions.find((o) => o.id === targetId);
          if (match) {
            setSelectedResumeId(match.id);
            setResumeType(match.type);
          }
        } else if (allOptions.length > 0) {
          setSelectedResumeId(allOptions[0].id);
          setResumeType(allOptions[0].type);
        }
      } catch (err) {
        console.error('[Templates] Error loading resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };
    loadResumes();
  }, [route.params]);

  const ds = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    categoryChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderWidth: isDark ? 1 : 0,
    },
    categoryChipText: { color: colors.textSecondary },
    templatePreview: { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
    templateName: { color: colors.text },
    templateCategory: { color: colors.textSecondary },
    detailsTitle: { color: colors.text },
    detailsDescription: { color: colors.textSecondary },
  }), [colors, isDark]);

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const selectedResumeLabel = useMemo(() => {
    const option = resumeOptions.find((o) => o.id === selectedResumeId);
    return option?.label || 'Select a resume';
  }, [resumeOptions, selectedResumeId]);

  const handleSelectTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl?.isPremium) {
      Alert.alert(
        'Premium Template',
        'This template requires a Pro subscription. Upgrade to access all premium templates.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Plans', onPress: () => (navigation as any).navigate('Pricing') },
        ],
      );
      return;
    }
    setSelectedTemplate(templateId);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      (navigation as any).navigate('ResumeBuilder', {
        templateId: selectedTemplate,
        resumeId: selectedResumeId,
        resumeType,
      });
    }
  };

  const handlePreview = () => {
    if (selectedTemplate) {
      setPreviewVisible(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, ds.title]}>Resume Templates</Text>
        </View>
        <Text style={[styles.subtitle, ds.subtitle]}>
          Choose a professional, ATS-friendly template
        </Text>

        {/* Resume Selector */}
        {loadingResumes ? (
          <View style={styles.resumeSelectorLoading}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={[styles.resumeSelectorLoadingText, { color: colors.textSecondary }]}>
              Loading resumes...
            </Text>
          </View>
        ) : resumeOptions.length === 0 ? (
          <GlassCard style={styles.emptyResumeCard}>
            <Upload size={24} color={colors.textSecondary} />
            <Text style={[styles.emptyResumeText, { color: colors.textSecondary }]}>
              Upload a resume first to preview with templates
            </Text>
            <GlassButton
              variant="primary"
              onPress={() => (navigation as any).navigate('UploadResume')}
              style={styles.uploadButton}
            >
              <Text style={styles.uploadButtonText}>Upload Resume</Text>
            </GlassButton>
          </GlassCard>
        ) : (
          <TouchableOpacity
            style={[styles.resumeSelector, { borderColor: colors.border }]}
            onPress={() => setResumeSelectorOpen(!resumeSelectorOpen)}
          >
            <View style={styles.resumeSelectorInner}>
              <FileText size={18} color={colors.textSecondary} />
              <View style={styles.resumeSelectorTextContainer}>
                <Text style={[styles.resumeSelectorLabel, { color: colors.textTertiary }]}>
                  {resumeType === 'tailored' ? 'Tailored Resume' : 'Base Resume'}
                </Text>
                <Text style={[styles.resumeSelectorValue, { color: colors.text }]} numberOfLines={1}>
                  {selectedResumeLabel}
                </Text>
              </View>
            </View>
            <ChevronDown size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Resume Selector Dropdown */}
        {resumeSelectorOpen && resumeOptions.length > 0 && (
          <GlassCard style={styles.resumeDropdown} padding={4}>
            {resumeOptions.map((option) => (
              <TouchableOpacity
                key={`${option.type}-${option.id}`}
                style={[
                  styles.resumeDropdownItem,
                  selectedResumeId === option.id && { backgroundColor: ALPHA_COLORS.primary.bg },
                ]}
                onPress={() => {
                  setSelectedResumeId(option.id);
                  setResumeType(option.type);
                  setResumeSelectorOpen(false);
                }}
              >
                <Text style={[styles.resumeDropdownType, { color: colors.textTertiary }]}>
                  {option.type === 'tailored' ? 'TAILORED' : 'BASE'}
                </Text>
                <Text style={[styles.resumeDropdownLabel, { color: colors.text }]} numberOfLines={1}>
                  {option.label}
                </Text>
                {selectedResumeId === option.id && <Check size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </GlassCard>
        )}

        {/* ATS Info Banner */}
        <View style={[styles.atsBanner, { backgroundColor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.05)' }]}>
          <Info size={14} color={COLORS.primary} />
          <Text style={[styles.atsBannerText, { color: colors.textSecondary }]}>
            ATS Score: Higher scores pass more applicant tracking systems.{' '}
            <Text style={{ color: COLORS.success }}>9-10</Text> Excellent{' '}
            <Text style={{ color: COLORS.primary }}>7-8</Text> Good{' '}
            <Text style={{ color: '#EAB308' }}>5-6</Text> Fair
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                ds.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  ds.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Templates Grid */}
        <ScrollView
          style={styles.templatesScroll}
          contentContainerStyle={styles.templatesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.templatesGrid}>
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => handleSelectTemplate(template.id)}
                  style={styles.templateCard}
                >
                  <GlassCard
                    style={[
                      styles.templateCardInner,
                      isSelected && styles.templateCardSelected,
                    ]}
                  >
                    <View style={[styles.templatePreview, ds.templatePreview]}>
                      <TemplatePreviewRenderer template={template} />
                    </View>

                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Check size={16} color="#FFF" />
                      </View>
                    )}

                    <View style={styles.templateInfo}>
                      <View style={styles.templateInfoRow}>
                        <Text style={[styles.templateName, ds.templateName]}>
                          {template.name}
                        </Text>
                        {template.isPremium && (
                          <Crown size={14} color="#EAB308" />
                        )}
                      </View>
                      <View style={styles.templateInfoRow}>
                        <Text style={[styles.templateCategory, ds.templateCategory]}>
                          {template.category}
                        </Text>
                        <View style={[styles.atsBadge, { backgroundColor: getAtsColor(template.atsScore) + '20' }]}>
                          <Text style={[styles.atsBadgeText, { color: getAtsColor(template.atsScore) }]}>
                            ATS {template.atsScore}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Template Details */}
          {selectedTemplate && (() => {
            const tmpl = templates.find((t) => t.id === selectedTemplate);
            return tmpl ? (
            <GlassCard style={styles.detailsCard}>
                <>
                  <View style={styles.detailsTitleRow}>
                    <Text style={[styles.detailsTitle, ds.detailsTitle]}>
                      {tmpl.name}
                    </Text>
                    <View style={[styles.atsScoreBadgeLarge, { backgroundColor: getAtsColor(tmpl.atsScore) + '20' }]}>
                      <Text style={[styles.atsScoreBadgeLargeText, { color: getAtsColor(tmpl.atsScore) }]}>
                        ATS Score: {tmpl.atsScore}/10
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.detailsDescription, ds.detailsDescription]}>
                    {tmpl.description}
                  </Text>

                  <View style={styles.detailsActions}>
                    <GlassButton
                      variant="secondary"
                      style={styles.previewButton}
                      onPress={handlePreview}
                    >
                      <Eye size={18} color={colors.text} />
                      <Text style={[styles.detailsButtonText, { color: colors.text }]}>
                        Preview
                      </Text>
                    </GlassButton>

                    <GlassButton
                      variant="primary"
                      style={styles.useButton}
                      onPress={handleUseTemplate}
                    >
                      <Text style={styles.detailsButtonTextPrimary}>
                        Use Template
                      </Text>
                    </GlassButton>
                  </View>
                </>
            </GlassCard>
            ) : null;
          })()}
        </ScrollView>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPreviewVisible(false)}
          />
          <View style={styles.modalContent}>
            <GlassCard style={styles.previewCard}>
              {selectedTemplate && (
                <>
                  <View style={styles.previewHeader}>
                    <Text style={[styles.previewTitle, { color: colors.text }]}>
                      {templates.find((t) => t.id === selectedTemplate)?.name}
                    </Text>
                    <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                      <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.previewImageContainer}>
                    {(() => {
                      const tmpl = templates.find((t) => t.id === selectedTemplate);
                      return tmpl ? (
                        <TemplatePreviewRenderer template={tmpl} large />
                      ) : null;
                    })()}
                  </View>
                </>
              )}
            </GlassCard>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  title: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.callout,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.headline.fontFamily,
  },
  templatesScroll: {
    flex: 1,
  },
  templatesContent: {
    padding: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  templateCard: {
    width: TEMPLATE_WIDTH,
  },
  templateCardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  templateCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  templatePreview: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    padding: 12,
  },
  templateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  templateName: {
    ...TYPOGRAPHY.h6,
    flex: 1,
  },
  templateCategory: {
    ...TYPOGRAPHY.caption1,
  },
  atsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  atsBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  detailsCard: {
    padding: 20,
  },
  detailsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailsTitle: {
    ...TYPOGRAPHY.title3,
    flex: 1,
  },
  atsScoreBadgeLarge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  atsScoreBadgeLargeText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  detailsDescription: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
    marginBottom: 20,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailsButtonText: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.headline.fontFamily,
  },
  detailsButtonTextPrimary: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.headline.fontFamily,
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  previewCard: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    ...TYPOGRAPHY.title3,
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  previewImageContainer: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Resume selector styles
  resumeSelectorLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 8,
  },
  resumeSelectorLoadingText: {
    ...TYPOGRAPHY.subhead,
  },
  emptyResumeCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyResumeText: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  uploadButton: {
    paddingHorizontal: SPACING.xl,
  },
  uploadButtonText: {
    color: '#FFF',
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  resumeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderRadius: 12,
  },
  resumeSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  resumeSelectorTextContainer: {
    flex: 1,
  },
  resumeSelectorLabel: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  resumeSelectorValue: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
  },
  resumeDropdown: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  resumeDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  resumeDropdownType: {
    fontSize: 9,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
    width: 60,
  },
  resumeDropdownLabel: {
    ...TYPOGRAPHY.subhead,
    fontSize: 13,
    flex: 1,
  },
  atsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: 6,
  },
  atsBannerText: {
    fontSize: 11,
    flex: 1,
  },
});
