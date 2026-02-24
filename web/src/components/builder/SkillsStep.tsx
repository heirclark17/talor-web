import { useState } from 'react'
import { Code } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'
import SkillTagInput from './SkillTagInput'
import AIInlineButton from './AIInlineButton'
import { api } from '../../api/client'

export default function SkillsStep() {
  const skills = useBuilderStore((s) => s.skills)
  const setSkills = useBuilderStore((s) => s.setSkills)
  const experiences = useBuilderStore((s) => s.experiences)

  const [aiLoading, setAiLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Record<string, string[]> | null>(null)

  const handleSuggest = async () => {
    setAiLoading(true)
    setSuggestions(null)
    try {
      const experienceTitles = experiences
        .filter((e) => e.title)
        .map((e) => e.title)

      const res = await api.builderSuggestSkills({
        job_title: experienceTitles[0] || 'Professional',
        existing_skills: skills,
        experience_titles: experienceTitles,
      })

      if (res.success && res.data?.categories) {
        setSuggestions(res.data.categories)
      }
    } catch {
      // Silent fail
    } finally {
      setAiLoading(false)
    }
  }

  const addSuggested = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Code className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-theme">Skills</h2>
        </div>
        <AIInlineButton
          label="Suggest Skills"
          onClick={handleSuggest}
          loading={aiLoading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Add your skills (type and press Enter)
        </label>
        <SkillTagInput skills={skills} onChange={setSkills} />
        <p className="text-xs text-theme-tertiary mt-2">
          {skills.length} skill{skills.length !== 1 ? 's' : ''} added. You can also paste a comma-separated list.
        </p>
      </div>

      {suggestions && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-theme-secondary">
            AI Suggestions — click to add:
          </p>
          {Object.entries(suggestions).map(([category, categorySkills]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-theme-tertiary uppercase tracking-wider mb-2">
                {category}
              </p>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => {
                  const alreadyAdded = skills.includes(skill)
                  return (
                    <button
                      key={skill}
                      onClick={() => !alreadyAdded && addSuggested(skill)}
                      disabled={alreadyAdded}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        alreadyAdded
                          ? 'bg-green-500/15 text-green-500 cursor-default'
                          : 'bg-theme-glass-5 text-theme-secondary hover:bg-accent/15 hover:text-accent border border-white/10 hover:border-accent/30'
                      }`}
                    >
                      {alreadyAdded ? '✓ ' : '+ '}
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
