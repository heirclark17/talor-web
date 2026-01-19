import { useState, useEffect } from 'react'
import { Award, Clock, DollarSign, TrendingUp, BookOpen, CheckCircle, Bookmark, ChevronDown, ChevronRight, ExternalLink, FileQuestion, Calendar } from 'lucide-react'
import type { Certification, StudyMaterial } from '../types/career-plan'

interface CareerPathCertificationsProps {
  certifications: Certification[]
  loading?: boolean
}

export default function CareerPathCertifications({ certifications, loading }: CareerPathCertificationsProps) {
  const [selectedLevel, setSelectedLevel] = useState<'foundation' | 'intermediate' | 'advanced' | 'all'>('all')
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set())
  const [savedCerts, setSavedCerts] = useState<Set<string>>(new Set())

  // Load saved certifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('career_path_saved_certifications')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSavedCerts(new Set(parsed))
      } catch (e) {
        console.error('Error loading saved certifications:', e)
      }
    }
  }, [])

  const toggleExpanded = (certName: string) => {
    const newExpanded = new Set(expandedCerts)
    if (newExpanded.has(certName)) {
      newExpanded.delete(certName)
    } else {
      newExpanded.add(certName)
    }
    setExpandedCerts(newExpanded)
  }

  const toggleSaved = (certName: string) => {
    const newSaved = new Set(savedCerts)
    if (newSaved.has(certName)) {
      newSaved.delete(certName)
    } else {
      newSaved.add(certName)
    }
    setSavedCerts(newSaved)
    localStorage.setItem('career_path_saved_certifications', JSON.stringify(Array.from(newSaved)))
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'foundation':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'intermediate':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'foundation':
        return 'Beginner'
      case 'intermediate':
        return 'Intermediate'
      case 'advanced':
        return 'Advanced'
      default:
        return level
    }
  }

  const getFilteredCertifications = () => {
    if (selectedLevel === 'all') {
      return certifications
    }
    return certifications.filter(c => c.level === selectedLevel)
  }

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="career-certifications-section">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading certification recommendations...</p>
      </div>
    )
  }

  if (!certifications || certifications.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400" data-testid="career-certifications-section">
        <p>No certification recommendations available.</p>
      </div>
    )
  }

  const filteredCerts = getFilteredCertifications()
  const totalWeeks = certifications.reduce((sum, cert) => sum + (cert.estStudyWeeks || 0), 0)

  return (
    <div className="space-y-6" data-testid="career-certifications-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Recommended Certifications</h3>
          <p className="text-sm text-gray-400">
            {certifications.length} certifications • {totalWeeks} weeks total study time
          </p>
        </div>
        <Award className="w-6 h-6 text-blue-500" />
      </div>

      {/* Level Filters */}
      <div className="flex flex-wrap gap-2" data-testid="cert-level-filters">
        <button
          onClick={() => setSelectedLevel('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          data-testid="level-filter-all"
        >
          All Levels ({certifications.length})
        </button>
        <button
          onClick={() => setSelectedLevel('foundation')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'foundation'
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          data-testid="level-filter-foundation"
        >
          Beginner ({certifications.filter(c => c.level === 'foundation').length})
        </button>
        <button
          onClick={() => setSelectedLevel('intermediate')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'intermediate'
              ? 'bg-yellow-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          data-testid="level-filter-intermediate"
        >
          Intermediate ({certifications.filter(c => c.level === 'intermediate').length})
        </button>
        <button
          onClick={() => setSelectedLevel('advanced')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'advanced'
              ? 'bg-red-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
          data-testid="level-filter-advanced"
        >
          Advanced ({certifications.filter(c => c.level === 'advanced').length})
        </button>
      </div>

      {/* Certification Cards */}
      <div className="space-y-3">
        {filteredCerts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No certifications found for this level.</p>
          </div>
        ) : (
          filteredCerts.map((cert, idx) => {
            const isExpanded = expandedCerts.has(cert.name)
            const isSaved = savedCerts.has(cert.name)

            return (
              <div
                key={idx}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
                data-testid="cert-card"
              >
                {/* Card Header */}
                <button
                  onClick={() => toggleExpanded(cert.name)}
                  className="w-full px-4 py-4 flex items-start justify-between hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="flex-1 space-y-2">
                    {/* Certification Name */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white" data-testid="cert-name">{cert.name}</h4>
                        <p className="text-sm text-gray-400">{cert.certifyingBody}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getLevelColor(cert.level)}`}
                        data-testid="cert-level"
                      >
                        {getLevelLabel(cert.level)}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {cert.estCostRange}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cert.estStudyWeeks} weeks
                      </span>
                      {cert.studyMaterials && cert.studyMaterials.length > 0 && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {cert.studyMaterials.length} resources
                        </span>
                      )}
                    </div>

                    {/* What It Unlocks Preview */}
                    <p className="text-sm text-gray-400 line-clamp-2">{cert.whatItUnlocks}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleSaved(cert.name)
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isSaved
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                      data-testid="save-cert-btn"
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-gray-800">
                    {/* What It Unlocks (Full) */}
                    <div className="pt-4">
                      <h5 className="text-sm font-semibold text-white mb-2">What This Certification Unlocks</h5>
                      <p className="text-sm text-gray-300" data-testid="cert-description">{cert.whatItUnlocks}</p>
                    </div>

                    {/* Exam Details */}
                    {cert.examDetails && Object.keys(cert.examDetails).length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <FileQuestion className="w-4 h-4" />
                          Exam Details
                        </h5>
                        <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                          {cert.examDetails.examCode && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Exam Code:</span>
                              <span className="text-white font-mono">{cert.examDetails.examCode}</span>
                            </div>
                          )}
                          {cert.examDetails.passingScore && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Passing Score:</span>
                              <span className="text-white">{cert.examDetails.passingScore}</span>
                            </div>
                          )}
                          {cert.examDetails.durationMinutes && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white">{cert.examDetails.durationMinutes} minutes</span>
                            </div>
                          )}
                          {cert.examDetails.numQuestions && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Questions:</span>
                              <span className="text-white">{cert.examDetails.numQuestions}</span>
                            </div>
                          )}
                          {cert.examDetails.questionTypes && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Format:</span>
                              <span className="text-white">{cert.examDetails.questionTypes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-gray-400 mb-1">Cost Range</h5>
                        <p className="text-sm text-white" data-testid="cert-cost">{cert.estCostRange}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-gray-400 mb-1">Study Time</h5>
                        <p className="text-sm text-white" data-testid="cert-duration">{cert.estStudyWeeks} weeks</p>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {cert.prerequisites && cert.prerequisites.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Prerequisites</h5>
                        <div className="flex flex-wrap gap-2">
                          {cert.prerequisites.map((prereq, prereqIdx) => (
                            <span
                              key={prereqIdx}
                              className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs rounded"
                            >
                              {prereq}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alternatives */}
                    {cert.alternatives && cert.alternatives.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Alternative Certifications</h5>
                        <div className="flex flex-wrap gap-2">
                          {cert.alternatives.map((alt, altIdx) => (
                            <span
                              key={altIdx}
                              className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded"
                            >
                              {alt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Study Materials */}
                    {cert.studyMaterials && cert.studyMaterials.length > 0 && (
                      <div data-testid="study-resources">
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Study Materials ({cert.studyMaterials.length})
                        </h5>
                        <div className="space-y-2">
                          {cert.studyMaterials
                            .sort((a, b) => (a.recommendedOrder || 0) - (b.recommendedOrder || 0))
                            .map((material, mIdx) => (
                              <div key={mIdx} className="bg-gray-800/50 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-white">
                                      #{material.recommendedOrder || mIdx + 1}
                                    </span>
                                    <span className="text-xs text-gray-400 uppercase">{material.type}</span>
                                  </div>
                                  <div className="text-right text-xs">
                                    <span className="text-white">{material.cost}</span>
                                    <span className="text-gray-400 ml-2">{material.duration}</span>
                                  </div>
                                </div>
                                <h6 className="text-white font-medium text-sm">{material.title}</h6>
                                <p className="text-xs text-gray-400 mb-2">{material.provider}</p>
                                {material.description && (
                                  <p className="text-xs text-gray-300 mb-2 line-clamp-2">{material.description}</p>
                                )}
                                {material.url && (
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View Resource
                                  </a>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Week-by-Week Study Plan */}
                    {cert.studyPlanWeeks && cert.studyPlanWeeks.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Week-by-Week Study Plan
                        </h5>
                        <div className="space-y-2">
                          {cert.studyPlanWeeks.map((week, wIdx) => (
                            <div key={wIdx} className="bg-gray-800/50 rounded-lg p-3 flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                                {week.week || wIdx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="text-white font-medium text-sm">{week.focus}</div>
                                {week.resources && (
                                  <div className="text-xs text-gray-400 mt-1">📚 {week.resources}</div>
                                )}
                                {week.practice && (
                                  <div className="text-xs text-gray-400 mt-1">✏️ {week.practice}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Official Links */}
                    {cert.officialLinks && cert.officialLinks.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-white mb-2">Official Links</h5>
                        <div className="space-y-1">
                          {cert.officialLinks.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate">{link}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source Citations */}
                    {cert.sourceCitations && cert.sourceCitations.length > 0 && (
                      <div className="bg-gray-800/30 rounded-lg p-3">
                        <h5 className="text-xs font-semibold text-gray-400 mb-2">Research Sources</h5>
                        <div className="space-y-1">
                          {cert.sourceCitations.map((source, sIdx) => {
                            const isUrl = source.startsWith('http://') || source.startsWith('https://')
                            return isUrl ? (
                              <a
                                key={sIdx}
                                href={source}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-1 text-xs text-blue-400 hover:text-blue-300 break-all"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                {source}
                              </a>
                            ) : (
                              <div key={sIdx} className="text-xs text-gray-400">• {source}</div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Certification Roadmap */}
      {certifications.length > 1 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6" data-testid="cert-roadmap">
          <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recommended Certification Path
          </h4>
          <div className="space-y-4">
            {certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-4" data-testid="roadmap-step">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      cert.level === 'foundation' ? 'bg-green-500 text-white' :
                      cert.level === 'intermediate' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }`}
                    data-testid="step-number"
                  >
                    {idx + 1}
                  </div>
                  {idx < certifications.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-700 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-white">{cert.name}</h5>
                    <span className="text-xs text-gray-400">{cert.estStudyWeeks} weeks</span>
                  </div>
                  <p className="text-sm text-gray-400">{cert.certifyingBody} • {getLevelLabel(cert.level)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
