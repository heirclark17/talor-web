/**
 * Export Buttons Component
 *
 * Beautiful, refined export buttons for PDF and Word formats
 * Matches the editorial design aesthetic
 */

import React, { useState, useRef } from 'react'
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react'
import { exportResume } from '../../utils/exportResume'
import type { ResumeTemplate } from '../../types/template'

interface ExportButtonsProps {
  template: ResumeTemplate
  resumeData: any
  previewElementId?: string // ID of element to export for PDF
  variant?: 'inline' | 'stacked'
}

export default function ExportButtons({
  template,
  resumeData,
  previewElementId = 'resume-preview-export',
  variant = 'inline',
}: ExportButtonsProps) {
  const [exportingPDF, setExportingPDF] = useState(false)
  const [exportingWord, setExportingWord] = useState(false)
  const [pdfSuccess, setPdfSuccess] = useState(false)
  const [wordSuccess, setWordSuccess] = useState(false)

  const handleExportPDF = async () => {
    if (!resumeData) return

    setExportingPDF(true)
    setPdfSuccess(false)

    try {
      const element = document.getElementById(previewElementId)
      if (!element) {
        throw new Error('Preview element not found')
      }

      await exportResume(element, resumeData, template, {
        format: 'pdf',
        templateName: template.name.toLowerCase().replace(/\s+/g, '_'),
      })

      setPdfSuccess(true)
      setTimeout(() => setPdfSuccess(false), 3000)
    } catch (error) {
      console.error('PDF export failed:', error)
      alert('Failed to export PDF. Please try again.')
    } finally {
      setExportingPDF(false)
    }
  }

  const handleExportWord = async () => {
    if (!resumeData) return

    setExportingWord(true)
    setWordSuccess(false)

    try {
      await exportResume(null as any, resumeData, template, {
        format: 'docx',
        templateName: template.name.toLowerCase().replace(/\s+/g, '_'),
      })

      setWordSuccess(true)
      setTimeout(() => setWordSuccess(false), 3000)
    } catch (error) {
      console.error('Word export failed:', error)
      alert('Failed to export Word document. Please try again.')
    } finally {
      setExportingWord(false)
    }
  }

  return (
    <div className="export-buttons">
      <style>{`
        .export-buttons {
          display: flex;
          gap: 0.75rem;
          ${variant === 'stacked' ? 'flex-direction: column;' : ''}
        }

        .export-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          outline: none;
          overflow: hidden;
          ${variant === 'stacked' ? 'width: 100%;' : ''}
        }

        .export-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .export-btn:hover::before {
          opacity: 1;
        }

        .export-btn:active {
          transform: scale(0.98);
        }

        .export-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .export-btn-pdf {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
        }

        .export-btn-pdf::before {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        }

        .export-btn-pdf:hover {
          box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
          transform: translateY(-2px);
        }

        .export-btn-word {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }

        .export-btn-word::before {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }

        .export-btn-word:hover {
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .export-btn.success {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }

        .export-icon {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 1;
        }

        .export-text {
          position: relative;
          z-index: 1;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .success-icon {
          animation: successPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes successPop {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>

      {/* PDF Export Button */}
      <button
        className={`export-btn export-btn-pdf ${pdfSuccess ? 'success' : ''}`}
        onClick={handleExportPDF}
        disabled={exportingPDF || exportingWord || !resumeData}
      >
        {exportingPDF ? (
          <>
            <Loader2 className="export-icon spinner" />
            <span className="export-text">Exporting PDF...</span>
          </>
        ) : pdfSuccess ? (
          <>
            <CheckCircle className="export-icon success-icon" />
            <span className="export-text">PDF Downloaded!</span>
          </>
        ) : (
          <>
            <FileText className="export-icon" />
            <span className="export-text">Export as PDF</span>
          </>
        )}
      </button>

      {/* Word Export Button */}
      <button
        className={`export-btn export-btn-word ${wordSuccess ? 'success' : ''}`}
        onClick={handleExportWord}
        disabled={exportingPDF || exportingWord || !resumeData}
      >
        {exportingWord ? (
          <>
            <Loader2 className="export-icon spinner" />
            <span className="export-text">Exporting Word...</span>
          </>
        ) : wordSuccess ? (
          <>
            <CheckCircle className="export-icon success-icon" />
            <span className="export-text">Word Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="export-icon" />
            <span className="export-text">Export as Word</span>
          </>
        )}
      </button>
    </div>
  )
}
