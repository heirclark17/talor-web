import { useMemo } from 'react'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'
import { useTemplateStore } from '../../stores/templateStore'
import { scoreResume } from '../../lib/resumeScorer'
import ResumeScoreRing from './ResumeScoreRing'
import ExportButtons from '../templates/ExportButtons'

export default function ReviewStep() {
  const getResumeData = useBuilderStore((s) => s.getResumeData)
  const { selectedTemplate } = useTemplateStore()

  const resumeData = getResumeData()
  const score = useMemo(() => scoreResume(resumeData), [resumeData])

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-theme mb-2">Review & Export</h2>
        <p className="text-theme-secondary text-sm">
          Your resume is ready. Review the quality score and export.
        </p>
      </div>

      {/* Score Ring */}
      <div className="flex justify-center relative">
        <ResumeScoreRing score={score.total} size={140} />
      </div>

      {/* Score Breakdown */}
      <div className="space-y-3">
        {score.breakdown.map((cat) => {
          const pct = cat.maxScore > 0 ? (cat.score / cat.maxScore) * 100 : 0
          return (
            <div key={cat.category} className="p-3 rounded-xl bg-theme-glass-5">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {pct >= 70 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : pct >= 40 ? (
                    <Info className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-theme">{cat.category}</span>
                </div>
                <span className="text-xs text-theme-tertiary">
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444',
                  }}
                />
              </div>
              {cat.tips.length > 0 && (
                <ul className="space-y-0.5">
                  {cat.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-theme-tertiary flex items-start gap-1.5">
                      <span className="mt-1 w-1 h-1 rounded-full bg-theme-tertiary flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      {/* Export */}
      {selectedTemplate && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm font-medium text-theme mb-3">Download your resume</p>
          <ExportButtons
            template={selectedTemplate}
            resumeData={resumeData}
            variant="stacked"
          />
        </div>
      )}

      {!selectedTemplate && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center">
          <p className="text-sm text-yellow-500">
            Please select a template (Step 1) before exporting.
          </p>
        </div>
      )}
    </div>
  )
}
