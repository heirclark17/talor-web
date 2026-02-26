import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader, AlertCircle, Trash2, Download, FileJson } from 'lucide-react'
import { api } from '../api/client'
import { showError } from '../utils/toast'
import { formatLocalDateTime } from '../utils/dateUtils'
import CareerPlanResults from '../components/CareerPlanResults'
import type { CareerPlan } from '../types/career-plan'

export default function SavedCareerPlanDetail() {
  const { planId } = useParams<{ planId: string }>()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<CareerPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (planId) fetchPlan(Number(planId))
  }, [planId])

  const fetchPlan = async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.getCareerPlan(id)
      if (!result.success) throw new Error(result.error || 'Failed to load career plan')
      // Backend returns { success, plan, plan_id } - plan is the full CareerPlan object
      const planData = result.data?.plan || result.data
      setPlan(planData)
    } catch (err) {
      console.error('Error fetching career plan:', err)
      setError(err instanceof Error ? err.message : 'Failed to load career plan')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!planId) return
    if (!window.confirm('Delete this career plan? This cannot be undone.')) return
    try {
      setDeleting(true)
      const result = await api.deleteCareerPlan(Number(planId))
      if (!result.success) throw new Error(result.error || 'Failed to delete')
      navigate('/saved-career-paths')
    } catch (err) {
      showError('Failed to delete career plan.')
      setDeleting(false)
    }
  }

  const handleExportJSON = () => {
    if (!plan) return
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `career-plan-${planId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    window.print()
  }

  // Derive timeline string from plan data
  const timelineStr = plan?.timeline?.twelveWeekPlan
    ? `${plan.timeline.twelveWeekPlan.length} weeks`
    : '12 weeks'

  return (
    <div className="min-h-screen bg-theme relative overflow-hidden">
      <div className="animate-gradient absolute inset-0 z-0"></div>
      <div className="particles-background">
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Top bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <button
              onClick={() => navigate('/saved-career-paths')}
              className="flex items-center gap-2 text-theme-secondary hover:text-theme transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Saved Plans
            </button>

            {plan && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-xs sm:text-sm text-theme-secondary hover:text-theme transition-colors"
                >
                  <FileJson className="w-4 h-4" />
                  Export JSON
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-xs sm:text-sm text-theme-secondary hover:text-theme transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Print / PDF
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs sm:text-sm transition-colors disabled:opacity-50"
                >
                  {deleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="glass rounded-2xl p-12 text-center">
              <Loader className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
              <p className="text-theme-secondary text-lg">Loading career plan...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Plan</h3>
              <p className="text-theme-secondary mb-6">{error}</p>
              <button
                onClick={() => planId && fetchPlan(Number(planId))}
                className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Plan header + results */}
          {!loading && !error && plan && (
            <>
              <div className="glass rounded-2xl p-5 sm:p-6 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-theme mb-2">
                  {plan.targetRoles?.[0]?.title || 'Career Plan'}
                </h1>
                {plan.profileSummary && (
                  <p className="text-sm text-theme-secondary mb-3">{plan.profileSummary}</p>
                )}
                <p className="text-xs text-theme-tertiary">
                  Generated {plan.generatedAt ? formatLocalDateTime(plan.generatedAt) : 'recently'}
                </p>
              </div>

              <CareerPlanResults
                plan={plan}
                timeline={timelineStr}
                onExportPDF={handleExportPDF}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
