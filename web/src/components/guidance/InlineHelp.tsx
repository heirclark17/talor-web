import React from 'react'
import { ExternalLink } from 'lucide-react'

interface InlineHelpProps {
  text: string
  link?: {
    href: string
    label: string
  }
  className?: string
}

export default function InlineHelp({ text, link, className = '' }: InlineHelpProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <p className="text-sm text-theme-secondary flex-1">{text}</p>
      {link && (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-accent hover:underline inline-flex items-center gap-1 flex-shrink-0"
        >
          <span>{link.label}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}
