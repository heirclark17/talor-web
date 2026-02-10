import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react'

interface CategoryScore {
  skills_match: number
  experience_relevance: number
  keyword_optimization: number
  role_alignment: number
}

interface Improvement {
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  potential_score_gain: number
  rationale: string
}

interface MatchScoreData {
  overall_score: number
  grade: string
  category_scores: CategoryScore
  strengths: string[]
  gaps: string[]
  improvements: Improvement[]
  explanation: string
}

interface MatchScoreProps {
  matchScore: MatchScoreData | null
  loading: boolean
}

export default function MatchScore({ matchScore, loading }: MatchScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Very Good'
    if (score >= 70) return 'Good'
    if (score >= 60) return 'Fair'
    return 'Needs Improvement'
  }

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
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

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="match-score">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-theme-secondary">Calculating match score...</p>
      </div>
    )
  }

  if (!matchScore) {
    return (
      <div className="p-6 text-center text-theme-secondary" data-testid="match-score">
        <p>No match score available.</p>
      </div>
    )
  }

  // Ensure score is in valid range
  const validatedScore = Math.max(0, Math.min(100, matchScore.overall_score))

  return (
    <div className="space-y-6" data-testid="match-score">
      {/* Overall Score */}
      <div className="bg-theme rounded-lg border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-theme">Match Score</h3>
            <p className="text-sm text-theme-secondary">How well your resume matches this job</p>
          </div>
          <div className="text-right">
            <div className={`text-5xl font-bold ${getScoreColor(validatedScore)}`} data-testid="match-score-value">
              {validatedScore}
            </div>
            <div className="text-sm text-theme-secondary" data-testid="match-score-grade">
              {matchScore.grade || getScoreGrade(validatedScore)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor(validatedScore)} transition-all duration-500`}
            style={{ width: `${validatedScore}%` }}
            data-testid="match-score-bar"
          ></div>
        </div>
      </div>

      {/* Category Breakdowns */}
      <div className="bg-theme rounded-lg border border-gray-800 p-6">
        <h4 className="font-semibold text-theme mb-4">Score Breakdown</h4>
        <div className="space-y-4">
          {Object.entries(matchScore.category_scores).map(([category, score]) => {
            const validatedCategoryScore = Math.max(0, Math.min(100, score))
            const categoryLabel = category
              .split('_')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-theme-secondary">{categoryLabel}</span>
                  <span
                    className={`text-sm font-medium ${getScoreColor(validatedCategoryScore)}`}
                    data-testid={`category-score-${category}`}
                  >
                    {validatedCategoryScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(validatedCategoryScore)} transition-all duration-500`}
                    style={{ width: `${validatedCategoryScore}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-theme rounded-lg border border-gray-800 p-6" data-testid="match-strengths">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-theme">Strengths</h4>
        </div>
        <div className="space-y-2">
          {matchScore.strengths && matchScore.strengths.length > 0 ? (
            matchScore.strengths.map((strength, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-theme-secondary"
                data-testid="strength-item"
              >
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{strength}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-theme-secondary">No strengths identified.</p>
          )}
        </div>
      </div>

      {/* Gaps */}
      {matchScore.gaps && matchScore.gaps.length > 0 && (
        <div className="bg-theme rounded-lg border border-gray-800 p-6" data-testid="match-gaps">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold text-theme">Areas for Improvement</h4>
          </div>
          <div className="space-y-2">
            {matchScore.gaps.map((gap, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-theme-secondary"
                data-testid="gap-item"
              >
                <span className="text-yellow-500 mt-0.5">⚠</span>
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestions */}
      <div className="bg-theme rounded-lg border border-gray-800 p-6" data-testid="improvement-suggestions">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-theme">Recommendations</h4>
        </div>
        <div className="space-y-3">
          {matchScore.improvements && matchScore.improvements.length > 0 ? (
            matchScore.improvements.map((improvement, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 rounded-lg p-4"
                data-testid="suggestion-item"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getPriorityColor(improvement.priority)}`}
                      data-testid="suggestion-priority"
                    >
                      {improvement.priority} priority
                    </span>
                    {improvement.potential_score_gain > 0 && (
                      <span
                        className="px-2 py-1 bg-green-500/10 border border-green-500/20 text-green-500 text-xs rounded flex items-center gap-1"
                        data-testid="potential-gain"
                      >
                        <TrendingUp className="w-3 h-3" />
                        +{improvement.potential_score_gain} points
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-theme mb-2">{improvement.suggestion}</p>
                <p className="text-xs text-theme-secondary">{improvement.rationale}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-theme-secondary">No recommendations at this time.</p>
          )}
        </div>
      </div>

      {/* AI Explanation */}
      <div className="bg-theme rounded-lg border border-gray-800 p-6" data-testid="match-score-explanation">
        <h4 className="font-semibold text-theme mb-3">Detailed Analysis</h4>
        <div className="text-sm text-theme-secondary leading-relaxed whitespace-pre-line">
          {matchScore.explanation}
        </div>
      </div>
    </div>
  )
}
