/**
 * Resume Selector Component
 *
 * Refined editorial interface for selecting and uploading resumes
 * Features custom dropdown, drag-and-drop upload, and live metadata display
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, ChevronDown, FileText, Briefcase, Award, Calendar, Check } from 'lucide-react'
import { useResumeStore } from '../../stores/resumeStore'
import type { Resume } from '../../stores/resumeStore'
import { useNavigate } from 'react-router-dom'
import { formatLocalDateTime } from '../../utils/dateUtils'

interface ResumeSelectorProps {
  selectedResumeId?: string | null
  onResumeSelect: (resumeId: string | null) => void
}

export default function ResumeSelector({ selectedResumeId, onResumeSelect }: ResumeSelectorProps) {
  const navigate = useNavigate()
  const { resumes, fetchResumes } = useResumeStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Always fetch fresh resume data on mount (stale localStorage may have incomplete fields)
  useEffect(() => {
    fetchResumes()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  // Get all available resumes - store uses numeric IDs
  const availableResumes = resumes || []

  // Derive the active resume: prefer the one matching selectedResumeId, otherwise the most recent
  const latestResume = availableResumes.length > 0 ? availableResumes[0] : null
  const selectedResume = selectedResumeId !== null && selectedResumeId !== undefined
    ? availableResumes.find(r => String(r.id) === String(selectedResumeId)) || latestResume
    : latestResume

  const handleResumeSelect = (resumeId: number) => {
    onResumeSelect(String(resumeId))
    setIsDropdownOpen(false)
  }

  const handleUploadClick = () => {
    navigate('/upload')
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    // Navigate to upload page with file
    navigate('/upload')
  }, [navigate])

  const getResumeName = (resume: Resume) => {
    // The flat Resume shape from resumeStore uses top-level name/email fields
    return resume.name || resume.filename || 'Untitled Resume'
  }

  return (
    <div className="resume-selector">
      <style>{`
        .resume-selector {
          margin-bottom: 3rem;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .selector-header {
          text-align: center;
          margin-bottom: 2.5rem;
          animation: fadeInUp 0.7s ease-out 0.1s both;
        }

        .selector-title {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .selector-subtitle {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 400;
        }

        .selection-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        @media (max-width: 768px) {
          .selection-grid {
            grid-template-columns: 1fr;
          }
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-trigger {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .dropdown-trigger::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .dropdown-trigger:hover::before {
          opacity: 1;
        }

        .dropdown-trigger:hover {
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
        }

        .dropdown-label {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .dropdown-value {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        .dropdown-value-text {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
        }

        .dropdown-icon {
          transition: transform 0.3s ease;
        }

        .dropdown-icon.open {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          left: 0;
          right: 0;
          background: rgba(15, 15, 25, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 0.5rem;
          z-index: 1000;
          max-height: 320px;
          overflow-y: auto;
          animation: dropdownSlide 0.3s ease-out;
          pointer-events: auto;
        }

        @keyframes dropdownSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-item {
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dropdown-item:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .dropdown-item.selected {
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .dropdown-item-content {
          flex: 1;
        }

        .dropdown-item-name {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: #fff;
          margin-bottom: 0.25rem;
        }

        .dropdown-item-meta {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .upload-zone {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 16px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          text-align: center;
        }

        .upload-zone::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .upload-zone:hover::before,
        .upload-zone.dragging::before {
          opacity: 1;
        }

        .upload-zone:hover {
          border-color: rgba(251, 191, 36, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(251, 191, 36, 0.15);
        }

        .upload-zone.dragging {
          border-color: rgba(251, 191, 36, 0.6);
          border-style: solid;
          background: rgba(251, 191, 36, 0.05);
        }

        .upload-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          color: rgba(251, 191, 36, 0.8);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .upload-title {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .upload-subtitle {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .resume-preview-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          animation: fadeInUp 0.9s ease-out 0.3s both;
          position: relative;
          overflow: hidden;
        }

        .resume-preview-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
        }

        .resume-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .resume-card-title {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.75rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .resume-card-subtitle {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .selected-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 100px;
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          color: #22c55e;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .metadata-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .metadata-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateX(4px);
        }

        .metadata-icon {
          width: 20px;
          height: 20px;
          color: rgba(59, 130, 246, 0.7);
        }

        .metadata-content {
          flex: 1;
        }

        .metadata-label {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .metadata-value {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .empty-state-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1.5rem;
          color: rgba(255, 255, 255, 0.2);
        }

        .empty-state-title {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.75rem;
        }

        .empty-state-subtitle {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          max-width: 400px;
          margin: 0 auto;
        }
      `}</style>

      {/* Header */}
      <div className="selector-header">
        <h2 className="selector-title">Select Your Resume</h2>
        <p className="selector-subtitle">Choose a resume to preview across all templates</p>
      </div>

      {/* Selection Grid */}
      <div className="selection-grid">
        {/* Dropdown Selector */}
        <div className="dropdown-container" ref={dropdownRef}>
          <div
            className="dropdown-trigger"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="dropdown-label">Stored Resumes</div>
            <div className="dropdown-value">
              <span className="dropdown-value-text">
                {selectedResume ? getResumeName(selectedResume) : 'Select a resume'}
              </span>
              <ChevronDown
                className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
                size={24}
              />
            </div>
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              {availableResumes.length > 0 ? (
                availableResumes.map((resume) => (
                  <div
                    key={resume.id}
                    className={`dropdown-item ${selectedResume?.id === resume.id ? 'selected' : ''}`}
                    onClick={() => handleResumeSelect(resume.id)}
                  >
                    <FileText size={20} style={{ color: 'rgba(59, 130, 246, 0.7)' }} />
                    <div className="dropdown-item-content">
                      <div className="dropdown-item-name">{getResumeName(resume)}</div>
                      <div className="dropdown-item-meta">
                        Uploaded {formatLocalDateTime(resume.uploaded_at)}
                      </div>
                    </div>
                    {selectedResume?.id === resume.id && (
                      <Check size={20} style={{ color: '#22c55e' }} />
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontFamily: "'Urbanist', sans-serif" }}>
                  No resumes found. Upload one to get started.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Zone */}
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onClick={handleUploadClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className="upload-icon" />
          <div className="upload-title">Upload New Resume</div>
          <div className="upload-subtitle">
            {isDragging ? 'Drop your file here' : 'Click to browse or drag and drop'}
          </div>
        </div>
      </div>

      {/* Selected Resume Preview Card */}
      {selectedResume ? (
        <div className="resume-preview-card">
          <div className="resume-card-header">
            <div>
              <h3 className="resume-card-title">{getResumeName(selectedResume)}</h3>
              <p className="resume-card-subtitle">
                {selectedResume.email || 'No email provided'}
              </p>
            </div>
            <div className="selected-badge">
              <Check size={14} />
              <span>Selected</span>
            </div>
          </div>

          <div className="metadata-grid">
            <div className="metadata-item">
              <Briefcase className="metadata-icon" />
              <div className="metadata-content">
                <div className="metadata-label">Experience</div>
                <div className="metadata-value">
                  {Array.isArray(selectedResume.experience) ? selectedResume.experience.length : 0} roles
                </div>
              </div>
            </div>

            <div className="metadata-item">
              <Award className="metadata-icon" />
              <div className="metadata-content">
                <div className="metadata-label">Skills</div>
                <div className="metadata-value">
                  {selectedResume.skills_count || selectedResume.skills?.length || 0} listed
                </div>
              </div>
            </div>

            <div className="metadata-item">
              <Calendar className="metadata-icon" />
              <div className="metadata-content">
                <div className="metadata-label">Uploaded</div>
                <div className="metadata-value">
                  {formatLocalDateTime(selectedResume.uploaded_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <FileText className="empty-state-icon" />
          <h3 className="empty-state-title">No Resume Selected</h3>
          <p className="empty-state-subtitle">
            Choose a resume from your library or upload a new one to see template previews
          </p>
        </div>
      )}
    </div>
  )
}
