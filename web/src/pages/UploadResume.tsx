import React, { useState, useRef, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { showError } from '../utils/toast'

// LocalStorage keys for clearing old tailored resumes
const LAST_TAILORED_RESUME_KEY = 'tailor_last_viewed_resume'
const TAILOR_SESSION_KEY = 'tailor_session_data'

interface ParsedResume {
  resume_id: number
  filename: string
  parsed_data: {
    // Contact Information (ATS Required)
    name?: string
    email?: string
    phone?: string
    linkedin?: string
    location?: string

    // Resume Sections
    summary: string
    skills: string[]
    experience: Array<{
      header?: string
      bullets?: string[]
      title?: string
      position?: string
      role?: string
      job_title?: string
      company?: string
      location?: string
      dates?: string
      date_range?: string
      duration?: string
      description?: string
    }>
    education: string
    certifications: string
  }
}

export default function UploadResume() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
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

  const handleDeleteResume = async (resumeId: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingId(resumeId)
      const result = await api.deleteResume(resumeId)

      if (result.success) {
        // If this was the currently displayed parsed resume, clear it
        if (parsedResume?.resume_id === resumeId) {
          setParsedResume(null)
          setUploadSuccess(false)
        }
      } else {
        showError(`Failed to delete resume: ${result.error}`)
      }
    } catch (err: any) {
      console.error('Error deleting resume:', err)
      showError(`Error deleting resume: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedExtensions = ['.pdf', '.docx']
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExtension) && !allowedMimeTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a .pdf or .docx file.')
      return
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`)
      return
    }

    try {
      setError(null)
      setUploadSuccess(false)
      setUploading(true)

      // Upload file directly to backend
      const uploadResult = await api.uploadResume(file)

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      console.log('Upload successful:', uploadResult.data)
      console.log('Full response structure:', JSON.stringify(uploadResult.data, null, 2))

      // Log the raw parsed_data to see what backend is sending
      console.log('=== RAW BACKEND PARSED_DATA ===')
      console.log('parsed_data object:', uploadResult.data.parsed_data)
      console.log('Available top-level fields:', Object.keys(uploadResult.data).join(', '))
      if (uploadResult.data.parsed_data) {
        console.log('Available parsed_data fields:', Object.keys(uploadResult.data.parsed_data).join(', '))
        console.log('candidate_name:', uploadResult.data.parsed_data.candidate_name)
        console.log('candidate_email:', uploadResult.data.parsed_data.candidate_email)
        console.log('candidate_phone:', uploadResult.data.parsed_data.candidate_phone)
      }
      console.log('===============================')

      // Success - map backend response to our interface
      const backendData = uploadResult.data.parsed_data || uploadResult.data

      const mappedData = {
        resume_id: uploadResult.data.resume_id || uploadResult.data.id,
        filename: uploadResult.data.filename || file.name,
        parsed_data: {
          // Contact Information (ATS Required)
          // Backend parser returns candidate_name, candidate_email, etc.
          name: backendData.candidate_name || backendData.name || backendData.Name || backendData.full_name || '',
          email: backendData.candidate_email || backendData.email || backendData.Email || '',
          phone: backendData.candidate_phone || backendData.phone || backendData.Phone || backendData.phone_number || '',
          linkedin: backendData.candidate_linkedin || backendData.linkedin || backendData.LinkedIn || backendData.linkedin_url || '',
          location: backendData.candidate_location || backendData.location || backendData.Location || backendData.address || '',

          // Resume Sections
          summary: backendData.summary || '',
          skills: backendData.skills || [],
          experience: backendData.experience || [],
          education: backendData.education || '',
          certifications: backendData.certifications || ''
        }
      }

      console.log('=== CONTACT INFORMATION DEBUG ===')
      console.log('Name:', mappedData.parsed_data.name)
      console.log('Email:', mappedData.parsed_data.email)
      console.log('Phone:', mappedData.parsed_data.phone)
      console.log('LinkedIn:', mappedData.parsed_data.linkedin)
      console.log('Location:', mappedData.parsed_data.location)
      console.log('==================================')

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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-theme mb-4 sm:mb-6">Upload Resume</h1>
          <p className="text-base sm:text-lg lg:text-xl text-theme-secondary mb-6 sm:mb-8 px-2">Upload a new resume to start tailoring for your next job</p>

          {/* Button to use existing resume */}
          <button
            onClick={() => navigate('/tailor')}
            className="btn-secondary inline-flex items-center gap-2 w-full sm:w-auto"
          >
            <FileText className="w-5 h-5" />
            Use Existing Resume Instead
          </button>
        </div>

      {/* Upload Area */}
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16 mb-12 sm:mb-16 lg:mb-24">
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-all cursor-pointer ${
            uploading
              ? 'border-theme-muted bg-theme-glass-5 cursor-wait'
              : uploadSuccess
              ? 'border-green-400/50 bg-green-500/10 cursor-pointer'
              : error
              ? 'border-red-400/50 bg-red-500/10 cursor-pointer'
              : 'border-theme-muted hover:border-theme-muted hover:bg-theme-glass-5'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-theme mb-3 sm:mb-4 animate-spin" />
              <p className="text-base sm:text-lg text-theme mb-2 font-semibold">Uploading and parsing resume...</p>
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-green-500 mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg text-theme mb-2 font-semibold">Resume uploaded successfully!</p>
              <p className="text-xs sm:text-sm text-theme-secondary mb-3 sm:mb-4">Parsed {parsedResume?.filename}</p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-red-500 mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg text-red-400 mb-2 font-semibold">Upload failed</p>
              <p className="text-xs sm:text-sm text-red-400 mb-3 sm:mb-4">{error}</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-theme mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg text-theme mb-2 font-semibold">Click to select your resume</p>
              <p className="text-xs sm:text-sm text-theme-secondary mb-3 sm:mb-4">Supports .docx and .pdf files (max 10MB)</p>
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
            className={uploading ? 'px-8 py-3 rounded-full font-semibold bg-theme-glass-10 text-theme-tertiary cursor-not-allowed' : 'btn-primary'}
          >
            {uploading ? 'Uploading...' : uploadSuccess ? 'Upload Another Resume' : 'Select File'}
          </button>
        </div>
      </div>

      {/* Parsed Resume Display */}
      {parsedResume && (
        <div className="mt-16 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-theme" />
            <div>
              <h2 className="text-2xl font-bold text-theme">Parsed Resume</h2>
              <p className="text-sm text-theme-secondary">Resume ID: {parsedResume.resume_id}</p>
            </div>
          </div>

          {/* Contact Information Card - ATS CRITICAL */}
          <div className="glass rounded-xl p-6 border-2 border-blue-500/30">
            <h3 className="text-xl font-bold text-theme mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Contact Information (ATS Required)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parsedResume.parsed_data.name ? (
                <div>
                  <p className="text-sm text-theme-secondary">Name</p>
                  <p className="text-theme font-semibold">{parsedResume.parsed_data.name}</p>
                </div>
              ) : (
                <div className="col-span-2 bg-red-500/10 border border-red-500/30 rounded p-3">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ❌ Name not found - Backend must extract candidate name
                  </p>
                </div>
              )}

              {parsedResume.parsed_data.email ? (
                <div>
                  <p className="text-sm text-theme-secondary">Email</p>
                  <p className="text-theme">{parsedResume.parsed_data.email}</p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ❌ Email missing
                  </p>
                </div>
              )}

              {parsedResume.parsed_data.phone ? (
                <div>
                  <p className="text-sm text-theme-secondary">Phone</p>
                  <p className="text-theme">{parsedResume.parsed_data.phone}</p>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    ❌ Phone missing
                  </p>
                </div>
              )}

              {parsedResume.parsed_data.linkedin && (
                <div>
                  <p className="text-sm text-theme-secondary">LinkedIn</p>
                  <p className="text-theme text-sm truncate">{parsedResume.parsed_data.linkedin}</p>
                </div>
              )}

              {parsedResume.parsed_data.location && (
                <div>
                  <p className="text-sm text-theme-secondary">Location</p>
                  <p className="text-theme">{parsedResume.parsed_data.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          {parsedResume.parsed_data.summary && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-theme mb-4">Professional Summary</h3>
              <p className="text-theme-secondary leading-relaxed">{parsedResume.parsed_data.summary}</p>
            </div>
          )}

          {/* Skills Card */}
          {parsedResume.parsed_data.skills && parsedResume.parsed_data.skills.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-theme mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {parsedResume.parsed_data.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-theme-glass-10 text-theme rounded-full text-sm font-medium"
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
              <h3 className="text-xl font-bold text-theme">Professional Experience</h3>
              {parsedResume.parsed_data.experience.map((job, idx) => (
                <div key={idx} className="glass rounded-xl p-6">
                  <h4 className="font-semibold text-theme mb-1">
                    {job.header || job.title || job.position || job.role || job.job_title || job.company || 'Position'}
                  </h4>
                  {(job.location || job.dates || job.date_range || job.duration) && (
                    <p className="text-sm text-theme-secondary italic mb-3">
                      {(job.location || '') && (job.dates || job.date_range || job.duration)
                        ? `${job.location} | ${job.dates || job.date_range || job.duration}`
                        : (job.location || job.dates || job.date_range || job.duration)}
                    </p>
                  )}
                  {job.bullets && Array.isArray(job.bullets) && job.bullets.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {job.bullets.map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="text-theme-secondary text-sm">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : job.description ? (
                    <p className="text-theme-secondary text-sm">{job.description}</p>
                  ) : (
                    <p className="text-theme-tertiary text-sm italic">No details available</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Education Card */}
          {parsedResume.parsed_data.education && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-theme mb-4">Education</h3>
              <p className="text-theme-secondary">{parsedResume.parsed_data.education}</p>
            </div>
          )}

          {/* Certifications Card */}
          {parsedResume.parsed_data.certifications && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-theme mb-4">Certifications</h3>
              <p className="text-theme-secondary">{parsedResume.parsed_data.certifications}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              onClick={() => navigate('/tailor', { state: { selectedResumeId: parsedResume.resume_id } })}
              className="flex-1 btn-primary"
            >
              Tailor This Resume →
            </button>
            <button
              onClick={() => navigate('/tailor')}
              className="btn-secondary w-full sm:w-auto"
            >
              View All Resumes
            </button>
            <button
              onClick={() => handleDeleteResume(parsedResume.resume_id, parsedResume.filename)}
              disabled={deletingId === parsedResume.resume_id}
              className="btn-secondary flex items-center justify-center gap-2 hover:bg-red-500/20 hover:border-red-500/50 transition-colors w-full sm:w-auto"
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
                  Delete
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
