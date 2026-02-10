import React, { useState, useEffect } from 'react'
import { Loader2, Sparkles, Save, Trash2, Edit, Check, X, Plus, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { getUserId } from '../utils/userSession'
import { api } from '../api/client'
import PracticeSession from './PracticeSession'

// API base URL - same logic as API client
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

// Tone options for story generation
const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional & Formal', description: 'Corporate, structured, polished language' },
  { value: 'conversational', label: 'Conversational & Authentic', description: 'Natural, approachable, genuine tone' },
  { value: 'confident', label: 'Confident & Assertive', description: 'Strong, decisive, leadership-focused' },
  { value: 'technical', label: 'Technical & Detailed', description: 'Precise, methodical, technical depth' },
  { value: 'strategic', label: 'Strategic & Visionary', description: 'Big-picture, forward-thinking, executive-level' },
]

interface Experience {
  header?: string
  title?: string
  position?: string
  bullets?: string[]
  description?: string
}

interface STARStory {
  id?: string
  title: string
  situation: string
  task: string
  action: string
  result: string
  key_themes: string[]
  talking_points: string[]
}

interface Props {
  tailoredResumeId: number
  experiences: Experience[]
  companyContext: string
  storyThemes: string[]
}

export default function STARStoryBuilder({ tailoredResumeId, experiences, companyContext, storyThemes }: Props) {
  // Debug: Log experiences to see what's being passed
  console.log('[STARStoryBuilder] Received experiences:', experiences)
  console.log('[STARStoryBuilder] Experiences length:', Array.isArray(experiences) ? experiences.length : 'NOT AN ARRAY')
  console.log('[STARStoryBuilder] tailoredResumeId:', tailoredResumeId)

  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set())
  const [selectedTheme, setSelectedTheme] = useState<string>(storyThemes[0] || '')
  const [selectedTone, setSelectedTone] = useState<string>('professional')
  const [generating, setGenerating] = useState(false)
  const [stories, setStories] = useState<STARStory[]>([])
  const [loadingStories, setLoadingStories] = useState(true)
  const [editingStory, setEditingStory] = useState<string | null>(null)
  const [editedStory, setEditedStory] = useState<STARStory | null>(null)
  const [collapsedStories, setCollapsedStories] = useState<Set<string>>(new Set())
  const [practicingStory, setPracticingStory] = useState<STARStory | null>(null)

  // Load existing stories for this interview prep
  useEffect(() => {
    const loadExistingStories = async () => {
      try {
        setLoadingStories(true)
        const response = await fetch(`${API_BASE_URL}/api/star-stories/list?tailored_resume_id=${tailoredResumeId}`, {
          headers: {
            'X-User-ID': getUserId(),
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.stories) {
            const loadedStories = data.stories.map((s: any) => ({
              id: s.id.toString(),
              title: s.title,
              situation: s.situation,
              task: s.task,
              action: s.action,
              result: s.result,
              key_themes: s.key_themes || [],
              talking_points: s.talking_points || [],
            }))
            setStories(loadedStories)
          }
        }
      } catch (error) {
        console.error('Error loading existing stories:', error)
      } finally {
        setLoadingStories(false)
      }
    }

    if (tailoredResumeId) {
      loadExistingStories()
    }
  }, [tailoredResumeId])

  const toggleExperience = (index: number) => {
    const newSet = new Set(selectedExperiences)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedExperiences(newSet)
  }

  const toggleCollapse = (storyId: string) => {
    const newSet = new Set(collapsedStories)
    if (newSet.has(storyId)) {
      newSet.delete(storyId)
    } else {
      newSet.add(storyId)
    }
    setCollapsedStories(newSet)
  }

  const generateStory = async () => {
    console.log('[STARStoryBuilder] generateStory called')
    console.log('[STARStoryBuilder] selectedExperiences:', selectedExperiences)
    console.log('[STARStoryBuilder] selectedExperiences.size:', selectedExperiences.size)
    console.log('[STARStoryBuilder] selectedTheme:', selectedTheme)

    if (selectedExperiences.size === 0) {
      console.log('[STARStoryBuilder] No experiences selected, showing alert')
      alert('Please select at least one experience')
      return
    }

    if (!selectedTheme) {
      console.log('[STARStoryBuilder] No theme selected, showing alert')
      alert('Please select a story theme')
      return
    }

    try {
      console.log('[STARStoryBuilder] Starting story generation...')
      setGenerating(true)

      const response = await fetch(`${API_BASE_URL}/api/interview-prep/generate-star-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': getUserId(),
        },
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          experience_indices: Array.from(selectedExperiences),
          story_theme: selectedTheme,
          tone: selectedTone,
          company_context: companyContext,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        // Save the generated story to database
        const saveResponse = await fetch(`${API_BASE_URL}/api/star-stories/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': getUserId(),
          },
          body: JSON.stringify({
            tailored_resume_id: tailoredResumeId,
            title: data.story.title,
            story_theme: selectedTheme,
            company_context: companyContext,
            situation: data.story.situation,
            task: data.story.task,
            action: data.story.action,
            result: data.story.result,
            key_themes: data.story.key_themes || [],
            talking_points: data.story.talking_points || [],
            experience_indices: Array.from(selectedExperiences),
          }),
        })

        if (!saveResponse.ok) {
          throw new Error('Failed to save story to database')
        }

        const saveData = await saveResponse.json()

        if (saveData.success) {
          const newStory: STARStory = {
            id: saveData.story.id.toString(),
            ...data.story,
          }
          setStories([...stories, newStory])

          // Reset selections to allow creating more stories
          setSelectedExperiences(new Set())
          setSelectedTheme(storyThemes[0] || '')
          setSelectedTone('professional')

          // Scroll to the new story
          setTimeout(() => {
            const storyElements = document.querySelectorAll('[data-story-id]')
            const lastStory = storyElements[storyElements.length - 1]
            if (lastStory) {
              lastStory.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }, 100)

          alert('✓ STAR story generated and saved successfully!\n\nYou can now create another story by selecting different experiences and themes.')
        } else {
          throw new Error('Failed to save story: ' + (saveData.error || 'Unknown error'))
        }
      } else {
        alert('Failed to generate story: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) {
      console.error('Error generating story:', error)
      alert('Failed to generate story: ' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  const deleteStory = async (storyId: string) => {
    if (!window.confirm('Are you sure you want to delete this STAR story? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/star-stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'X-User-ID': getUserId(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete story from database')
      }

      const data = await response.json()

      if (data.success) {
        // Remove from local state
        setStories(stories.filter(s => s.id !== storyId))
        alert('✓ STAR story deleted successfully!')
      } else {
        throw new Error('Failed to delete story')
      }
    } catch (error: any) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story: ' + error.message)
    }
  }

  const startEditing = (story: STARStory) => {
    setEditingStory(story.id || null)
    setEditedStory({ ...story })
  }

  const saveEdit = async () => {
    if (!editedStory || !editingStory) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/star-stories/${editingStory}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': getUserId(),
        },
        body: JSON.stringify({
          title: editedStory.title,
          situation: editedStory.situation,
          task: editedStory.task,
          action: editedStory.action,
          result: editedStory.result,
          key_themes: editedStory.key_themes,
          talking_points: editedStory.talking_points,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update story in database')
      }

      const data = await response.json()

      if (data.success) {
        setStories(stories.map(s => s.id === editingStory ? editedStory : s))
        setEditingStory(null)
        setEditedStory(null)
        alert('✓ STAR story updated successfully!')
      } else {
        throw new Error('Failed to update story')
      }
    } catch (error: any) {
      console.error('Error updating story:', error)
      alert('Failed to update story: ' + error.message)
    }
  }

  const cancelEdit = () => {
    setEditingStory(null)
    setEditedStory(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">STAR Story Builder</h3>
        <p className="text-gray-400">
          Select experiences from your resume and let AI generate compelling interview stories
        </p>
      </div>

      {/* Experience Selection */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">1. Select Your Experiences</h4>
        <div className="space-y-3">
          {experiences.length === 0 ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-400 text-sm">
                <strong>Loading resume experiences...</strong>
                <br />
                Your resume experiences will appear here once the interview prep data is loaded.
                If this message persists, please refresh the page or check that your resume was uploaded correctly.
              </p>
            </div>
          ) : (
            experiences.map((exp, index) => (
              <label
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all ${
                  selectedExperiences.has(index)
                    ? 'bg-white/10 border-2 border-white/40'
                    : 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedExperiences.has(index)}
                  onChange={() => toggleExperience(index)}
                  className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-white focus:ring-2 focus:ring-white/50"
                />
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">
                    {exp.header || exp.title || exp.position || 'Position'}
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <div className="text-sm text-gray-400 space-y-1">
                      {exp.bullets.slice(0, 2).map((bullet, i) => (
                        <div key={i}>• {bullet.substring(0, 100)}{bullet.length > 100 ? '...' : ''}</div>
                      ))}
                      {exp.bullets.length > 2 && (
                        <div className="text-gray-500 italic">+{exp.bullets.length - 2} more achievements</div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">2. Choose Story Theme</h4>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none"
        >
          {storyThemes.map((theme, index) => (
            <option key={index} value={theme} className="bg-[#1a1a2e] text-white">
              {theme}
            </option>
          ))}
        </select>
      </div>

      {/* Tone Selection */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">3. Choose Tone</h4>
        <select
          value={selectedTone}
          onChange={(e) => setSelectedTone(e.target.value)}
          className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none"
        >
          {TONE_OPTIONS.map((tone) => (
            <option key={tone.value} value={tone.value} className="bg-[#1a1a2e] text-white">
              {tone.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-400 mt-2">
          {TONE_OPTIONS.find(t => t.value === selectedTone)?.description}
        </p>
      </div>

      {/* Generate Button */}
      {stories.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Ready to create another story?</strong> Select different experiences and a new theme below, then click Generate STAR Story again.
          </p>
        </div>
      )}

      <button
        onClick={generateStory}
        disabled={generating || selectedExperiences.size === 0}
        className="w-full btn-primary flex items-center justify-center gap-3 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Generating STAR Story...
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            {stories.length > 0 ? 'Generate Another STAR Story' : 'Generate STAR Story'}
          </>
        )}
      </button>

      {/* Generated Stories */}
      {stories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-white">Your STAR Stories ({stories.length})</h4>
            <p className="text-sm text-gray-400">
              All stories are automatically saved and available on the STAR Stories page
            </p>
          </div>
          {stories.map((story) => (
            <div
              key={story.id}
              data-story-id={story.id}
              className="glass rounded-xl p-6 border border-white/10">
              {editingStory === story.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedStory?.title || ''}
                    onChange={(e) => setEditedStory({ ...editedStory!, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-semibold text-xl focus:border-white/40 focus:outline-none"
                    placeholder="Story Title"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Situation (150-250 words)</label>
                    <textarea
                      value={editedStory?.situation || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, situation: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-y"
                      placeholder="Detailed context and background..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Task (100-150 words)</label>
                    <textarea
                      value={editedStory?.task || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, task: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-y"
                      placeholder="What needed to be accomplished and why..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Action (300-500 words) - Most Important!</label>
                    <textarea
                      value={editedStory?.action || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, action: e.target.value })}
                      rows={15}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-y"
                      placeholder="Step-by-step breakdown of what YOU did..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Result (150-250 words)</label>
                    <textarea
                      value={editedStory?.result || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, result: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-y"
                      placeholder="Specific, quantifiable outcomes..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={saveEdit}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h5 className="text-xl font-semibold text-white flex-1">{story.title}</h5>
                    <div className="flex gap-2" role="group" aria-label={`Actions for ${story.title}`}>
                      <button
                        onClick={() => toggleCollapse(story.id!)}
                        className="min-w-[44px] min-h-[44px] p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                        aria-label={collapsedStories.has(story.id!) ? "Expand story" : "Collapse story"}
                        aria-expanded={!collapsedStories.has(story.id!)}
                      >
                        {collapsedStories.has(story.id!) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        ) : (
                          <ChevronUp className="w-5 h-5 text-gray-400" aria-hidden="true" />
                        )}
                      </button>
                      <button
                        onClick={() => setPracticingStory(story)}
                        className="min-w-[44px] min-h-[44px] p-2 hover:bg-green-500/20 rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Practice this story"
                      >
                        <Play className="w-5 h-5 text-green-400" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => startEditing(story)}
                        className="min-w-[44px] min-h-[44px] p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Edit story"
                      >
                        <Edit className="w-5 h-5 text-gray-400" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => deleteStory(story.id!)}
                        className="min-w-[44px] min-h-[44px] p-2 hover:bg-red-500/20 rounded-lg transition-colors flex items-center justify-center"
                        aria-label="Delete story"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {!collapsedStories.has(story.id!) && (
                    <>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-semibold text-green-400 mb-1">Situation</div>
                          <p className="text-gray-300 whitespace-pre-wrap">{story.situation}</p>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-blue-400 mb-1">Task</div>
                          <p className="text-gray-300 whitespace-pre-wrap">{story.task}</p>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-purple-400 mb-1">Action</div>
                          <p className="text-gray-300 whitespace-pre-wrap">{story.action}</p>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-yellow-400 mb-1">Result</div>
                          <p className="text-gray-300 whitespace-pre-wrap">{story.result}</p>
                        </div>
                      </div>

                      {story.key_themes && story.key_themes.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-gray-400 mb-2">Key Themes</div>
                          <div className="flex flex-wrap gap-2">
                            {story.key_themes.map((theme, i) => (
                              <span key={i} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {story.talking_points && story.talking_points.length > 0 && (
                        <div>
                          <div className="text-sm font-semibold text-gray-400 mb-2">Talking Points</div>
                          <ul className="space-y-1">
                            {story.talking_points.map((point, i) => (
                              <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                <span className="text-white mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {collapsedStories.has(story.id!) && (
                    <div className="text-sm text-gray-400 italic">
                      Story collapsed - click to expand
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Practice Session Modal */}
      {practicingStory && (
        <PracticeSession
          story={practicingStory}
          onClose={() => setPracticingStory(null)}
        />
      )}
    </div>
  )
}
