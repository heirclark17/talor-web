import React from 'react'
import {
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Award,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Zap,
  Target,
  Users,
  FileText,
  Download,
  Share2
} from 'lucide-react'
import type { OverallFeedback } from '../lib/mockInterview'

interface MockInterviewFeedbackProps {
  feedback: OverallFeedback
  jobTitle: string
  company: string
  onClose: () => void
  onRestart?: () => void
}

export default function MockInterviewFeedback({
  feedback,
  jobTitle,
  company,
  onClose,
  onRestart
}: MockInterviewFeedbackProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-theme-tertiary'
            }`}
          />
        ))}
      </div>
    )
  }

  const getGradeColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-400'
    if (rating >= 3.5) return 'text-blue-400'
    if (rating >= 2.5) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getGradeLetter = (rating: number) => {
    if (rating >= 4.5) return 'A'
    if (rating >= 3.5) return 'B'
    if (rating >= 2.5) return 'C'
    if (rating >= 1.5) return 'D'
    return 'F'
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {feedback.wouldHire ? (
            <ThumbsUp className="w-10 h-10 text-green-400" />
          ) : (
            <Award className="w-10 h-10 text-blue-400" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-theme mb-2">Interview Complete!</h2>
        <p className="text-theme-secondary">
          {jobTitle} at {company}
        </p>
      </div>

      {/* Overall Rating */}
      <div className="glass rounded-2xl border border-theme-subtle p-8 text-center">
        <div className={`text-6xl font-bold mb-2 ${getGradeColor(feedback.overallRating)}`}>
          {getGradeLetter(feedback.overallRating)}
        </div>
        {renderStars(feedback.overallRating)}
        <p className="text-theme-secondary mt-4">Overall Performance</p>

        {feedback.wouldHire && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-green-400">Strong Candidate</span>
          </div>
        )}
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl border border-theme-subtle p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-theme">Communication</h3>
            </div>
            {renderStars(feedback.communication)}
          </div>
          <p className="text-sm text-theme-secondary">
            Clarity, articulation, and professional demeanor
          </p>
        </div>

        <div className="glass rounded-xl border border-theme-subtle p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-theme">Technical Knowledge</h3>
            </div>
            {renderStars(feedback.technicalKnowledge)}
          </div>
          <p className="text-sm text-theme-secondary">
            Depth of expertise and technical understanding
          </p>
        </div>

        <div className="glass rounded-xl border border-theme-subtle p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold text-theme">Problem Solving</h3>
            </div>
            {renderStars(feedback.problemSolving)}
          </div>
          <p className="text-sm text-theme-secondary">
            Analytical thinking and solution approach
          </p>
        </div>

        <div className="glass rounded-xl border border-theme-subtle p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold text-theme">Culture Fit</h3>
            </div>
            {renderStars(feedback.cultureFit)}
          </div>
          <p className="text-sm text-theme-secondary">
            Alignment with company values and team dynamics
          </p>
        </div>
      </div>

      {/* Summary */}
      {feedback.summary && (
        <div className="glass rounded-xl border border-theme-subtle p-6">
          <h3 className="font-semibold text-theme mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Summary
          </h3>
          <p className="text-theme-secondary leading-relaxed">{feedback.summary}</p>
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div className="glass rounded-xl border border-theme-subtle p-6">
          <h3 className="font-semibold text-theme mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-theme-secondary">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.improvements.length > 0 && (
        <div className="glass rounded-xl border border-theme-subtle p-6">
          <h3 className="font-semibold text-theme mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
            Areas for Improvement
          </h3>
          <ul className="space-y-2">
            {feedback.improvements.map((improvement, i) => (
              <li key={i} className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-theme-secondary">{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {feedback.recommendations.length > 0 && (
        <div className="glass rounded-xl border border-theme-subtle p-6">
          <h3 className="font-semibold text-theme mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Recommendations for Next Time
          </h3>
          <ul className="space-y-2">
            {feedback.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-400">{i + 1}</span>
                </div>
                <span className="text-theme-secondary">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {onRestart && (
          <button
            onClick={onRestart}
            className="flex-1 min-w-[200px] px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Try Another Interview
          </button>
        )}

        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Mock Interview Results',
                text: `I completed a mock ${jobTitle} interview with a ${getGradeLetter(feedback.overallRating)} rating!`
              })
            }
          }}
          className="px-6 py-3 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-xl transition-colors font-medium flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-xl transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
