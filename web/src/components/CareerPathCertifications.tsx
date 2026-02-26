import { useState, useEffect, useMemo } from 'react'
import { Award, Clock, DollarSign, TrendingUp, BookOpen, CheckCircle, Bookmark, ChevronDown, ChevronRight, ExternalLink, FileQuestion, Calendar, Map, List, ArrowRight, Play } from 'lucide-react'
import type { Certification, StudyMaterial } from '../types/career-plan'

interface CareerPathCertificationsProps {
  certifications: Certification[]
  loading?: boolean
  certificationJourneySummary?: string
}

export default function CareerPathCertifications({ certifications, loading, certificationJourneySummary }: CareerPathCertificationsProps) {
  const [selectedLevel, setSelectedLevel] = useState<'foundation' | 'intermediate' | 'advanced' | 'all'>('all')
  const [viewMode, setViewMode] = useState<'journey' | 'priority'>('journey')
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

  // Journey view: sort by journeyOrder and group by tier
  const journeyCerts = useMemo(() => {
    const sorted = [...certifications].sort((a, b) => (a.journeyOrder ?? 999) - (b.journeyOrder ?? 999))
    const tiers: { tier: string; label: string; certs: typeof certifications }[] = [
      { tier: 'foundation', label: 'Phase 1: Foundation', certs: [] },
      { tier: 'intermediate', label: 'Phase 2: Intermediate', certs: [] },
      { tier: 'advanced', label: 'Phase 3: Advanced', certs: [] },
    ]
    sorted.forEach(cert => {
      const t = cert.tier || cert.level || 'foundation'
      const group = tiers.find(g => g.tier === t)
      if (group) group.certs.push(cert)
      else tiers[0].certs.push(cert) // default to foundation
    })
    return { sorted, tiers: tiers.filter(g => g.certs.length > 0) }
  }, [certifications])

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'foundation': return 'border-green-500/40 bg-green-500/5'
      case 'intermediate': return 'border-yellow-500/40 bg-yellow-500/5'
      case 'advanced': return 'border-red-500/40 bg-red-500/5'
      default: return 'border-theme-subtle bg-theme-glass-5'
    }
  }

  const getTierHeaderColor = (tier: string) => {
    switch (tier) {
      case 'foundation': return 'text-green-400'
      case 'intermediate': return 'text-yellow-400'
      case 'advanced': return 'text-red-400'
      default: return 'text-theme'
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="career-certifications-section">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-theme-secondary">Loading certification recommendations...</p>
      </div>
    )
  }

  if (!certifications || certifications.length === 0) {
    return (
      <div className="p-6 text-center text-theme-secondary" data-testid="career-certifications-section">
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
          <h3 className="text-lg font-semibold text-theme">Recommended Certifications</h3>
          <p className="text-sm text-theme-secondary">
            {certifications.length} certifications • {totalWeeks} weeks total study time
          </p>
        </div>
        <Award className="w-6 h-6 text-blue-500" />
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center gap-2" data-testid="cert-view-toggle">
        <button
          onClick={() => setViewMode('journey')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'journey'
              ? 'bg-blue-500 text-white'
              : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
          }`}
        >
          <Map className="w-4 h-4" />
          Journey
        </button>
        <button
          onClick={() => setViewMode('priority')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'priority'
              ? 'bg-blue-500 text-white'
              : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
          }`}
        >
          <List className="w-4 h-4" />
          Priority
        </button>
      </div>

      {/* Journey Summary Banner */}
      {viewMode === 'journey' && certificationJourneySummary && (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Play className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-theme mb-1">Your Certification Journey</h4>
            <p className="text-sm text-theme-secondary">{certificationJourneySummary}</p>
          </div>
        </div>
      )}

      {/* Level Filters (only show in priority view) */}
      {viewMode === 'priority' && (
        <div className="flex flex-wrap gap-2" data-testid="cert-level-filters">
          <button
            onClick={() => setSelectedLevel('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLevel === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
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
                : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
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
                : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
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
                : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
            }`}
            data-testid="level-filter-advanced"
          >
            Advanced ({certifications.filter(c => c.level === 'advanced').length})
          </button>
        </div>
      )}

      {/* Certification Cards */}
      {viewMode === 'journey' ? (
        /* ===== JOURNEY VIEW ===== */
        <div className="space-y-6">
          {journeyCerts.tiers.map((tierGroup) => (
            <div key={tierGroup.tier} className={`rounded-xl border-2 p-4 ${getTierColor(tierGroup.tier)}`}>
              {/* Tier Header */}
              <h4 className={`text-base font-bold mb-3 flex items-center gap-2 ${getTierHeaderColor(tierGroup.tier)}`}>
                {tierGroup.tier === 'foundation' && <Play className="w-4 h-4" />}
                {tierGroup.tier === 'intermediate' && <TrendingUp className="w-4 h-4" />}
                {tierGroup.tier === 'advanced' && <Award className="w-4 h-4" />}
                {tierGroup.label}
              </h4>

              <div className="space-y-3">
                {tierGroup.certs.map((cert, idx) => {
                  const isExpanded = expandedCerts.has(cert.name)
                  const isSaved = savedCerts.has(cert.name)
                  const globalIndex = journeyCerts.sorted.indexOf(cert)

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
                          {/* Step label + badges */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-theme-glass-10 text-theme-secondary px-2 py-0.5 rounded font-medium">
                              Step {globalIndex + 1} of {journeyCerts.sorted.length}
                            </span>
                            {cert.beginnerEntryPoint && (
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                                <Play className="w-3 h-3" /> START HERE
                              </span>
                            )}
                          </div>
                          {/* Certification Name */}
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-theme" data-testid="cert-name">{cert.name}</h4>
                              <p className="text-sm text-theme-secondary">{cert.certifyingBody}</p>
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
                            <span className="text-xs text-theme-secondary flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {cert.estCostRange}
                            </span>
                            <span className="text-xs text-theme-secondary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cert.estStudyWeeks} weeks
                            </span>
                            {cert.roiRating && (
                              <span className={`text-xs flex items-center gap-1 ${getRoiColor(cert.roiRating)}`}>
                                <TrendingUp className="w-3 h-3" />
                                {cert.roiRating} ROI
                              </span>
                            )}
                          </div>

                          {/* What It Unlocks Preview */}
                          <p className="text-sm text-theme-secondary line-clamp-2">{cert.whatItUnlocks}</p>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
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
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-theme-secondary" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-theme-secondary" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Details (journey mode) */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-4">
                          {/* What It Unlocks (Full) */}
                          <div className="pt-4">
                            <h5 className="text-sm font-semibold text-theme mb-2">What This Certification Unlocks</h5>
                            <p className="text-sm text-theme-secondary">{cert.whatItUnlocks}</p>
                          </div>

                          {/* Why Recommended */}
                          {cert.whyRecommended && (
                            <div>
                              <h5 className="text-sm font-semibold text-theme mb-2">Why Recommended</h5>
                              <p className="text-sm text-theme-secondary">{cert.whyRecommended}</p>
                            </div>
                          )}

                          {/* Skills Gained */}
                          {cert.skillsGained && cert.skillsGained.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-theme mb-2">Skills Gained</h5>
                              <div className="flex flex-wrap gap-2">
                                {cert.skillsGained.map((skill, skillIdx) => (
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
                              <h5 className="text-xs font-semibold text-theme-secondary mb-1">Cost Range</h5>
                              <p className="text-sm text-theme">{cert.estCostRange}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-theme-secondary mb-1">Study Time</h5>
                              <p className="text-sm text-theme">{cert.estStudyWeeks} weeks</p>
                            </div>
                          </div>

                          {/* Study Materials */}
                          {cert.studyMaterials && cert.studyMaterials.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-theme mb-2 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Study Materials ({cert.studyMaterials.length})
                              </h5>
                              <div className="space-y-2">
                                {cert.studyMaterials
                                  .sort((a, b) => (a.recommendedOrder || 0) - (b.recommendedOrder || 0))
                                  .slice(0, 3)
                                  .map((material, mIdx) => (
                                    <div key={mIdx} className="bg-theme-glass-10 rounded-lg p-3">
                                      <h6 className="text-theme font-medium text-sm">{material.title}</h6>
                                      <p className="text-xs text-theme-secondary">{material.provider} - {material.cost}</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Unlocks Next (Journey-specific) */}
                          {cert.unlocksNext && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center gap-2">
                              <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                              <span className="text-sm text-theme-secondary">
                                <span className="text-blue-400 font-semibold">Next:</span> {cert.unlocksNext}
                              </span>
                            </div>
                          )}

                          {/* Official Links */}
                          {cert.officialLinks && cert.officialLinks.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-theme mb-2">Official Links</h5>
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
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
      /* ===== PRIORITY VIEW (original) ===== */
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
                        <p className="text-sm text-theme-secondary">{cert.certifyingBody}</p>
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
                      {cert.priority && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getPriorityColor(cert.priority)}`}
                        >
                          {cert.priority} priority
                        </span>
                      )}
                      <span className="text-xs text-theme-secondary flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {cert.estCostRange}
                      </span>
                      <span className="text-xs text-theme-secondary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {cert.estStudyWeeks} weeks
                      </span>
                      {cert.roiRating && (
                        <span className={`text-xs flex items-center gap-1 ${getRoiColor(cert.roiRating)}`}>
                          <TrendingUp className="w-3 h-3" />
                          {cert.roiRating} ROI
                        </span>
                      )}
                      {cert.studyMaterials && cert.studyMaterials.length > 0 && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {cert.studyMaterials.length} resources
                        </span>
                      )}
                    </div>

                    {/* What It Unlocks Preview */}
                    <p className="text-sm text-theme-secondary line-clamp-2">{cert.whatItUnlocks}</p>
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
                  <div className="px-4 pb-4 space-y-4">
                    {/* What It Unlocks (Full) */}
                    <div className="pt-4">
                      <h5 className="text-sm font-semibold text-theme mb-2">What This Certification Unlocks</h5>
                      <p className="text-sm text-theme-secondary" data-testid="cert-description">{cert.whatItUnlocks}</p>
                    </div>

                    {/* Why Recommended */}
                    {cert.whyRecommended && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2">Why Recommended</h5>
                        <p className="text-sm text-theme-secondary">{cert.whyRecommended}</p>
                      </div>
                    )}

                    {/* Skills Gained */}
                    {cert.skillsGained && cert.skillsGained.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2">Skills Gained</h5>
                        <div className="flex flex-wrap gap-2">
                          {cert.skillsGained.map((skill, skillIdx) => (
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

                    {/* Exam Details */}
                    {cert.examDetails && Object.keys(cert.examDetails).length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2 flex items-center gap-2">
                          <FileQuestion className="w-4 h-4" />
                          Exam Details
                        </h5>
                        <div className="bg-theme-glass-10 rounded-lg p-3 space-y-2">
                          {cert.examDetails.examCode && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">Exam Code:</span>
                              <span className="text-theme font-mono">{cert.examDetails.examCode}</span>
                            </div>
                          )}
                          {cert.examDetails.passingScore && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">Passing Score:</span>
                              <span className="text-theme">{cert.examDetails.passingScore}</span>
                            </div>
                          )}
                          {cert.examDetails.durationMinutes && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">Duration:</span>
                              <span className="text-theme">{cert.examDetails.durationMinutes} minutes</span>
                            </div>
                          )}
                          {cert.examDetails.numQuestions && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">Questions:</span>
                              <span className="text-theme">{cert.examDetails.numQuestions}</span>
                            </div>
                          )}
                          {cert.examDetails.questionTypes && (
                            <div className="flex justify-between text-sm">
                              <span className="text-theme-secondary">Format:</span>
                              <span className="text-theme">{cert.examDetails.questionTypes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Key Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-semibold text-theme-secondary mb-1">Cost Range</h5>
                        <p className="text-sm text-theme" data-testid="cert-cost">{cert.estCostRange}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-theme-secondary mb-1">Study Time</h5>
                        <p className="text-sm text-theme" data-testid="cert-duration">{cert.estStudyWeeks} weeks</p>
                      </div>
                      {cert.difficulty && (
                        <div>
                          <h5 className="text-xs font-semibold text-theme-secondary mb-1">Difficulty</h5>
                          <p className="text-sm text-theme capitalize">{cert.difficulty}</p>
                        </div>
                      )}
                      {cert.roiRating && (
                        <div>
                          <h5 className="text-xs font-semibold text-theme-secondary mb-1">ROI Rating</h5>
                          <p className={`text-sm font-medium capitalize ${getRoiColor(cert.roiRating)}`} data-testid="cert-roi">
                            {cert.roiRating}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Prerequisites */}
                    {cert.prerequisites && cert.prerequisites.length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-theme mb-2">Prerequisites</h5>
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
                        <h5 className="text-sm font-semibold text-theme mb-2">Alternative Certifications</h5>
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
                        <h5 className="text-sm font-semibold text-theme mb-2 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Study Materials ({cert.studyMaterials.length})
                        </h5>
                        <div className="space-y-2">
                          {cert.studyMaterials
                            .sort((a, b) => (a.recommendedOrder || 0) - (b.recommendedOrder || 0))
                            .map((material, mIdx) => (
                              <div key={mIdx} className="bg-theme-glass-10 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-theme-glass-10 px-2 py-0.5 rounded text-theme">
                                      #{material.recommendedOrder || mIdx + 1}
                                    </span>
                                    <span className="text-xs text-theme-secondary uppercase">{material.type}</span>
                                  </div>
                                  <div className="text-right text-xs">
                                    <span className="text-theme">{material.cost}</span>
                                    <span className="text-theme-secondary ml-2">{material.duration}</span>
                                  </div>
                                </div>
                                <h6 className="text-theme font-medium text-sm">{material.title}</h6>
                                <p className="text-xs text-theme-secondary mb-2">{material.provider}</p>
                                {material.description && (
                                  <p className="text-xs text-theme-secondary mb-2 line-clamp-2">{material.description}</p>
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
                        <h5 className="text-sm font-semibold text-theme mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Week-by-Week Study Plan
                        </h5>
                        <div className="space-y-2">
                          {cert.studyPlanWeeks.map((week, wIdx) => (
                            <div key={wIdx} className="bg-theme-glass-10 rounded-lg p-3 flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                                {week.week || wIdx + 1}
                              </div>
                              <div className="flex-1">
                                <div className="text-theme font-medium text-sm">{week.focus}</div>
                                {week.resources && (
                                  <div className="text-xs text-theme-secondary mt-1">📚 {week.resources}</div>
                                )}
                                {week.practice && (
                                  <div className="text-xs text-theme-secondary mt-1">✏️ {week.practice}</div>
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
                        <h5 className="text-sm font-semibold text-theme mb-2">Official Links</h5>
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
                      <div className="bg-theme-glass-5 rounded-lg p-3">
                        <h5 className="text-xs font-semibold text-theme-secondary mb-2">Research Sources</h5>
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
                              <div key={sIdx} className="text-xs text-theme-secondary">• {source}</div>
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
      )}

      {/* Certification Roadmap */}
      {certifications.length > 1 && (
        <div className="bg-theme rounded-lg border border-theme-subtle p-6" data-testid="cert-roadmap">
          <h4 className="font-semibold text-theme mb-4 flex items-center gap-2">
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
                    <div className="w-0.5 flex-1 bg-theme-glass-10 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between mb-1">
                    <h5 className="font-medium text-theme">{cert.name}</h5>
                    <span className="text-xs text-theme-secondary">{cert.estStudyWeeks} weeks</span>
                  </div>
                  <p className="text-sm text-theme-secondary">{cert.certifyingBody} • {getLevelLabel(cert.level)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
