/**
 * Generate Template Preview Images
 *
 * Uses Playwright to render each resume template as a high-quality PNG screenshot.
 * Saves to public/template-previews/ for static serving and optionally uploads to Supabase Storage.
 *
 * Usage:
 *   npx tsx scripts/generate-template-previews.ts
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// --- Template Definitions (mirrored from src/data/templates.ts) ---

interface TemplateStyle {
  colors: {
    primary: string
    secondary: string
    text: string
    heading: string
    background: string
    border: string
    subtle: string
  }
  fonts: {
    heading: string
    body: string
    accent: string
    headingSize: { name: string; section: string; job: string }
    bodySize: string
    lineHeight: string
  }
  spacing: {
    section: string
    subsection: string
    line: string
    margin: string
    padding: string
  }
  borderRadius: string
  accentWidth: string
  shadowEffect: boolean
}

interface TemplateLayout {
  type: string
  columns?: { left: string; right: string; gap: string }
  sectionOrder: string[]
  showIcons: boolean
  showBorders: boolean
  showDividers: boolean
}

interface Template {
  id: string
  name: string
  category: string
  style: TemplateStyle
  layout: TemplateLayout
}

// --- Sample Resume Data ---

const sampleResume = {
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@email.com',
  phone: '(415) 555-0189',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/sarahmitchell',
  summary:
    'Senior Product Manager with 8+ years of experience driving cross-functional product development at scale. Expertise in data-driven decision making, agile methodologies, and user-centered design. Led products serving 10M+ users with a track record of 40% revenue growth and 25% improvement in user retention.',
  skills: [
    'Product Strategy',
    'Agile / Scrum',
    'Data Analytics',
    'User Research',
    'A/B Testing',
    'SQL & Python',
    'Stakeholder Management',
    'Roadmap Planning',
  ],
  experience: [
    {
      company: 'TechForward Inc.',
      title: 'Senior Product Manager',
      location: 'San Francisco, CA',
      dates: 'Jan 2022 - Present',
      bullets: [
        'Led product strategy for core platform serving 10M+ monthly active users, driving 40% year-over-year revenue growth through data-informed feature prioritization',
        'Managed cross-functional team of 15 engineers, 3 designers, and 2 data scientists to deliver quarterly product milestones on time and within budget',
        'Implemented experimentation framework running 50+ A/B tests quarterly, improving conversion rates by 18% and reducing churn by 12%',
      ],
    },
    {
      company: 'DataStream Solutions',
      title: 'Product Manager',
      location: 'New York, NY',
      dates: 'Mar 2019 - Dec 2021',
      bullets: [
        'Owned end-to-end product lifecycle for B2B analytics dashboard used by 500+ enterprise clients, growing ARR from $8M to $15M',
        'Conducted 200+ customer interviews to identify pain points, leading to redesigned onboarding flow that improved activation by 35%',
      ],
    },
  ],
  education: 'MBA, Stanford Graduate School of Business | 2019\nBS Computer Science, UC Berkeley | 2016',
  certifications: 'Certified Scrum Product Owner (CSPO) | 2021\nGoogle Analytics Professional Certificate | 2020',
}

// --- Google Fonts used by templates ---

const GOOGLE_FONTS = [
  'Inter:wght@400;600;700',
  'Poppins:wght@400;600;700',
  'Open+Sans:wght@400;600;700',
  'Montserrat:wght@400;600;700',
  'Lato:wght@400;700',
  'Raleway:wght@400;600;700',
  'Roboto:wght@400;500;700',
  'Playfair+Display:wght@400;700',
  'Source+Sans+3:wght@400;600;700',
  'Bebas+Neue',
  'Nunito:wght@400;600;700',
  'Abril+Fatface',
  'Work+Sans:wght@400;500;600',
  'Fira+Sans:wght@400;500;600',
  'Fira+Code:wght@400;500',
  'Merriweather:wght@400;700',
]

const FONT_LINK = `https://fonts.googleapis.com/css2?${GOOGLE_FONTS.map((f) => `family=${f}`).join('&')}&display=swap`

// --- Template definitions (all 15) ---

const templates: Template[] = [
  {
    id: 'classic-professional',
    name: 'Classic Professional',
    category: 'ats-friendly',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'],
      showIcons: false,
      showBorders: false,
      showDividers: true,
    },
    style: {
      colors: { primary: '#2c3e50', secondary: '#34495e', text: '#2c3e50', heading: '#1a252f', background: '#ffffff', border: '#e1e8ed', subtle: '#95a5a6' },
      fonts: { heading: 'Georgia, serif', body: 'Arial, sans-serif', accent: 'Arial, sans-serif', headingSize: { name: '28px', section: '14px', job: '12px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '20px', subsection: '12px', line: '1.6', margin: '0.75in', padding: '0' },
      borderRadius: '0', accentWidth: '0', shadowEffect: false,
    },
  },
  {
    id: 'clean-minimal',
    name: 'Clean Minimal',
    category: 'ats-friendly',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications'],
      showIcons: false,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#0066cc', secondary: '#4a90e2', text: '#333333', heading: '#000000', background: '#ffffff', border: '#dddddd', subtle: '#666666' },
      fonts: { heading: 'Helvetica, Arial, sans-serif', body: 'Helvetica, Arial, sans-serif', accent: 'Helvetica, Arial, sans-serif', headingSize: { name: '32px', section: '16px', job: '13px' }, bodySize: '11px', lineHeight: '1.5' },
      spacing: { section: '24px', subsection: '10px', line: '1.5', margin: '0.75in', padding: '0' },
      borderRadius: '0', accentWidth: '2px', shadowEffect: false,
    },
  },
  {
    id: 'traditional-serif',
    name: 'Traditional Serif',
    category: 'ats-friendly',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'education', 'certifications', 'skills'],
      showIcons: false,
      showBorders: true,
      showDividers: false,
    },
    style: {
      colors: { primary: '#1a1a1a', secondary: '#4a4a4a', text: '#333333', heading: '#000000', background: '#ffffff', border: '#cccccc', subtle: '#777777' },
      fonts: { heading: 'Garamond, Times New Roman, serif', body: 'Times New Roman, serif', accent: 'Garamond, serif', headingSize: { name: '26px', section: '14px', job: '12px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '18px', subsection: '12px', line: '1.6', margin: '1in', padding: '0' },
      borderRadius: '0', accentWidth: '1px', shadowEffect: false,
    },
  },
  {
    id: 'modern-two-column',
    name: 'Modern Two-Column',
    category: 'modern',
    layout: {
      type: 'two-column',
      columns: { left: '35%', right: '65%', gap: '20px' },
      sectionOrder: ['contact', 'skills', 'education', 'certifications'],
      showIcons: true,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#3b82f6', secondary: '#60a5fa', text: '#374151', heading: '#1f2937', background: '#ffffff', border: '#e5e7eb', subtle: '#9ca3af' },
      fonts: { heading: 'Inter, Helvetica, sans-serif', body: 'Inter, Helvetica, sans-serif', accent: 'Inter, sans-serif', headingSize: { name: '30px', section: '15px', job: '13px' }, bodySize: '10.5px', lineHeight: '1.6' },
      spacing: { section: '22px', subsection: '14px', line: '1.6', margin: '0.65in', padding: '16px' },
      borderRadius: '4px', accentWidth: '3px', shadowEffect: false,
    },
  },
  {
    id: 'modern-accent',
    name: 'Modern Accent',
    category: 'modern',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
      showIcons: true,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#6366f1', secondary: '#818cf8', text: '#1e293b', heading: '#0f172a', background: '#ffffff', border: '#e2e8f0', subtle: '#64748b' },
      fonts: { heading: 'Poppins, Helvetica, sans-serif', body: 'Open Sans, Arial, sans-serif', accent: 'Poppins, sans-serif', headingSize: { name: '34px', section: '16px', job: '14px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '24px', subsection: '12px', line: '1.6', margin: '0.7in', padding: '0' },
      borderRadius: '0', accentWidth: '4px', shadowEffect: false,
    },
  },
  {
    id: 'modern-sidebar',
    name: 'Modern Sidebar',
    category: 'modern',
    layout: {
      type: 'sidebar',
      columns: { left: '30%', right: '70%', gap: '0' },
      sectionOrder: ['contact', 'skills', 'certifications'],
      showIcons: true,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#10b981', secondary: '#34d399', text: '#111827', heading: '#000000', background: '#ffffff', border: '#d1d5db', subtle: '#6b7280' },
      fonts: { heading: 'Montserrat, Helvetica, sans-serif', body: 'Lato, Arial, sans-serif', accent: 'Montserrat, sans-serif', headingSize: { name: '28px', section: '14px', job: '13px' }, bodySize: '10.5px', lineHeight: '1.6' },
      spacing: { section: '20px', subsection: '12px', line: '1.6', margin: '0', padding: '24px' },
      borderRadius: '0', accentWidth: '0', shadowEffect: true,
    },
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegant',
    category: 'minimal',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'education', 'skills'],
      showIcons: false,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#000000', secondary: '#404040', text: '#2d2d2d', heading: '#000000', background: '#ffffff', border: '#f0f0f0', subtle: '#808080' },
      fonts: { heading: 'Futura, Helvetica, sans-serif', body: 'Avenir, Arial, sans-serif', accent: 'Futura, sans-serif', headingSize: { name: '36px', section: '12px', job: '13px' }, bodySize: '11px', lineHeight: '1.7' },
      spacing: { section: '32px', subsection: '14px', line: '1.7', margin: '1in', padding: '0' },
      borderRadius: '0', accentWidth: '0', shadowEffect: false,
    },
  },
  {
    id: 'minimal-line',
    name: 'Minimal Line',
    category: 'minimal',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'skills', 'experience', 'education'],
      showIcons: false,
      showBorders: false,
      showDividers: true,
    },
    style: {
      colors: { primary: '#2563eb', secondary: '#3b82f6', text: '#1f2937', heading: '#111827', background: '#ffffff', border: '#d1d5db', subtle: '#9ca3af' },
      fonts: { heading: 'Raleway, Helvetica, sans-serif', body: 'Roboto, Arial, sans-serif', accent: 'Raleway, sans-serif', headingSize: { name: '32px', section: '14px', job: '12px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '26px', subsection: '12px', line: '1.6', margin: '0.75in', padding: '0' },
      borderRadius: '0', accentWidth: '1px', shadowEffect: false,
    },
  },
  {
    id: 'executive-classic',
    name: 'Executive Classic',
    category: 'executive',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'education', 'certifications'],
      showIcons: false,
      showBorders: true,
      showDividers: false,
    },
    style: {
      colors: { primary: '#1e3a8a', secondary: '#1e40af', text: '#1f2937', heading: '#111827', background: '#ffffff', border: '#9ca3af', subtle: '#6b7280' },
      fonts: { heading: 'Didot, Georgia, serif', body: 'Baskerville, Times New Roman, serif', accent: 'Didot, serif', headingSize: { name: '30px', section: '15px', job: '13px' }, bodySize: '11.5px', lineHeight: '1.7' },
      spacing: { section: '24px', subsection: '14px', line: '1.7', margin: '1in', padding: '0' },
      borderRadius: '0', accentWidth: '2px', shadowEffect: false,
    },
  },
  {
    id: 'executive-modern',
    name: 'Executive Modern',
    category: 'executive',
    layout: {
      type: 'single-column', // modern-split renders as single-column
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'],
      showIcons: false,
      showBorders: false,
      showDividers: true,
    },
    style: {
      colors: { primary: '#0f172a', secondary: '#1e293b', text: '#334155', heading: '#0f172a', background: '#ffffff', border: '#cbd5e1', subtle: '#64748b' },
      fonts: { heading: 'Playfair Display, Georgia, serif', body: 'Source Sans 3, Arial, sans-serif', accent: 'Playfair Display, serif', headingSize: { name: '34px', section: '16px', job: '13px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '26px', subsection: '14px', line: '1.6', margin: '0.85in', padding: '0' },
      borderRadius: '0', accentWidth: '1px', shadowEffect: false,
    },
  },
  {
    id: 'creative-bold',
    name: 'Creative Bold',
    category: 'creative',
    layout: {
      type: 'two-column',
      columns: { left: '40%', right: '60%', gap: '24px' },
      sectionOrder: ['contact', 'skills', 'education'],
      showIcons: true,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#f59e0b', secondary: '#fbbf24', text: '#1f2937', heading: '#111827', background: '#ffffff', border: '#e5e7eb', subtle: '#6b7280' },
      fonts: { heading: 'Bebas Neue, Impact, sans-serif', body: 'Nunito, Arial, sans-serif', accent: 'Bebas Neue, sans-serif', headingSize: { name: '42px', section: '18px', job: '14px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '24px', subsection: '12px', line: '1.6', margin: '0.6in', padding: '16px' },
      borderRadius: '8px', accentWidth: '4px', shadowEffect: true,
    },
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    category: 'creative',
    layout: {
      type: 'single-column', // modern-split renders as single-column
      sectionOrder: ['summary', 'experience', 'skills', 'education'],
      showIcons: true,
      showBorders: false,
      showDividers: false,
    },
    style: {
      colors: { primary: '#ec4899', secondary: '#f472b6', text: '#374151', heading: '#1f2937', background: '#ffffff', border: '#e5e7eb', subtle: '#9ca3af' },
      fonts: { heading: 'Abril Fatface, Georgia, serif', body: 'Work Sans, Arial, sans-serif', accent: 'Abril Fatface, serif', headingSize: { name: '38px', section: '16px', job: '13px' }, bodySize: '10.5px', lineHeight: '1.6' },
      spacing: { section: '28px', subsection: '14px', line: '1.6', margin: '0.65in', padding: '20px' },
      borderRadius: '12px', accentWidth: '3px', shadowEffect: true,
    },
  },
  {
    id: 'tech-simple',
    name: 'Tech Simple',
    category: 'modern',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'skills', 'experience', 'education', 'certifications'],
      showIcons: false,
      showBorders: false,
      showDividers: true,
    },
    style: {
      colors: { primary: '#059669', secondary: '#10b981', text: '#1f2937', heading: '#111827', background: '#ffffff', border: '#e5e7eb', subtle: '#6b7280' },
      fonts: { heading: 'Fira Sans, Helvetica, sans-serif', body: 'Fira Sans, Arial, sans-serif', accent: 'Fira Code, monospace', headingSize: { name: '30px', section: '14px', job: '12px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '22px', subsection: '12px', line: '1.6', margin: '0.75in', padding: '0' },
      borderRadius: '0', accentWidth: '2px', shadowEffect: false,
    },
  },
  {
    id: 'balanced-professional',
    name: 'Balanced Professional',
    category: 'ats-friendly',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'skills', 'education', 'certifications'],
      showIcons: false,
      showBorders: false,
      showDividers: true,
    },
    style: {
      colors: { primary: '#1e40af', secondary: '#3b82f6', text: '#374151', heading: '#1f2937', background: '#ffffff', border: '#d1d5db', subtle: '#6b7280' },
      fonts: { heading: 'Merriweather, Georgia, serif', body: 'Open Sans, Arial, sans-serif', accent: 'Merriweather, serif', headingSize: { name: '28px', section: '14px', job: '12px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '20px', subsection: '12px', line: '1.6', margin: '0.75in', padding: '0' },
      borderRadius: '0', accentWidth: '1px', shadowEffect: false,
    },
  },
  {
    id: 'corporate-standard',
    name: 'Corporate Standard',
    category: 'ats-friendly',
    layout: {
      type: 'single-column',
      sectionOrder: ['summary', 'experience', 'education', 'skills', 'certifications'],
      showIcons: false,
      showBorders: true,
      showDividers: false,
    },
    style: {
      colors: { primary: '#374151', secondary: '#4b5563', text: '#1f2937', heading: '#111827', background: '#ffffff', border: '#9ca3af', subtle: '#6b7280' },
      fonts: { heading: 'Calibri, Arial, sans-serif', body: 'Calibri, Arial, sans-serif', accent: 'Calibri, sans-serif', headingSize: { name: '26px', section: '13px', job: '12px' }, bodySize: '11px', lineHeight: '1.6' },
      spacing: { section: '18px', subsection: '12px', line: '1.6', margin: '0.75in', padding: '0' },
      borderRadius: '0', accentWidth: '1px', shadowEffect: false,
    },
  },
]

// --- HTML Generators ---

function generateSingleColumnHTML(t: Template): string {
  const { style, layout } = t
  const { colors, fonts, spacing } = style
  const d = sampleResume
  const dividerCSS = layout.showDividers
    ? `border-bottom: 1px solid ${colors.border}; padding-bottom: 4px;`
    : ''
  const borderCSS = layout.showBorders ? `border: 1px solid ${colors.border}; padding: 12px; border-radius: 4px;` : ''

  // Build sections in order
  const sectionHTML: Record<string, string> = {
    summary: `
      <div>
        <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.section}; font-weight: bold; color: ${colors.primary}; margin-top: ${spacing.section}; margin-bottom: ${spacing.subsection}; ${dividerCSS} text-transform: uppercase; letter-spacing: 1px;">Professional Summary</div>
        <p style="margin: 0; line-height: ${spacing.line};">${d.summary}</p>
      </div>`,
    experience: `
      <div>
        <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.section}; font-weight: bold; color: ${colors.primary}; margin-top: ${spacing.section}; margin-bottom: ${spacing.subsection}; ${dividerCSS} text-transform: uppercase; letter-spacing: 1px;">Experience</div>
        ${d.experience
          .map(
            (exp) => `
          <div style="margin-bottom: ${spacing.subsection}; ${borderCSS}">
            <div style="font-size: ${fonts.headingSize.job}; font-weight: 600; color: ${colors.heading};">${exp.title}</div>
            <div style="font-size: 10px; color: ${colors.secondary}; margin-bottom: 4px;">${exp.company} &bull; ${exp.location} &bull; ${exp.dates}</div>
            <ul style="margin: 4px 0; padding-left: 20px; font-size: 10px;">
              ${exp.bullets.map((b) => `<li style="margin-bottom: 3px;">${b}</li>`).join('')}
            </ul>
          </div>`
          )
          .join('')}
      </div>`,
    skills: `
      <div>
        <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.section}; font-weight: bold; color: ${colors.primary}; margin-top: ${spacing.section}; margin-bottom: ${spacing.subsection}; ${dividerCSS} text-transform: uppercase; letter-spacing: 1px;">Skills</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 9px;">
          ${d.skills
            .map(
              (s) =>
                `<span style="padding: 4px 10px; background: ${colors.primary}15; color: ${colors.primary}; border-radius: 4px;">${s}</span>`
            )
            .join('')}
        </div>
      </div>`,
    education: `
      <div>
        <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.section}; font-weight: bold; color: ${colors.primary}; margin-top: ${spacing.section}; margin-bottom: ${spacing.subsection}; ${dividerCSS} text-transform: uppercase; letter-spacing: 1px;">Education</div>
        <div style="font-size: 10px; white-space: pre-line;">${d.education}</div>
      </div>`,
    certifications: `
      <div>
        <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.section}; font-weight: bold; color: ${colors.primary}; margin-top: ${spacing.section}; margin-bottom: ${spacing.subsection}; ${dividerCSS} text-transform: uppercase; letter-spacing: 1px;">Certifications</div>
        <div style="font-size: 10px; white-space: pre-line;">${d.certifications}</div>
      </div>`,
  }

  const sectionsOrdered = layout.sectionOrder
    .filter((s) => sectionHTML[s])
    .map((s) => sectionHTML[s])
    .join('')

  return `
    <div style="margin-bottom: ${spacing.section};">
      <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.name}; font-weight: bold; color: ${colors.heading}; margin-bottom: 8px;">${d.name}</div>
      <div style="font-size: 10px; color: ${colors.subtle};">
        ${d.email} &bull; ${d.phone} &bull; ${d.location}
      </div>
      <div style="font-size: 9px; color: ${colors.primary}; margin-top: 4px;">${d.linkedin}</div>
    </div>
    ${sectionsOrdered}
  `
}

function generateTwoColumnHTML(t: Template): string {
  const { style, layout } = t
  const { colors, fonts, spacing } = style
  const d = sampleResume
  const leftWidth = layout.columns?.left || '35%'
  const gap = layout.columns?.gap || '20px'
  const isSidebar = layout.type === 'sidebar'
  const dividerCSS = layout.showDividers
    ? `border-bottom: 1px solid ${colors.border}; padding-bottom: 4px;`
    : ''

  const sectionHeading = (text: string, mt = spacing.section) =>
    `<div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.section}; font-weight: bold; color: ${colors.primary}; margin-top: ${mt}; margin-bottom: ${spacing.subsection}; ${dividerCSS} text-transform: uppercase; letter-spacing: 1px;">${text}</div>`

  const leftBg = isSidebar ? `background: ${colors.primary}10; padding: 24px;` : `padding-right: 10px;`

  return `
    <div style="display: flex; gap: ${gap}; height: 100%;">
      <!-- Left Column -->
      <div style="width: ${leftWidth}; ${leftBg}">
        <div style="font-family: ${fonts.heading}; font-size: ${fonts.headingSize.name}; font-weight: bold; color: ${colors.heading}; margin-bottom: 16px;">${d.name}</div>
        ${sectionHeading('Contact', '0')}
        <div style="font-size: 9px; color: ${colors.text};">
          <div style="margin-bottom: 4px;">${d.email}</div>
          <div style="margin-bottom: 4px;">${d.phone}</div>
          <div style="margin-bottom: 4px;">${d.location}</div>
          <div style="margin-bottom: 4px; color: ${colors.primary};">${d.linkedin}</div>
        </div>
        ${sectionHeading('Skills')}
        <div style="font-size: 9px;">
          ${d.skills.map((s) => `<div style="margin-bottom: 5px; color: ${colors.text};">&bull; ${s}</div>`).join('')}
        </div>
        ${sectionHeading('Education')}
        <div style="font-size: 9px; white-space: pre-line; color: ${colors.text};">${d.education}</div>
        ${sectionHeading('Certifications')}
        <div style="font-size: 9px; white-space: pre-line; color: ${colors.text};">${d.certifications}</div>
      </div>
      <!-- Right Column -->
      <div style="flex: 1;">
        ${sectionHeading('Profile', '0')}
        <p style="margin: 0; font-size: 10px;">${d.summary}</p>
        ${sectionHeading('Experience')}
        ${d.experience
          .map(
            (exp) => `
          <div style="margin-bottom: 12px;">
            <div style="font-size: ${fonts.headingSize.job}; font-weight: 600; color: ${colors.heading};">${exp.title}</div>
            <div style="font-size: 9px; color: ${colors.secondary};">${exp.company} &bull; ${exp.dates}</div>
            <ul style="margin: 4px 0; padding-left: 16px; font-size: 9px;">
              ${exp.bullets.map((b) => `<li style="margin-bottom: 2px;">${b}</li>`).join('')}
            </ul>
          </div>`
          )
          .join('')}
      </div>
    </div>
  `
}

function generateTemplateHTML(t: Template): string {
  const { style, layout } = t
  const { colors, fonts, spacing } = style
  const isTwoCol = layout.type === 'two-column' || layout.type === 'sidebar'
  const content = isTwoCol ? generateTwoColumnHTML(t) : generateSingleColumnHTML(t)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link href="${FONT_LINK}" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div style="
    width: 816px;
    height: 1056px;
    background-color: ${colors.background};
    font-family: ${fonts.body};
    font-size: ${fonts.bodySize};
    line-height: ${spacing.line};
    color: ${colors.text};
    padding: ${spacing.margin};
    overflow: hidden;
  ">
    ${content}
  </div>
</body>
</html>`
}

// --- Main Script ---

async function main() {
  const outputDir = path.resolve(__dirname, '..', 'public', 'template-previews')
  fs.mkdirSync(outputDir, { recursive: true })

  console.log(`Generating ${templates.length} template previews...`)
  console.log(`Output directory: ${outputDir}`)

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 816, height: 1056 },
    deviceScaleFactor: 2, // 2x retina quality
  })

  const results: { id: string; name: string; file: string; url?: string }[] = []

  for (const template of templates) {
    const page = await context.newPage()
    const html = generateTemplateHTML(template)

    await page.setContent(html)
    // Wait for fonts to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const filePath = path.join(outputDir, `${template.id}.png`)
    await page.screenshot({
      path: filePath,
      type: 'png',
      clip: { x: 0, y: 0, width: 816, height: 1056 },
    })

    console.log(`  [OK] ${template.name} -> ${template.id}.png`)
    results.push({ id: template.id, name: template.name, file: filePath })
    await page.close()
  }

  await browser.close()
  console.log(`\nGenerated ${results.length} preview images locally.`)

  // --- Upload to Supabase Storage ---
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yokyxytijxmkdbrezzzb.supabase.co'
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3l4eXRpanhta2RicmV6enpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NDc1MzEsImV4cCI6MjA4NzEyMzUzMX0.hw86oSvNHFkYu39Fpx3vqUko9tAWOs074ljDmk2qIJg'

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const BUCKET = 'template-previews'

  // Try to create bucket (may fail if already exists or no permission)
  try {
    const { error: bucketError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      allowedMimeTypes: ['image/png', 'image/webp', 'image/jpeg'],
      fileSizeLimit: 10485760, // 10MB
    })
    if (bucketError && !bucketError.message.includes('already exists')) {
      console.log(`\nBucket creation note: ${bucketError.message}`)
      console.log('You may need to create the bucket manually in Supabase Dashboard.')
    } else {
      console.log(`\nBucket "${BUCKET}" ready.`)
    }
  } catch (err) {
    console.log('\nCould not create bucket - may need manual creation.')
  }

  // Upload each image
  let uploadCount = 0
  for (const result of results) {
    try {
      const fileBuffer = fs.readFileSync(result.file)
      const { error } = await supabase.storage.from(BUCKET).upload(`${result.id}.png`, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
        cacheControl: '31536000', // 1 year cache
      })

      if (error) {
        console.log(`  [UPLOAD FAIL] ${result.name}: ${error.message}`)
      } else {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${result.id}.png`)
        result.url = data.publicUrl
        uploadCount++
        console.log(`  [UPLOADED] ${result.name} -> ${result.url}`)
      }
    } catch (err: any) {
      console.log(`  [UPLOAD ERROR] ${result.name}: ${err.message}`)
    }
  }

  console.log(`\nUploaded ${uploadCount}/${results.length} images to Supabase Storage.`)

  // Output the URL map for templates.ts
  console.log('\n--- Template Preview URLs ---')
  console.log('Add these to src/data/templates.ts or use dynamic URLs:\n')
  console.log(`const SUPABASE_URL = '${SUPABASE_URL}'`)
  console.log(`const getPreviewUrl = (id: string) => \`\${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/\${id}.png\`\n`)

  for (const result of results) {
    const url = result.url || `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${result.id}.png`
    console.log(`  '${result.id}': '${url}'`)
  }

  // Also write a JSON mapping file
  const mapFile = path.join(outputDir, 'url-map.json')
  const urlMap = Object.fromEntries(
    results.map((r) => [
      r.id,
      r.url || `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${r.id}.png`,
    ])
  )
  fs.writeFileSync(mapFile, JSON.stringify(urlMap, null, 2))
  console.log(`\nURL map saved to: ${mapFile}`)
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
