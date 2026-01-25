import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, MapPin, Trash2, Eye, Loader, AlertCircle } from 'lucide-react'
import { getUserId } from '../utils/userSession'

// API base URL - same logic as API client
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

interface InterviewPrepItem {
  id: number
  tailored_resume_id: number
  company_name: string
  job_title: string
  job_location: string | null
  created_at: string
  updated_at: string | null
}

export default function InterviewPrepList() {
  const navigate = useNavigate()
  const [preps, setPreps] = useState<InterviewPrepItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchInterviewPreps()
  }, [])

  const fetchInterviewPreps = async () => {
    try {
      setLoading(true)
      setError(null)

      const userId = getUserId()
      const response = await fetch(`${API_BASE_URL}/api/interview-prep/list`, {
        method: 'GET',
        headers: {
          'X-User-ID': userId
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to load interview preps: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setPreps(data.interview_preps || [])
      } else {
        throw new Error('Failed to load interview preps')
      }
    } catch (err) {
      console.error('Error fetching interview preps:', err)
      setError(err instanceof Error ? err.message : 'Failed to load interview preps')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (prepId: number) => {
    if (!window.confirm('Are you sure you want to delete this interview prep? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(prepId)

      const response = await fetch(`${API_BASE_URL}/api/interview-prep/${prepId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete interview prep')
      }

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setPreps(preps.filter(p => p.id !== prepId))
      } else {
        throw new Error('Failed to delete interview prep')
      }
    } catch (err) {
      console.error('Error deleting interview prep:', err)
      alert('Failed to delete interview prep. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleView = (tailoredResumeId: number) => {
    navigate(`/interview-prep/${tailoredResumeId}`)
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="animate-gradient absolute inset-0 z-0"></div>

      {/* Floating particles */}
      <div className="particles-background">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">My Interview Prep</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400">
            Access all your saved interview preparation materials. Click any item to view the full prep details.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              <Loader className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Loading your interview preps...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Interview Preps</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={fetchInterviewPreps}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && preps.length === 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <BookOpen className="w-16 h-16 text-white/40 mx-auto mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">No Interview Preps Yet</h3>
              <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg px-2 sm:px-0">
                Create a tailored resume first, then generate interview prep materials from the tailor page.
              </p>
              <button
                onClick={() => navigate('/tailor')}
                className="btn-primary inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
              >
                Create Tailored Resume →
              </button>
            </div>
          </div>
        )}

        {/* Interview Prep List */}
        {!loading && !error && preps.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 text-gray-400 text-sm">
              {preps.length} {preps.length === 1 ? 'interview prep' : 'interview preps'} found
            </div>

            <div className="space-y-3 sm:space-y-4">
              {preps.map((prep) => (
                <div
                  key={prep.id}
                  className="glass rounded-xl p-4 sm:p-6 border border-white/10 hover:border-white/30 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                          {prep.company_name}
                        </h3>
                        <span className="text-xs text-gray-500 bg-white/5 px-2 sm:px-3 py-1 rounded-full flex-shrink-0">
                          ID: {prep.id}
                        </span>
                      </div>

                      <p className="text-gray-300 text-lg mb-4">
                        {prep.job_title}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-400">
                        {prep.job_location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{prep.job_location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created {formatDate(prep.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-6">
                      <button
                        onClick={() => handleView(prep.tailored_resume_id)}
                        className="btn-secondary flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm min-h-[44px] min-w-[44px] flex-1 sm:flex-none"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        onClick={() => handleDelete(prep.id)}
                        disabled={deletingId === prep.id}
                        className={`btn-danger flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-sm min-h-[44px] min-w-[44px] flex-1 sm:flex-none ${
                          deletingId === prep.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {deletingId === prep.id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
