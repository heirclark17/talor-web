import React, { useState } from 'react'
import { Loader2, Sparkles, Save, Trash2, Edit, Check, X, Plus } from 'lucide-react'
import { api } from '../api/client'

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
  const [selectedExperiences, setSelectedExperiences] = useState<Set<number>>(new Set())
  const [selectedTheme, setSelectedTheme] = useState<string>(storyThemes[0] || '')
  const [generating, setGenerating] = useState(false)
  const [stories, setStories] = useState<STARStory[]>([])
  const [editingStory, setEditingStory] = useState<string | null>(null)
  const [editedStory, setEditedStory] = useState<STARStory | null>(null)

  const toggleExperience = (index: number) => {
    const newSet = new Set(selectedExperiences)
    if (newSet.has(index)) {
      newSet.delete(index)
    } else {
      newSet.add(index)
    }
    setSelectedExperiences(newSet)
  }

  const generateStory = async () => {
    if (selectedExperiences.size === 0) {
      alert('Please select at least one experience')
      return
    }

    if (!selectedTheme) {
      alert('Please select a story theme')
      return
    }

    try {
      setGenerating(true)

      const response = await fetch('/api/interview-prep/generate-star-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': localStorage.getItem('talor_user_id') || '',
        },
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          experience_indices: Array.from(selectedExperiences),
          story_theme: selectedTheme,
          company_context: companyContext,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const newStory: STARStory = {
          id: Date.now().toString(),
          ...data.story,
        }
        setStories([...stories, newStory])

        // Reset selections
        setSelectedExperiences(new Set())
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

  const deleteStory = (storyId: string) => {
    setStories(stories.filter(s => s.id !== storyId))
  }

  const startEditing = (story: STARStory) => {
    setEditingStory(story.id || null)
    setEditedStory({ ...story })
  }

  const saveEdit = () => {
    if (editedStory && editingStory) {
      setStories(stories.map(s => s.id === editingStory ? editedStory : s))
      setEditingStory(null)
      setEditedStory(null)
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
          {experiences.map((exp, index) => (
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
          ))}
        </div>
      </div>

      {/* Theme Selection */}
      <div className="glass rounded-xl p-6 border border-white/10">
        <h4 className="text-lg font-semibold text-white mb-4">2. Choose Story Theme</h4>
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none"
        >
          {storyThemes.map((theme, index) => (
            <option key={index} value={theme} className="bg-gray-900">
              {theme}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
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
            Generate STAR Story
          </>
        )}
      </button>

      {/* Generated Stories */}
      {stories.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-white">Your STAR Stories</h4>
          {stories.map((story) => (
            <div key={story.id} className="glass rounded-xl p-6 border border-white/10">
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
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Situation</label>
                    <textarea
                      value={editedStory?.situation || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, situation: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Task</label>
                    <textarea
                      value={editedStory?.task || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, task: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Action</label>
                    <textarea
                      value={editedStory?.action || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, action: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-2">Result</label>
                    <textarea
                      value={editedStory?.result || ''}
                      onChange={(e) => setEditedStory({ ...editedStory!, result: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-white/40 focus:outline-none resize-none"
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
                    <h5 className="text-xl font-semibold text-white">{story.title}</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(story)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit story"
                      >
                        <Edit className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={() => deleteStory(story.id!)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete story"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-semibold text-green-400 mb-1">Situation</div>
                      <p className="text-gray-300">{story.situation}</p>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-blue-400 mb-1">Task</div>
                      <p className="text-gray-300">{story.task}</p>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-purple-400 mb-1">Action</div>
                      <p className="text-gray-300">{story.action}</p>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-yellow-400 mb-1">Result</div>
                      <p className="text-gray-300">{story.result}</p>
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
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
