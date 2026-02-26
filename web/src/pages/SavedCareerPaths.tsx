import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderOpen, Trash2, Eye, Loader, AlertCircle, Plus, CheckSquare, Square,
  ArrowRight, Calendar, Clock, Award, Briefcase, TrendingUp, XCircle
} from 'lucide-react'
import { api } from '../api/client'
import { showError } from '../utils/toast'
import { formatLocalDateTime } from '../utils/dateUtils'
import type { CareerPlanListItem } from '../types/career-plan'

export default function SavedCareerPaths() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<CareerPlanListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await api.listCareerPlans()
      if (!result.success) throw new Error(result.error || 'Failed to load career plans')
      // Backend returns snake_case, api client auto-converts to camelCase
      setPlans(result.data || [])
    } catch (err) {
      console.error('Error fetching career plans:', err)
      setError(err instanceof Error ? err.message : 'Failed to load career plans')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (planId: number) => {
    if (!window.confirm('Delete this career plan? This cannot be undone.')) return
    try {
      setDeletingId(planId)
      const result = await api.deleteCareerPlan(planId)
      if (!result.success) throw new Error(result.error || 'Failed to delete')
      setPlans(prev => prev.filter(p => p.id !== planId))
      setSelectedIds(prev => { const next = new Set(prev); next.delete(planId); return next })
    } catch (err) {
      showError('Failed to delete career plan.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Delete ${selectedIds.size} selected plan${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return
    try {
      setBulkDeleting(true)
      const promises = Array.from(selectedIds).map(id => api.deleteCareerPlan(id))
      await Promise.all(promises)
      setPlans(prev => prev.filter(p => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
    } catch (err) {
      showError('Failed to delete some plans.')
      fetchPlans()
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (plans.length === 0) return
    if (!window.confirm(`Delete ALL ${plans.length} career plans? This cannot be undone.`)) return
    try {
      setBulkDeleting(true)
      const result = await api.deleteAllCareerPlans()
      if (!result.success) throw new Error(result.error || 'Failed to delete all')
      setPlans([])
      setSelectedIds(new Set())
    } catch (err) {
      showError('Failed to delete all plans.')
      fetchPlans()
    } finally {
      setBulkDeleting(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === plans.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(plans.map(p => p.id)))
  }

  const allSelected = plans.length > 0 && selectedIds.size === plans.length

  return (
    <div className="min-h-screen bg-theme relative overflow-hidden">
      <div className="animate-gradient absolute inset-0 z-0"></div>
      <div className="particles-background">
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
        <div className="particle"></div><div className="particle"></div><div className="particle"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme">Saved Career Plans</h1>
                <p className="text-sm sm:text-base text-theme-secondary mt-1">
                  {loading ? 'Loading...' : `${plans.length} plan${plans.length !== 1 ? 's' : ''} saved`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/career-path')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Create New Plan
            </button>
          </div>

          {/* Bulk Actions */}
          {plans.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-xs sm:text-sm text-theme-secondary hover:text-theme transition-colors"
              >
                {allSelected ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4" />}
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs sm:text-sm text-red-400 transition-colors disabled:opacity-50"
                >
                  {bulkDeleting ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Selected ({selectedIds.size})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                disabled={bulkDeleting}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs sm:text-sm text-red-400/80 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Delete All
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              <Loader className="w-12 h-12 text-emerald-400 mx-auto mb-4 animate-spin" />
              <p className="text-theme-secondary text-lg">Loading your career plans...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Plans</h3>
              <p className="text-theme-secondary mb-6">{error}</p>
              <button onClick={fetchPlans} className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-colors">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && plans.length === 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              <FolderOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-theme mb-2">No Career Plans Yet</h3>
              <p className="text-theme-secondary mb-6 max-w-md mx-auto">
                Create your first AI-powered career plan to get personalized recommendations for certifications, skills, and a step-by-step timeline.
              </p>
              <button
                onClick={() => navigate('/career-path')}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Your First Plan
              </button>
            </div>
          </div>
        )}

        {/* Plans List */}
        {!loading && !error && plans.length > 0 && (
          <div className="max-w-6xl mx-auto space-y-4">
            {plans.map(plan => (
              <div key={plan.id} className="glass rounded-2xl p-5 sm:p-6 hover:bg-white/[0.04] transition-all duration-200 group">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelect(plan.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {selectedIds.has(plan.id)
                      ? <CheckSquare className="w-5 h-5 text-emerald-400" />
                      : <Square className="w-5 h-5 text-theme-tertiary hover:text-theme-secondary transition-colors" />
                    }
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-theme truncate">
                        {plan.dreamRole || plan.targetRoles?.[0] || 'Career Plan'}
                      </h3>
                    </div>

                    {/* Transition arrow */}
                    {plan.currentRole && (
                      <div className="flex items-center gap-2 text-sm text-theme-secondary mb-3">
                        <Briefcase className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{plan.currentRole}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="truncate font-medium text-emerald-400">
                          {plan.dreamRole || plan.targetRoles?.[0] || 'Target Role'}
                        </span>
                      </div>
                    )}

                    {/* Industry pills */}
                    {plan.targetIndustries && plan.targetIndustries.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {plan.targetIndustries.slice(0, 4).map((ind, i) => (
                          <span key={i} className="px-2.5 py-0.5 text-xs rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                            {ind}
                          </span>
                        ))}
                        {plan.targetIndustries.length > 4 && (
                          <span className="px-2.5 py-0.5 text-xs rounded-full bg-white/5 text-theme-tertiary">
                            +{plan.targetIndustries.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Profile summary */}
                    {plan.profileSummary && (
                      <p className="text-sm text-theme-secondary line-clamp-2 mb-3">
                        {plan.profileSummary}
                      </p>
                    )}

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-theme-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatLocalDateTime(plan.createdAt)}
                      </span>
                      {plan.timeline && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {plan.timeline}
                        </span>
                      )}
                      {plan.numCertifications > 0 && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5" />
                          {plan.numCertifications} cert{plan.numCertifications !== 1 ? 's' : ''}
                        </span>
                      )}
                      {plan.numProjects > 0 && (
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {plan.numProjects} project{plan.numProjects !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/saved-career-paths/${plan.id}`)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      disabled={deletingId === plan.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {deletingId === plan.id
                        ? <Loader className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
