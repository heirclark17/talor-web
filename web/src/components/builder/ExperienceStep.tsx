import { useState } from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'
import AIInlineButton from './AIInlineButton'
import { api } from '../../api/client'

export default function ExperienceStep() {
  const experiences = useBuilderStore((s) => s.experiences)
  const addExperience = useBuilderStore((s) => s.addExperience)
  const updateExperience = useBuilderStore((s) => s.updateExperience)
  const removeExperience = useBuilderStore((s) => s.removeExperience)
  const addExperienceBullet = useBuilderStore((s) => s.addExperienceBullet)
  const updateExperienceBullet = useBuilderStore((s) => s.updateExperienceBullet)
  const removeExperienceBullet = useBuilderStore((s) => s.removeExperienceBullet)
  const setExperienceBullets = useBuilderStore((s) => s.setExperienceBullets)

  const [enhancingId, setEnhancingId] = useState<string | null>(null)

  const handleEnhance = async (exp: typeof experiences[0]) => {
    setEnhancingId(exp.id)
    try {
      const res = await api.builderEnhanceBullets({
        job_title: exp.title,
        company: exp.company,
        bullets: exp.bullets.filter((b) => b.trim()),
      })
      if (res.success && res.data?.enhanced_bullets) {
        setExperienceBullets(exp.id, res.data.enhanced_bullets)
      }
    } catch {
      // Silent fail
    } finally {
      setEnhancingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-theme">Work Experience</h2>
        </div>
        <button onClick={addExperience} className="btn-secondary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          Add Position
        </button>
      </div>

      {experiences.map((exp) => (
        <div key={exp.id} className="p-5 bg-theme-glass-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-theme text-sm">
              {exp.title && exp.company ? `${exp.title} at ${exp.company}` : 'New Position'}
            </h3>
            <div className="flex items-center gap-2">
              <AIInlineButton
                label="Enhance"
                size="sm"
                onClick={() => handleEnhance(exp)}
                loading={enhancingId === exp.id}
                disabled={!exp.bullets.some((b) => b.trim())}
              />
              {experiences.length > 1 && (
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                className="input"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Company *
              </label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                className="input"
                placeholder="Google"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                className="input"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                Start Date
              </label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => {
                    updateExperience(exp.id, {
                      current: e.target.checked,
                      ...(e.target.checked ? { endDate: '' } : {}),
                    })
                  }}
                  className="checkbox-styled"
                />
                <label className="text-xs font-medium text-theme-secondary">
                  I currently work here
                </label>
              </div>
              {!exp.current && (
                <div>
                  <label className="block text-xs font-medium text-theme-secondary mb-1.5">
                    End Date
                  </label>
                  <input
                    type="month"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bullet Points */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-theme-secondary">
                Key Achievements / Responsibilities
              </label>
              <button
                onClick={() => addExperienceBullet(exp.id)}
                className="text-accent hover:opacity-80 text-xs flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Bullet
              </button>
            </div>
            <div className="space-y-2">
              {exp.bullets.map((bullet, bi) => (
                <div key={bi} className="flex gap-2 items-start">
                  <span className="text-theme-tertiary mt-2.5 text-xs select-none">&#8226;</span>
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => updateExperienceBullet(exp.id, bi, e.target.value)}
                    className="input flex-1 text-sm"
                    placeholder="Led development of..."
                  />
                  {exp.bullets.length > 1 && (
                    <button
                      onClick={() => removeExperienceBullet(exp.id, bi)}
                      className="p-1.5 text-red-500/60 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
