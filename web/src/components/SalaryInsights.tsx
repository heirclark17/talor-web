/**
 * Salary Insights Component
 *
 * Displays salary data with visual charts and negotiation tips
 */

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, MapPin, Briefcase, Info, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getSalaryData,
  getNegotiationTips,
  formatCurrency,
  formatSalaryRange,
  type SalaryInsight,
  type NegotiationTip,
} from '../lib/salaryData'

interface SalaryInsightsProps {
  jobTitle: string
  location?: string
  salaryData?: any // Perplexity salary data from job extraction
  className?: string
}

export default function SalaryInsights({ jobTitle, location, salaryData: perplexitySalaryData, className = '' }: SalaryInsightsProps) {
  const [salaryData, setSalaryData] = useState<SalaryInsight | null>(null)
  const [negotiationTips, setNegotiationTips] = useState<NegotiationTip[]>([])
  const [loading, setLoading] = useState(true)
  const [showTips, setShowTips] = useState(false)
  const [showMarketInsights, setShowMarketInsights] = useState(false)

  useEffect(() => {
    loadSalaryData()
  }, [jobTitle, location, perplexitySalaryData])

  const loadSalaryData = async () => {
    setLoading(true)
    try {
      // Use Perplexity data if available, otherwise fallback to built-in data
      if (perplexitySalaryData && perplexitySalaryData.salary_range) {
        // We have Perplexity data - use it directly
        setSalaryData(null) // Clear built-in data
        setLoading(false)
        return
      }

      // Fallback to built-in data
      const data = await getSalaryData(jobTitle, location)
      if (data) {
        setSalaryData(data)
        setNegotiationTips(getNegotiationTips(data))
      }
    } catch (error) {
      console.error('Failed to load salary data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`glass rounded-xl border border-theme-subtle p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme">Salary Insights</h3>
            <p className="text-sm text-theme-tertiary">Loading market data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Use Perplexity data if available
  if (perplexitySalaryData && perplexitySalaryData.salary_range) {
    return (
      <div className={`glass rounded-xl border border-theme-subtle p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme">Salary Insights</h3>
              <p className="text-sm text-theme-tertiary">Real-time market data for {jobTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Powered by Perplexity
            </span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-theme-glass-5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-theme-tertiary uppercase tracking-wide">Salary Range</span>
            </div>
            <p className="text-xl font-bold text-theme">{perplexitySalaryData.salary_range}</p>
            <p className="text-xs text-theme-tertiary mt-1">Based on current market data</p>
          </div>

          {perplexitySalaryData.median_salary && perplexitySalaryData.median_salary !== "Data not available" && (
            <div className="bg-theme-glass-5 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xs text-theme-tertiary uppercase tracking-wide">Median Salary</span>
              </div>
              <p className="text-xl font-bold text-theme">{perplexitySalaryData.median_salary}</p>
              <p className="text-xs text-theme-tertiary mt-1">Average market rate</p>
            </div>
          )}
        </div>

        {location && (
          <div className="mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-theme-secondary">{location}</span>
          </div>
        )}

        {/* Market Insights */}
        {perplexitySalaryData.market_insights && (
          <div className="mb-6">
            <button
              onClick={() => setShowMarketInsights(!showMarketInsights)}
              className="w-full flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                <span className="font-semibold text-theme">Market Analysis & Trends</span>
              </div>
              {showMarketInsights ? (
                <ChevronUp className="w-5 h-5 text-theme-tertiary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-theme-tertiary" />
              )}
            </button>

            {showMarketInsights && (
              <div className="mt-4 p-4 bg-theme-glass-5 rounded-lg">
                <p className="text-sm text-theme-secondary whitespace-pre-wrap leading-relaxed">
                  {perplexitySalaryData.market_insights}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {perplexitySalaryData.sources && perplexitySalaryData.sources.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowTips(!showTips)}
              className="w-full flex items-center justify-between p-4 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors border border-purple-500/20"
            >
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-theme">Data Sources ({perplexitySalaryData.sources.length})</span>
              </div>
              {showTips ? (
                <ChevronUp className="w-5 h-5 text-theme-tertiary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-theme-tertiary" />
              )}
            </button>

            {showTips && (
              <div className="mt-4 space-y-2">
                {perplexitySalaryData.sources.map((source: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-theme-glass-5 rounded-lg border-l-4 border-purple-400"
                  >
                    <a
                      href={source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                    >
                      {source}
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data Source */}
        <div className="pt-4 border-t border-theme-subtle">
          <p className="text-xs text-theme-tertiary text-center">
            Real-time data from Perplexity AI •
            Updated {perplexitySalaryData.last_updated ? new Date(perplexitySalaryData.last_updated).toLocaleDateString() : 'recently'}
          </p>
        </div>
      </div>
    )
  }

  // Fallback to built-in data
  if (!salaryData) {
    return null
  }

  const { baseSalary, totalCompensation, experienceLevel, confidence } = salaryData

  // Calculate percentage position in range for visual indicator
  const medianPercent = ((baseSalary.median - baseSalary.min) / (baseSalary.max - baseSalary.min)) * 100

  return (
    <div className={`glass rounded-xl border border-theme-subtle p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme">Salary Insights</h3>
            <p className="text-sm text-theme-tertiary">Market data for {jobTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              confidence === 'high'
                ? 'bg-green-500/20 text-green-400'
                : confidence === 'medium'
                ? 'bg-yellow-500/20 text-yellow-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {confidence} confidence
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-theme-glass-5 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-theme-tertiary uppercase tracking-wide">Base Salary</span>
          </div>
          <p className="text-2xl font-bold text-theme">{formatCurrency(baseSalary.median)}</p>
          <p className="text-xs text-theme-tertiary mt-1">{formatSalaryRange(baseSalary)}</p>
        </div>

        {totalCompensation && (
          <div className="bg-theme-glass-5 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-xs text-theme-tertiary uppercase tracking-wide">Total Comp</span>
            </div>
            <p className="text-2xl font-bold text-theme">{formatCurrency(totalCompensation.median)}</p>
            <p className="text-xs text-theme-tertiary mt-1">w/ equity & bonus</p>
          </div>
        )}
      </div>

      {/* Salary Range Visualization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-theme">Salary Distribution</span>
          {location && (
            <div className="flex items-center gap-1 text-xs text-theme-tertiary">
              <MapPin className="w-3 h-3" />
              {location}
            </div>
          )}
        </div>

        <div className="relative h-2 bg-theme-glass-10 rounded-full overflow-hidden">
          {/* Range bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-green-500/30 to-blue-500/30" />

          {/* Median indicator */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-green-400 shadow-lg"
            style={{ left: `${medianPercent}%` }}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-theme-tertiary">
          <span>{formatCurrency(baseSalary.min)}</span>
          <span className="font-medium text-green-400">{formatCurrency(baseSalary.median)} median</span>
          <span>{formatCurrency(baseSalary.max)}</span>
        </div>

        {/* Percentile breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center">
            <p className="text-xs text-theme-tertiary mb-1">25th</p>
            <p className="text-sm font-semibold text-theme">{formatCurrency(baseSalary.p25)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-theme-tertiary mb-1">50th (Median)</p>
            <p className="text-sm font-semibold text-green-400">{formatCurrency(baseSalary.median)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-theme-tertiary mb-1">75th</p>
            <p className="text-sm font-semibold text-theme">{formatCurrency(baseSalary.p75)}</p>
          </div>
        </div>
      </div>

      {/* Experience Level Badge */}
      {experienceLevel && (
        <div className="mb-6 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-theme-secondary">
            This data is for{' '}
            <span className="font-semibold text-theme capitalize">{experienceLevel}-level</span> positions
          </span>
        </div>
      )}

      {/* Negotiation Tips Toggle */}
      <button
        onClick={() => setShowTips(!showTips)}
        className="w-full flex items-center justify-between p-4 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors border border-blue-500/20"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-theme">Negotiation Tips ({negotiationTips.length})</span>
        </div>
        {showTips ? (
          <ChevronUp className="w-5 h-5 text-theme-tertiary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-theme-tertiary" />
        )}
      </button>

      {/* Negotiation Tips Content */}
      {showTips && (
        <div className="mt-4 space-y-3">
          {negotiationTips.map((tip, index) => (
            <div
              key={index}
              className="p-4 bg-theme-glass-5 rounded-lg border-l-4 border-blue-400"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-theme-secondary mb-1">
                    <span className="font-semibold text-theme capitalize">{tip.category}:</span>
                  </p>
                  <p className="text-sm text-theme-secondary">{tip.tip}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Data Source */}
      <div className="mt-6 pt-4 border-t border-theme-subtle">
        <p className="text-xs text-theme-tertiary text-center">
          Data from {salaryData.source === 'built-in' ? 'Talor Market Data' : salaryData.source} •
          Updated {new Date(salaryData.lastUpdated).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
