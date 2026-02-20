import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowRight, Info, Download, Crown } from 'lucide-react'
import TemplateGallery from '../components/templates/TemplateGallery'
import ResumeSelector from '../components/templates/ResumeSelector'
import ExportButtons from '../components/templates/ExportButtons'
import type { ResumeTemplate } from '../types/template'
import { useTemplateStore } from '../stores/templateStore'
import { useSubscriptionStore } from '../stores/subscriptionStore'
import { useResumeStore } from '../stores/resumeStore'
import { showSuccess, showError } from '../utils/toast'
import ResumePreview from '../components/templates/ResumePreview'

/**
 * Templates Page
 *
 * Browse and select resume templates
 */
export default function Templates() {
  const navigate = useNavigate()
  const { selectedTemplate, setSelectedTemplate } = useTemplateStore()
  const { checkFeatureAccess } = useSubscriptionStore()
  const { latestResume, resumes } = useResumeStore()
  const [previewTemplate, setPreviewTemplate] = useState<ResumeTemplate | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)

  // Get the selected resume or default to latest
  const activeResume = useMemo(() => {
    if (selectedResumeId) {
      return resumes?.find(r => r.id === selectedResumeId) || null
    }
    return latestResume
  }, [selectedResumeId, resumes, latestResume])

  // Convert resume store data to ResumePreview format
  const resumeData = useMemo(() => {
    if (!activeResume) return null

    return {
      name: activeResume.personalInfo?.name || activeResume.personalInfo?.fullName,
      email: activeResume.personalInfo?.email,
      phone: activeResume.personalInfo?.phone,
      linkedin: activeResume.personalInfo?.linkedin,
      location: activeResume.personalInfo?.location,
      summary: activeResume.summary,
      skills: activeResume.skills,
      experience: activeResume.experience?.map(exp => ({
        company: exp.company,
        title: exp.title,
        location: exp.location,
        dates: exp.dates,
        bullets: exp.bullets || (exp.description ? [exp.description] : undefined),
        description: exp.description,
      })),
      education: activeResume.education,
      certifications: activeResume.certifications,
    }
  }, [activeResume])

  const handleSelectTemplate = (template: ResumeTemplate) => {
    if (template.isPremium && !checkFeatureAccess('premium_templates')) {
      showError('This is a premium template. Upgrade to Pro to use it.')
      navigate('/pricing')
      return
    }

    setSelectedTemplate(template)
    showSuccess(`Selected template: ${template.name}`)
  }

  const handleContinueWithTemplate = () => {
    if (!selectedTemplate) {
      showError('Please select a template first')
      return
    }

    // Navigate to resume upload or builder with selected template
    navigate('/tailor-resume')
  }

  const handlePreviewTemplate = (template: ResumeTemplate) => {
    setPreviewTemplate(template)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-theme mb-4">Choose Your Template</h1>
        <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
          Select from professionally designed, ATS-friendly resume templates. Each template is
          optimized for applicant tracking systems while maintaining visual appeal.
        </p>
      </div>

      {/* Resume Selector */}
      <div className="max-w-7xl mx-auto mb-12">
        <ResumeSelector
          selectedResumeId={selectedResumeId}
          onResumeSelect={setSelectedResumeId}
        />
      </div>

      {/* Info Banner */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="glass rounded-xl border border-theme-subtle p-6 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-theme mb-2">About ATS Scores</h3>
            <p className="text-sm text-theme-secondary mb-3">
              ATS (Applicant Tracking System) scores indicate how well a template works with
              automated resume screening software. Higher scores (9-10) are best for corporate
              roles, while creative templates (5-7) prioritize visual impact.
            </p>
            <div className="flex items-center gap-6 text-xs text-theme-tertiary">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>ATS 9-10: Excellent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>ATS 7-8: Good</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>ATS 5-6: Creative</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Gallery */}
      <div className="max-w-7xl mx-auto mb-8">
        <TemplateGallery
          onSelect={handleSelectTemplate}
          onPreview={handlePreviewTemplate}
          resumeData={resumeData}
        />
      </div>

      {/* Selected Template Footer */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-theme-subtle backdrop-blur-xl z-40">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 bg-theme-glass-10 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-theme-secondary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-theme">{selectedTemplate.name}</p>
                    {selectedTemplate.isPremium && (
                      <Crown className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <p className="text-sm text-theme-secondary">
                    {selectedTemplate.category} • ATS {selectedTemplate.atsScore}/10
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Export Buttons */}
                {resumeData && (
                  <div className="hidden md:block">
                    <ExportButtons
                      template={selectedTemplate}
                      resumeData={resumeData}
                      previewElementId="resume-preview-export"
                      variant="inline"
                    />
                  </div>
                )}

                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-lg font-medium transition-colors"
                >
                  Change
                </button>
                <button
                  onClick={handleContinueWithTemplate}
                  className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal (TODO: Implement full preview modal) */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Template preview"
        >
          <div
            className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-4xl rounded-2xl border border-theme-subtle bg-theme p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-theme mb-2">{previewTemplate.name}</h2>
              <p className="text-theme-secondary">{previewTemplate.description}</p>
            </div>

            {/* Live Resume Preview */}
            <div className="aspect-[8.5/11] bg-theme-glass-5 rounded-lg mb-6 flex items-center justify-center overflow-auto">
              <div id="resume-preview-export" className="w-full h-full flex items-center justify-center p-4">
                <ResumePreview template={previewTemplate} resumeData={resumeData} scale={0.65} />
              </div>
            </div>

            {/* Export Buttons */}
            {resumeData && (
              <div className="mb-6">
                <div className="text-center mb-3">
                  <p className="text-sm text-theme-secondary">Download your resume</p>
                </div>
                <ExportButtons
                  template={previewTemplate}
                  resumeData={resumeData}
                  previewElementId="resume-preview-export"
                  variant="inline"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-6 py-2 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSelectTemplate(previewTemplate)
                  setPreviewTemplate(null)
                }}
                className="px-6 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
