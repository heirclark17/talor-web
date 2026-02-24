/**
 * Resume Preview Component
 *
 * Renders resume data according to template specifications.
 * Each template produces a visually distinctive resume layout.
 */

import React from 'react'
import type { ResumeTemplate } from '../../types/template'

interface ResumeData {
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  location?: string
  summary?: string
  skills?: string[]
  experience?: Array<{
    company?: string
    title?: string
    location?: string
    dates?: string
    bullets?: string[]
    description?: string
  }>
  education?: string
  certifications?: string
}

interface ResumePreviewProps {
  template: ResumeTemplate
  resumeData: ResumeData | null
  scale?: number
}

const PAGE_WIDTH = 8.5 * 96 // 816px
const PAGE_HEIGHT = 11 * 96 // 1056px

const SAMPLE_DATA: ResumeData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '(555) 234-5678',
  linkedin: 'linkedin.com/in/alexjohnson',
  location: 'San Francisco, CA',
  summary:
    'Results-driven professional with 8+ years of experience in project management, strategic planning, and cross-functional team leadership. Proven track record of delivering complex initiatives on time and under budget while driving measurable business outcomes.',
  skills: [
    'Project Management',
    'Strategic Planning',
    'Team Leadership',
    'Agile / Scrum',
    'Budget Management',
    'Stakeholder Relations',
    'Data Analysis',
    'Risk Assessment',
  ],
  experience: [
    {
      company: 'Innovate Corp',
      title: 'Senior Project Manager',
      location: 'San Francisco, CA',
      dates: 'Jan 2021 - Present',
      bullets: [
        'Led cross-functional team of 15 to deliver $4.2M platform migration 3 weeks ahead of schedule',
        'Reduced operational costs by 28% through process optimization and vendor renegotiation',
        'Implemented agile methodology across 4 product teams, improving sprint velocity by 35%',
      ],
    },
    {
      company: 'TechWave Solutions',
      title: 'Project Manager',
      location: 'Austin, TX',
      dates: 'Mar 2018 - Dec 2020',
      bullets: [
        'Managed portfolio of 12 concurrent projects with combined budget of $8.5M',
        'Achieved 97% on-time delivery rate across all managed initiatives',
        'Built and mentored team of 6 project coordinators, with 3 promoted to senior roles',
      ],
    },
    {
      company: 'DataStream Inc',
      title: 'Associate Project Manager',
      location: 'Seattle, WA',
      dates: 'Jun 2016 - Feb 2018',
      bullets: [
        'Coordinated product launch reaching 50K+ users in first quarter',
        'Developed standardized project tracking dashboard used company-wide',
      ],
    },
  ],
  education: 'MBA, Business Administration | Stanford University | 2016\nBS Computer Science | University of Washington | 2014',
  certifications: 'PMP (Project Management Professional) | 2019\nCertified Scrum Master (CSM) | 2020\nAWS Cloud Practitioner | 2022',
}

export default function ResumePreview({ template, resumeData, scale = 1 }: ResumePreviewProps) {
  const { style, layout } = template

  const hasContent =
    resumeData &&
    (resumeData.name ||
      resumeData.summary ||
      (resumeData.skills && resumeData.skills.length > 0) ||
      (resumeData.experience && resumeData.experience.length > 0))
  const data = hasContent ? resumeData : SAMPLE_DATA

  const wrapperStyle: React.CSSProperties = {
    width: `${PAGE_WIDTH * scale}px`,
    height: `${PAGE_HEIGHT * scale}px`,
    overflow: 'hidden',
    borderRadius: scale < 1 ? '4px' : '0',
    boxShadow: scale < 1 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
  }

  const containerBase: React.CSSProperties = {
    width: `${PAGE_WIDTH}px`,
    height: `${PAGE_HEIGHT}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    backgroundColor: style.colors.background,
    fontFamily: style.fonts.body,
    fontSize: style.fonts.bodySize,
    lineHeight: style.spacing.line,
    color: style.colors.text,
    overflow: 'hidden',
    boxSizing: 'border-box',
  }

  // Route to the right renderer
  switch (template.id) {
    case 'modern-sidebar':
      return <SidebarLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} />
    case 'modern-two-column':
    case 'creative-bold':
      return <TwoColumnLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} templateId={template.id} />
    case 'modern-accent':
      return <AccentBarLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} />
    case 'minimal-elegant':
      return <ElegantMinimalLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} />
    case 'executive-classic':
      return <ExecutiveClassicLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} />
    case 'executive-modern':
      return <ExecutiveModernLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} />
    case 'creative-portfolio':
      return <CreativePortfolioLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} />
    default:
      return <SingleColumnLayout data={data} style={style} layout={layout} wrapper={wrapperStyle} container={containerBase} templateId={template.id} />
  }
}

/* ─── Shared types ──────────────────────────────── */
interface LayoutProps {
  data: ResumeData
  style: ResumeTemplate['style']
  layout: ResumeTemplate['layout']
  wrapper: React.CSSProperties
  container: React.CSSProperties
  templateId?: string
}

/* ─── Single Column (classic-professional, clean-minimal, traditional-serif, tech-simple, etc.) ─── */
function SingleColumnLayout({ data, style, layout, wrapper, container, templateId }: LayoutProps) {
  const isTraditional = templateId === 'traditional-serif'
  const isTech = templateId === 'tech-simple'
  const isMinimalLine = templateId === 'minimal-line'
  const isCorporate = templateId === 'corporate-standard'
  const isBalanced = templateId === 'balanced-professional'

  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: style.spacing.margin }}>
        {/* Name header */}
        <div
          style={{
            textAlign: isTraditional || isCorporate ? 'center' : 'left',
            marginBottom: style.spacing.section,
            borderBottom: isTraditional ? `2px solid ${style.colors.primary}` : isCorporate ? `2px solid ${style.colors.border}` : 'none',
            paddingBottom: isTraditional || isCorporate ? '12px' : '0',
          }}
        >
          <div
            style={{
              fontFamily: style.fonts.heading,
              fontSize: style.fonts.headingSize.name,
              fontWeight: isMinimalLine || isTech ? '600' : 'bold',
              color: style.colors.heading,
              letterSpacing: isTraditional ? '2px' : isTech ? '0.5px' : '0',
              textTransform: isTraditional ? 'uppercase' as const : 'none' as const,
              marginBottom: '6px',
            }}
          >
            {data.name}
          </div>
          <div
            style={{
              fontSize: '10px',
              color: style.colors.subtle,
              display: 'flex',
              justifyContent: isTraditional || isCorporate ? 'center' : 'flex-start',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>|</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>|</span>}
            {data.location && <span>{data.location}</span>}
          </div>
          {data.linkedin && (
            <div style={{ fontSize: '9px', color: style.colors.primary, marginTop: '4px', textAlign: isTraditional || isCorporate ? 'center' : 'left' }}>
              {data.linkedin}
            </div>
          )}
        </div>

        {/* Accent line for some templates */}
        {(isMinimalLine || isBalanced) && (
          <div style={{ height: '2px', background: style.colors.primary, marginBottom: style.spacing.section, opacity: 0.6 }} />
        )}

        {/* Summary */}
        {data.summary && (
          <Section title="PROFESSIONAL SUMMARY" style={style} layout={layout} isTech={isTech} isCorporate={isCorporate}>
            <p style={{ margin: 0, lineHeight: '1.5' }}>{data.summary}</p>
          </Section>
        )}

        {/* Skills (before experience for tech) */}
        {isTech && data.skills && data.skills.length > 0 && (
          <Section title="TECHNICAL SKILLS" style={style} layout={layout} isTech>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    padding: '3px 10px',
                    fontSize: '9px',
                    fontFamily: style.fonts.accent,
                    border: `1px solid ${style.colors.primary}40`,
                    borderRadius: '3px',
                    color: style.colors.primary,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <Section title="PROFESSIONAL EXPERIENCE" style={style} layout={layout} isTech={isTech} isCorporate={isCorporate}>
            {data.experience.map((exp, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: style.spacing.subsection,
                  paddingLeft: isCorporate ? '8px' : '0',
                  borderLeft: isCorporate ? `2px solid ${style.colors.border}` : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: style.fonts.heading, fontSize: style.fonts.headingSize.job, fontWeight: '600', color: style.colors.heading }}>
                    {exp.title}
                  </div>
                  <div style={{ fontSize: '9px', color: style.colors.subtle, whiteSpace: 'nowrap' }}>{exp.dates}</div>
                </div>
                <div style={{ fontSize: '10px', color: style.colors.secondary, marginBottom: '4px', fontStyle: isTraditional ? 'italic' : 'normal' }}>
                  {exp.company}
                  {exp.location && ` — ${exp.location}`}
                </div>
                {exp.bullets && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '10px', lineHeight: '1.5' }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: '2px' }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Skills (non-tech) */}
        {!isTech && data.skills && data.skills.length > 0 && (
          <Section title="SKILLS" style={style} layout={layout} isCorporate={isCorporate}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {data.skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    padding: '3px 8px',
                    fontSize: '9px',
                    backgroundColor: `${style.colors.primary}12`,
                    color: style.colors.primary,
                    borderRadius: style.borderRadius || '3px',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {data.education && (
          <Section title="EDUCATION" style={style} layout={layout} isTech={isTech} isCorporate={isCorporate}>
            <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
          </Section>
        )}

        {/* Certifications */}
        {data.certifications && (
          <Section title="CERTIFICATIONS" style={style} layout={layout} isTech={isTech} isCorporate={isCorporate}>
            <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.certifications}</div>
          </Section>
        )}
      </div>
    </div>
  )
}

/* ─── Section heading helper ─── */
function Section({
  title,
  style,
  layout,
  children,
  isTech,
  isCorporate,
}: {
  title: string
  style: ResumeTemplate['style']
  layout: ResumeTemplate['layout']
  children: React.ReactNode
  isTech?: boolean
  isCorporate?: boolean
}) {
  return (
    <div style={{ marginBottom: style.spacing.section }}>
      <div
        style={{
          fontFamily: style.fonts.heading,
          fontSize: style.fonts.headingSize.section,
          fontWeight: 'bold',
          color: style.colors.primary,
          textTransform: 'uppercase' as const,
          letterSpacing: isTech ? '1.5px' : '1px',
          marginBottom: style.spacing.subsection,
          paddingBottom: layout.showDividers || isCorporate ? '4px' : '0',
          borderBottom: layout.showDividers
            ? `1px solid ${style.colors.border}`
            : layout.showBorders
              ? `2px solid ${style.colors.primary}`
              : 'none',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

/* ─── Modern Accent Bar Layout (modern-accent) ─── */
function AccentBarLayout({ data, style, layout, wrapper, container }: LayoutProps) {
  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: '0' }}>
        {/* Colored header band */}
        <div
          style={{
            background: `linear-gradient(135deg, ${style.colors.primary}, ${style.colors.secondary})`,
            padding: '32px 48px 24px',
            color: '#ffffff',
          }}
        >
          <div style={{ fontFamily: style.fonts.heading, fontSize: style.fonts.headingSize.name, fontWeight: 'bold', marginBottom: '8px' }}>
            {data.name}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.9, display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </div>

        <div style={{ padding: '24px 48px' }}>
          {/* Summary */}
          {data.summary && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontFamily: style.fonts.heading,
                  fontSize: style.fonts.headingSize.section,
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  paddingLeft: '12px',
                  borderLeft: `${style.accentWidth} solid ${style.colors.primary}`,
                }}
              >
                PROFESSIONAL SUMMARY
              </div>
              <p style={{ margin: 0, lineHeight: '1.5', fontSize: '10.5px' }}>{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontFamily: style.fonts.heading,
                  fontSize: style.fonts.headingSize.section,
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '12px',
                  paddingLeft: '12px',
                  borderLeft: `${style.accentWidth} solid ${style.colors.primary}`,
                }}
              >
                EXPERIENCE
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: '600', fontSize: style.fonts.headingSize.job, color: style.colors.heading }}>{exp.title}</div>
                    <div style={{ fontSize: '9px', color: style.colors.subtle }}>{exp.dates}</div>
                  </div>
                  <div style={{ fontSize: '10px', color: style.colors.secondary, marginBottom: '4px' }}>
                    {exp.company}
                    {exp.location && ` • ${exp.location}`}
                  </div>
                  {exp.bullets && (
                    <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '10px', lineHeight: '1.5' }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ marginBottom: '2px' }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontFamily: style.fonts.heading,
                  fontSize: style.fonts.headingSize.section,
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  paddingLeft: '12px',
                  borderLeft: `${style.accentWidth} solid ${style.colors.primary}`,
                }}
              >
                SKILLS
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 12px',
                      fontSize: '9px',
                      backgroundColor: `${style.colors.primary}15`,
                      color: style.colors.primary,
                      borderRadius: '20px',
                      fontWeight: '500',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.education && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontFamily: style.fonts.heading,
                  fontSize: style.fonts.headingSize.section,
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '8px',
                  paddingLeft: '12px',
                  borderLeft: `${style.accentWidth} solid ${style.colors.primary}`,
                }}
              >
                EDUCATION
              </div>
              <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Sidebar Layout (modern-sidebar) ─── */
function SidebarLayout({ data, style, layout, wrapper, container }: LayoutProps) {
  const sidebarWidth = layout.columns?.left || '30%'
  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: 0, display: 'flex' }}>
        {/* Colored sidebar */}
        <div
          style={{
            width: sidebarWidth,
            backgroundColor: `${style.colors.primary}0D`,
            borderRight: `3px solid ${style.colors.primary}30`,
            padding: style.spacing.padding,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Name in sidebar */}
          <div
            style={{
              fontFamily: style.fonts.heading,
              fontSize: '22px',
              fontWeight: 'bold',
              color: style.colors.heading,
              lineHeight: '1.2',
              marginBottom: '4px',
            }}
          >
            {data.name}
          </div>

          {/* Contact */}
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: style.colors.primary,
                textTransform: 'uppercase' as const,
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
            >
              Contact
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.8', color: style.colors.text }}>
              {data.email && <div>{data.email}</div>}
              {data.phone && <div>{data.phone}</div>}
              {data.location && <div>{data.location}</div>}
              {data.linkedin && <div style={{ color: style.colors.primary }}>{data.linkedin}</div>}
            </div>
          </div>

          {/* Skills */}
          {data.skills && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}
              >
                Skills
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.skills.map((s, i) => (
                  <div key={i} style={{ fontSize: '9px', padding: '3px 0', borderBottom: `1px solid ${style.colors.primary}15` }}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education in sidebar */}
          {data.education && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}
              >
                Education
              </div>
              <div style={{ fontSize: '9px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: style.spacing.padding }}>
          {data.summary && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: style.colors.primary, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '8px' }}>
                Profile
              </div>
              <p style={{ margin: 0, fontSize: '10.5px', lineHeight: '1.5' }}>{data.summary}</p>
            </div>
          )}

          {data.experience && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: style.colors.primary, textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '12px' }}>
                Experience
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: '600', fontSize: '12px', color: style.colors.heading }}>{exp.title}</div>
                  <div style={{ fontSize: '10px', color: style.colors.secondary }}>
                    {exp.company} • {exp.dates}
                  </div>
                  {exp.bullets && (
                    <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '9.5px', lineHeight: '1.5' }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ marginBottom: '2px' }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Two Column Layout (modern-two-column, creative-bold) ─── */
function TwoColumnLayout({ data, style, layout, wrapper, container, templateId }: LayoutProps) {
  const isCreative = templateId === 'creative-bold'
  const leftWidth = layout.columns?.left || '35%'

  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: 0, display: 'flex' }}>
        {/* Left column */}
        <div
          style={{
            width: leftWidth,
            backgroundColor: isCreative ? `${style.colors.primary}10` : style.colors.background,
            borderRight: isCreative ? 'none' : `1px solid ${style.colors.border}`,
            padding: '32px 20px',
          }}
        >
          <div
            style={{
              fontFamily: style.fonts.heading,
              fontSize: isCreative ? '32px' : '24px',
              fontWeight: 'bold',
              color: style.colors.heading,
              lineHeight: '1.1',
              letterSpacing: isCreative ? '2px' : '0',
              textTransform: isCreative ? 'uppercase' as const : 'none' as const,
              marginBottom: '16px',
            }}
          >
            {data.name}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: style.colors.primary,
                textTransform: 'uppercase' as const,
                letterSpacing: '1px',
                marginBottom: '6px',
                paddingBottom: '4px',
                borderBottom: `2px solid ${style.colors.primary}`,
              }}
            >
              Contact
            </div>
            <div style={{ fontSize: '9px', lineHeight: '1.8' }}>
              {data.email && <div>{data.email}</div>}
              {data.phone && <div>{data.phone}</div>}
              {data.location && <div>{data.location}</div>}
            </div>
          </div>

          {data.skills && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '6px',
                  paddingBottom: '4px',
                  borderBottom: `2px solid ${style.colors.primary}`,
                }}
              >
                Skills
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.skills.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: '9px',
                      padding: isCreative ? '4px 8px' : '2px 0',
                      backgroundColor: isCreative ? `${style.colors.primary}15` : 'transparent',
                      borderRadius: isCreative ? style.borderRadius : '0',
                      color: style.colors.text,
                    }}
                  >
                    {isCreative ? s : `• ${s}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.education && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '1px',
                  marginBottom: '6px',
                  paddingBottom: '4px',
                  borderBottom: `2px solid ${style.colors.primary}`,
                }}
              >
                Education
              </div>
              <div style={{ fontSize: '9px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
            </div>
          )}
        </div>

        {/* Right column - main content */}
        <div style={{ flex: 1, padding: '32px 24px' }}>
          {data.summary && (
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontFamily: style.fonts.heading,
                  fontSize: style.fonts.headingSize.section,
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: isCreative ? '2px' : '1px',
                  marginBottom: '8px',
                }}
              >
                Profile
              </div>
              <p style={{ margin: 0, fontSize: '10.5px', lineHeight: '1.5' }}>{data.summary}</p>
            </div>
          )}

          {data.experience && (
            <div>
              <div
                style={{
                  fontFamily: style.fonts.heading,
                  fontSize: style.fonts.headingSize.section,
                  fontWeight: 'bold',
                  color: style.colors.primary,
                  textTransform: 'uppercase' as const,
                  letterSpacing: isCreative ? '2px' : '1px',
                  marginBottom: '12px',
                }}
              >
                Experience
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px' }}>
                  <div style={{ fontWeight: '600', fontSize: style.fonts.headingSize.job, color: style.colors.heading }}>{exp.title}</div>
                  <div style={{ fontSize: '10px', color: style.colors.secondary }}>
                    {exp.company} • {exp.dates}
                  </div>
                  {exp.bullets && (
                    <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '9.5px', lineHeight: '1.5' }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi} style={{ marginBottom: '2px' }}>
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Minimal Elegant ─── */
function ElegantMinimalLayout({ data, style, wrapper, container }: LayoutProps) {
  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: style.spacing.margin }}>
        {/* Ultra-minimal header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              fontFamily: style.fonts.heading,
              fontSize: style.fonts.headingSize.name,
              fontWeight: '300',
              color: style.colors.heading,
              letterSpacing: '6px',
              textTransform: 'uppercase' as const,
              marginBottom: '12px',
            }}
          >
            {data.name}
          </div>
          <div style={{ fontSize: '9px', color: style.colors.subtle, letterSpacing: '2px' }}>
            {[data.email, data.phone, data.location].filter(Boolean).join('  •  ')}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: '32px' }}>
            <p style={{ margin: 0, textAlign: 'center', fontSize: '10.5px', lineHeight: '1.7', color: style.colors.secondary, fontStyle: 'italic' }}>
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience && (
          <div style={{ marginBottom: '28px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: '400',
                color: style.colors.heading,
                textTransform: 'uppercase' as const,
                letterSpacing: '4px',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              Experience
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '18px' }}>
                <div style={{ fontWeight: '500', fontSize: '12px', color: style.colors.heading }}>{exp.title}</div>
                <div style={{ fontSize: '10px', color: style.colors.subtle, marginBottom: '4px' }}>
                  {exp.company} — {exp.dates}
                </div>
                {exp.bullets && (
                  <ul style={{ margin: '6px 0 0', paddingLeft: '16px', fontSize: '10px', lineHeight: '1.6', color: style.colors.text }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: '2px' }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills as inline */}
        {data.skills && (
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div
              style={{ fontSize: '10px', fontWeight: '400', color: style.colors.heading, textTransform: 'uppercase' as const, letterSpacing: '4px', marginBottom: '12px' }}
            >
              Skills
            </div>
            <div style={{ fontSize: '10px', color: style.colors.subtle, lineHeight: '1.8' }}>{data.skills.join('  /  ')}</div>
          </div>
        )}

        {data.education && (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{ fontSize: '10px', fontWeight: '400', color: style.colors.heading, textTransform: 'uppercase' as const, letterSpacing: '4px', marginBottom: '12px' }}
            >
              Education
            </div>
            <div style={{ fontSize: '10px', whiteSpace: 'pre-line', color: style.colors.subtle, lineHeight: '1.6' }}>{data.education}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Executive Classic ─── */
function ExecutiveClassicLayout({ data, style, wrapper, container }: LayoutProps) {
  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: style.spacing.margin }}>
        {/* Distinguished header with top/bottom borders */}
        <div
          style={{
            textAlign: 'center',
            borderTop: `3px solid ${style.colors.primary}`,
            borderBottom: `3px solid ${style.colors.primary}`,
            padding: '16px 0',
            marginBottom: style.spacing.section,
          }}
        >
          <div style={{ fontFamily: style.fonts.heading, fontSize: style.fonts.headingSize.name, fontWeight: 'bold', color: style.colors.primary, letterSpacing: '2px' }}>
            {data.name}
          </div>
          <div style={{ fontSize: '10px', color: style.colors.subtle, marginTop: '6px' }}>
            {[data.email, data.phone, data.location].filter(Boolean).join('  |  ')}
          </div>
        </div>

        {/* Executive Summary */}
        {data.summary && (
          <ExecSection title="EXECUTIVE SUMMARY" style={style}>
            <p style={{ margin: 0, lineHeight: '1.6', fontSize: '10.5px' }}>{data.summary}</p>
          </ExecSection>
        )}

        {/* Professional Experience */}
        {data.experience && (
          <ExecSection title="PROFESSIONAL EXPERIENCE" style={style}>
            {data.experience.map((exp, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '14px',
                  padding: '10px',
                  border: `1px solid ${style.colors.border}`,
                  borderLeft: `3px solid ${style.colors.primary}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: style.fonts.heading, fontWeight: '600', fontSize: '12px', color: style.colors.heading }}>{exp.title}</div>
                  <div style={{ fontSize: '9px', color: style.colors.subtle }}>{exp.dates}</div>
                </div>
                <div style={{ fontSize: '10px', color: style.colors.secondary, fontStyle: 'italic', marginBottom: '4px' }}>
                  {exp.company}
                  {exp.location && `, ${exp.location}`}
                </div>
                {exp.bullets && (
                  <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '10px', lineHeight: '1.5' }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: '2px' }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </ExecSection>
        )}

        {data.education && (
          <ExecSection title="EDUCATION" style={style}>
            <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
          </ExecSection>
        )}

        {data.certifications && (
          <ExecSection title="CERTIFICATIONS" style={style}>
            <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.certifications}</div>
          </ExecSection>
        )}
      </div>
    </div>
  )
}

function ExecSection({ title, style, children }: { title: string; style: ResumeTemplate['style']; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: style.spacing.section }}>
      <div
        style={{
          fontFamily: style.fonts.heading,
          fontSize: style.fonts.headingSize.section,
          fontWeight: 'bold',
          color: style.colors.primary,
          textTransform: 'uppercase' as const,
          letterSpacing: '2px',
          marginBottom: '10px',
          paddingBottom: '4px',
          borderBottom: `2px solid ${style.colors.primary}`,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

/* ─── Executive Modern ─── */
function ExecutiveModernLayout({ data, style, wrapper, container }: LayoutProps) {
  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: style.spacing.margin }}>
        {/* Name with serif distinction */}
        <div style={{ marginBottom: style.spacing.section }}>
          <div
            style={{
              fontFamily: style.fonts.heading,
              fontSize: style.fonts.headingSize.name,
              fontWeight: 'bold',
              color: style.colors.heading,
              marginBottom: '4px',
            }}
          >
            {data.name}
          </div>
          <div style={{ height: '2px', width: '60px', backgroundColor: style.colors.primary, marginBottom: '8px' }} />
          <div style={{ fontSize: '10px', color: style.colors.subtle }}>
            {[data.email, data.phone, data.location].filter(Boolean).join('  •  ')}
          </div>
        </div>

        {data.summary && (
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                fontFamily: style.fonts.heading,
                fontSize: style.fonts.headingSize.section,
                fontWeight: 'bold',
                color: style.colors.heading,
                marginBottom: '8px',
                borderBottom: `1px solid ${style.colors.border}`,
                paddingBottom: '4px',
              }}
            >
              PROFESSIONAL SUMMARY
            </div>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{data.summary}</p>
          </div>
        )}

        {data.experience && (
          <div style={{ marginBottom: '22px' }}>
            <div
              style={{
                fontFamily: style.fonts.heading,
                fontSize: style.fonts.headingSize.section,
                fontWeight: 'bold',
                color: style.colors.heading,
                marginBottom: '12px',
                borderBottom: `1px solid ${style.colors.border}`,
                paddingBottom: '4px',
              }}
            >
              CAREER HISTORY
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '14px', paddingBottom: '10px', borderBottom: i < data.experience!.length - 1 ? `1px dashed ${style.colors.border}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: style.fonts.heading, fontWeight: '600', fontSize: '12px' }}>{exp.title}</div>
                  <div style={{ fontSize: '9px', color: style.colors.subtle, fontStyle: 'italic' }}>{exp.dates}</div>
                </div>
                <div style={{ fontSize: '10px', color: style.colors.secondary, marginBottom: '4px' }}>
                  {exp.company}
                  {exp.location && ` | ${exp.location}`}
                </div>
                {exp.bullets && (
                  <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '10px', lineHeight: '1.5' }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ marginBottom: '2px' }}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '24px' }}>
          {data.skills && (
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: style.fonts.heading, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: `1px solid ${style.colors.border}`, paddingBottom: '4px' }}>
                CORE COMPETENCIES
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontSize: '9px' }}>
                {data.skills.map((s, i) => (
                  <span key={i} style={{ padding: '2px 6px', backgroundColor: `${style.colors.primary}08`, borderRadius: '2px' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.education && (
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: style.fonts.heading, fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', borderBottom: `1px solid ${style.colors.border}`, paddingBottom: '4px' }}>
                EDUCATION
              </div>
              <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Creative Portfolio ─── */
function CreativePortfolioLayout({ data, style, wrapper, container }: LayoutProps) {
  return (
    <div style={wrapper}>
      <div style={{ ...container, padding: '0' }}>
        {/* Large colored header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${style.colors.primary}, ${style.colors.secondary})`,
            padding: '40px 48px 28px',
            color: '#fff',
            borderRadius: `0 0 ${style.borderRadius} ${style.borderRadius}`,
          }}
        >
          <div style={{ fontFamily: style.fonts.heading, fontSize: style.fonts.headingSize.name, fontWeight: 'bold', marginBottom: '4px' }}>{data.name}</div>
          <div style={{ fontSize: '11px', opacity: 0.85 }}>
            {[data.email, data.phone, data.location].filter(Boolean).join('  •  ')}
          </div>
          {data.summary && <p style={{ margin: '12px 0 0', fontSize: '10px', lineHeight: '1.5', opacity: 0.9 }}>{data.summary}</p>}
        </div>

        <div style={{ padding: '24px 48px' }}>
          {/* Skills as pills */}
          {data.skills && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.skills.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '5px 14px',
                      fontSize: '9px',
                      fontWeight: '600',
                      backgroundColor: `${style.colors.primary}15`,
                      color: style.colors.primary,
                      borderRadius: '20px',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {data.experience && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontFamily: style.fonts.heading, fontWeight: 'bold', color: style.colors.primary, marginBottom: '12px' }}>
                Experience
              </div>
              {data.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: `3px solid ${style.colors.primary}30` }}>
                  <div style={{ fontWeight: '600', fontSize: '12px', color: style.colors.heading }}>{exp.title}</div>
                  <div style={{ fontSize: '10px', color: style.colors.secondary }}>
                    {exp.company} • {exp.dates}
                  </div>
                  {exp.bullets && (
                    <ul style={{ margin: '4px 0 0', paddingLeft: '16px', fontSize: '9.5px', lineHeight: '1.5' }}>
                      {exp.bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {data.education && (
            <div>
              <div style={{ fontSize: '14px', fontFamily: style.fonts.heading, fontWeight: 'bold', color: style.colors.primary, marginBottom: '8px' }}>
                Education
              </div>
              <div style={{ fontSize: '10px', whiteSpace: 'pre-line', lineHeight: '1.5' }}>{data.education}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
