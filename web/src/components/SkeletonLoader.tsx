import React from 'react'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

/**
 * Skeleton loader component for better perceived performance
 * Shows placeholder content while data is loading
 */
export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-theme-glass-10'

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    />
  )
}

/**
 * Card skeleton for loading states
 */
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass rounded-xl p-6 border border-theme-subtle ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={16} />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="90%" />
      </div>
    </div>
  )
}

/**
 * List item skeleton
 */
export function SkeletonListItem({ className = '' }: { className?: string }) {
  return (
    <div className={`glass rounded-xl p-4 border border-theme-subtle flex items-center gap-4 ${className}`}>
      <Skeleton variant="rounded" width={56} height={56} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="50%" height={18} />
        <Skeleton variant="text" width="30%" height={14} />
      </div>
      <Skeleton variant="circular" width={32} height={32} />
    </div>
  )
}

/**
 * Table row skeleton
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-theme-subtle">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton variant="text" width={i === 0 ? '80%' : '60%'} />
        </td>
      ))}
    </tr>
  )
}

/**
 * Resume comparison skeleton
 */
export function SkeletonResumeComparison() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Original Resume */}
      <div className="glass rounded-xl p-6 border border-theme-subtle space-y-4">
        <Skeleton variant="text" width="40%" height={24} />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="60%" height={18} />
              <Skeleton variant="text" width="40%" height={14} />
              <div className="space-y-1 mt-2">
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="85%" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailored Resume */}
      <div className="glass rounded-xl p-6 border border-theme-subtle space-y-4">
        <Skeleton variant="text" width="40%" height={24} />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="60%" height={18} />
              <Skeleton variant="text" width="40%" height={14} />
              <div className="space-y-1 mt-2">
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="90%" />
                <Skeleton variant="text" width="85%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Interview prep skeleton
 */
export function SkeletonInterviewPrep() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={28} />
          <Skeleton variant="text" width={150} height={16} />
        </div>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}

/**
 * Career path skeleton
 */
export function SkeletonCareerPath() {
  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="flex items-center justify-between">
        {Array.from({ length: 5 }).map((_, i) => (
          <React.Fragment key={i}>
            <Skeleton variant="circular" width={40} height={40} />
            {i < 4 && <Skeleton variant="text" width="100%" height={2} className="flex-1 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      {/* Form fields */}
      <div className="glass rounded-xl p-6 border border-theme-subtle space-y-6">
        <Skeleton variant="text" width="30%" height={24} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width="40%" height={14} />
              <Skeleton variant="rounded" width="100%" height={44} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skeleton
