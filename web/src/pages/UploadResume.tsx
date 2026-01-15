import React, { useState, useRef, useEffect } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

// LocalStorage key for clearing old tailored resumes
const LAST_TAILORED_RESUME_KEY = 'tailor_last_viewed_resume'

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

export default function UploadResume() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Clear old tailored resume data when user navigates to upload page
  // This ensures they start fresh with a new resume
  useEffect(() => {
    const savedResumeId = localStorage.getItem(LAST_TAILORED_RESUME_KEY)
    if (savedResumeId) {
      console.log('Clearing old tailored resume from localStorage:', savedResumeId)
      localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
    }
  }, [])

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
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-32">
          <h1 className="text-6xl font-bold text-white mb-8">Upload Resume</h1>
          <p className="text-2xl text-gray-400">Upload your base resume to start tailoring for specific jobs</p>
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

          {/* Experience Card */}
          {parsedResume.parsed_data.experience && parsedResume.parsed_data.experience.length > 0 && (
            <div className="glass rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Professional Experience</h3>
              <div className="space-y-6">
                {parsedResume.parsed_data.experience.map((job, idx) => (
                  <div key={idx} className="border-l-4 border-white/20 pl-4">
                    <h4 className="font-semibold text-white mb-1">
                      {job.header || job.title || job.position || 'Position'}
                    </h4>
                    {(job.location || job.dates) && (
                      <p className="text-sm text-gray-400 italic mb-2">
                        {job.location && job.dates ? `${job.location} | ${job.dates}` : job.location || job.dates}
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
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
