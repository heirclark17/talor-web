import { useMemo } from 'react'

interface ResumeScoreRingProps {
  score: number // 0-100
  size?: number
}

export default function ResumeScoreRing({ score, size = 120 }: ResumeScoreRingProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color = useMemo(() => {
    if (score >= 70) return '#22c55e' // green
    if (score >= 40) return '#eab308' // yellow
    return '#ef4444' // red
  }, [score])

  const label = useMemo(() => {
    if (score >= 80) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Fair'
    if (score >= 30) return 'Needs Work'
    return 'Getting Started'
  }, [score])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/5"
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s ease',
          }}
        />
      </svg>
      {/* Score number overlay */}
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-3xl font-bold text-theme">{score}</span>
        <span className="text-xs text-theme-tertiary">/ 100</span>
      </div>
      <span className="text-sm font-medium" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
