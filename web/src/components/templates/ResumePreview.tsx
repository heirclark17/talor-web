/**
 * Resume Preview Component
 *
 * Renders resume data according to template specifications
 * Used for both thumbnail previews and full-size modal previews
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

const PAGE_WIDTH = 8.5 * 96 // 816px (8.5 inches at 96 DPI)
const PAGE_HEIGHT = 11 * 96 // 1056px (11 inches at 96 DPI)

export default function ResumePreview({ template, resumeData, scale = 1 }: ResumePreviewProps) {
  const { style, layout } = template

  // Use sample data if no resume data provided
  const data = resumeData || {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    location: 'New York, NY',
    summary: 'Experienced professional with expertise in project management and strategic planning.',
    skills: ['Leadership', 'Project Management', 'Strategic Planning', 'Team Building'],
    experience: [
      {
        company: 'Tech Company',
        title: 'Senior Manager',
        location: 'New York, NY',
        dates: '2020 - Present',
        bullets: ['Led team of 10 professionals', 'Managed $2M budget'],
      },
      {
        company: 'Previous Company',
        title: 'Manager',
        location: 'Boston, MA',
        dates: '2018 - 2020',
        bullets: ['Coordinated cross-functional teams', 'Improved efficiency by 25%'],
      },
    ],
    education: 'MBA, Business School | 2018\nBS Computer Science, University | 2015',
    certifications: 'PMP Certified | 2019',
  }

  // Wrapper takes the scaled dimensions so it occupies correct layout space
  const wrapperStyle: React.CSSProperties = {
    width: `${PAGE_WIDTH * scale}px`,
    height: `${PAGE_HEIGHT * scale}px`,
    overflow: 'hidden',
    borderRadius: scale < 1 ? '4px' : '0',
    boxShadow: scale < 1 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
  }

  // Inner page renders at full size then scales visually
  const containerStyle: React.CSSProperties = {
    width: `${PAGE_WIDTH}px`,
    height: `${PAGE_HEIGHT}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    backgroundColor: style.colors.background,
    fontFamily: style.fonts.body,
    fontSize: style.fonts.bodySize,
    lineHeight: style.spacing.line,
    color: style.colors.text,
    padding: style.spacing.margin,
    overflow: 'hidden',
  }

  const headingStyle: React.CSSProperties = {
    fontFamily: style.fonts.heading,
    color: style.colors.heading,
    marginBottom: style.spacing.subsection,
  }

  const nameStyle: React.CSSProperties = {
    ...headingStyle,
    fontSize: style.fonts.headingSize.name,
    fontWeight: 'bold',
    marginBottom: '8px',
  }

  const sectionHeadingStyle: React.CSSProperties = {
    ...headingStyle,
    fontSize: style.fonts.headingSize.section,
    fontWeight: 'bold',
    marginTop: style.spacing.section,
    marginBottom: style.spacing.subsection,
    color: style.colors.primary,
    borderBottom: layout.showDividers ? `1px solid ${style.colors.border}` : 'none',
    paddingBottom: layout.showDividers ? '4px' : '0',
  }

  const jobTitleStyle: React.CSSProperties = {
    fontSize: style.fonts.headingSize.job,
    fontWeight: '600',
    color: style.colors.heading,
  }

  const renderSingleColumn = () => (
    <div style={wrapperStyle}>
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: style.spacing.section }}>
        <div style={nameStyle}>{data.name}</div>
        <div style={{ fontSize: '10px', color: style.colors.subtle }}>
          {data.email} {data.phone && `• ${data.phone}`} {data.location && `• ${data.location}`}
        </div>
        {data.linkedin && (
          <div style={{ fontSize: '9px', color: style.colors.primary, marginTop: '4px' }}>
            {data.linkedin}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <div style={sectionHeadingStyle}>PROFESSIONAL SUMMARY</div>
          <p style={{ margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div>
          <div style={sectionHeadingStyle}>EXPERIENCE</div>
          {data.experience.slice(0, 2).map((exp, idx) => (
            <div key={idx} style={{ marginBottom: style.spacing.subsection }}>
              <div style={jobTitleStyle}>{exp.title}</div>
              <div style={{ fontSize: '10px', color: style.colors.secondary, marginBottom: '4px' }}>
                {exp.company} {exp.location && `• ${exp.location}`} {exp.dates && `• ${exp.dates}`}
              </div>
              {exp.bullets && (
                <ul style={{ margin: '4px 0', paddingLeft: '20px', fontSize: '10px' }}>
                  {exp.bullets.slice(0, 2).map((bullet, bIdx) => (
                    <li key={bIdx} style={{ marginBottom: '2px' }}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <div style={sectionHeadingStyle}>SKILLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '9px' }}>
            {data.skills.slice(0, 8).map((skill, idx) => (
              <span
                key={idx}
                style={{
                  padding: '4px 8px',
                  backgroundColor: `${style.colors.primary}15`,
                  color: style.colors.primary,
                  borderRadius: '4px',
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && (
        <div>
          <div style={sectionHeadingStyle}>EDUCATION</div>
          <div style={{ fontSize: '10px', whiteSpace: 'pre-line' }}>{data.education}</div>
        </div>
      )}
    </div>
    </div>
  )

  const renderTwoColumn = () => (
    <div style={wrapperStyle}>
    <div style={containerStyle}>
      <div style={{ display: 'flex', gap: layout.columns?.gap || '20px' }}>
        {/* Left Column */}
        <div style={{ width: layout.columns?.left || '35%', paddingRight: '10px' }}>
          <div style={nameStyle}>{data.name}</div>

          {/* Contact */}
          <div style={{ ...sectionHeadingStyle, marginTop: '0' }}>CONTACT</div>
          <div style={{ fontSize: '9px', color: style.colors.text }}>
            <div style={{ marginBottom: '4px' }}>{data.email}</div>
            {data.phone && <div style={{ marginBottom: '4px' }}>{data.phone}</div>}
            {data.location && <div style={{ marginBottom: '4px' }}>{data.location}</div>}
          </div>

          {/* Skills */}
          {data.skills && (
            <>
              <div style={sectionHeadingStyle}>SKILLS</div>
              <div style={{ fontSize: '9px' }}>
                {data.skills.slice(0, 6).map((skill, idx) => (
                  <div key={idx} style={{ marginBottom: '4px', color: style.colors.text }}>
                    • {skill}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1 }}>
          {/* Summary */}
          {data.summary && (
            <div>
              <div style={{ ...sectionHeadingStyle, marginTop: '0' }}>PROFILE</div>
              <p style={{ margin: 0, fontSize: '10px' }}>{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience && (
            <>
              <div style={sectionHeadingStyle}>EXPERIENCE</div>
              {data.experience.slice(0, 2).map((exp, idx) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  <div style={jobTitleStyle}>{exp.title}</div>
                  <div style={{ fontSize: '9px', color: style.colors.secondary }}>
                    {exp.company} • {exp.dates}
                  </div>
                  {exp.bullets && (
                    <ul style={{ margin: '4px 0', paddingLeft: '16px', fontSize: '9px' }}>
                      {exp.bullets.slice(0, 2).map((bullet, bIdx) => (
                        <li key={bIdx}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
    </div>
  )

  // Render based on layout type
  if (layout.type === 'two-column' || layout.type === 'sidebar') {
    return renderTwoColumn()
  }

  return renderSingleColumn()
}
