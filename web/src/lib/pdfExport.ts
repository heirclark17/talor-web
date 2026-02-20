/**
 * PDF Export Service
 *
 * Generates PDF exports of resumes using jsPDF
 * Supports multiple templates and customization options
 */

import { jsPDF } from 'jspdf'
import type { ResumeTemplate } from '../types/template'

export interface ResumeData {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
  }
  summary?: string
  experience: {
    title: string
    company: string
    location: string
    startDate: string
    endDate: string
    bullets: string[]
  }[]
  education: {
    degree: string
    school: string
    year: string
    gpa?: string
  }[]
  skills: string[]
  certifications?: {
    name: string
    issuer: string
    date: string
  }[]
}

export interface PDFExportOptions {
  template: ResumeTemplate
  fileName?: string
  pageSize?: 'letter' | 'a4'
  margins?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

/**
 * Generate PDF from resume data
 */
export async function generateResumePDF(
  resumeData: ResumeData,
  options: PDFExportOptions
): Promise<Blob> {
  const {
    template,
    pageSize = 'letter',
    margins = { top: 0.75, right: 0.75, bottom: 0.75, left: 0.75 },
  } = options

  // Create jsPDF instance
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: pageSize,
  })

  // Get page dimensions
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const contentWidth = pageWidth - margins.left - margins.right

  let y = margins.top

  // Helper: Add text with line wrapping
  const addText = (
    text: string,
    fontSize: number,
    fontStyle: 'normal' | 'bold' = 'normal',
    color: string = template.colors.text,
    align: 'left' | 'center' | 'right' = 'left'
  ) => {
    pdf.setFontSize(fontSize)
    pdf.setFont('helvetica', fontStyle)
    const rgb = hexToRgb(color)
    pdf.setTextColor(rgb.r, rgb.g, rgb.b)

    const lines = pdf.splitTextToSize(text, contentWidth)
    for (const line of lines) {
      if (y + fontSize / 72 > pageHeight - margins.bottom) {
        pdf.addPage()
        y = margins.top
      }

      let x = margins.left
      if (align === 'center') {
        x = pageWidth / 2
      } else if (align === 'right') {
        x = pageWidth - margins.right
      }

      pdf.text(line, x, y, { align })
      y += fontSize / 72 + 0.05
    }
  }

  // Helper: Add line separator
  const addLine = (color: string = template.colors.accent, thickness: number = 0.02) => {
    const rgb = hexToRgb(color)
    pdf.setDrawColor(rgb.r, rgb.g, rgb.b)
    pdf.setLineWidth(thickness)
    pdf.line(margins.left, y, pageWidth - margins.right, y)
    y += 0.1
  }

  // Helper: Add spacing
  const addSpace = (inches: number) => {
    y += inches
  }

  // HEADER: Name and contact info
  addText(resumeData.personalInfo.name, 24, 'bold', template.colors.primary, 'center')
  addSpace(0.1)

  const contactLine = [
    resumeData.personalInfo.email,
    resumeData.personalInfo.phone,
    resumeData.personalInfo.location,
  ]
    .filter(Boolean)
    .join(' • ')
  addText(contactLine, 10, 'normal', template.colors.secondary, 'center')

  if (resumeData.personalInfo.linkedin || resumeData.personalInfo.website) {
    const linksLine = [resumeData.personalInfo.linkedin, resumeData.personalInfo.website]
      .filter(Boolean)
      .join(' • ')
    addText(linksLine, 10, 'normal', template.colors.accent, 'center')
  }

  addSpace(0.2)
  addLine()

  // PROFESSIONAL SUMMARY
  if (resumeData.summary) {
    addText('PROFESSIONAL SUMMARY', 12, 'bold', template.colors.accent)
    addSpace(0.1)
    addText(resumeData.summary, 10, 'normal', template.colors.text)
    addSpace(0.2)
    addLine()
  }

  // EXPERIENCE
  if (resumeData.experience.length > 0) {
    addText('PROFESSIONAL EXPERIENCE', 12, 'bold', template.colors.accent)
    addSpace(0.1)

    for (const exp of resumeData.experience) {
      addText(exp.title, 11, 'bold', template.colors.primary)
      addText(
        `${exp.company} | ${exp.location}`,
        10,
        'normal',
        template.colors.secondary
      )
      addText(
        `${exp.startDate} - ${exp.endDate}`,
        9,
        'normal',
        template.colors.secondary
      )
      addSpace(0.05)

      for (const bullet of exp.bullets) {
        const bulletY = y
        addText('•', 10, 'normal', template.colors.text)
        y = bulletY
        pdf.setFontSize(10)
        const lines = pdf.splitTextToSize(bullet, contentWidth - 0.3)
        for (const line of lines) {
          if (y + 10 / 72 > pageHeight - margins.bottom) {
            pdf.addPage()
            y = margins.top
          }
          pdf.text(line, margins.left + 0.3, y)
          y += 10 / 72 + 0.05
        }
      }
      addSpace(0.15)
    }
    addLine()
  }

  // EDUCATION
  if (resumeData.education.length > 0) {
    addText('EDUCATION', 12, 'bold', template.colors.accent)
    addSpace(0.1)

    for (const edu of resumeData.education) {
      addText(edu.degree, 11, 'bold', template.colors.primary)
      addText(
        `${edu.school}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
        10,
        'normal',
        template.colors.secondary
      )
      addText(edu.year, 9, 'normal', template.colors.secondary)
      addSpace(0.1)
    }
    addLine()
  }

  // SKILLS
  if (resumeData.skills.length > 0) {
    addText('CORE COMPETENCIES', 12, 'bold', template.colors.accent)
    addSpace(0.1)
    const skillsText = resumeData.skills.join(' • ')
    addText(skillsText, 10, 'normal', template.colors.text)
    addSpace(0.1)

    if (resumeData.certifications && resumeData.certifications.length > 0) {
      addLine()
    }
  }

  // CERTIFICATIONS
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    addText('CERTIFICATIONS & TRAINING', 12, 'bold', template.colors.accent)
    addSpace(0.1)

    for (const cert of resumeData.certifications) {
      addText(
        `${cert.name} | ${cert.issuer} | ${cert.date}`,
        10,
        'normal',
        template.colors.text
      )
    }
  }

  // Return PDF as blob
  return pdf.output('blob')
}

/**
 * Download PDF file
 */
export function downloadPDF(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

/**
 * Generate PDF and download
 */
export async function exportResumeToPDF(
  resumeData: ResumeData,
  options: PDFExportOptions
): Promise<void> {
  const blob = await generateResumePDF(resumeData, options)
  const fileName = options.fileName || `Resume_${resumeData.personalInfo.name.replace(/\s+/g, '_')}.pdf`
  downloadPDF(blob, fileName)
}
