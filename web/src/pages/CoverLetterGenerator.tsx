import { useState, useEffect } from 'react'
import { FileEdit, Plus, Download, Loader2, Wand2, ChevronDown, Trash2, X } from 'lucide-react'
import { api } from '../api/client'

interface CoverLetter {
  id: number
  tailoredResumeId: number | null
  jobTitle: string
  companyName: string
  tone: string
  content: string
  createdAt: string
  updatedAt: string
}

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Formal and polished' },
  { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and passionate' },
  { value: 'conversational', label: 'Conversational', desc: 'Friendly and approachable' },
]

export default function CoverLetterGenerator() {
  const [letters, setLetters] = useState<CoverLetter[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(null)
  const [editContent, setEditContent] = useState('')

  // Generator form state
  const [jobTitle, setJobTitle] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [tone, setTone] = useState('professional')

  useEffect(() => {
    loadLetters()
  }, [])

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
    try {
      const res = await api.generateCoverLetter({
        job_title: jobTitle,
        company_name: companyName,
        job_description: jobDescription,
        tone,
      })
      if (res.success && res.data) {
        loadLetters()
        setShowGenerator(false)
        setJobTitle('')
        setCompanyName('')
        setJobDescription('')
        // Select the new letter
        if (res.data.cover_letter) {
          setSelectedLetter(res.data.cover_letter)
          setEditContent(res.data.cover_letter.content)
        }
      }
    } catch (err) {
      console.error('[CoverLetters] Generate error:', err)
    } finally {
      setGenerating(false)
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FileEdit className="w-8 h-8" />
            Cover Letters
          </h1>
          <p className="text-gray-400 mt-1">{letters.length} cover letter{letters.length !== 1 ? 's' : ''} generated</p>
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
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : letters.length === 0 ? (
            <div className="text-center py-8">
              <FileEdit className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No cover letters yet</p>
              <p className="text-gray-500 text-sm mt-1">Generate your first cover letter</p>
            </div>
          ) : (
            letters.map(letter => (
              <div
                key={letter.id}
                onClick={() => { setSelectedLetter(letter); setEditContent(letter.content) }}
                className={`glass rounded-xl p-4 border cursor-pointer transition-all ${
                  selectedLetter?.id === letter.id ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <h3 className="text-white font-medium truncate">{letter.jobTitle}</h3>
                <p className="text-gray-400 text-sm">{letter.companyName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{new Date(letter.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-400 capitalize">{letter.tone}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Letter Preview/Editor */}
        <div className="lg:col-span-2">
          {selectedLetter ? (
            <div className="glass rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">{selectedLetter.jobTitle}</h2>
                  <p className="text-gray-400 text-sm">{selectedLetter.companyName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExport(selectedLetter.id, 'docx')}
                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title="Export as DOCX"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedLetter.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="w-full h-[500px] bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm leading-relaxed focus:outline-none focus:border-white/30 resize-none"
              />
              {editContent !== selectedLetter.content && (
                <div className="flex justify-end mt-3">
                  <button onClick={handleSaveEdit} className="btn-primary px-5 py-2.5 text-sm">Save Changes</button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 border border-white/10 text-center">
              <FileEdit className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Select a cover letter to preview and edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !generating && setShowGenerator(false)}>
          <div className="glass rounded-2xl p-6 w-full max-w-lg border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Generate Cover Letter</h2>
              <button onClick={() => !generating && setShowGenerator(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Job Title *</label>
                <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company Name *</label>
                <input required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Job Description *</label>
                <textarea required value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={5} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 resize-none" placeholder="Paste the job description here..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {TONES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTone(t.value)}
                      className={`p-3 rounded-xl border text-sm text-center transition-all ${
                        tone === t.value ? 'border-blue-500/50 bg-blue-500/10 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <div className="font-medium">{t.label}</div>
                      <div className="text-xs mt-0.5 text-gray-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={generating} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                {generating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Wand2 className="w-5 h-5" /> Generate Cover Letter</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
