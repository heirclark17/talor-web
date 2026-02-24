import React, { useMemo } from 'react'
import { Check, Crown } from 'lucide-react'
import type { ResumeTemplate } from '../../types/template'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { useResumeStore, parseExperienceItem } from '../../stores/resumeStore'
import ResumePreview from './ResumePreview'
import Tooltip from '../guidance/Tooltip'

interface TemplateCardProps {
  template: ResumeTemplate
  isSelected?: boolean
  onSelect: (template: ResumeTemplate) => void
  onPreview?: (template: ResumeTemplate) => void
  resumeData?: any // Optional resume data to preview (overrides store data)
}

/**
 * Template Card Component
 *
 * Displays resume template with preview, metadata, and selection state
 *
 * @example
 * ```tsx
 * <TemplateCard
 *   template={template}
 *   isSelected={selectedTemplate?.id === template.id}
 *   onSelect={handleSelect}
 *   onPreview={handlePreview}
 * />
 * ```
 */
export default function TemplateCard({
  template,
  isSelected = false,
  onSelect,
  onPreview,
  resumeData: propResumeData,
}: TemplateCardProps) {
  const { checkFeatureAccess } = useSubscriptionStore()
  const { resumes } = useResumeStore()
  const hasAccess = !template.isPremium || checkFeatureAccess('premium_templates')

  // Use provided resume data or convert from store
  // The resumeStore.Resume uses a flat shape (not nested personalInfo)
  const resumeData = useMemo(() => {
    // If resume data is provided as prop, use it
    if (propResumeData) return propResumeData

    // Otherwise derive from the most recently uploaded resume (index 0)
    const latestResume = resumes && resumes.length > 0 ? resumes[0] : null
    if (!latestResume) return null

    return {
      name: latestResume.name,
      email: latestResume.email,
      phone: latestResume.phone,
      linkedin: latestResume.linkedin,
      location: latestResume.location,
      summary: latestResume.summary,
      skills: latestResume.skills,
      experience: Array.isArray(latestResume.experience)
        ? latestResume.experience.map(parseExperienceItem)
        : undefined,
      education: latestResume.education,
      certifications: latestResume.certifications,
    }
  }, [propResumeData, resumes])

  const handleClick = () => {
    if (hasAccess) {
      onSelect(template)
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'ats-friendly':
        return 'bg-green-500/20 text-green-400'
      case 'modern':
        return 'bg-blue-500/20 text-blue-400'
      case 'creative':
        return 'bg-purple-500/20 text-purple-400'
      case 'executive':
        return 'bg-amber-500/20 text-amber-400'
      case 'minimal':
        return 'bg-gray-500/20 text-gray-400'
      default:
        return 'bg-theme-glass-10 text-theme-secondary'
    }
  }

  return (
    <div
      data-testid="template-card"
      className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-theme'
          : hasAccess
          ? 'border-theme-subtle hover:border-accent cursor-pointer'
          : 'border-theme-subtle opacity-60 cursor-not-allowed'
      }`}
      onClick={handleClick}
    >
      {/* Preview Image */}
      <div className="relative aspect-[8.5/11] overflow-hidden bg-neutral-100">
        {/* Live resume preview rendering with user data */}
        <div className="w-full h-full flex items-start justify-center pt-0 overflow-hidden">
          <ResumePreview template={template} resumeData={resumeData} scale={0.38} />
        </div>

        {/* Premium Badge */}
        {template.isPremium && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-accent rounded-lg shadow-lg">
              <Crown className="w-3 h-3 text-white" />
              <span className="text-xs font-semibold text-white">PRO</span>
            </div>
          </div>
        )}

        {/* Selected Indicator */}
        {isSelected && (
          <div className="absolute top-3 left-3">
            <div className="flex items-center gap-1 px-2 py-1 bg-accent rounded-lg shadow-lg">
              <Check className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white">Selected</span>
            </div>
          </div>
        )}

        {/* Hover Preview Button */}
        {onPreview && hasAccess && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreview(template)
              }}
              className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Preview
            </button>
          </div>
        )}
      </div>

      {/* Template Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-theme text-sm">{template.name}</h3>

          {/* ATS Score Badge */}
          <Tooltip
            tooltipId={`ats-score-${template.id}`}
            content="ATS scores indicate how well a template works with automated resume screening software"
            expandedContent={
              <>
                <p className="mb-2">
                  Companies use Applicant Tracking Systems (ATS) to filter resumes before human review.
                </p>
                <p className="mb-2">
                  <strong>Higher scores (9-10)</strong> are best for corporate roles where ATS systems
                  are common.
                </p>
                <p className="mb-3">
                  <strong>Creative templates (5-7)</strong> prioritize visual appeal over ATS
                  optimization.
                </p>
                <a
                  href="/help"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-400 hover:underline inline-flex items-center gap-1 text-sm"
                >
                  Learn more about ATS →
                </a>
              </>
            }
          >
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 cursor-help ${
                template.atsScore >= 9
                  ? 'bg-green-500/20 text-green-400'
                  : template.atsScore >= 7
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              <span>ATS {template.atsScore}/10</span>
            </div>
          </Tooltip>
        </div>

        <p className="text-xs text-theme-secondary mb-3 line-clamp-2">{template.description}</p>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryBadgeColor(
              template.category
            )}`}
          >
            {template.category}
          </span>
        </div>

        {/* Locked State */}
        {template.isPremium && !hasAccess && (
          <div className="mt-3 pt-3 border-t border-theme-subtle">
            <p className="text-xs text-theme-tertiary">Upgrade to Pro to use this template</p>
          </div>
        )}
      </div>
    </div>
  )
}
