import React, { useMemo, useState } from 'react'
import { Check, Crown, Star } from 'lucide-react'
import type { ResumeTemplate } from '../../types/template'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import { useResumeStore } from '../../stores/resumeStore'
import { generateTemplatePlaceholder } from '../../utils/generateTemplatePlaceholder'
import ResumePreview from './ResumePreview'

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

  const [imgError, setImgError] = useState(false)

  // Use AI-generated preview if available
  const previewImage = useMemo(() => {
    if (template.preview && !imgError) return template.preview
    return ''
  }, [template.preview, imgError])

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
        ? latestResume.experience.map((exp: any) => ({
            company: exp.company,
            title: exp.title,
            location: exp.location,
            dates: exp.dates,
            bullets: exp.bullets || (exp.description ? [exp.description] : undefined),
            description: exp.description,
          }))
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
        {/* If AI-generated preview image exists, use it. Otherwise render live preview */}
        {previewImage ? (
          <img
            src={previewImage}
            alt={`${template.name} preview`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-start justify-center pt-0 overflow-hidden">
            <ResumePreview template={template} resumeData={resumeData} scale={0.28} />
          </div>
        )}

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
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
              template.atsScore >= 9
                ? 'bg-green-500/20 text-green-400'
                : template.atsScore >= 7
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            <span>ATS {template.atsScore}/10</span>
          </div>
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
