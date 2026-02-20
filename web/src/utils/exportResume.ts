/**
 * Resume Export Utilities
 *
 * Handles exporting resumes to PDF and Word formats
 * with template styling preserved
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx'
import { saveAs } from 'file-saver'

interface ExportOptions {
  format: 'pdf' | 'docx'
  filename?: string
  templateName?: string
}

/**
 * Export resume as PDF
 * Captures the rendered HTML and converts to PDF
 */
export async function exportToPDF(element: HTMLElement, filename: string = 'resume.pdf') {
  try {
    // Capture the element as canvas with high quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    // Calculate dimensions (8.5 x 11 inches at 72 DPI)
    const imgWidth = 210 // A4 width in mm
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    let heightLeft = imgHeight
    let position = 0

    // Add image to PDF
    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight,
      undefined,
      'FAST'
    )

    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        'FAST'
      )
      heightLeft -= pageHeight
    }

    // Save the PDF
    pdf.save(filename)
    return true
  } catch (error) {
    console.error('PDF export error:', error)
    throw new Error('Failed to export PDF')
  }
}

/**
 * Export resume as Word document
 * Creates a .docx file with proper formatting
 */
export async function exportToWord(
  resumeData: any,
  template: any,
  filename: string = 'resume.docx'
) {
  try {
    const { name, email, phone, location, summary, skills, experience, education } = resumeData
    const { style } = template

    // Create document sections
    const sections: any[] = []

    // Header - Name and Contact
    sections.push(
      new Paragraph({
        text: name || 'Your Name',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    )

    const contactInfo = [email, phone, location].filter(Boolean).join(' • ')
    if (contactInfo) {
      sections.push(
        new Paragraph({
          text: contactInfo,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      )
    }

    // Professional Summary
    if (summary) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      )
      sections.push(
        new Paragraph({
          text: summary,
          spacing: { after: 300 },
        })
      )
    }

    // Experience
    if (experience && experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EXPERIENCE',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      )

      experience.forEach((exp: any) => {
        // Job title
        sections.push(
          new Paragraph({
            text: exp.title || 'Position',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 50 },
          })
        )

        // Company, location, dates
        const expMeta = [exp.company, exp.location, exp.dates].filter(Boolean).join(' • ')
        sections.push(
          new Paragraph({
            text: expMeta,
            spacing: { after: 100 },
          })
        )

        // Bullets
        if (exp.bullets && exp.bullets.length > 0) {
          exp.bullets.forEach((bullet: string) => {
            sections.push(
              new Paragraph({
                text: bullet,
                bullet: { level: 0 },
                spacing: { after: 50 },
              })
            )
          })
        }

        sections.push(
          new Paragraph({
            text: '',
            spacing: { after: 150 },
          })
        )
      })
    }

    // Skills
    if (skills && skills.length > 0) {
      sections.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      )
      sections.push(
        new Paragraph({
          text: skills.join(' • '),
          spacing: { after: 300 },
        })
      )
    }

    // Education
    if (education) {
      sections.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
        })
      )
      sections.push(
        new Paragraph({
          text: education,
          spacing: { after: 200 },
        })
      )
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    })

    // Generate and save
    const blob = await Packer.toBlob(doc)
    saveAs(blob, filename)
    return true
  } catch (error) {
    console.error('Word export error:', error)
    throw new Error('Failed to export Word document')
  }
}

/**
 * Main export function that handles both formats
 */
export async function exportResume(
  element: HTMLElement,
  resumeData: any,
  template: any,
  options: ExportOptions
) {
  const { format, filename, templateName } = options
  const defaultFilename = `resume_${templateName || 'template'}_${Date.now()}`

  try {
    if (format === 'pdf') {
      const pdfFilename = filename || `${defaultFilename}.pdf`
      await exportToPDF(element, pdfFilename)
    } else if (format === 'docx') {
      const docxFilename = filename || `${defaultFilename}.docx`
      await exportToWord(resumeData, template, docxFilename)
    }
    return true
  } catch (error) {
    console.error('Export error:', error)
    throw error
  }
}
