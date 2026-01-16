import React, { useState, useRef, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Trash2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

// LocalStorage keys for clearing old tailored resumes
const LAST_TAILORED_RESUME_KEY = 'tailor_last_viewed_resume'
const TAILOR_SESSION_KEY = 'tailor_session_data'

interface ParsedResume {
  resume_id: number
  filename: string
  parsed_data: {
    summary: string
    skills: string[]
    experience: Array<{
      header: string
      bullets: string[]
    }>
    education: string
    certifications: string
  }
}

interface ExistingResume {
  id: number
  filename: string
  uploaded_at: string
  skills_count?: number
}

export default function UploadResume() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const [existingResumes, setExistingResumes] = useState<ExistingResume[]>([])
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear old tailored resume data when user navigates to upload page
  // This ensures they start fresh with a new resume
  useEffect(() => {
    const savedResumeId = localStorage.getItem(LAST_TAILORED_RESUME_KEY)
    const sessionData = localStorage.getItem(TAILOR_SESSION_KEY)

    if (savedResumeId || sessionData) {
      console.log('Clearing old session data from localStorage')
      localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
      localStorage.removeItem(TAILOR_SESSION_KEY)
    }
  }, [])

  // Load existing resumes on mount
  useEffect(() => {
    loadExistingResumes()
  }, [])

  const loadExistingResumes = async () => {
    try {
      setLoadingResumes(true)
      const result = await api.listResumes()

      if (result.success && result.data?.resumes) {
        setExistingResumes(result.data.resumes)
      }
    } catch (err) {
      console.error('Error loading resumes:', err)
    } finally {
      setLoadingResumes(false)
    }
  }

  const handleDeleteResume = async (resumeId: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(resumeId)
      const result = await api.deleteResume(resumeId)

      if (result.success) {
        // Remove from list
        setExistingResumes(prev => prev.filter(r => r.id !== resumeId))

        // If this was the currently displayed parsed resume, clear it
        if (parsedResume?.resume_id === resumeId) {
          setParsedResume(null)
          setUploadSuccess(false)
        }
      } else {
        alert(`Failed to delete resume: ${result.error}`)
      }
    } catch (err: any) {
      console.error('Error deleting resume:', err)
      alert(`Error deleting resume: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setUploadSuccess(false)
      setUploading(true)

      console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes')

      // Upload file directly to backend
      const uploadResult = await api.uploadResume(file)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      console.log('Upload successful:', uploadResult.data)
      console.log('Full response structure:', JSON.stringify(uploadResult.data, null, 2))

      // Success - map backend response to our interface
      const mappedData = {
        resume_id: uploadResult.data.resume_id || uploadResult.data.id,
        filename: uploadResult.data.filename || file.name,
        parsed_data: {
          summary: uploadResult.data.parsed_data?.summary || uploadResult.data.summary || '',
          skills: uploadResult.data.parsed_data?.skills || uploadResult.data.skills || [],
          experience: uploadResult.data.parsed_data?.experience || uploadResult.data.experience || [],
          education: uploadResult.data.parsed_data?.education || uploadResult.data.education || '',
          certifications: uploadResult.data.parsed_data?.certifications || uploadResult.data.certifications || ''
        }
      }

      console.log('Mapped data:', mappedData)

      // Log each experience entry individually for better debugging
      console.log('=== EXPERIENCE ENTRIES DEBUG ===')
      mappedData.parsed_data.experience.forEach((exp: any, idx: number) => {
        console.log(`Experience ${idx + 1}:`)
        console.log(`  Available fields: ${Object.keys(exp).join(', ')}`)
        console.log(`  header: "${exp.header}"`)
        console.log(`  title: "${exp.title}"`)
        console.log(`  position: "${exp.position}"`)
        console.log(`  role: "${exp.role}"`)
        console.log(`  job_title: "${exp.job_title}"`)
        console.log(`  company: "${exp.company}"`)
        console.log(`  location: "${exp.location}"`)
        console.log(`  dates: "${exp.dates}"`)
      })
      console.log('=================================')
      setParsedResume(mappedData)
      setUploadSuccess(true)
      setUploading(false)

      // Reload existing resumes list
      await loadExistingResumes()

      // Reset file input so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload resume')
      setUploading(false)
      setUploadSuccess(false)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-6">Upload Resume</h1>
          <p className="text-xl text-gray-400 mb-8">Upload a new resume to start tailoring for your next job</p>

          {/* Button to use existing resume */}
          <button
            onClick={() => navigate('/tailor')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Use Existing Resume Instead
          </button>
        </div>

      {/* Upload Area */}
      <div className="glass rounded-3xl p-16 mb-24">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            uploading
              ? 'border-white/40 bg-white/5 cursor-wait'
              : uploadSuccess
              ? 'border-green-400/50 bg-green-500/10 cursor-pointer'
              : error
              ? 'border-red-400/50 bg-red-500/10 cursor-pointer'
              : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-white mb-4 animate-spin" />
              <p className="text-lg text-white mb-2 font-semibold">Uploading and parsing resume...</p>
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <p className="text-lg text-white mb-2 font-semibold">Resume uploaded successfully!</p>
              <p className="text-sm text-gray-400 mb-4">Parsed {parsedResume?.filename}</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <p className="text-lg text-red-400 mb-2 font-semibold">Upload failed</p>
              <p className="text-sm text-red-400 mb-4">{error}</p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 mx-auto text-white mb-4" />
              <p className="text-lg text-white mb-2 font-semibold">Click to select your resume</p>
              <p className="text-sm text-gray-400 mb-4">Supports .docx and .pdf files (max 10MB)</p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.pdf"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file-input"
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              fileInputRef.current?.click()
            }}
            disabled={uploading}
            className={uploading ? 'px-8 py-3 rounded-full font-semibold bg-white/10 text-gray-500 cursor-not-allowed' : 'btn-primary'}
          >
            {uploading ? 'Uploading...' : uploadSuccess ? 'Upload Another Resume' : 'Select File'}
          </button>
        </div>
      </div>

      {/* Existing Resumes Section */}
      {existingResumes.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6">Your Uploaded Resumes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingResumes.map((resume) => (
              <div
                key={resume.id}
                className="glass rounded-xl p-6 flex items-center justify-between hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileText className="w-10 h-10 text-white flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">{resume.filename}</h3>
                    <p className="text-sm text-gray-400">
                      Uploaded: {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                    {resume.skills_count !== undefined && (
                      <p className="text-xs text-gray-500">
                        {resume.skills_count} skills
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate('/tailor', { state: { selectedResumeId: resume.id } })}
                    className="btn-secondary flex items-center gap-2 px-4 py-2"
                    title="View and tailor this resume"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteResume(resume.id, resume.filename)}
                    disabled={deletingId === resume.id}
                    className="btn-secondary flex items-center gap-2 px-4 py-2 hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
                    title="Delete this resume"
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parsed Resume Display */}
      {parsedResume && (
        <div className="mt-16 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-2xl font-bold text-white">Parsed Resume</h2>
              <p className="text-sm text-gray-400">Resume ID: {parsedResume.resume_id}</p>
            </div>
          </div>

          {/* Summary Card */}
          {parsedResume.parsed_data.summary && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Professional Summary</h3>
              <p className="text-gray-400 leading-relaxed">{parsedResume.parsed_data.summary}</p>
            </div>
          )}

          {/* Skills Card */}
          {parsedResume.parsed_data.skills && parsedResume.parsed_data.skills.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {parsedResume.parsed_data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section - Each job in separate card */}
          {parsedResume.parsed_data.experience && parsedResume.parsed_data.experience.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Professional Experience</h3>
              {parsedResume.parsed_data.experience.map((job, idx) => (
                <div key={idx} className="glass rounded-xl p-6">
                  <h4 className="font-semibold text-white mb-1">
                    {job.header || job.title || job.position || job.role || job.job_title || job.company || 'Position'}
                  </h4>
                  {(job.location || job.dates || job.date_range || job.duration) && (
                    <p className="text-sm text-gray-400 italic mb-3">
                      {(job.location || '') && (job.dates || job.date_range || job.duration)
                        ? `${job.location} | ${job.dates || job.date_range || job.duration}`
                        : (job.location || job.dates || job.date_range || job.duration)}
                    </p>
                  )}
                  {job.bullets && Array.isArray(job.bullets) && job.bullets.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {job.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="text-gray-400 text-sm">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : job.description ? (
                    <p className="text-gray-400 text-sm">{job.description}</p>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No details available</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education Card */}
          {parsedResume.parsed_data.education && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Education</h3>
              <p className="text-gray-400">{parsedResume.parsed_data.education}</p>
            </div>
          )}

          {/* Certifications Card */}
          {parsedResume.parsed_data.certifications && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Certifications</h3>
              <p className="text-gray-400">{parsedResume.parsed_data.certifications}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => navigate('/tailor', { state: { selectedResumeId: parsedResume.resume_id } })}
              className="flex-1 btn-primary"
            >
              Tailor This Resume →
            </button>
            <button
              onClick={() => navigate('/tailor')}
              className="btn-secondary"
            >
              View All Resumes
            </button>
            <button
              onClick={() => handleDeleteResume(parsedResume.resume_id, parsedResume.filename)}
              disabled={deletingId === parsedResume.resume_id}
              className="btn-secondary flex items-center gap-2 hover:bg-red-500/20 hover:border-red-500/50 transition-colors"
              title="Delete this uploaded resume"
            >
              {deletingId === parsedResume.resume_id ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Delete This Resume
                </>
              )}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
