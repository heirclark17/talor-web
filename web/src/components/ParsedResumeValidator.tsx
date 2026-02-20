import React, { useState } from 'react'
import { CheckCircle, AlertTriangle, Edit, Save, X, Loader2 } from 'lucide-react'
import { api } from '../api/client'

interface ParsedData {
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  location?: string
  summary: string
  skills: string[]
  experience: Array<{
    header?: string
    bullets?: string[]
    title?: string
    company?: string
    location?: string
    dates?: string
  }>
  education: string
  certifications: string
}

interface ParsedResumeValidatorProps {
  resumeId: number
  parsedData: ParsedData
  onConfirm: () => void
  onSkip: () => void
}

function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { color: 'text-green-400 bg-green-500/20', label: 'Good' },
    medium: { color: 'text-yellow-400 bg-yellow-500/20', label: 'Review' },
    low: { color: 'text-red-400 bg-red-500/20', label: 'Check' },
  }
  const c = config[level]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${c.color}`}>{c.label}</span>
  )
}

function getConfidence(value: string | string[] | undefined): 'high' | 'medium' | 'low' {
  if (!value || (Array.isArray(value) && value.length === 0)) return 'low'
  if (typeof value === 'string' && value.length < 10) return 'medium'
  return 'high'
}

export default function ParsedResumeValidator({
  resumeId,
  parsedData,
  onConfirm,
  onSkip,
}: ParsedResumeValidatorProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [data, setData] = useState<ParsedData>(parsedData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const updateField = (field: string, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateParsedResumeData(resumeId, {
        candidate_name: data.name,
        candidate_email: data.email,
        candidate_phone: data.phone,
        candidate_location: data.location,
        candidate_linkedin: data.linkedin,
        summary: data.summary,
        skills: data.skills,
        education: data.education,
        certifications: data.certifications,
      })
      setSaved(true)
      setTimeout(() => onConfirm(), 1000)
    } catch (err) {
      console.error('Failed to save corrections:', err)
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<{ key: string; label: string; value: any }> = [
    { key: 'name', label: 'Name', value: data.name },
    { key: 'email', label: 'Email', value: data.email },
    { key: 'phone', label: 'Phone', value: data.phone },
    { key: 'location', label: 'Location', value: data.location },
    { key: 'linkedin', label: 'LinkedIn', value: data.linkedin },
    { key: 'summary', label: 'Summary', value: data.summary },
    { key: 'education', label: 'Education', value: data.education },
    { key: 'certifications', label: 'Certifications', value: data.certifications },
  ]

  return (
    <div className="glass rounded-2xl border border-theme-subtle p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CheckCircle className="w-6 h-6 text-green-400" />
        <div>
          <h2 className="text-xl font-semibold text-theme">Resume Parsed Successfully</h2>
          <p className="text-sm text-theme-secondary">Review the extracted data and fix any issues.</p>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map(({ key, label, value }) => (
          <div key={key} className="flex items-start gap-3 group">
            <div className="w-28 flex-shrink-0 pt-2">
              <span className="text-sm text-theme-secondary">{label}</span>
            </div>
            <div className="flex-1">
              {editing === key ? (
                <div className="flex gap-2">
                  {key === 'summary' ? (
                    <textarea
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => updateField(key, e.target.value)}
                      rows={3}
                      className="flex-1 bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme text-sm focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={typeof value === 'string' ? value : ''}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="flex-1 bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme text-sm focus:outline-none focus:border-blue-500"
                    />
                  )}
                  <button
                    onClick={() => setEditing(null)}
                    className="p-2 text-theme-secondary hover:text-theme"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-theme text-sm flex-1 truncate">
                    {typeof value === 'string' ? value || '(empty)' : JSON.stringify(value)}
                  </p>
                  <ConfidenceBadge level={getConfidence(value)} />
                  <button
                    onClick={() => setEditing(key)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-theme-secondary hover:text-theme transition-opacity"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Skills */}
        <div className="flex items-start gap-3">
          <div className="w-28 flex-shrink-0 pt-2">
            <span className="text-sm text-theme-secondary">Skills</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs bg-theme-glass-10 text-theme px-2 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {data.skills.length === 0 && (
                <span className="text-sm text-theme-tertiary">(no skills detected)</span>
              )}
            </div>
            <ConfidenceBadge level={getConfidence(data.skills)} />
          </div>
        </div>

        {/* Experience count */}
        <div className="flex items-start gap-3">
          <div className="w-28 flex-shrink-0 pt-2">
            <span className="text-sm text-theme-secondary">Experience</span>
          </div>
          <div className="flex-1">
            <p className="text-theme text-sm">
              {data.experience.length} position{data.experience.length !== 1 ? 's' : ''} detected
            </p>
            <ConfidenceBadge level={data.experience.length > 0 ? 'high' : 'low'} />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-6">
        {getConfidence(data.summary) === 'low' && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            Some fields may need correction
          </div>
        )}
        <div className="flex gap-3 ml-auto">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-theme-secondary hover:text-theme text-sm transition-colors"
          >
            Skip Review
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved!' : 'Confirm & Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
