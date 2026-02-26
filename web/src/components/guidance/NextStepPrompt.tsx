import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, X } from 'lucide-react'

interface NextStepPromptProps {
  primaryAction: {
    label: string
    href: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href: string
    onClick?: () => void
  }
  context: string
  autoDismissMs?: number
}

export default function NextStepPrompt({
  primaryAction,
  secondaryAction,
  context,
  autoDismissMs = 10000,
}: NextStepPromptProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (autoDismissMs) {
      const timer = setTimeout(() => {
        setVisible(false)
      }, autoDismissMs)

      return () => clearTimeout(timer)
    }
  }, [autoDismissMs])

  if (!visible) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <div className="glass rounded-xl border border-theme-subtle p-5">
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 p-1 text-theme-tertiary hover:text-theme transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Context */}
        <p className="text-sm text-theme-secondary mb-4 pr-6">{context}</p>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            to={primaryAction.href}
            onClick={primaryAction.onClick}
            className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
          >
            <span>{primaryAction.label}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          {secondaryAction && (
            <Link
              to={secondaryAction.href}
              onClick={secondaryAction.onClick}
              className="px-4 py-2.5 bg-theme-glass-10 text-theme font-medium rounded-lg hover:bg-theme-glass-20 transition-all text-center"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
