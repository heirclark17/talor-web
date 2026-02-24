import { useState } from 'react'
import { ZoomIn, ZoomOut, Eye } from 'lucide-react'
import ResumePreview from '../templates/ResumePreview'
import { useBuilderStore } from '../../stores/builderStore'
import { useTemplateStore } from '../../stores/templateStore'

interface LivePreviewProps {
  className?: string
}

export default function LivePreview({ className = '' }: LivePreviewProps) {
  const getResumeData = useBuilderStore((s) => s.getResumeData)
  const { selectedTemplate } = useTemplateStore()
  const [scale, setScale] = useState(0.45)

  const resumeData = getResumeData()

  if (!selectedTemplate) {
    return (
      <div className={`flex flex-col items-center justify-center h-full text-theme-tertiary ${className}`}>
        <Eye className="w-10 h-10 mb-3 opacity-40" />
        <p className="text-sm">Select a template to see preview</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Zoom controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <span className="text-xs text-theme-tertiary font-medium">Live Preview</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScale((s) => Math.max(0.25, s - 0.05))}
            className="p-1 rounded hover:bg-theme-glass-10 text-theme-secondary"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-theme-tertiary w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(1, s + 0.05))}
            className="p-1 rounded hover:bg-theme-glass-10 text-theme-secondary"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 flex justify-center">
        <div id="resume-preview-export">
          <ResumePreview
            template={selectedTemplate}
            resumeData={resumeData}
            scale={scale}
          />
        </div>
      </div>
    </div>
  )
}

/** Mobile floating preview button + modal */
export function MobilePreviewFAB() {
  const [open, setOpen] = useState(false)
  const { selectedTemplate } = useTemplateStore()

  if (!selectedTemplate) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95"
        style={{
          background: 'linear-gradient(135deg, var(--accent-color), color-mix(in srgb, var(--accent-color) 80%, #000))',
        }}
      >
        <Eye className="w-6 h-6 text-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-theme-secondary rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="font-semibold text-theme">Preview</span>
              <button
                onClick={() => setOpen(false)}
                className="text-theme-secondary hover:text-theme text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <LivePreview />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
