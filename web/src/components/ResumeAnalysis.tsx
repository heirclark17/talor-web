import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface Change {
  change_type: 'added' | 'modified' | 'removed'
  impact_level: 'high' | 'medium' | 'low'
  original_text: string | null
  new_text: string | null
  why_this_matters: string
  what_changed: string
  how_it_helps: string
  job_requirements_matched: string[]
  keywords_added: string[]
}

interface Section {
  section_name: string
  changes: Change[]
}

interface Analysis {
  sections: Section[]
}

interface ResumeAnalysisProps {
  analysis: Analysis | null
  loading: boolean
}

export default function ResumeAnalysis({ analysis, loading }: ResumeAnalysisProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set())

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName)
    } else {
      newExpanded.add(sectionName)
    }
    setExpandedSections(newExpanded)
  }

  const toggleChange = (changeId: string) => {
    const newExpanded = new Set(expandedChanges)
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId)
    } else {
      newExpanded.add(changeId)
    }
    setExpandedChanges(newExpanded)
  }

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'low':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'modified':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'removed':
        return <Info className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="resume-analysis">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-theme-secondary">Analyzing resume changes...</p>
      </div>
    )
  }

  if (!analysis || !analysis.sections || analysis.sections.length === 0) {
    return (
      <div className="p-6 text-center text-theme-secondary" data-testid="resume-analysis">
        <p>No analysis available. Generate a tailored resume to see changes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4" data-testid="resume-analysis">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-theme">AI-Powered Change Analysis</h3>
        <span className="text-sm text-theme-secondary">
          {analysis.sections.length} section{analysis.sections.length !== 1 ? 's' : ''} modified
        </span>
      </div>

      {analysis.sections.map((section, sectionIdx) => {
        const isExpanded = expandedSections.has(section.section_name)

        return (
          <div
            key={sectionIdx}
            className="bg-theme rounded-lg border border-gray-800 overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.section_name)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
              data-testid={`section-header-${section.section_name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-theme-secondary" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-theme-secondary" />
                )}
                <span className="font-medium text-theme">{section.section_name}</span>
                <span className="text-sm text-theme-secondary bg-gray-800 px-2 py-1 rounded">
                  {section.changes.length} change{section.changes.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div
                className="px-4 pb-4 space-y-3"
                data-testid={`section-header-${section.section_name.toLowerCase().replace(/\s+/g, '-')}-content`}
              >
                {section.changes.map((change, changeIdx) => {
                  const changeId = `${section.section_name}-${changeIdx}`
                  const isChangeExpanded = expandedChanges.has(changeId)

                  return (
                    <div
                      key={changeIdx}
                      className="bg-gray-800/50 rounded-lg border border-gray-700 p-3"
                      data-testid={`change-item-${changeId}`}
                    >
                      {/* Change Header */}
                      <button
                        onClick={() => toggleChange(changeId)}
                        className="w-full flex items-start justify-between gap-3 text-left"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Change Type */}
                            <span
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium capitalize"
                              data-testid="change-type"
                            >
                              {getChangeTypeIcon(change.change_type)}
                              {change.change_type}
                            </span>

                            {/* Impact Level */}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getImpactColor(change.impact_level)}`}
                              data-testid="impact-level"
                            >
                              {change.impact_level} impact
                            </span>
                          </div>

                          {/* What Changed (Preview) */}
                          <p className="text-sm text-theme-secondary line-clamp-2">
                            {change.what_changed}
                          </p>
                        </div>

                        {isChangeExpanded ? (
                          <ChevronDown className="w-5 h-5 text-theme-secondary flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-theme-secondary flex-shrink-0" />
                        )}
                      </button>

                      {/* Expanded Change Details */}
                      {isChangeExpanded && (
                        <div className="mt-4 space-y-4 pt-4" data-testid="change-explanation">
                          {/* Original vs New Text */}
                          {change.original_text && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-theme-secondary uppercase">Original</p>
                              <p className="text-sm text-theme-secondary italic bg-red-500/5 border-l-2 border-red-500 pl-3 py-2">
                                {change.original_text}
                              </p>
                            </div>
                          )}

                          {change.new_text && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-theme-secondary uppercase">New</p>
                              <p className="text-sm text-green-400 bg-green-500/5 border-l-2 border-green-500 pl-3 py-2">
                                {change.new_text}
                              </p>
                            </div>
                          )}

                          {/* Why This Matters */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-blue-400 uppercase">Why This Matters</p>
                            <p className="text-sm text-theme-secondary">{change.why_this_matters}</p>
                          </div>

                          {/* What Changed */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-yellow-400 uppercase">What Changed</p>
                            <p className="text-sm text-theme-secondary">{change.what_changed}</p>
                          </div>

                          {/* How It Helps */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-green-400 uppercase">How It Helps</p>
                            <p className="text-sm text-theme-secondary">{change.how_it_helps}</p>
                          </div>

                          {/* Job Requirements Matched */}
                          {change.job_requirements_matched && change.job_requirements_matched.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-xs font-semibold text-purple-400 uppercase">Job Requirements Matched</p>
                              <div className="flex flex-wrap gap-2">
                                {change.job_requirements_matched.map((req, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded"
                                  >
                                    {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Keywords Added */}
                          {change.keywords_added && change.keywords_added.length > 0 && (
                            <div className="space-y-2" data-testid="keywords-added">
                              <p className="text-xs font-semibold text-cyan-400 uppercase">Keywords Added</p>
                              <div className="flex flex-wrap gap-2">
                                {change.keywords_added.map((keyword, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded"
                                    data-testid="keyword-badge"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
