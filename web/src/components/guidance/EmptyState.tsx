import React from 'react'
import { Link } from 'react-router-dom'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  headline: string
  description: string
  primaryAction?: {
    label: string
    href: string
    onClick?: () => void
  }
  secondaryAction?: {
    label: string
    href: string
    onClick?: () => void
  }
  metric?: string
}

export default function EmptyState({
  icon: Icon,
  headline,
  description,
  primaryAction,
  secondaryAction,
  metric,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="mb-6 rounded-full bg-blue-500/10 p-6">
        <Icon className="w-16 h-16 text-blue-400" />
      </div>

      {/* Headline */}
      <h2 className="text-2xl font-bold text-theme mb-3 text-center">
        {headline}
      </h2>

      {/* Description */}
      <p className="text-theme-secondary text-center max-w-md mb-8">
        {description}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {primaryAction && (
          <Link
            to={primaryAction.href}
            onClick={primaryAction.onClick}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            {primaryAction.label}
          </Link>
        )}

        {secondaryAction && (
          <Link
            to={secondaryAction.href}
            onClick={secondaryAction.onClick}
            className="px-6 py-3 bg-theme-glass-10 text-theme border border-theme-muted font-medium rounded-lg hover:bg-theme-glass-20 transition-all"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>

      {/* Metric */}
      {metric && (
        <p className="text-sm text-theme-tertiary text-center max-w-md">
          {metric}
        </p>
      )}
    </div>
  )
}
