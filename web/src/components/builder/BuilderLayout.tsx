import { useMemo, ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react'
import { useBuilderStore } from '../../stores/builderStore'
import StepNav from './StepNav'
import LivePreview from './LivePreview'
import { MobilePreviewFAB } from './LivePreview'
import TemplateStep from './TemplateStep'
import ContactStep from './ContactStep'
import SummaryStep from './SummaryStep'
import ExperienceStep from './ExperienceStep'
import EducationStep from './EducationStep'
import SkillsStep from './SkillsStep'
import ReviewStep from './ReviewStep'

const TOTAL_STEPS = 7

export default function BuilderLayout() {
  const currentStep = useBuilderStore((s) => s.currentStep)
  const setStep = useBuilderStore((s) => s.setStep)
  const contactInfo = useBuilderStore((s) => s.contactInfo)
  const summary = useBuilderStore((s) => s.summary)
  const experiences = useBuilderStore((s) => s.experiences)
  const educations = useBuilderStore((s) => s.educations)
  const skills = useBuilderStore((s) => s.skills)
  const selectedTemplateId = useBuilderStore((s) => s.selectedTemplateId)

  const completedSteps = useMemo(() => {
    const set = new Set<number>()
    if (selectedTemplateId) set.add(0)
    if (contactInfo.name && contactInfo.email) set.add(1)
    if (summary.trim().length > 0) set.add(2)
    if (experiences.some((e) => e.company && e.title)) set.add(3)
    if (educations.some((e) => e.school)) set.add(4)
    if (skills.length > 0) set.add(5)
    // Step 6 (review) is always accessible once others are done
    if (set.size >= 5) set.add(6)
    return set
  }, [selectedTemplateId, contactInfo, summary, experiences, educations, skills])

  const canProceed = completedSteps.has(currentStep)

  const stepContent: Record<number, ReactNode> = {
    0: <TemplateStep />,
    1: <ContactStep />,
    2: <SummaryStep />,
    3: <ExperienceStep />,
    4: <EducationStep />,
    5: <SkillsStep />,
    6: <ReviewStep />,
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-theme mb-1">Resume Builder</h1>
          <p className="text-theme-secondary text-sm">
            Build a professional resume with AI assistance
          </p>
        </div>

        {/* Step Nav */}
        <StepNav
          currentStep={currentStep}
          onStepClick={setStep}
          completedSteps={completedSteps}
        />

        {/* Split Layout */}
        <div className="flex gap-6">
          {/* Left: Editor */}
          <div className="flex-1 min-w-0 lg:max-w-[55%]">
            <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
              {stepContent[currentStep]}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep < TOTAL_STEPS - 1 && (
                <button
                  onClick={() => setStep(currentStep + 1)}
                  disabled={!canProceed}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Live Preview (desktop only) */}
          <div className="hidden lg:block w-[45%] flex-shrink-0">
            <div className="sticky top-6 glass rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              <LivePreview />
            </div>
          </div>
        </div>

        {/* Mobile preview FAB */}
        <MobilePreviewFAB />
      </div>
    </div>
  )
}
