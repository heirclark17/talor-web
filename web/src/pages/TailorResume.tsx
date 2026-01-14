import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Target, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, ArrowRight, Download, Trash2, CheckSquare, Square, Briefcase } from 'lucide-react'
import { api } from '../api/client'

interface BaseResume {
  id: number
  filename: string
  summary: string
  skills: string[]
  experience: any[]
  education: string
  certifications: string
  skills_count: number
  uploaded_at: string
}

interface TailoredResume {
  id: number
  tailored_summary: string
  tailored_skills: string[]
  tailored_experience: any[]
  tailored_education: string
  tailored_certifications: string
  alignment_statement: string
  quality_score: number
  docx_path: string
  company: string
  title: string
}

export default function TailorResume() {
  const location = useLocation()
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<BaseResume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null)
  const [selectedResume, setSelectedResume] = useState<BaseResume | null>(null)
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null)
  const [selectedResumeIds, setSelectedResumeIds] = useState<Set<number>>(new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)

  // Check if a resume was passed via navigation state
  useEffect(() => {
    if (location.state?.selectedResumeId) {
      setSelectedResumeId(location.state.selectedResumeId)
    }
  }, [location])

  useEffect(() => {
    loadResumes()
  }, [])

  useEffect(() => {
    if (selectedResumeId) {
      loadFullResume(selectedResumeId)
    }
  }, [selectedResumeId])

  const loadFullResume = async (resumeId: number) => {
    try {
      const result = await api.getResume(resumeId)
      if (result.success) {
        setSelectedResume(result.data)
      }
    } catch (err: any) {
      console.error('Failed to load full resume:', err)
      // Fallback to partial data from list
      const resume = resumes.find(r => r.id === resumeId)
      setSelectedResume(resume || null)
    }
  }

  const loadResumes = async () => {
    try {
      setLoadingResumes(true)
      const result = await api.listResumes()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load resumes')
      }

      setResumes(result.data.resumes || [])

      // Auto-select first resume if available
      if (result.data.resumes && result.data.resumes.length > 0) {
        setSelectedResumeId(result.data.resumes[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingResumes(false)
    }
  }

  const toggleResumeSelection = (resumeId: number) => {
    setSelectedResumeIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resumeId)) {
        newSet.delete(resumeId)
      } else {
        newSet.add(resumeId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedResumeIds.size === resumes.length) {
      setSelectedResumeIds(new Set())
    } else {
      setSelectedResumeIds(new Set(resumes.map(r => r.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedResumeIds.size === 0) {
      setError('Please select at least one resume to delete')
      return
    }

    const count = selectedResumeIds.size
    if (!confirm(`Are you sure you want to delete ${count} resume(s)? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingBulk(true)
      setError(null)

      // Delete all selected resumes
      const deletePromises = Array.from(selectedResumeIds).map(id => api.deleteResume(id))
      const results = await Promise.all(deletePromises)

      // Check for failures
      const failures = results.filter(r => !r.success)
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} resume(s)`)
      }

      // Remove from local state
      setResumes(prevResumes => prevResumes.filter(r => !selectedResumeIds.has(r.id)))

      // Clear selections
      setSelectedResumeIds(new Set())

      // If currently selected resume was deleted, clear it
      if (selectedResumeId && selectedResumeIds.has(selectedResumeId)) {
        setSelectedResumeId(null)
        setSelectedResume(null)
      }

      console.log(`Successfully deleted ${count} resume(s)`)
    } catch (err: any) {
      console.error('Bulk delete error:', err)
      setError(err.message)
    } finally {
      setDeletingBulk(false)
    }
  }

  const handleDeleteResume = async (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the resume when clicking delete

    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingResumeId(resumeId)
      const result = await api.deleteResume(resumeId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete resume')
      }

      // Remove from local state using functional update
      setResumes(prevResumes => prevResumes.filter(r => r.id !== resumeId))

      // Remove from selected if it was selected
      setSelectedResumeIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(resumeId)
        return newSet
      })

      // If deleted resume was selected, clear selection
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null)
        setSelectedResume(null)
      }

      // Show success message
      console.log('Resume deleted successfully:', resumeId)
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message)
    } finally {
      setDeletingResumeId(null)
    }
  }

  const handleTailor = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume')
      return
    }

    if (!jobUrl && !company) {
      setError('Please provide a job URL (or company name if no URL available)')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    setShowComparison(false)

    try {
      const result = await api.tailorResume({
        baseResumeId: selectedResumeId,
        jobUrl: jobUrl.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to tailor resume')
      }

      // Set tailored resume data
      setTailoredResume({
        id: result.data.tailored_resume_id,
        tailored_summary: result.data.summary,
        tailored_skills: result.data.competencies || [],
        tailored_experience: result.data.experience || [],
        tailored_education: result.data.education || '',
        tailored_certifications: result.data.certifications || '',
        alignment_statement: result.data.alignment_statement || '',
        quality_score: 95,
        docx_path: result.data.docx_path,
        company: result.data.company || company,
        title: result.data.title || jobTitle
      })

      setSuccess(true)
      setShowComparison(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setJobUrl('')
    setCompany('')
    setJobTitle('')
    setTailoredResume(null)
    setShowComparison(false)
    setSuccess(false)
    setError(null)
  }

  if (showComparison && selectedResume && tailoredResume) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Resume Comparison
                </h1>
                <p className="text-gray-400 mt-1">Original vs. Tailored for {tailoredResume.company}</p>
              </div>
            </div>
            <button
              onClick={resetForm}
              className="btn-secondary"
            >
              ← Back to Tailoring
            </button>
          </div>

          {/* Success Banner */}
          <div className="mb-8 p-6 glass border-2 border-green-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Resume Successfully Tailored!</h3>
                <p className="text-gray-400">
                  Your resume has been customized for <span className="font-semibold text-white">{tailoredResume.company}</span> - {tailoredResume.title}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  📄 Saved to: <code className="bg-white/10 px-2 py-1 rounded text-xs">{tailoredResume.docx_path}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {/* Original Resume */}
            <div className="glass rounded-2xl overflow-hidden border border-white/20">
              <div className="glass p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Original Resume</h2>
                </div>
                <p className="text-gray-400 text-sm">{selectedResume.filename}</p>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* Summary */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/10">
                    Professional Summary
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{selectedResume.summary}</p>
                </div>

                {/* Skills */}
                {selectedResume.skills && selectedResume.skills.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/10">
                      Skills ({selectedResume.skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedResume.skills.slice(0, 12).map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedResume.experience && selectedResume.experience.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/10">
                      Professional Experience
                    </h3>
                    <div className="space-y-6">
                      {selectedResume.experience.map((exp: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-white/20 pl-4">
                          <h4 className="font-bold text-white text-base mb-1">{exp.header || exp.title}</h4>
                          {exp.location && (
                            <p className="text-gray-400 text-sm mb-1">{exp.location}</p>
                          )}
                          {exp.dates && (
                            <p className="text-gray-500 text-sm mb-3">{exp.dates}</p>
                          )}
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="space-y-2 text-sm">
                              {exp.bullets.map((bullet: string, bulletIdx: number) => (
                                <li key={bulletIdx} className="text-gray-400 flex gap-2">
                                  <span className="text-white/40 flex-shrink-0">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedResume.education && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/10">
                      Education
                    </h3>
                    <p className="text-gray-400">{selectedResume.education}</p>
                  </div>
                )}

                {/* Certifications */}
                {selectedResume.certifications && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/10">
                      Certifications
                    </h3>
                    <p className="text-gray-400 whitespace-pre-line">{selectedResume.certifications}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tailored Resume */}
            <div className="glass rounded-2xl overflow-hidden border border-white/40">
              <div className="glass p-6 border-b border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Tailored Resume</h2>
                </div>
                <p className="text-gray-300 text-sm">Customized for {tailoredResume.company}</p>
              </div>

              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* AI Badge */}
                <div className="mb-6 p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      AI-Enhanced with GPT-4.1-mini & Perplexity
                    </span>
                  </div>
                </div>

                {/* Tailored Summary */}
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/20">
                    Professional Summary
                  </h3>
                  <p className="text-gray-400 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                    {tailoredResume.tailored_summary}
                  </p>
                </div>

                {/* Tailored Competencies */}
                {tailoredResume.tailored_skills && tailoredResume.tailored_skills.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/20">
                      Core Competencies ({tailoredResume.tailored_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tailoredResume.tailored_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white/15 text-white rounded-full text-sm font-medium border border-white/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tailored Experience */}
                {tailoredResume.tailored_experience && tailoredResume.tailored_experience.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/20">
                      Professional Experience (Tailored)
                    </h3>
                    <div className="space-y-6">
                      {tailoredResume.tailored_experience.map((exp: any, idx: number) => (
                        <div key={idx} className="border-l-2 border-white/40 pl-4 bg-white/5 p-3 rounded-r-lg">
                          <h4 className="font-bold text-white text-base mb-1">{exp.header || exp.title}</h4>
                          {exp.location && (
                            <p className="text-gray-300 text-sm mb-1">{exp.location}</p>
                          )}
                          {exp.dates && (
                            <p className="text-gray-400 text-sm mb-3">{exp.dates}</p>
                          )}
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="space-y-2 text-sm">
                              {exp.bullets.map((bullet: string, bulletIdx: number) => (
                                <li key={bulletIdx} className="text-gray-300 flex gap-2">
                                  <span className="text-white/40 flex-shrink-0">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {tailoredResume.tailored_education && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/20">
                      Education
                    </h3>
                    <p className="text-gray-300">{tailoredResume.tailored_education}</p>
                  </div>
                )}

                {/* Certifications */}
                {tailoredResume.tailored_certifications && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/20">
                      Certifications & Training
                    </h3>
                    <p className="text-gray-300 whitespace-pre-line">{tailoredResume.tailored_certifications}</p>
                  </div>
                )}

                {/* Alignment Statement */}
                {tailoredResume.alignment_statement && (
                  <div className="mb-10">
                    <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b-2 border-white/20">
                      Company Alignment
                    </h3>
                    <p className="text-gray-400 bg-white/5 p-4 rounded-lg border border-white/10">
                      {tailoredResume.alignment_statement}
                    </p>
                  </div>
                )}

                {/* Quality Score */}
                <div className="p-4 bg-white/5 rounded-xl border border-green-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Quality Score</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${tailoredResume.quality_score}%` }}
                        />
                      </div>
                      <span className="text-2xl font-bold text-green-500">{tailoredResume.quality_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/interview-prep/${tailoredResume.id}`)}
              className="btn-primary flex items-center gap-3 text-lg bg-purple-600 hover:bg-purple-700"
            >
              <Briefcase className="w-5 h-5" />
              View Interview Prep
            </button>
            <button
              onClick={() => window.open(`https://resume-ai-backend-production-3134.up.railway.app/api/tailor/download/${tailoredResume.id}`, '_blank')}
              className="btn-primary flex items-center gap-3 text-lg"
            >
              <Download className="w-5 h-5" />
              Download Tailored Resume
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary text-lg"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Talor
          </h1>
          <p className="text-xl text-gray-400">
            AI-powered resume customization for every job application
          </p>
        </div>

        {error && (
          <div className="mb-16 p-5 glass border-2 border-red-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">Error</p>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resume Selection */}
        <div className="glass rounded-2xl p-10 mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Select Base Resume</h2>
          </div>

          {/* Bulk Actions */}
          {resumes.length > 0 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                  {selectedResumeIds.size === resumes.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {selectedResumeIds.size === resumes.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
                {selectedResumeIds.size > 0 && (
                  <span className="text-sm text-gray-400">
                    {selectedResumeIds.size} selected
                  </span>
                )}
              </div>
              {selectedResumeIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deletingBulk}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingBulk ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete Selected ({selectedResumeIds.size})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {loadingResumes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="ml-3 text-gray-400 text-lg">Loading resumes...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4 text-lg">No resumes uploaded yet</p>
              <a href="/upload" className="text-white hover:text-gray-300 font-semibold text-lg">
                Upload a resume to get started →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`block p-6 border-2 rounded-xl transition-all ${
                    selectedResumeId === resume.id
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for bulk selection */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleResumeSelection(resume.id)
                      }}
                      className="mt-1 flex-shrink-0"
                    >
                      {selectedResumeIds.has(resume.id) ? (
                        <CheckSquare className="w-5 h-5 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      )}
                    </button>

                    {/* Resume content - clickable to select */}
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg mb-2">{resume.filename}</p>
                          {resume.summary && (
                            <p className="text-gray-400 line-clamp-2 mb-3">
                              {resume.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              {resume.skills_count} skills
                            </span>
                            <span>•</span>
                            <span>Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedResumeId === resume.id && (
                        <div className="p-2 bg-white/10 rounded-full">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDeleteResume(resume.id, e)}
                        disabled={deletingResumeId === resume.id}
                        className="p-2 hover:bg-red-500/20 rounded-full transition-colors disabled:opacity-50"
                        title="Delete resume"
                      >
                        {deletingResumeId === resume.id ? (
                          <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Job Details */}
        <div className="glass rounded-2xl p-10 mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white">Job Details</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-white mb-3">
                Job URL (LinkedIn, Indeed, Company Site)
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/... or https://jobs.microsoft.com/..."
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all text-lg text-white placeholder-gray-500"
              />
              <p className="text-sm text-gray-400 mt-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Just paste the URL - we'll automatically extract company name, job title, and full description
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-white mb-3">
                  Company Name (Optional)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="JPMorgan Chase"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all text-lg text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-3">
                  Job Title (Optional)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Lead Technical Program Manager"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all text-lg text-white placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tailor Button */}
        <button
          onClick={handleTailor}
          disabled={loading || !selectedResumeId}
          className={`w-full py-6 rounded-2xl font-bold text-xl transition-all ${
            loading || !selectedResumeId
              ? 'bg-white/10 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating tailored resume with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6" />
              Generate Tailored Resume
              <ArrowRight className="w-6 h-6" />
            </span>
          )}
        </button>

        <div className="text-center mt-8 p-4 glass rounded-xl">
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-white" />
            <span>Powered by <strong className="text-white">OpenAI GPT-4.1-mini</strong> & <strong className="text-white">Perplexity AI</strong></span>
          </p>
        </div>
      </div>
    </div>
  )
}
