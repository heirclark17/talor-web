import TemplateGallery from '../templates/TemplateGallery'
import { useBuilderStore } from '../../stores/builderStore'
import { useTemplateStore } from '../../stores/templateStore'
import type { ResumeTemplate } from '../../types/template'

export default function TemplateStep() {
  const setTemplate = useBuilderStore((s) => s.setTemplate)
  const { setSelectedTemplate } = useTemplateStore()

  const handleSelect = (template: ResumeTemplate) => {
    setTemplate(template.id)
    setSelectedTemplate(template)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-theme mb-2">Choose a Template</h2>
      <p className="text-theme-secondary text-sm mb-6">
        Pick a design that fits your style. You can change it anytime.
      </p>
      <TemplateGallery onSelect={handleSelect} />
    </div>
  )
}
