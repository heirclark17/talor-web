import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'
import AIInlineButton from './AIInlineButton'
import { api } from '../../api/client'

export default function SummaryStep() {
  const summary = useBuilderStore((s) => s.summary)
  const setSummary = useBuilderStore((s) => s.setSummary)
  const experiences = useBuilderStore((s) => s.experiences)
  const contactInfo = useBuilderStore((s) => s.contactInfo)
  const skills = useBuilderStore((s) => s.skills)

  const [aiLoading, setAiLoading] = useState(false)
  const [variants, setVariants] = useState<string[]>([])

  const handleAIGenerate = async () => {
    setAiLoading(true)
    setVariants([])
    try {
      const jobTitle = experiences[0]?.title || 'Professional'
      const highlights = experiences
        .filter((e) => e.company)
        .map((e) => `${e.title} at ${e.company}`)
        .slice(0, 3)

      const res = await api.builderGenerateSummary({
        job_title: jobTitle,
        years_experience: experiences.length > 1 ? `${experiences.length}+` : '',
        highlights,
        existing_skills: skills,
      })

      if (res.success && res.data?.variants) {
        setVariants(res.data.variants)
      }
    } catch {
      // Silent fail - user can still type manually
    } finally {
      setAiLoading(false)
    }
  }

  const charCount = summary.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-accent" />
          <h2 className="text-2xl font-bold text-theme">Professional Summary</h2>
        </div>
        <AIInlineButton
          label="AI Generate"
          onClick={handleAIGenerate}
          loading={aiLoading}
        />
      </div>

      <div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="input min-h-[160px]"
          placeholder="Write a brief professional summary highlighting your key skills, experience, and career goals..."
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-theme-tertiary">
            Tip: Focus on your most relevant skills and achievements (3-5 sentences)
          </p>
          <span
            className={`text-xs font-medium ${
              charCount > 500 ? 'text-yellow-500' : 'text-theme-tertiary'
            }`}
          >
            {charCount} chars
          </span>
        </div>
      </div>

      {variants.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-theme-secondary">
            AI Suggestions — click to use:
          </p>
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => {
                setSummary(v)
                setVariants([])
              }}
              className="w-full text-left p-4 rounded-xl border border-white/10 bg-theme-glass-5 hover:bg-theme-glass-10 hover:border-accent/30 transition-all text-sm text-theme leading-relaxed"
            >
              {v}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
