import React, { useState, useEffect } from 'react'
import { Clock, RotateCcw, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../api/client'

interface Version {
  id: number
  versionNumber: number
  changeSummary: string | null
  createdAt: string
}

interface ResumeVersionHistoryProps {
  tailoredResumeId: number
  onRestore?: () => void
}

export default function ResumeVersionHistory({
  tailoredResumeId,
  onRestore,
}: ResumeVersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadVersions()
  }, [tailoredResumeId])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const result = await api.listResumeVersions(tailoredResumeId)
      if (result.success && result.data?.versions) {
        setVersions(result.data.versions)
      }
    } catch (err) {
      console.error('Failed to load versions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionId: number, versionNumber: number) => {
    if (!window.confirm(`Restore to version ${versionNumber}? Current state will be auto-saved first.`)) return
    setRestoring(versionId)
    setMessage(null)
    try {
      const result = await api.restoreResumeVersion(tailoredResumeId, versionId)
      if (result.success) {
        setMessage({ type: 'success', text: `Restored to version ${versionNumber}` })
        await loadVersions()
        onRestore?.()
      } else {
        setMessage({ type: 'error', text: result.error || 'Restore failed' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to restore version' })
    } finally {
      setRestoring(null)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-theme-secondary animate-spin" />
      </div>
    )
  }

  if (versions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-8 h-8 text-theme-tertiary mx-auto mb-3" />
        <p className="text-theme-secondary text-sm">No versions yet</p>
        <p className="text-theme-tertiary text-xs mt-1">Versions are saved automatically when you make changes</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-theme mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Version History
      </h3>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className="glass rounded-xl border border-theme-subtle p-4 flex items-center justify-between group hover:border-theme-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 flex items-center justify-center text-sm font-medium text-theme">
                {version.versionNumber}
              </div>
              <div>
                <p className="text-theme text-sm font-medium">
                  Version {version.versionNumber}
                </p>
                <p className="text-theme-tertiary text-xs">
                  {formatDate(version.createdAt)}
                  {version.changeSummary && ` - ${version.changeSummary}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRestore(version.id, version.versionNumber)}
              disabled={restoring === version.id}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-theme-secondary hover:text-theme hover:bg-theme-glass-10 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {restoring === version.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
