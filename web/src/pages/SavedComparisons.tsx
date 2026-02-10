import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Calendar, Building2, Briefcase, Trash2, Loader2, Pin } from 'lucide-react'
import { api } from '../api/client'
import { showError } from '../utils/toast'

interface SavedComparisonItem {
  id: number
  tailored_resume_id: number
  title: string | null
  company: string
  position: string
  saved_at: string
  last_viewed_at: string | null
  is_pinned: boolean
  tags: string[] | null
}

export default function SavedComparisons() {
  const navigate = useNavigate()
  const [comparisons, setComparisons] = useState<SavedComparisonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSavedComparisons()
  }, [])

  const loadSavedComparisons = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.listSavedComparisons()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load saved comparisons')
      }

      setComparisons(result.data || [])
    } catch (err: any) {
      console.error('Error loading saved comparisons:', err)
      setError(err.message || 'Failed to load saved comparisons')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (comparisonId: number) => {
    if (!confirm('Are you sure you want to delete this saved comparison?')) {
      return
    }

    try {
      const result = await api.deleteSavedComparison(comparisonId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete comparison')
      }

      // Remove from list
      setComparisons(comparisons.filter(c => c.id !== comparisonId))
    } catch (err: any) {
      console.error('Error deleting comparison:', err)
      showError('Failed to delete comparison')
    }
  }

  const handleTogglePin = async (comparisonId: number, currentPinned: boolean) => {
    try {
      const result = await api.updateSavedComparison(comparisonId, {
        is_pinned: !currentPinned,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to update pin status')
      }

      // Update local state
      setComparisons(comparisons.map(c =>
        c.id === comparisonId ? { ...c, is_pinned: !currentPinned } : c
      ))
    } catch (err: any) {
      console.error('Error toggling pin:', err)
      showError('Failed to update pin status')
    }
  }

  const handleViewComparison = (comparisonId: number) => {
    // Navigate to tailor page with saved comparison
    navigate(`/tailor?comparison=${comparisonId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-theme animate-spin mx-auto mb-4" />
          <p className="text-theme-secondary">Loading saved comparisons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={loadSavedComparisons} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Bookmark className="w-6 h-6 sm:w-8 sm:h-8 text-theme" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme">Saved Comparisons</h1>
          </div>
          <p className="text-sm sm:text-base text-theme-secondary">
            View and manage your saved resume comparisons
          </p>
        </div>

        {/* Comparisons List */}
        {comparisons.length === 0 ? (
          <div className="glass rounded-xl p-8 sm:p-12 text-center">
            <Bookmark className="w-12 h-12 sm:w-16 sm:h-16 text-theme-tertiary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-theme mb-2">No Saved Comparisons</h2>
            <p className="text-sm sm:text-base text-theme-secondary mb-6">
              Save your resume comparisons to easily return to them later
            </p>
            <button
              onClick={() => navigate('/tailor')}
              className="btn-primary w-full sm:w-auto"
            >
              Create a Tailored Resume →
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {comparisons.map((comparison) => (
              <div
                key={comparison.id}
                className="glass rounded-xl p-6 hover:bg-theme-glass-5 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => handleViewComparison(comparison.id)}>
                    <div className="flex items-center gap-3 mb-3">
                      {comparison.is_pinned && (
                        <Pin className="w-5 h-5 text-yellow-400" />
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-theme group-hover:text-blue-400 transition-colors">
                        {comparison.title || `${comparison.company} - ${comparison.position}`}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-theme-secondary">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {comparison.company}
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        {comparison.position}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Saved {formatDate(comparison.saved_at)}
                      </div>
                      {comparison.last_viewed_at && (
                        <div className="text-theme-tertiary">
                          Last viewed {formatDate(comparison.last_viewed_at)}
                        </div>
                      )}
                    </div>

                    {comparison.tags && comparison.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {comparison.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-2 sm:ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleTogglePin(comparison.id, comparison.is_pinned)
                      }}
                      className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${
                        comparison.is_pinned
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 hover:text-theme'
                      }`}
                      title={comparison.is_pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(comparison.id)
                      }}
                      className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
