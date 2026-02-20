import React, { useState, useMemo } from 'react'
import { Search, Filter, X } from 'lucide-react'
import type { TemplateCategory, ResumeTemplate, TemplateFilter } from '../../types/template'
import TemplateCard from './TemplateCard'
import { useTemplateStore } from '../../stores/templateStore'

interface TemplateGalleryProps {
  onSelect: (template: ResumeTemplate) => void
  onPreview?: (template: ResumeTemplate) => void
}

/**
 * Template Gallery Component
 *
 * Displays filterable grid of resume templates
 *
 * @example
 * ```tsx
 * <TemplateGallery
 *   onSelect={(template) => setSelectedTemplate(template)}
 *   onPreview={(template) => setPreviewTemplate(template)}
 * />
 * ```
 */
export default function TemplateGallery({ onSelect, onPreview }: TemplateGalleryProps) {
  const { selectedTemplate, filterTemplates } = useTemplateStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all')
  const [minAtsScore, setMinAtsScore] = useState(0)
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)

  // Build filter object
  const filter: TemplateFilter = useMemo(() => {
    const f: TemplateFilter = {}
    if (searchQuery) f.search = searchQuery
    if (selectedCategory !== 'all') f.category = selectedCategory
    if (minAtsScore > 0) f.atsMinScore = minAtsScore
    if (showPremiumOnly) f.isPremium = true
    return f
  }, [searchQuery, selectedCategory, minAtsScore, showPremiumOnly])

  // Get filtered templates
  const templates = filterTemplates(filter)

  const categories: Array<{ value: TemplateCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Templates' },
    { value: 'ats-friendly', label: 'ATS-Friendly' },
    { value: 'modern', label: 'Modern' },
    { value: 'minimal', label: 'Minimal' },
    { value: 'executive', label: 'Executive' },
    { value: 'creative', label: 'Creative' },
  ]

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || minAtsScore > 0 || showPremiumOnly

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setMinAtsScore(0)
    setShowPremiumOnly(false)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-theme-subtle bg-theme text-theme placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-glass-10 rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-theme-secondary" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-theme-secondary" />
            <span className="text-sm font-medium text-theme-secondary">Filters:</span>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-accent text-white'
                    : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ATS Score Filter */}
          <select
            value={minAtsScore}
            onChange={(e) => setMinAtsScore(Number(e.target.value))}
            className="px-3 py-1.5 bg-theme-glass-10 text-theme-secondary rounded-lg text-sm font-medium border border-theme-subtle focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
          >
            <option value={0}>All ATS Scores</option>
            <option value={7}>ATS 7+</option>
            <option value={8}>ATS 8+</option>
            <option value={9}>ATS 9+</option>
          </select>

          {/* Premium Filter */}
          <button
            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showPremiumOnly
                ? 'bg-accent text-white'
                : 'bg-theme-glass-10 text-theme-secondary hover:bg-theme-glass-20'
            }`}
          >
            Premium Only
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-theme-secondary">
          Showing {templates.length} template{templates.length !== 1 ? 's' : ''}
        </p>
        {selectedTemplate && (
          <p className="text-sm text-theme-secondary">
            Selected: <span className="font-medium text-accent">{selectedTemplate.name}</span>
          </p>
        )}
      </div>

      {/* Template Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-theme-glass-10 mx-auto mb-4 flex items-center justify-center">
            <Search className="w-8 h-8 text-theme-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-theme mb-2">No templates found</h3>
          <p className="text-theme-secondary text-sm mb-4">
            Try adjusting your filters or search query
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
