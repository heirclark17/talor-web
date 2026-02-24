/**
 * Resume Selector Component
 *
 * Modal-based interface for selecting and managing resumes
 * Features resume selection, deletion, and drag-and-drop upload
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Upload, FileText, Briefcase, Award, Calendar, Check, Trash2, X, Sparkles } from 'lucide-react'
import { useResumeStore } from '../../stores/resumeStore'
import type { Resume } from '../../stores/resumeStore'
import { useNavigate } from 'react-router-dom'
import { formatLocalDateTime } from '../../utils/dateUtils'
import { showSuccess, showError } from '../../utils/toast'
import { api } from '../../api/client'

interface TailoredResume {
  id: number
  job_title: string
  company_name?: string
  created_at: string
  base_resume_id: number
}

interface ResumeSelectorProps {
  selectedResumeId?: string | null
  onResumeSelect: (resumeId: string | null, type: 'base' | 'tailored') => void
  resumeType?: 'base' | 'tailored'
}

export default function ResumeSelector({ selectedResumeId, onResumeSelect, resumeType: initialResumeType = 'base' }: ResumeSelectorProps) {
  const navigate = useNavigate()
  const { resumes, fetchResumes, deleteResume } = useResumeStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [resumeType, setResumeType] = useState<'base' | 'tailored'>(initialResumeType)
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([])
  const [loadingTailored, setLoadingTailored] = useState(false)

  // Always fetch fresh resume data on mount
  useEffect(() => {
    fetchResumes()
    fetchTailoredResumes()
  }, [])

  // Fetch tailored resumes
  const fetchTailoredResumes = async () => {
    setLoadingTailored(true)
    try {
      const result = await api.listTailoredResumes()
      if (result.success && result.data?.tailored_resumes) {
        setTailoredResumes(result.data.tailored_resumes)
      }
    } catch (error) {
      console.error('Error fetching tailored resumes:', error)
    } finally {
      setLoadingTailored(false)
    }
  }

  // Get all available resumes
  const availableResumes = resumes || []

  // Derive the active resume
  const latestResume = availableResumes.length > 0 ? availableResumes[0] : null
  const selectedResume = selectedResumeId !== null && selectedResumeId !== undefined
    ? availableResumes.find(r => String(r.id) === String(selectedResumeId)) || latestResume
    : latestResume

  const handleResumeSelect = (resumeId: number, type: 'base' | 'tailored') => {
    onResumeSelect(String(resumeId), type)
    setResumeType(type)
    setIsModalOpen(false)
  }

  const handleDeleteResume = async (resumeId: number, resumeName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${resumeName}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(resumeId)
      const success = await deleteResume(resumeId)

      if (success) {
        showSuccess('Resume deleted successfully')
        // If deleted resume was selected, clear selection
        if (selectedResumeId && String(resumeId) === String(selectedResumeId)) {
          onResumeSelect(null, resumeType)
        }
      } else {
        showError('Failed to delete resume')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      showError('Failed to delete resume')
    } finally {
      setDeletingId(null)
    }
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
    navigate('/upload')
  }, [navigate])

  const getResumeName = (resume: Resume) => {
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

        .select-button {
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

        .select-button::before {
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

        .select-button:hover::before {
          opacity: 1;
        }

        .select-button:hover {
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
        }

        .select-label {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.75rem;
          font-weight: 600;
        }

        .select-value {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          position: relative;
          z-index: 1;
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
        {/* Select Resume Button */}
        <button
          className="select-button"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="select-label">Stored Resumes</div>
          <div className="select-value">
            {selectedResume ? getResumeName(selectedResume) : 'Select a resume'}
          </div>
        </button>

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

      {/* Resume Selection Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative bg-theme-card rounded-2xl border border-theme-subtle w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-theme-card border-b border-theme-subtle p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-theme">Select Resume</h3>
                  <p className="text-sm text-theme-secondary mt-1">
                    Choose a resume to use with templates
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-theme-secondary" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setResumeType('base')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    resumeType === 'base'
                      ? 'bg-accent text-white'
                      : 'bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Uploaded Resumes</span>
                  </div>
                </button>
                <button
                  onClick={() => setResumeType('tailored')}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${
                    resumeType === 'tailored'
                      ? 'bg-accent text-white'
                      : 'bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Tailored Resumes</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Resume List */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
              {resumeType === 'base' ? (
                /* Base Resumes */
                availableResumes.length > 0 ? (
                  <div className="space-y-3">
                    {availableResumes.map((resume) => (
                      <div
                        key={resume.id}
                        className={`group p-4 rounded-xl border transition-all ${
                          selectedResume?.id === resume.id && resumeType === 'base'
                            ? 'bg-accent/10 border-accent/30'
                            : 'bg-theme-glass-5 border-theme-subtle hover:bg-theme-glass-10 hover:border-theme-tertiary'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <FileText
                            className={`w-5 h-5 shrink-0 mt-1 ${
                              selectedResume?.id === resume.id && resumeType === 'base' ? 'text-accent' : 'text-theme-secondary'
                            }`}
                          />

                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleResumeSelect(resume.id, 'base')}
                              className="w-full text-left"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-theme truncate">
                                  {getResumeName(resume)}
                                </h4>
                                {selectedResume?.id === resume.id && resumeType === 'base' && (
                                  <Check className="w-4 h-4 text-accent shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-theme-secondary">
                                Uploaded {formatLocalDateTime(resume.uploaded_at)}
                              </p>
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteResume(resume.id, getResumeName(resume))}
                            disabled={deletingId === resume.id}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete resume"
                          >
                            {deletingId === resume.id ? (
                              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-theme-faint mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-theme mb-2">No Resumes Found</h4>
                    <p className="text-sm text-theme-secondary mb-4">
                      Upload your first resume to get started
                    </p>
                    <button
                      onClick={() => {
                        setIsModalOpen(false)
                        navigate('/upload')
                      }}
                      className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors"
                    >
                      Upload Resume
                    </button>
                  </div>
                )
              ) : (
                /* Tailored Resumes */
                loadingTailored ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-theme-secondary">Loading tailored resumes...</p>
                  </div>
                ) : tailoredResumes.length > 0 ? (
                  <div className="space-y-3">
                    {tailoredResumes.map((tailored) => (
                      <div
                        key={tailored.id}
                        className={`group p-4 rounded-xl border transition-all ${
                          Number(selectedResumeId) === tailored.id && resumeType === 'tailored'
                            ? 'bg-accent/10 border-accent/30'
                            : 'bg-theme-glass-5 border-theme-subtle hover:bg-theme-glass-10 hover:border-theme-tertiary'
                        }`}
                      >
                        <button
                          onClick={() => handleResumeSelect(tailored.id, 'tailored')}
                          className="w-full text-left flex items-start gap-4"
                        >
                          <Sparkles
                            className={`w-5 h-5 shrink-0 mt-1 ${
                              Number(selectedResumeId) === tailored.id && resumeType === 'tailored' ? 'text-accent' : 'text-purple-400'
                            }`}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-theme truncate">
                                {tailored.job_title}
                                {tailored.company_name && ` at ${tailored.company_name}`}
                              </h4>
                              {Number(selectedResumeId) === tailored.id && resumeType === 'tailored' && (
                                <Check className="w-4 h-4 text-accent shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-theme-secondary">
                              Tailored {formatLocalDateTime(tailored.created_at)}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-theme-faint mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-theme mb-2">No Tailored Resumes</h4>
                    <p className="text-sm text-theme-secondary mb-4">
                      Create your first tailored resume for a specific job
                    </p>
                    <button
                      onClick={() => {
                        setIsModalOpen(false)
                        navigate('/tailor')
                      }}
                      className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors"
                    >
                      Tailor Resume
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
