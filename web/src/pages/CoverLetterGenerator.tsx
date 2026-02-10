import { useState, useEffect, useRef } from 'react'
import { FileEdit, Plus, Download, Loader2, Wand2, ChevronDown, Trash2, X, Upload, FileText, Search } from 'lucide-react'
import { api } from '../api/client'

interface CoverLetter {
  id: number
  tailoredResumeId: number | null
  baseResumeId: number | null
  jobTitle: string
  companyName: string
  tone: string
  content: string
  createdAt: string
  updatedAt: string
}

interface ResumeItem {
  id: number
  filename: string
  candidate_name: string | null
  uploaded_at: string
}

type ResumeSource = 'none' | 'existing' | 'upload'

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Formal and polished' },
  { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and passionate' },
  { value: 'conversational', label: 'Conversational', desc: 'Friendly and approachable' },
]

export default function CoverLetterGenerator() {
  const [letters, setLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [generationStage, setGenerationStage] = useState<'researching' | 'generating' | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null)
  const [editContent, setEditContent] = useState('')

  // Generator form state
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState('professional')

  // Resume picker state
  const [resumes, setResumes] = useState<ResumeItem[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null)
  const [resumeSource, setResumeSource] = useState<ResumeSource>('none')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadLetters()
    loadResumes()
  }, [])

  async function loadResumes() {
    try {
      const res = await api.listResumes()
      if (res.success && res.data) {
        setResumes(res.data.resumes || [])
      }
    } catch (err) {
      console.error('[CoverLetters] Load resumes error:', err)
    }
  }

  async function handleFileUpload(file: File) {
    if (!file) return
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File must be under 10MB')
      return
    }
    setUploading(true)
    try {
      const res = await api.uploadResume(file)
      if (res.success && res.data) {
        const newResume = res.data.resume || res.data
        setResumes(prev => [newResume, ...prev])
        setSelectedResumeId(newResume.id)
      }
    } catch (err) {
      console.error('[CoverLetters] Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  async function loadLetters() {
    setLoading(true)
    try {
      const res = await api.listCoverLetters()
      if (res.success && res.data) {
        setLetters(res.data.cover_letters || [])
      }
    } catch (err) {
      console.error('[CoverLetters] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    setGenerationStage('researching')

    // Switch to "generating" stage after 5 seconds
    const stageTimer = setTimeout(() => setGenerationStage('generating'), 5000)

    try {
      const params: Record<string, any> = {
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        tone,
      }
      if (resumeSource !== 'none' && selectedResumeId) {
        params.base_resume_id = selectedResumeId
      }

      const res = await api.generateCoverLetter(params)
      if (res.success && res.data) {
        loadLetters()
        setShowGenerator(false)
        setJobTitle('')
        setCompanyName('')
        setJobDescription('')
        setResumeSource('none')
        setSelectedResumeId(null)
        if (res.data.cover_letter) {
          setSelectedLetter(res.data.cover_letter)
          setEditContent(res.data.cover_letter.content)
        }
      }
    } catch (err) {
      console.error('[CoverLetters] Generate error:', err)
    } finally {
      clearTimeout(stageTimer)
      setGenerating(false)
      setGenerationStage(null)
    }
  }

  async function handleSaveEdit() {
    if (!selectedLetter) return
    const res = await api.updateCoverLetter(selectedLetter.id, { content: editContent })
    if (res.success) {
      loadLetters()
      setSelectedLetter({ ...selectedLetter, content: editContent })
    }
  }

  async function handleDelete(id: number) {
    const res = await api.deleteCoverLetter(id)
    if (res.success) {
      setLetters(prev => prev.filter(l => l.id !== id))
      if (selectedLetter?.id === id) {
        setSelectedLetter(null)
        setEditContent('')
      }
    }
  }

  async function handleExport(id: number, format: 'docx') {
    try {
      const res = await api.exportCoverLetter(id, format)
      if (res.success && res.data) {
        const blob = res.data as Blob
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cover_letter.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('[CoverLetters] Export error:', err)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-theme flex items-center gap-3">
            <FileEdit className="w-8 h-8" />
            Cover Letters
          </h1>
          <p className="text-theme-secondary mt-1">{letters.length} cover letter{letters.length !== 1 ? 's' : ''} generated</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary inline-flex items-center gap-2 px-5 py-3"
        >
          <Wand2 className="w-5 h-5" />
          Generate New
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Letters List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="text-center py-8 text-theme-secondary">Loading...</div>
          ) : letters.length === 0 ? (
            <div className="text-center py-8">
              <FileEdit className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
              <p className="text-theme-secondary">No cover letters yet</p>
              <p className="text-theme-tertiary text-sm mt-1">Generate your first cover letter</p>
            </div>
          ) : (
            letters.map(letter => (
              <div
                key={letter.id}
                onClick={() => { setSelectedLetter(letter); setEditContent(letter.content) }}
                className={`glass rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedLetter?.id === letter.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-theme-subtle hover:border-theme-muted'
                }`}
              >
                <h3 className="text-theme font-medium truncate">{letter.jobTitle}</h3>
                <p className="text-theme-secondary text-sm">{letter.companyName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-theme-tertiary">{new Date(letter.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs px-2 py-0.5 bg-theme-glass-10 rounded-full text-theme-secondary capitalize">{letter.tone}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Letter Preview/Editor */}
        <div className="lg:col-span-2">
          {selectedLetter ? (
            <div className="glass rounded-2xl p-6 border border-theme-subtle">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-theme">{selectedLetter.jobTitle}</h2>
                  <p className="text-theme-secondary text-sm">{selectedLetter.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport(selectedLetter.id, 'docx')}
                    className="p-2 hover:bg-theme-glass-10 rounded-lg text-theme-secondary hover:text-theme transition-colors"
                    title="Export as DOCX"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedLetter.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-theme-secondary hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-[500px] bg-theme-glass-5 border border-theme-subtle rounded-xl p-4 text-theme text-sm leading-relaxed focus:outline-none focus:border-theme-muted resize-none"
              />
              {editContent !== selectedLetter.content && (
                <div className="flex justify-end mt-3">
                  <button onClick={handleSaveEdit} className="btn-primary px-5 py-2.5 text-sm">Save Changes</button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 border border-theme-subtle text-center">
              <FileEdit className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <p className="text-theme-secondary text-lg">Select a cover letter to preview and edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0f]/95 backdrop-blur-sm" onClick={() => !generating && setShowGenerator(false)}>
          <div className="rounded-2xl p-6 w-full max-w-lg border border-theme-subtle bg-theme" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-theme">Generate Cover Letter</h2>
              <button onClick={() => !generating && setShowGenerator(false)} className="p-2 hover:bg-theme-glass-10 rounded-lg text-theme-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm text-theme-secondary mb-1">Job Title *</label>
                <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted" />
              </div>
              <div>
                <label className="block text-sm text-theme-secondary mb-1">Company Name *</label>
                <input required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted" />
              </div>

              {/* Resume Picker */}
              <div>
                <label className="block text-sm text-theme-secondary mb-2">Resume (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => { setResumeSource('none'); setSelectedResumeId(null) }}
                    className={`p-3 rounded-xl border text-sm text-center transition-all ${
                      resumeSource === 'none' ? 'border-blue-500/50 bg-blue-500/10 text-theme' : 'border-theme-subtle text-theme-secondary hover:border-theme-muted'
                    }`}
                  >
                    <X className="w-4 h-4 mx-auto mb-1" />
                    <div className="font-medium">None</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeSource('existing')}
                    className={`p-3 rounded-xl border text-sm text-center transition-all ${
                      resumeSource === 'existing' ? 'border-blue-500/50 bg-blue-500/10 text-theme' : 'border-theme-subtle text-theme-secondary hover:border-theme-muted'
                    }`}
                  >
                    <FileText className="w-4 h-4 mx-auto mb-1" />
                    <div className="font-medium">Existing</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResumeSource('upload')}
                    className={`p-3 rounded-xl border text-sm text-center transition-all ${
                      resumeSource === 'upload' ? 'border-blue-500/50 bg-blue-500/10 text-theme' : 'border-theme-subtle text-theme-secondary hover:border-theme-muted'
                    }`}
                  >
                    <Upload className="w-4 h-4 mx-auto mb-1" />
                    <div className="font-medium">Upload</div>
                  </button>
                </div>

                {/* Existing resume dropdown */}
                {resumeSource === 'existing' && (
                  <div className="mt-2">
                    {resumes.length === 0 ? (
                      <p className="text-xs text-theme-tertiary py-2">No resumes uploaded yet. Use "Upload" instead.</p>
                    ) : (
                      <select
                        value={selectedResumeId ?? ''}
                        onChange={e => setSelectedResumeId(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted text-sm"
                      >
                        <option value="">Select a resume...</option>
                        {resumes.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.candidate_name || r.filename} — {new Date(r.uploaded_at).toLocaleDateString()}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* File upload input */}
                {resumeSource === 'upload' && (
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                    />
                    {uploading ? (
                      <div className="flex items-center gap-2 text-sm text-theme-secondary py-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                      </div>
                    ) : selectedResumeId && resumeSource === 'upload' ? (
                      <div className="flex items-center justify-between bg-theme-glass-5 border border-theme-subtle rounded-xl px-4 py-2.5">
                        <span className="text-sm text-theme truncate">
                          {resumes.find(r => r.id === selectedResumeId)?.filename || 'Resume uploaded'}
                        </span>
                        <button
                          type="button"
                          onClick={() => { setSelectedResumeId(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                          className="text-theme-tertiary hover:text-theme-secondary ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-4 py-2.5 bg-theme-glass-5 border border-dashed border-theme-muted rounded-xl text-sm text-theme-secondary hover:border-theme-muted hover:text-theme transition-all"
                      >
                        Choose .pdf or .docx file (max 10MB)
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-theme-secondary mb-1">Job Description *</label>
                <textarea required value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={5} className="w-full px-4 py-2.5 bg-theme-glass-5 border border-theme-subtle rounded-xl text-theme focus:outline-none focus:border-theme-muted resize-none" placeholder="Paste the job description here..." />
              </div>
              <div>
                <label className="block text-sm text-theme-secondary mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        tone === t.value ? 'border-blue-500/50 bg-blue-500/10 text-theme' : 'border-theme-subtle text-theme-secondary hover:border-theme-muted'
                      }`}
                    >
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs mt-0.5 text-theme-tertiary">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={generating || uploading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {generationStage === 'researching' ? (
                      <span className="flex items-center gap-1.5"><Search className="w-4 h-4" /> Researching {companyName || 'company'}...</span>
                    ) : (
                      <span>Generating cover letter...</span>
                    )}
                  </>
                ) : (
                  <><Wand2 className="w-5 h-5" /> Generate Cover Letter</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
