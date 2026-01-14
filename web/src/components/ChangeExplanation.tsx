import React, { useState } from 'react'
import { Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'

interface ChangeDetail {
  type: 'added' | 'removed' | 'modified'
  original?: string
  changed?: string
  reason: string
  keywords?: string[]
}

interface Props {
  sectionName: string
  changes: ChangeDetail[]
  originalText: string
  tailoredText: string
}

export default function ChangeExplanation({ sectionName, changes, originalText, tailoredText }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'text-green-400'
      case 'removed':
        return 'text-red-400'
      case 'modified':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return '+'
      case 'removed':
        return '-'
      case 'modified':
        return '~'
      default:
        return '•'
    }
  }

  // Function to highlight differences between original and tailored text
  const highlightDifferences = (original: string, tailored: string) => {
    // Simple word-level diff
    const originalWords = original.split(' ')
    const tailoredWords = tailored.split(' ')

    return { originalWords, tailoredWords }
  }

  if (changes.length === 0) {
    return null
  }

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors w-full"
      >
        <Info className="w-4 h-4" />
        <span>Why was this changed?</span>
        {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Overall comparison */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">ORIGINAL</div>
              <p className="text-sm text-gray-300 leading-relaxed">{originalText}</p>
            </div>
            <div className="border-t border-white/10 pt-3">
              <div className="text-xs font-semibold text-gray-400 mb-2">TAILORED</div>
              <p className="text-sm text-white leading-relaxed">{tailoredText}</p>
            </div>
          </div>

          {/* Detailed changes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Lightbulb className="w-4 h-4" />
              <span>DETAILED CHANGES</span>
            </div>

            {changes.map((change, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-4 space-y-2 border-l-4"
                style={{
                  borderLeftColor:
                    change.type === 'added'
                      ? '#4ade80'
                      : change.type === 'removed'
                      ? '#f87171'
                      : '#fbbf24',
                }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`text-lg font-bold ${getChangeColor(change.type)} flex-shrink-0`}
                  >
                    {getChangeIcon(change.type)}
                  </span>
                  <div className="flex-1 space-y-2">
                    {change.original && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500">Before:</span>
                        <p className="text-sm text-gray-400 line-through">{change.original}</p>
                      </div>
                    )}

                    {change.changed && (
                      <div>
                        <span className="text-xs font-semibold text-gray-500">After:</span>
                        <p className={`text-sm font-medium ${getChangeColor(change.type)}`}>
                          {change.changed}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-white/10">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-300">{change.reason}</p>
                      </div>
                    </div>

                    {change.keywords && change.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {change.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white/10 rounded-full text-xs text-white"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
