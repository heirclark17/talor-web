import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Calendar, Briefcase, Trash2, Eye, Loader, AlertCircle, Sparkles } from 'lucide-react'
import { api } from '../api/client'

interface StarStory {
  id: number
  title: string
  story_theme: string | null
  company_context: string | null
  situation: string
  task: string
  action: string
  result: string
  key_themes: string[]
  talking_points: string[]
  created_at: string
  updated_at: string
}

export default function StarStoriesList() {
  const navigate = useNavigate()
  const [stories, setStories] = useState<StarStory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedStory, setSelectedStory] = useState<StarStory | null>(null)

  useEffect(() => {
    fetchStarStories()
  }, [])

  const fetchStarStories = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await api.listStarStories()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load STAR stories')
      }

      setStories(result.data || [])
    } catch (err) {
      console.error('Error fetching STAR stories:', err)
      setError(err instanceof Error ? err.message : 'Failed to load STAR stories')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (storyId: number) => {
    if (!window.confirm('Are you sure you want to delete this STAR story? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(storyId)

      const result = await api.deleteStarStory(storyId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete STAR story')
      }

      // Remove from local state
      setStories(stories.filter(s => s.id !== storyId))
      if (selectedStory?.id === storyId) {
        setSelectedStory(null)
      }
    } catch (err) {
      console.error('Error deleting STAR story:', err)
      alert('Failed to delete STAR story. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const getWordCount = (text: string) => {
    return text.split(/\s+/).filter(word => word.length > 0).length
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
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">My STAR Stories</h1>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-400">
            Your saved interview stories using the STAR method (Situation, Task, Action, Result)
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              <Loader className="w-12 h-12 text-white mx-auto mb-4 animate-spin" />
              <p className="text-gray-400 text-lg">Loading your STAR stories...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading STAR Stories</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={fetchStarStories}
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <Sparkles className="w-16 h-16 text-white/40 mx-auto mb-6" />
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">No STAR Stories Yet</h3>
              <p className="text-gray-400 mb-6 sm:mb-8 text-base sm:text-lg px-2 sm:px-0">
                Create interview prep from a tailored resume to generate STAR stories,
                or create a new tailored resume to get started.
              </p>
              <button
                onClick={() => navigate('/tailor')}
                className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                Create Tailored Resume →
              </button>
            </div>
          </div>
        )}

        {/* STAR Stories List */}
        {!loading && !error && stories.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 text-gray-400 text-sm">
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} saved
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Stories Grid */}
              <div className="space-y-4">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className={`glass rounded-xl p-6 border transition-all cursor-pointer ${
                      selectedStory?.id === story.id
                        ? 'border-blue-400 shadow-lg shadow-blue-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedStory(story)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {story.title}
                        </h3>
                        {story.story_theme && (
                          <span className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs mb-2">
                            {story.story_theme}
                          </span>
                        )}
                        {story.company_context && (
                          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                            <Briefcase className="w-4 h-4" />
                            <span>{story.company_context}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(story.id)
                        }}
                        disabled={deletingId === story.id}
                        className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete story"
                      >
                        {deletingId === story.id ? (
                          <Loader className="w-5 h-5 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(story.created_at)}</span>
                      </div>
                      <span>•</span>
                      <span>{getWordCount(story.situation + story.task + story.action + story.result)} words</span>
                    </div>

                    {story.key_themes && story.key_themes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {story.key_themes.slice(0, 3).map((theme, i) => (
                          <span key={i} className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs">
                            {theme}
                          </span>
                        ))}
                        {story.key_themes.length > 3 && (
                          <span className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs">
                            +{story.key_themes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Story Detail View */}
              {selectedStory ? (
                <div className="glass rounded-xl p-8 border border-white/10 lg:sticky lg:top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">{selectedStory.title}</h2>

                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-green-400 font-bold text-sm">S</span>
                        </div>
                        <h3 className="text-sm font-semibold text-green-400 uppercase">Situation</h3>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedStory.situation}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-blue-400 font-bold text-sm">T</span>
                        </div>
                        <h3 className="text-sm font-semibold text-blue-400 uppercase">Task</h3>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedStory.task}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-purple-400 font-bold text-sm">A</span>
                        </div>
                        <h3 className="text-sm font-semibold text-purple-400 uppercase">Action</h3>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedStory.action}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <span className="text-yellow-400 font-bold text-sm">R</span>
                        </div>
                        <h3 className="text-sm font-semibold text-yellow-400 uppercase">Result</h3>
                      </div>
                      <p className="text-gray-300 whitespace-pre-wrap">{selectedStory.result}</p>
                    </div>

                    {selectedStory.key_themes && selectedStory.key_themes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Key Themes</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedStory.key_themes.map((theme, i) => (
                            <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedStory.talking_points && selectedStory.talking_points.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Talking Points</h3>
                        <ul className="space-y-2">
                          {selectedStory.talking_points.map((point, i) => (
                            <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                              <span className="text-white mt-1">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="glass rounded-xl p-12 border border-white/10 flex items-center justify-center text-center lg:sticky lg:top-6">
                  <div>
                    <Eye className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-gray-400">Select a story to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
