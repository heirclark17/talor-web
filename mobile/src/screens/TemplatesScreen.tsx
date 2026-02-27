/**
 * Templates Screen
 * Browse and select resume templates — previews render with the user's
 * actual resume data instead of placeholder "John Doe" content.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { Check, Eye, Crown, Info, Upload, FileText, ChevronDown, Download, Share2 } from 'lucide-react-native';
// expo-print loaded lazily — requires dev build (not Expo Go)
let Print: typeof import('expo-print') | null = null;
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS, TYPOGRAPHY, SPACING, FONTS, ALPHA_COLORS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { api } from '../api/client';

const { width } = Dimensions.get('window');
const TEMPLATE_WIDTH = (width - 48) / 2;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

/** Normalized shape of resume content used by the preview renderer */
export interface ResumeContent {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: Array<{
    role: string;
    company: string;
    date: string;
    loc: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

// ---------------------------------------------------------------------------
// Static template catalogue
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Fallback placeholder resume (used only while real data loads or is absent)
// ---------------------------------------------------------------------------

const PLACEHOLDER_RESUME: ResumeContent = {
  name: 'Your Name',
  email: 'you@email.com',
  phone: '(555) 000-0000',
  location: 'City, State',
  summary:
    'Your professional summary will appear here once you upload a resume. It will reflect your actual experience and career objectives.',
  skills: ['Upload', 'Your Resume', 'To See', 'Real Skills', 'Here'],
  experience: [
    {
      role: 'Your Most Recent Role',
      company: 'Company Name',
      date: '20XX – Present',
      loc: 'City, State',
      bullets: [
        'Your real achievements and impact will be shown here',
        'Upload your resume to preview with your actual content',
      ],
    },
  ],
  education: [
    { degree: 'Degree', institution: 'University', year: '20XX' },
  ],
};

// ---------------------------------------------------------------------------
// Helper: parse raw API data into ResumeContent
// ---------------------------------------------------------------------------

/**
 * Parse raw experience entries returned by the backend.
 * The AI parser returns objects with {title, company, dates, bullets, location?}.
 */
function parseExperience(
  raw: any[],
): ResumeContent['experience'] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.slice(0, 3).map((job: any) => ({
    role: job.title || job.role || job.position || '',
    company: job.company || job.employer || '',
    date: job.dates || job.date || job.dateRange || '',
    loc: job.location || job.loc || '',
    bullets: Array.isArray(job.bullets)
      ? job.bullets.slice(0, 3)
      : Array.isArray(job.responsibilities)
      ? job.responsibilities.slice(0, 3)
      : [],
  }));
}

/**
 * Parse education — backend stores it as a free-form string or occasionally
 * as an array of objects.
 */
function parseEducation(raw: any): ResumeContent['education'] {
  if (!raw) return [];

  // Array of objects
  if (Array.isArray(raw)) {
    return raw.slice(0, 2).map((e: any) => ({
      degree: e.degree || e.field || '',
      institution: e.institution || e.school || e.university || '',
      year: e.year || e.graduationYear || e.dates || '',
    }));
  }

  // Single string — attempt to extract the first line as degree + institution
  if (typeof raw === 'string' && raw.trim()) {
    const lines = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) return [];
    // Heuristic: first line is often "Degree — Institution (Year)"
    const firstLine = lines[0];
    const yearMatch = firstLine.match(/\b(19|20)\d{2}\b/);
    return [
      {
        degree: firstLine.replace(/\b(19|20)\d{2}\b/, '').replace(/[-–|,]?\s*$/, '').trim(),
        institution: lines[1] || '',
        year: yearMatch ? yearMatch[0] : '',
      },
    ];
  }

  return [];
}

/**
 * Normalise a raw API resume payload (base or tailored) into ResumeContent.
 */
function normaliseResumeContent(raw: any, isTailored: boolean): ResumeContent {
  if (!raw) return PLACEHOLDER_RESUME;

  // Tailored resumes use slightly different field names
  const name =
    raw.name ||
    raw.candidate_name ||
    raw.candidateName ||
    '';
  const email =
    raw.candidate_email ||
    raw.candidateEmail ||
    (raw.contact_info && raw.contact_info.email) ||
    '';
  const phone =
    raw.candidate_phone ||
    raw.candidatePhone ||
    (raw.contact_info && raw.contact_info.phone) ||
    '';
  const location =
    raw.candidate_location ||
    raw.candidateLocation ||
    (raw.contact_info && raw.contact_info.location) ||
    '';
  const summary = raw.summary || raw.tailoredSummary || '';

  // Skills: tailored resumes use "competencies", base resumes use "skills"
  const rawSkills = isTailored
    ? raw.competencies || raw.skills || []
    : raw.skills || raw.competencies || [];
  const skills: string[] = Array.isArray(rawSkills)
    ? rawSkills.filter(Boolean).slice(0, 10)
    : [];

  const rawExp = isTailored
    ? raw.experience || raw.tailoredExperience || []
    : raw.experience || [];
  const experience = parseExperience(rawExp);

  const rawEdu = raw.education || raw.tailoredEducation || '';
  const education = parseEducation(rawEdu);

  // If nothing meaningful came back fall through to the placeholder
  const hasContent = name || summary || experience.length > 0 || skills.length > 0;
  if (!hasContent) return PLACEHOLDER_RESUME;

  return {
    name: name || PLACEHOLDER_RESUME.name,
    email: email || PLACEHOLDER_RESUME.email,
    phone: phone || PLACEHOLDER_RESUME.phone,
    location: location || PLACEHOLDER_RESUME.location,
    summary: summary || PLACEHOLDER_RESUME.summary,
    skills: skills.length > 0 ? skills : PLACEHOLDER_RESUME.skills,
    experience: experience.length > 0 ? experience : PLACEHOLDER_RESUME.experience,
    education: education.length > 0 ? education : PLACEHOLDER_RESUME.education,
  };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function getAtsColor(score: number): string {
  if (score >= 9) return COLORS.success;
  if (score >= 7) return COLORS.primary;
  return '#EAB308';
}

/**
 * Truncate a string to a maximum length, appending "…" when cut.
 * Used to keep variable-length user content from overflowing thumbnail cells.
 */
function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

// ---------------------------------------------------------------------------
// Template preview renderer
// ---------------------------------------------------------------------------

/**
 * Renders an actual visual preview of the resume template populated with the
 * user's real resume data (or a placeholder when data is not yet available).
 *
 * Props:
 *   template  - which template layout to render
 *   content   - the user's normalised resume data
 *   large     - true when shown in the full-size preview modal
 *   loading   - true while resume data is being fetched
 */
function TemplatePreviewRenderer({
  template,
  content,
  large = false,
  loading = false,
}: {
  template: Template;
  content: ResumeContent;
  large?: boolean;
  loading?: boolean;
}) {
  const accent = template.accentColor;
  const bg = '#FFFFFF';
  const textDark = '#1F2937';
  const textMid = '#6B7280';
  const textLight = '#9CA3AF';
  const borderColor = '#E5E7EB';

  // Scale factors
  const f = large ? 1.8 : 1;
  const nameSize = 11 * f;
  const sectionSize = 6 * f;
  const bodySize = 4.5 * f;
  const contactSize = 4 * f;
  const bulletSize = 4 * f;
  const pad = 8 * f;
  const sectionGap = 6 * f;
  const lineGap = 2 * f;

  // While data is loading we show a subtle skeleton overlay
  if (loading) {
    return (
      <View style={[pv.canvas, { backgroundColor: bg, padding: pad, alignItems: 'center', justifyContent: 'center' }]}>
        <View style={{ width: '70%', height: nameSize + lineGap, backgroundColor: '#E5E7EB', borderRadius: 3, marginBottom: lineGap * 2 }} />
        <View style={{ width: '50%', height: contactSize, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: sectionGap }} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ width: '100%', height: bulletSize, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: lineGap * 1.5 }} />
        ))}
      </View>
    );
  }

  // Derive display content with appropriate truncation for thumbnail vs modal
  const maxSummary = large ? 280 : 120;
  const maxBullet = large ? 120 : 55;
  const maxName = large ? 60 : 30;

  const name = truncate(content.name, maxName);
  const contactLine = [content.email, content.phone, content.location]
    .filter(Boolean)
    .join(' | ');
  const contact = truncate(contactLine, large ? 90 : 50);
  const summaryText = truncate(content.summary, maxSummary);
  const skills = content.skills.slice(0, large ? 10 : 8);

  // Build sections array for the body (Experience + Education)
  const experienceItems = content.experience.map((job) => ({
    role: truncate(job.role, large ? 50 : 28),
    company: truncate(job.company, large ? 40 : 22),
    date: truncate(job.date, 20),
    loc: truncate(job.loc, 20),
    bullets: job.bullets
      .slice(0, large ? 3 : 2)
      .map((b) => truncate(b, maxBullet)),
  }));

  const educationItems = content.education.slice(0, large ? 2 : 1).map((edu) => ({
    role: truncate(edu.degree, large ? 50 : 28),
    company: truncate(edu.institution, large ? 40 : 22),
    date: truncate(edu.year, 10),
    loc: '',
    bullets: [] as string[],
  }));

  const sections = [
    { title: 'EXPERIENCE', items: experienceItems },
    { title: 'EDUCATION', items: educationItems },
  ];

  // ---- Professional: centered header, section dividers ---
  if (template.headerStyle === 'centered') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg, padding: pad }]}>
        <View style={{ alignItems: 'center', paddingBottom: pad * 0.6, borderBottomWidth: 1.5 * f, borderBottomColor: accent, marginBottom: sectionGap }}>
          <Text style={{ fontSize: nameSize, fontFamily: FONTS.bold, color: textDark, letterSpacing: 1 }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: contactSize, color: textMid, marginTop: lineGap }} numberOfLines={1}>{contact}</Text>
        </View>
        <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5, marginBottom: sectionGap }} numberOfLines={large ? 6 : 3}>{summaryText}</Text>
        {sections.map((sec, si) => (
          <View key={si} style={{ marginBottom: sectionGap }}>
            <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: accent, letterSpacing: 1, textTransform: 'uppercase', borderBottomWidth: 0.5 * f, borderBottomColor: borderColor, paddingBottom: lineGap }}>{sec.title}</Text>
            {sec.items.map((item, ii) => (
              <View key={ii} style={{ marginTop: lineGap * 1.5 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: bulletSize + 0.5 * f, fontFamily: FONTS.semibold, color: textDark }} numberOfLines={1}>{item.role}</Text>
                  <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                </View>
                <Text style={{ fontSize: bulletSize, color: textMid, fontStyle: 'italic' }} numberOfLines={1}>{item.company}{item.loc ? ` | ${item.loc}` : ''}</Text>
                {item.bullets.map((b, bi) => (
                  <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.5, paddingLeft: pad * 0.5 }} numberOfLines={2}>{'\u2022'} {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <View style={{ marginBottom: sectionGap }}>
          <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: accent, letterSpacing: 1, textTransform: 'uppercase', borderBottomWidth: 0.5 * f, borderBottomColor: borderColor, paddingBottom: lineGap }}>SKILLS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 * f, marginTop: lineGap * 1.5 }}>
            {skills.map((sk, i) => (
              <View key={i} style={{ backgroundColor: accent + '12', paddingHorizontal: 4 * f, paddingVertical: 1.5 * f, borderRadius: 2 * f }}>
                <Text style={{ fontSize: bulletSize - 0.5 * f, color: accent }} numberOfLines={1}>{sk}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ---- Modern: left-aligned, accent left border on sections ---
  if (template.headerStyle === 'left') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg, padding: pad }]}>
        <Text style={{ fontSize: nameSize * 1.1, fontFamily: FONTS.bold, color: accent }} numberOfLines={1}>{name}</Text>
        <Text style={{ fontSize: contactSize, color: textMid, marginTop: lineGap }} numberOfLines={1}>{contact}</Text>
        <View style={{ height: 0.5 * f, backgroundColor: borderColor, marginVertical: sectionGap }} />
        <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5, marginBottom: sectionGap }} numberOfLines={large ? 6 : 3}>{summaryText}</Text>
        {sections.map((sec, si) => (
          <View key={si} style={{ borderLeftWidth: 2 * f, borderLeftColor: accent, paddingLeft: pad * 0.7, marginBottom: sectionGap }}>
            <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: textDark, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap * 1.5 }}>{sec.title}</Text>
            {sec.items.map((item, ii) => (
              <View key={ii} style={{ marginBottom: lineGap * 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: bulletSize + 0.5 * f, fontFamily: FONTS.semibold, color: textDark }} numberOfLines={1}>{item.role}</Text>
                  <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                </View>
                <Text style={{ fontSize: bulletSize, color: accent, marginTop: lineGap * 0.3 }} numberOfLines={1}>{item.company}{item.loc ? ` \u2022 ${item.loc}` : ''}</Text>
                {item.bullets.map((b, bi) => (
                  <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.5, paddingLeft: pad * 0.3 }} numberOfLines={2}>{'\u2022'} {b}</Text>
                ))}
              </View>
            ))}
          </View>
        ))}
        <View style={{ borderLeftWidth: 2 * f, borderLeftColor: accent, paddingLeft: pad * 0.7 }}>
          <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: textDark, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap * 1.5 }}>SKILLS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 * f }}>
            {skills.map((sk, i) => (
              <View key={i} style={{ backgroundColor: accent + '15', paddingHorizontal: 5 * f, paddingVertical: 2 * f, borderRadius: 10 * f }}>
                <Text style={{ fontSize: bulletSize - 0.5 * f, color: accent, fontFamily: FONTS.medium }} numberOfLines={1}>{sk}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ---- Technical: sidebar left, content right ---
  if (template.headerStyle === 'sidebar') {
    const sidebarContact = [content.email, content.phone, content.location].filter(Boolean);
    return (
      <View style={[pv.canvas, { backgroundColor: bg, flexDirection: 'row' }]}>
        {/* Sidebar */}
        <View style={{ width: '32%', backgroundColor: accent + '0D', borderRightWidth: 2 * f, borderRightColor: accent + '30', padding: pad * 0.8 }}>
          <Text style={{ fontSize: nameSize * 0.75, fontFamily: FONTS.bold, color: textDark, lineHeight: nameSize * 0.9, marginBottom: sectionGap * 0.5 }} numberOfLines={2}>{name}</Text>
          <Text style={{ fontSize: sectionSize * 0.75, fontFamily: FONTS.bold, color: accent, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: lineGap }}>CONTACT</Text>
          {sidebarContact.map((c, i) => (
            <Text key={i} style={{ fontSize: bulletSize * 0.85, color: textMid, marginBottom: lineGap * 0.5 }} numberOfLines={1}>{c}</Text>
          ))}
          <Text style={{ fontSize: sectionSize * 0.75, fontFamily: FONTS.bold, color: accent, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: sectionGap * 0.6, marginBottom: lineGap }}>SKILLS</Text>
          {skills.slice(0, 6).map((sk, i) => (
            <Text key={i} style={{ fontSize: bulletSize * 0.85, color: textDark, marginBottom: lineGap * 0.3 }} numberOfLines={1}>{'\u2022'} {sk}</Text>
          ))}
          {content.education.length > 0 && (
            <>
              <Text style={{ fontSize: sectionSize * 0.75, fontFamily: FONTS.bold, color: accent, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: sectionGap * 0.6, marginBottom: lineGap }}>EDUCATION</Text>
              <Text style={{ fontSize: bulletSize * 0.85, fontFamily: FONTS.semibold, color: textDark }} numberOfLines={2}>{content.education[0].degree}</Text>
              <Text style={{ fontSize: bulletSize * 0.75, color: textMid }} numberOfLines={1}>{content.education[0].institution}</Text>
              <Text style={{ fontSize: bulletSize * 0.75, color: textMid }}>{content.education[0].year}</Text>
            </>
          )}
        </View>
        {/* Main content */}
        <View style={{ flex: 1, padding: pad * 0.8 }}>
          <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: accent, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap }}>PROFILE</Text>
          <Text style={{ fontSize: bodySize * 0.9, color: textMid, lineHeight: bodySize * 1.4, marginBottom: sectionGap }} numberOfLines={large ? 6 : 3}>{summaryText}</Text>
          <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: accent, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: lineGap }}>EXPERIENCE</Text>
          {experienceItems.map((item, ii) => (
            <View key={ii} style={{ marginBottom: lineGap * 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: bulletSize, fontFamily: FONTS.semibold, color: textDark }} numberOfLines={1}>{item.role}</Text>
              </View>
              <Text style={{ fontSize: bulletSize * 0.85, color: textMid }} numberOfLines={1}>{item.company} | {item.date}</Text>
              {item.bullets.slice(0, 2).map((b, bi) => (
                <Text key={bi} style={{ fontSize: bulletSize * 0.85, color: textDark, marginTop: lineGap * 0.3 }} numberOfLines={2}>{'\u2022'} {b}</Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ---- Creative: bold full-width colour header ---
  if (template.headerStyle === 'bold') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg }]}>
        <View style={{ backgroundColor: accent, paddingVertical: pad * 1.2, paddingHorizontal: pad }}>
          <Text style={{ fontSize: nameSize * 1.2, fontFamily: FONTS.bold, color: '#FFFFFF', letterSpacing: 1.5, textTransform: 'uppercase' }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: contactSize, color: 'rgba(255,255,255,0.7)', marginTop: lineGap }} numberOfLines={1}>{contact}</Text>
        </View>
        <View style={{ padding: pad }}>
          <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5, marginBottom: sectionGap }} numberOfLines={large ? 6 : 3}>{summaryText}</Text>
          {sections.map((sec, si) => (
            <View key={si} style={{ marginBottom: sectionGap }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: lineGap * 1.5 }}>
                <View style={{ width: 4 * f, height: 4 * f, borderRadius: 2 * f, backgroundColor: accent, marginRight: 4 * f }} />
                <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: textDark, letterSpacing: 0.8, textTransform: 'uppercase' }}>{sec.title}</Text>
              </View>
              {sec.items.map((item, ii) => (
                <View key={ii} style={{ marginBottom: lineGap * 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: bulletSize + 0.5 * f, fontFamily: FONTS.semibold, color: textDark }} numberOfLines={1}>{item.role}</Text>
                    <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                  </View>
                  <Text style={{ fontSize: bulletSize, color: accent }} numberOfLines={1}>{item.company}</Text>
                  {item.bullets.map((b, bi) => (
                    <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.4 }} numberOfLines={2}>{'\u2022'} {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ---- Executive: two-tone split header ---
  if (template.headerStyle === 'split') {
    return (
      <View style={[pv.canvas, { backgroundColor: bg }]}>
        <View style={{ backgroundColor: accent, paddingVertical: pad, paddingHorizontal: pad * 1.2 }}>
          <Text style={{ fontSize: nameSize, fontFamily: FONTS.bold, color: '#FFFFFF', letterSpacing: 0.5 }} numberOfLines={1}>{name}</Text>
          <Text style={{ fontSize: contactSize, color: 'rgba(255,255,255,0.6)', marginTop: lineGap }} numberOfLines={1}>{contact}</Text>
        </View>
        <View style={{ paddingHorizontal: pad * 1.2, paddingVertical: sectionGap * 0.6, borderBottomWidth: 1 * f, borderBottomColor: accent + '40' }}>
          <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.5 }} numberOfLines={large ? 6 : 3}>{summaryText}</Text>
        </View>
        <View style={{ padding: pad * 1.2, paddingTop: sectionGap }}>
          {sections.map((sec, si) => (
            <View key={si} style={{ marginBottom: sectionGap }}>
              <Text style={{ fontSize: sectionSize, fontFamily: FONTS.bold, color: accent, letterSpacing: 1, textTransform: 'uppercase' }}>{sec.title}</Text>
              <View style={{ height: 0.5 * f, backgroundColor: borderColor, marginTop: lineGap, marginBottom: lineGap * 1.5 }} />
              {sec.items.map((item, ii) => (
                <View key={ii} style={{ marginBottom: lineGap * 2 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: bulletSize + 0.5 * f, fontFamily: FONTS.semibold, color: textDark }} numberOfLines={1}>{item.role}</Text>
                    <Text style={{ fontSize: bulletSize, color: textMid }}>{item.date}</Text>
                  </View>
                  <Text style={{ fontSize: bulletSize, color: textMid, fontStyle: 'italic' }} numberOfLines={1}>{item.company}</Text>
                  {item.bullets.map((b, bi) => (
                    <Text key={bi} style={{ fontSize: bulletSize, color: textDark, marginTop: lineGap * 0.4 }} numberOfLines={2}>{'\u2022'} {b}</Text>
                  ))}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // ---- Minimal: ultra-clean, maximum whitespace ---
  return (
    <View style={[pv.canvas, { backgroundColor: bg, padding: pad * 1.2 }]}>
      <Text style={{ fontSize: nameSize * 0.9, fontFamily: FONTS.light, color: textDark, letterSpacing: 0.5 }} numberOfLines={1}>{name}</Text>
      <Text style={{ fontSize: contactSize, color: textLight, marginTop: lineGap }} numberOfLines={1}>{contact}</Text>
      <View style={{ height: 0.5 * f, backgroundColor: borderColor, marginVertical: sectionGap }} />
      <Text style={{ fontSize: bodySize, color: textMid, lineHeight: bodySize * 1.6, marginBottom: sectionGap }} numberOfLines={large ? 6 : 3}>{summaryText}</Text>
      {sections.map((sec, si) => (
        <View key={si} style={{ marginBottom: sectionGap * 1.2 }}>
          <Text style={{ fontSize: sectionSize * 0.9, fontFamily: FONTS.medium, color: textDark, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: lineGap * 2 }}>{sec.title}</Text>
          {sec.items.map((item, ii) => (
            <View key={ii} style={{ marginBottom: lineGap * 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: bulletSize + 0.5 * f, fontFamily: FONTS.medium, color: textDark }} numberOfLines={1}>{item.role}</Text>
                <Text style={{ fontSize: bulletSize, color: textLight }}>{item.date}</Text>
              </View>
              <Text style={{ fontSize: bulletSize, color: textLight }} numberOfLines={1}>{item.company}</Text>
              {item.bullets.map((b, bi) => (
                <Text key={bi} style={{ fontSize: bulletSize, color: textMid, marginTop: lineGap * 0.4 }} numberOfLines={2}>{'\u2022'} {b}</Text>
              ))}
            </View>
          ))}
        </View>
      ))}
      <Text style={{ fontSize: sectionSize * 0.9, fontFamily: FONTS.medium, color: textDark, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: lineGap * 2 }}>SKILLS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3 * f }}>
        {skills.map((sk, i) => (
          <Text key={i} style={{ fontSize: bulletSize - 0.5 * f, color: textMid, paddingHorizontal: 4 * f, paddingVertical: 1.5 * f, borderWidth: 0.5, borderColor: borderColor, borderRadius: 2 * f }} numberOfLines={1}>{sk}</Text>
        ))}
      </View>
    </View>
  );
}

const pv = StyleSheet.create({
  canvas: { flex: 1, overflow: 'hidden' },
});

// ---------------------------------------------------------------------------
// HTML generation for PDF export
// ---------------------------------------------------------------------------

function buildResumeHtml(content: ResumeContent, template: Template): string {
  const accent = template.accentColor;
  const textDark = '#1F2937';
  const textMid = '#6B7280';
  const borderColor = '#E5E7EB';

  const contactLine = [content.email, content.phone, content.location]
    .filter(Boolean)
    .join(' &nbsp;|&nbsp; ');

  const experienceHtml = content.experience
    .map(
      (job) => `
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:baseline">
          <strong style="font-size:13px;color:${textDark}">${job.role}</strong>
          <span style="font-size:11px;color:${textMid}">${job.date}</span>
        </div>
        <div style="font-size:11px;color:${textMid};font-style:italic">${job.company}${job.loc ? ` | ${job.loc}` : ''}</div>
        <ul style="margin:4px 0 0 16px;padding:0;font-size:11px;color:${textDark};line-height:1.5">
          ${job.bullets.map((b) => `<li>${b}</li>`).join('')}
        </ul>
      </div>`,
    )
    .join('');

  const educationHtml = content.education
    .map(
      (edu) => `
      <div style="margin-bottom:8px">
        <strong style="font-size:12px;color:${textDark}">${edu.degree}</strong>
        <div style="font-size:11px;color:${textMid}">${edu.institution}${edu.year ? ` — ${edu.year}` : ''}</div>
      </div>`,
    )
    .join('');

  const skillsHtml = content.skills
    .map(
      (sk) =>
        `<span style="display:inline-block;background:${accent}15;color:${accent};padding:3px 8px;border-radius:4px;font-size:10px;margin:2px">${sk}</span>`,
    )
    .join('');

  // Build header based on template style
  let headerHtml = '';
  if (template.headerStyle === 'bold' || template.headerStyle === 'split') {
    headerHtml = `
      <div style="background:${accent};padding:28px 32px;margin:-32px -32px 24px -32px">
        <h1 style="margin:0;font-size:26px;color:#FFFFFF;letter-spacing:1px">${content.name}</h1>
        <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:6px">${contactLine}</div>
      </div>`;
  } else if (template.headerStyle === 'centered') {
    headerHtml = `
      <div style="text-align:center;padding-bottom:14px;border-bottom:2px solid ${accent};margin-bottom:18px">
        <h1 style="margin:0;font-size:26px;color:${textDark};letter-spacing:1px">${content.name}</h1>
        <div style="font-size:11px;color:${textMid};margin-top:6px">${contactLine}</div>
      </div>`;
  } else {
    headerHtml = `
      <div style="margin-bottom:14px;${template.headerStyle === 'left' ? `border-left:3px solid ${accent};padding-left:12px` : ''}">
        <h1 style="margin:0;font-size:26px;color:${template.headerStyle === 'left' ? accent : textDark}">${content.name}</h1>
        <div style="font-size:11px;color:${textMid};margin-top:6px">${contactLine}</div>
      </div>
      <hr style="border:none;border-top:1px solid ${borderColor};margin-bottom:14px"/>`;
  }

  const sectionStyle = template.headerStyle === 'left'
    ? `border-left:3px solid ${accent};padding-left:10px;`
    : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  @page { margin: 0.75in; size: letter; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: ${textDark}; margin: 0; padding: 32px; }
  h2 { font-size: 13px; color: ${accent}; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px 0; }
</style></head><body>
${headerHtml}
<div style="margin-bottom:16px">
  <h2>Professional Summary</h2>
  <p style="font-size:11px;color:${textMid};line-height:1.6;margin:0">${content.summary}</p>
</div>
<div style="${sectionStyle}margin-bottom:16px">
  <h2>Experience</h2>
  ${experienceHtml}
</div>
<div style="${sectionStyle}margin-bottom:16px">
  <h2>Education</h2>
  ${educationHtml}
</div>
<div style="${sectionStyle}">
  <h2>Skills</h2>
  <div style="margin-top:6px">${skillsHtml}</div>
</div>
</body></html>`;
}

const categories = ['All', 'Classic', 'Contemporary', 'Tech', 'Design', 'Leadership', 'Simple'];

// ---------------------------------------------------------------------------
// Main screen component
// ---------------------------------------------------------------------------

export default function TemplatesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Resume list selector state
  const [resumeOptions, setResumeOptions] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumeType, setResumeType] = useState<'base' | 'tailored'>('base');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [resumeSelectorOpen, setResumeSelectorOpen] = useState(false);

  // The parsed resume content for preview
  const [resumeContent, setResumeContent] = useState<ResumeContent>(PLACEHOLDER_RESUME);
  const [loadingContent, setLoadingContent] = useState(false);

  // Cache fetched resume content to avoid re-fetching on every selection change
  const contentCacheRef = useRef<Map<string, ResumeContent>>(new Map());

  // -------------------------------------------------------------------------
  // Step 1: Load the resume list on mount
  // -------------------------------------------------------------------------
  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      try {
        const [baseResult, tailoredResult] = await Promise.all([
          api.getResumes(),
          api.listTailoredResumes(),
        ]);

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

        const tailoredResumes: ResumeOption[] = [];
        if (tailoredResult.success && Array.isArray(tailoredResult.data)) {
          tailoredResult.data.forEach((r: any) => {
            tailoredResumes.push({
              id: r.id || r.tailored_resume_id,
              label: `${r.job_title || r.jobTitle || 'Job'} — ${r.company || r.companyName || 'Company'}`,
              type: 'tailored',
              company: r.company || r.companyName,
              jobTitle: r.job_title || r.jobTitle,
            });
          });
        }

        const allOptions = [...baseResumes, ...tailoredResumes];
        setResumeOptions(allOptions);

        // Respect resumeId coming in from navigation params (batch tailor flow)
        const params = route.params as any;
        let initialId: number | null = null;
        let initialType: 'base' | 'tailored' = 'base';

        if (params?.resumeId) {
          const targetId = Number(params.resumeId);
          const match = allOptions.find((o) => o.id === targetId);
          if (match) {
            initialId = match.id;
            initialType = match.type;
          }
        }

        if (initialId === null && allOptions.length > 0) {
          initialId = allOptions[0].id;
          initialType = allOptions[0].type;
        }

        setSelectedResumeId(initialId);
        setResumeType(initialType);
      } catch (err) {
        console.error('[Templates] Error loading resumes:', err);
      } finally {
        setLoadingResumes(false);
      }
    };

    loadResumes();
  }, [route.params]);

  // -------------------------------------------------------------------------
  // Step 2: Fetch full resume content when the selected resume changes
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (selectedResumeId === null) return;

    const cacheKey = `${resumeType}-${selectedResumeId}`;

    // Serve from cache if available
    if (contentCacheRef.current.has(cacheKey)) {
      setResumeContent(contentCacheRef.current.get(cacheKey)!);
      return;
    }

    const fetchContent = async () => {
      setLoadingContent(true);
      try {
        let raw: any = null;

        if (resumeType === 'tailored') {
          const result = await api.getTailoredResume(selectedResumeId);
          if (result.success && result.data) {
            raw = result.data;
          }
        } else {
          const result = await api.getResume(selectedResumeId);
          if (result.success && result.data) {
            raw = result.data;
          }
        }

        const normalised = normaliseResumeContent(raw, resumeType === 'tailored');
        contentCacheRef.current.set(cacheKey, normalised);
        setResumeContent(normalised);
      } catch (err) {
        console.error('[Templates] Error fetching resume content:', err);
        // Fall back to the placeholder — do not crash the screen
        setResumeContent(PLACEHOLDER_RESUME);
      } finally {
        setLoadingContent(false);
      }
    };

    fetchContent();
  }, [selectedResumeId, resumeType]);

  // -------------------------------------------------------------------------
  // Derived / memoised values
  // -------------------------------------------------------------------------
  const ds = useMemo(
    () => ({
      container: { backgroundColor: colors.background },
      title: { color: colors.text },
      subtitle: { color: colors.textSecondary },
      categoryChip: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
        borderWidth: isDark ? 1 : 0,
      },
      categoryChipText: { color: colors.textSecondary },
      templatePreview: {
        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      },
      templateName: { color: colors.text },
      templateCategory: { color: colors.textSecondary },
      detailsTitle: { color: colors.text },
      detailsDescription: { color: colors.textSecondary },
    }),
    [colors, isDark],
  );

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const selectedResumeLabel = useMemo(() => {
    const option = resumeOptions.find((o) => o.id === selectedResumeId);
    return option?.label || 'Select a resume';
  }, [resumeOptions, selectedResumeId]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleSelectTemplate = useCallback(
    (templateId: string) => {
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
    },
    [navigation],
  );

  const handleUseTemplate = useCallback(() => {
    if (selectedTemplate) {
      (navigation as any).navigate('ResumeBuilder', {
        templateId: selectedTemplate,
        resumeId: selectedResumeId,
        resumeType,
      });
    }
  }, [navigation, selectedTemplate, selectedResumeId, resumeType]);

  const handlePreview = useCallback(() => {
    if (selectedTemplate) {
      setPreviewVisible(true);
    }
  }, [selectedTemplate]);

  const handleResumeSelect = useCallback(
    (option: ResumeOption) => {
      setSelectedResumeId(option.id);
      setResumeType(option.type);
      setResumeSelectorOpen(false);
    },
    [],
  );

  // Export state
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = useCallback(async () => {
    if (!selectedTemplate || resumeContent === PLACEHOLDER_RESUME) {
      Alert.alert('No Content', 'Please select a resume to export.');
      return;
    }
    const tmpl = templates.find((t) => t.id === selectedTemplate);
    if (!tmpl) return;

    setExporting(true);
    try {
      if (!Print) Print = await import('expo-print');
      const html = buildResumeHtml(resumeContent, tmpl);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      // Move to a friendlier filename
      const safeName = (resumeContent.name || 'Resume').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${safeName}_${tmpl.name}_Resume.pdf`;
      const dest = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.moveAsync({ from: uri, to: dest });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(dest, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save Resume PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Saved', `PDF saved to app files:\n${filename}`);
      }
    } catch (err: any) {
      console.error('[Templates] PDF export error:', err);
      Alert.alert('Export Failed', err.message || 'Could not generate PDF.');
    } finally {
      setExporting(false);
    }
  }, [selectedTemplate, resumeContent]);

  const handleSaveToDevice = useCallback(async () => {
    if (!selectedTemplate || resumeContent === PLACEHOLDER_RESUME) {
      Alert.alert('No Content', 'Please select a resume to save.');
      return;
    }
    const tmpl = templates.find((t) => t.id === selectedTemplate);
    if (!tmpl) return;

    setExporting(true);
    try {
      if (!Print) Print = await import('expo-print');
      const html = buildResumeHtml(resumeContent, tmpl);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      const safeName = (resumeContent.name || 'Resume').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${safeName}_${tmpl.name}_Resume.pdf`;
      const dest = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.moveAsync({ from: uri, to: dest });

      // Open the native share sheet so user can "Save to Files" or send anywhere
      await Sharing.shareAsync(dest, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save Resume',
        UTI: 'com.adobe.pdf',
      });
    } catch (err: any) {
      console.error('[Templates] Save error:', err);
      Alert.alert('Save Failed', err.message || 'Could not save file.');
    } finally {
      setExporting(false);
    }
  }, [selectedTemplate, resumeContent]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
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
              Upload a resume first to preview with your real content
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
            accessibilityRole="button"
            accessibilityLabel="Select resume to preview"
            accessibilityHint="Opens a list of your resumes"
          >
            <View style={styles.resumeSelectorInner}>
              {loadingContent ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ marginRight: SPACING.xs }} />
              ) : (
                <FileText size={18} color={colors.textSecondary} />
              )}
              <View style={styles.resumeSelectorTextContainer}>
                <Text style={[styles.resumeSelectorLabel, { color: colors.textTertiary }]}>
                  {resumeType === 'tailored' ? 'Tailored Resume' : 'Base Resume'}
                  {loadingContent ? ' — loading preview…' : ''}
                </Text>
                <Text
                  style={[styles.resumeSelectorValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {selectedResumeLabel}
                </Text>
              </View>
            </View>
            <ChevronDown size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        {/* Dropdown */}
        {resumeSelectorOpen && resumeOptions.length > 0 && (
          <GlassCard style={styles.resumeDropdown} padding={4}>
            {resumeOptions.map((option) => (
              <TouchableOpacity
                key={`${option.type}-${option.id}`}
                style={[
                  styles.resumeDropdownItem,
                  selectedResumeId === option.id && {
                    backgroundColor: ALPHA_COLORS.primary.bg,
                  },
                ]}
                onPress={() => handleResumeSelect(option)}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedResumeId === option.id }}
                accessibilityLabel={option.label}
              >
                <Text style={[styles.resumeDropdownType, { color: colors.textTertiary }]}>
                  {option.type === 'tailored' ? 'TAILORED' : 'BASE'}
                </Text>
                <Text
                  style={[styles.resumeDropdownLabel, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {option.label}
                </Text>
                {selectedResumeId === option.id && (
                  <Check size={16} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </GlassCard>
        )}

        {/* ATS Info Banner */}
        <View
          style={[
            styles.atsBanner,
            {
              backgroundColor: isDark
                ? 'rgba(59,130,246,0.08)'
                : 'rgba(59,130,246,0.05)',
            },
          ]}
        >
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
              accessibilityRole="button"
              accessibilityState={{ selected: selectedCategory === category }}
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
                  accessibilityRole="button"
                  accessibilityLabel={`${template.name} template`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <GlassCard
                    style={[
                      styles.templateCardInner,
                      isSelected && styles.templateCardSelected,
                    ]}
                  >
                    <View style={[styles.templatePreview, ds.templatePreview]}>
                      <TemplatePreviewRenderer
                        template={template}
                        content={resumeContent}
                        loading={loadingContent && resumeOptions.length > 0}
                      />
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
                        {template.isPremium && <Crown size={14} color="#EAB308" />}
                      </View>
                      <View style={styles.templateInfoRow}>
                        <Text style={[styles.templateCategory, ds.templateCategory]}>
                          {template.category}
                        </Text>
                        <View
                          style={[
                            styles.atsBadge,
                            { backgroundColor: getAtsColor(template.atsScore) + '20' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.atsBadgeText,
                              { color: getAtsColor(template.atsScore) },
                            ]}
                          >
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
          {selectedTemplate &&
            (() => {
              const tmpl = templates.find((t) => t.id === selectedTemplate);
              return tmpl ? (
                <GlassCard style={styles.detailsCard}>
                  <>
                    <View style={styles.detailsTitleRow}>
                      <Text style={[styles.detailsTitle, ds.detailsTitle]}>
                        {tmpl.name}
                      </Text>
                      <View
                        style={[
                          styles.atsScoreBadgeLarge,
                          { backgroundColor: getAtsColor(tmpl.atsScore) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.atsScoreBadgeLargeText,
                            { color: getAtsColor(tmpl.atsScore) },
                          ]}
                        >
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
                        <Text style={styles.detailsButtonTextPrimary}>Use Template</Text>
                      </GlassButton>
                    </View>

                    {/* Export Actions */}
                    <View style={styles.exportActions}>
                      <TouchableOpacity
                        style={[styles.exportButton, { borderColor: colors.border }]}
                        onPress={handleExportPdf}
                        disabled={exporting || resumeContent === PLACEHOLDER_RESUME}
                        accessibilityRole="button"
                        accessibilityLabel="Export as PDF"
                      >
                        {exporting ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <Download size={16} color={COLORS.primary} />
                        )}
                        <Text style={[styles.exportButtonText, { color: colors.text }]}>
                          Export PDF
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.exportButton, { borderColor: colors.border }]}
                        onPress={handleSaveToDevice}
                        disabled={exporting || resumeContent === PLACEHOLDER_RESUME}
                        accessibilityRole="button"
                        accessibilityLabel="Save to Files"
                      >
                        {exporting ? (
                          <ActivityIndicator size="small" color={COLORS.primary} />
                        ) : (
                          <Share2 size={16} color={COLORS.primary} />
                        )}
                        <Text style={[styles.exportButtonText, { color: colors.text }]}>
                          Save to Files
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                </GlassCard>
              ) : null;
            })()}
        </ScrollView>
      </View>

      {/* Full Preview Modal */}
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
                    <View>
                      <Text style={[styles.previewTitle, { color: colors.text }]}>
                        {templates.find((t) => t.id === selectedTemplate)?.name}
                      </Text>
                      {!loadingContent && resumeContent.name !== PLACEHOLDER_RESUME.name && (
                        <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
                          Preview for {resumeContent.name}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => setPreviewVisible(false)}
                      accessibilityRole="button"
                      accessibilityLabel="Close preview"
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView
                    style={styles.previewScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    {(() => {
                      const tmpl = templates.find((t) => t.id === selectedTemplate);
                      return tmpl ? (
                        <TemplatePreviewRenderer
                          template={tmpl}
                          content={resumeContent}
                          large
                          loading={loadingContent}
                        />
                      ) : null;
                    })()}
                  </ScrollView>

                  {/* Modal Export Actions */}
                  <View style={styles.modalExportActions}>
                    <TouchableOpacity
                      style={[styles.modalExportButton, { backgroundColor: COLORS.primary }]}
                      onPress={handleExportPdf}
                      disabled={exporting || resumeContent === PLACEHOLDER_RESUME}
                      accessibilityRole="button"
                      accessibilityLabel="Download PDF"
                    >
                      {exporting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Download size={18} color="#FFF" />
                      )}
                      <Text style={styles.modalExportButtonText}>
                        {exporting ? 'Exporting...' : 'Download PDF'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalExportButton, { backgroundColor: colors.backgroundTertiary, borderWidth: 1, borderColor: colors.border }]}
                      onPress={handleSaveToDevice}
                      disabled={exporting || resumeContent === PLACEHOLDER_RESUME}
                      accessibilityRole="button"
                      accessibilityLabel="Save to Files"
                    >
                      {exporting ? (
                        <ActivityIndicator size="small" color={colors.text} />
                      ) : (
                        <Share2 size={18} color={colors.text} />
                      )}
                      <Text style={[styles.modalExportButtonTextAlt, { color: colors.text }]}>
                        Save to Files
                      </Text>
                    </TouchableOpacity>
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

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    marginTop: 0,
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
  // Modal
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
    maxHeight: '85%',
  },
  previewCard: {
    padding: 20,
    maxHeight: '100%',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  previewTitle: {
    ...TYPOGRAPHY.title3,
  },
  previewSubtitle: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  closeButton: {
    fontSize: 28,
    fontFamily: FONTS.light,
    lineHeight: 32,
  },
  previewScrollView: {
    flexGrow: 0,
  },
  // Resume selector
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
  // Export actions in details card
  exportActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  exportButtonText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  // Export actions in preview modal
  modalExportActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalExportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalExportButtonText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
  modalExportButtonTextAlt: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
});
