import { Sparkles, Loader2 } from 'lucide-react'

interface AIInlineButtonProps {
  label: string
  onClick: () => void
  loading?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
}

export default function AIInlineButton({
  label,
  onClick,
  loading = false,
  disabled = false,
  size = 'md',
}: AIInlineButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'px-2.5 py-1 text-xs gap-1.5'
    : 'px-3.5 py-1.5 text-sm gap-2'
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center ${sizeClasses} rounded-lg font-medium transition-all
        bg-gradient-to-r from-purple-500/15 to-blue-500/15
        border border-purple-500/30
        text-purple-400 hover:text-purple-300
        hover:from-purple-500/25 hover:to-blue-500/25
        hover:border-purple-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.97]`}
    >
      {loading ? (
        <Loader2 className={`${iconSize} animate-spin`} />
      ) : (
        <Sparkles className={iconSize} />
      )}
      {label}
    </button>
  )
}
