import { useState, useEffect } from 'react'
import { Award, Clock, DollarSign, TrendingUp, BookOpen, CheckCircle, Bookmark, ChevronDown, ChevronRight } from 'lucide-react'

interface Certification {
  name: string
  provider: string
  priority: 'high' | 'medium' | 'low'
  why_recommended: string
  skills_gained: string[]
  cost: string
  time_to_complete: string
  difficulty: string
  roi_rating: string
  prerequisites: string
  study_resources: string[]
  exam_details: {
    format: string
    duration: string
    passing_score: string
    validity: string
  }
}

interface RoadmapStep {
  step: number
  certification: string
  timeline: string
  rationale: string
}

interface CertificationData {
  certifications_by_level: {
    entry: Certification[]
    mid: Certification[]
    advanced: Certification[]
  }
  recommended_path: RoadmapStep[]
  personalized_advice: string
}

interface CertificationRecommendationsProps {
  certifications: CertificationData | null
  loading: boolean
}

export default function CertificationRecommendations({ certifications, loading }: CertificationRecommendationsProps) {
  const [selectedLevel, setSelectedLevel] = useState<'entry' | 'mid' | 'advanced' | 'all'>('all')
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set())
  const [savedCerts, setSavedCerts] = useState<Set<string>>(new Set())

  // Load saved certifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved_certifications')
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

    // Save to localStorage
    localStorage.setItem('saved_certifications', JSON.stringify(Array.from(newSaved)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getRoiColor = (roi: string) => {
    switch (roi.toLowerCase()) {
      case 'high':
        return 'text-green-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'entry':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'mid':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'advanced':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getAllCertifications = (): Array<Certification & { level: string }> => {
    if (!certifications) return []

    const allCerts: Array<Certification & { level: string }> = []

    if (certifications.certifications_by_level.entry) {
      allCerts.push(...certifications.certifications_by_level.entry.map(c => ({ ...c, level: 'entry' })))
    }
    if (certifications.certifications_by_level.mid) {
      allCerts.push(...certifications.certifications_by_level.mid.map(c => ({ ...c, level: 'mid' })))
    }
    if (certifications.certifications_by_level.advanced) {
      allCerts.push(...certifications.certifications_by_level.advanced.map(c => ({ ...c, level: 'advanced' })))
    }

    return allCerts
  }

  const getFilteredCertifications = () => {
    const allCerts = getAllCertifications()

    if (selectedLevel === 'all') {
      return allCerts
    }

    return allCerts.filter(c => c.level === selectedLevel)
  }

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="certifications-section">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-theme-secondary">Loading certification recommendations...</p>
      </div>
    )
  }

  if (!certifications) {
    return (
      <div className="p-6 text-center text-theme-secondary" data-testid="certifications-section">
        <p>No certification recommendations available.</p>
      </div>
    )
  }

  const filteredCerts = getFilteredCertifications()

  return (
    <div className="space-y-6" data-testid="certifications-section">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-theme">Recommended Certifications</h3>
          <p className="text-sm text-theme-secondary">Personalized recommendations for your career path</p>
        </div>
        <Award className="w-6 h-6 text-blue-500" />
      </div>

      {/* Level Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedLevel('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
          }`}
        >
          All Levels
        </button>
        <button
          onClick={() => setSelectedLevel('entry')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'entry'
              ? 'bg-green-500 text-white'
              : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
          }`}
          data-testid="level-filter-entry"
        >
          Entry Level
        </button>
        <button
          onClick={() => setSelectedLevel('mid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'mid'
              ? 'bg-yellow-500 text-white'
              : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
          }`}
          data-testid="level-filter-mid"
        >
          Mid Level
        </button>
        <button
          onClick={() => setSelectedLevel('advanced')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedLevel === 'advanced'
              ? 'bg-red-500 text-white'
              : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
          }`}
          data-testid="level-filter-advanced"
        >
          Advanced
        </button>
      </div>

      {/* Certification Cards */}
      <div className="space-y-3">
        {filteredCerts.length === 0 ? (
          <div className="text-center py-8 text-theme-secondary">
            <p>No certifications found for this level.</p>
          </div>
        ) : (
          filteredCerts.map((cert, idx) => {
            const isExpanded = expandedCerts.has(cert.name)
            const isSaved = savedCerts.has(cert.name)

            return (
              <div
                key={idx}
                className="bg-theme rounded-lg border border-theme-subtle overflow-hidden"
                data-testid="cert-card"
              >
                {/* Card Header */}
                <button
                  onClick={() => toggleExpanded(cert.name)}
                  className="w-full px-4 py-4 flex items-start justify-between hover:bg-theme-glass-10 transition-colors text-left"
                >
                  <div className="flex-1 space-y-2">
                    {/* Certification Name */}
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-theme" data-testid="cert-name">{cert.name}</h4>
                        <p className="text-sm text-theme-secondary">{cert.provider}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getLevelColor(cert.level)}`}
                        data-testid="cert-level"
                      >
                        {cert.level}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getPriorityColor(cert.priority)}`}
                      >
                        {cert.priority} priority
                      </span>
                      <span className="text-xs text-theme-secondary flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {cert.cost}
                      </span>
                      <span className="text-xs text-theme-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cert.time_to_complete}
                      </span>
                      <span className={`text-xs flex items-center gap-1 ${getRoiColor(cert.roi_rating)}`}>
                        <TrendingUp className="w-3 h-3" />
                        {cert.roi_rating} ROI
                      </span>
                    </div>
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
                          : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
                      }`}
                      data-testid="save-cert-btn"
                    >
                      <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>

                    {/* Expand Icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-theme-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-theme-secondary" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-theme-subtle">
                    {/* Why Recommended */}
                    <div className="pt-4">
                      <h5 className="text-sm font-semibold text-theme mb-2">Why Recommended</h5>
                      <p className="text-sm text-theme-secondary" data-testid="cert-description">{cert.why_recommended}</p>
                    </div>

                    {/* Skills Gained */}
                    {cert.skills_gained && cert.skills_gained.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2">Skills Gained</h5>
                        <div className="flex flex-wrap gap-2">
                          {cert.skills_gained.map((skill, skillIdx) => (
                            <span
                              key={skillIdx}
                              className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-theme-secondary mb-1">Cost</h5>
                        <p className="text-sm text-theme" data-testid="cert-cost">{cert.cost}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-theme-secondary mb-1">Time to Complete</h5>
                        <p className="text-sm text-theme" data-testid="cert-duration">{cert.time_to_complete}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-theme-secondary mb-1">Difficulty</h5>
                        <p className="text-sm text-theme capitalize">{cert.difficulty}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-theme-secondary mb-1">ROI Rating</h5>
                        <p className={`text-sm font-medium capitalize ${getRoiColor(cert.roi_rating)}`} data-testid="cert-roi">
                          {cert.roi_rating}
                        </p>
                      </div>
                    </div>

                    {/* Prerequisites */}
                    {cert.prerequisites && cert.prerequisites !== 'None' && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2">Prerequisites</h5>
                        <p className="text-sm text-theme-secondary">{cert.prerequisites}</p>
                      </div>
                    )}

                    {/* Exam Details */}
                    {cert.exam_details && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2">Exam Details</h5>
                        <div className="bg-theme-glass-10 rounded-lg p-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">Format:</span>
                            <span className="text-theme">{cert.exam_details.format}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">Duration:</span>
                            <span className="text-theme">{cert.exam_details.duration}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">Passing Score:</span>
                            <span className="text-theme">{cert.exam_details.passing_score}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-theme-secondary">Validity:</span>
                            <span className="text-theme">{cert.exam_details.validity}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Study Resources */}
                    {cert.study_resources && cert.study_resources.length > 0 && (
                      <div data-testid="study-resources">
                        <h5 className="text-sm font-semibold text-theme mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Study Resources
                        </h5>
                        <ul className="space-y-1">
                          {cert.study_resources.map((resource, resIdx) => (
                            <li key={resIdx} className="text-sm text-blue-400 flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <span>{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Recommended Certification Path */}
      {certifications.recommended_path && certifications.recommended_path.length > 0 && (
        <div className="bg-theme rounded-lg border border-theme-subtle p-6" data-testid="cert-roadmap">
          <h4 className="font-semibold text-theme mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recommended Certification Path
          </h4>
          <div className="space-y-4">
            {certifications.recommended_path.map((step, idx) => (
              <div key={idx} className="flex gap-4" data-testid="roadmap-step">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm"
                    data-testid="step-number"
                  >
                    {step.step}
                  </div>
                  {idx < certifications.recommended_path.length - 1 && (
                    <div className="w-0.5 flex-1 bg-theme-glass-10 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-theme">{step.certification}</h5>
                    <span className="text-xs text-theme-secondary">{step.timeline}</span>
                  </div>
                  <p className="text-sm text-theme-secondary">{step.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Advice */}
      {certifications.personalized_advice && (
        <div className="bg-theme rounded-lg border border-theme-subtle p-6">
          <h4 className="font-semibold text-theme mb-3">Personalized Career Advice</h4>
          <p className="text-sm text-theme-secondary leading-relaxed whitespace-pre-line">
            {certifications.personalized_advice}
          </p>
        </div>
      )}
    </div>
  )
}
