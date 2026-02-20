/**
 * Resume Template System Types
 *
 * Defines the structure for resume templates, including layout, styling,
 * and component configuration.
 */

export type TemplateCategory = 'ats-friendly' | 'modern' | 'creative' | 'executive' | 'minimal'

export type LayoutType = 'single-column' | 'two-column' | 'sidebar' | 'modern-split'

export interface TemplateColors {
  primary: string // Main accent color (headings, icons)
  secondary: string // Secondary accent
  text: string // Body text color
  heading: string // Heading text color
  background: string // Background color
  border: string // Border color
  subtle: string // Subtle elements
}

export interface TemplateFonts {
  heading: string // Font family for headings
  body: string // Font family for body text
  accent: string // Optional accent font
  headingSize: {
    name: string // Name size (e.g., '24px', '2rem')
    section: string // Section heading size
    job: string // Job title size
  }
  bodySize: string // Body text size
  lineHeight: string // Line height for body text
}

export interface TemplateSpacing {
  section: string // Gap between sections
  subsection: string // Gap within sections
  line: string // Line spacing
  margin: string // Page margins
  padding: string // Internal padding
}

export interface TemplateLayout {
  type: LayoutType
  columns?: {
    left: string // Width of left column (e.g., '30%')
    right: string // Width of right column
    gap: string // Gap between columns
  }
  sectionOrder: string[] // Order of resume sections
  showIcons: boolean // Show icons next to section headings
  showBorders: boolean // Show section borders
  showDividers: boolean // Show dividers between items
}

export interface TemplateStyle {
  colors: TemplateColors
  fonts: TemplateFonts
  spacing: TemplateSpacing
  borderRadius: string // Border radius for elements
  accentWidth: string // Width of accent bars/lines
  shadowEffect: boolean // Apply subtle shadows
}

export interface ResumeTemplate {
  id: string
  name: string
  category: TemplateCategory
  description: string
  preview: string // Preview image URL or data URI
  layout: TemplateLayout
  style: TemplateStyle
  atsScore: number // How ATS-friendly (1-10)
  isPremium: boolean // Requires pro subscription
  tags: string[] // Searchable tags
  popularityRank: number // For sorting
  createdAt: string
  updatedAt: string
}

export interface TemplateFilter {
  category?: TemplateCategory
  atsMinScore?: number
  isPremium?: boolean
  search?: string
}

/**
 * Template Application Context
 * Contains resume data and selected template for rendering
 */
export interface TemplateContext {
  template: ResumeTemplate
  resumeData: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
    summary: string
    experience: Array<{
      title: string
      company: string
      location: string
      startDate: string
      endDate: string
      current: boolean
      bullets: string[]
    }>
    education: Array<{
      degree: string
      institution: string
      location: string
      year: string
      gpa?: string
    }>
    skills: Array<{
      category: string
      items: string[]
    }>
    certifications?: Array<{
      name: string
      issuer: string
      date: string
    }>
  }
}
