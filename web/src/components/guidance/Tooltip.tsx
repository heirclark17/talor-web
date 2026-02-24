import React, { useState } from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useOnboardingStore } from '../../stores/onboardingStore'

interface TooltipProps {
  tooltipId: string
  trigger?: React.ReactNode
  content: string
  expandedContent?: React.ReactNode
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({
  tooltipId,
  trigger,
  content,
  expandedContent,
  placement = 'top',
}: TooltipProps) {
  const { isTooltipDismissed, dismissTooltip } = useOnboardingStore()
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't show if dismissed
  if (isTooltipDismissed(tooltipId)) {
    return null
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    dismissTooltip(tooltipId)
  }

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={isExpanded ? true : undefined}>
        <TooltipPrimitive.Trigger asChild>
          <button
            className="inline-flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={() => expandedContent && setIsExpanded(!isExpanded)}
          >
            {trigger || <HelpCircle className="w-4 h-4" />}
          </button>
        </TooltipPrimitive.Trigger>

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={placement}
            sideOffset={5}
            className="z-50 max-w-sm overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg animate-in fade-in-0 zoom-in-95"
          >
            {/* Brief tooltip content */}
            {!isExpanded && (
              <div className="p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{content}</p>
                {expandedContent && (
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Learn more</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Expanded content */}
            {isExpanded && expandedContent && (
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{content}</p>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                    {expandedContent}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 flex items-center gap-1"
                    >
                      <ChevronUp className="w-3 h-3" />
                      <span>Show less</span>
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Don't show again
                    </button>
                  </div>
                </div>
              </div>
            )}

            <TooltipPrimitive.Arrow className="fill-white dark:fill-gray-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
