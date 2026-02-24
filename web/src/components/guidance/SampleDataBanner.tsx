import React from 'react'
import { AlertCircle, Upload, X } from 'lucide-react'

interface SampleDataBannerProps {
  onClear: () => void
  onUploadReal: () => void
}

/**
 * Sample Data Banner Component
 *
 * Sticky banner shown when in sample data mode
 * Warns user they're viewing sample data, not real data
 *
 * @example
 * ```tsx
 * <SampleDataBanner
 *   onClear={() => setSampleDataMode(false)}
 *   onUploadReal={() => navigate('/resumes')}
 * />
 * ```
 */
export default function SampleDataBanner({ onClear, onUploadReal }: SampleDataBannerProps) {
  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 py-3">
          {/* Warning Message */}
          <div className="flex items-center gap-3 flex-1">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">You're viewing sample data</p>
              <p className="text-xs text-white/90">
                This is demo content to help you explore. Upload your resume to get started.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onUploadReal}
              className="flex items-center gap-2 px-4 py-2 bg-white text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors text-sm"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Resume</span>
            </button>
            <button
              onClick={onClear}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Clear sample data"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
