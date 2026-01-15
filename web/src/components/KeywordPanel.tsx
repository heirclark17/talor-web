import { useState } from 'react'
import { Search, Briefcase, TrendingUp, Award, Wrench, X } from 'lucide-react'

interface Keyword {
  keyword: string
  why_added: string
  jd_frequency: number
  ats_impact: 'high' | 'medium' | 'low'
  location_in_resume: string
  context: string
}

interface KeywordGroup {
  category: string
  keywords: Keyword[]
}

interface KeywordAnalysis {
  keyword_groups: KeywordGroup[]
  total_keywords_added: number
  ats_optimization_score: number
}

interface KeywordPanelProps {
  keywords: KeywordAnalysis | null
  loading: boolean
}

export default function KeywordPanel({ keywords, loading }: KeywordPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categoryLabels: Record<string, string> = {
    technical_skills: 'Technical Skills',
    soft_skills: 'Soft Skills',
    industry_terms: 'Industry Terms',
    certifications: 'Certifications',
    tools_technologies: 'Tools & Technologies'
  }

  const categoryIcons: Record<string, JSX.Element> = {
    technical_skills: <Briefcase className="w-4 h-4" />,
    soft_skills: <TrendingUp className="w-4 h-4" />,
    industry_terms: <Award className="w-4 h-4" />,
    certifications: <Award className="w-4 h-4" />,
    tools_technologies: <Wrench className="w-4 h-4" />
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const filterKeywords = () => {
    if (!keywords || !keywords.keyword_groups) return []

    let filtered = keywords.keyword_groups

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(group => group.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.map(group => ({
        ...group,
        keywords: group.keywords.filter(k =>
          k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.why_added.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(group => group.keywords.length > 0)
    }

    return filtered
  }

  const scrollToResumeSection = (location: string) => {
    const sectionId = location.toLowerCase().replace(/\s+/g, '-') + '-section'
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      element.classList.add('bg-yellow-500/20')
      setTimeout(() => {
        element.classList.remove('bg-yellow-500/20')
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center" data-testid="keyword-panel">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-400">Analyzing keywords...</p>
      </div>
    )
  }

  if (!keywords || !keywords.keyword_groups || keywords.keyword_groups.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400" data-testid="keyword-panel">
        <p>No keyword analysis available.</p>
      </div>
    )
  }

  const filteredGroups = filterKeywords()

  return (
    <div className="space-y-4" data-testid="keyword-panel">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Keywords Added</h3>
          <p className="text-sm text-gray-400">
            {keywords.total_keywords_added} total keywords • ATS Score: {keywords.ats_optimization_score}/100
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-500">{keywords.ats_optimization_score}</div>
            <div className="text-xs text-gray-400">ATS Score</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          data-testid="keyword-search"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All Categories
        </button>
        {keywords.keyword_groups.map((group) => (
          <button
            key={group.category}
            onClick={() => setSelectedCategory(group.category)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === group.category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            data-testid={`category-filter-${group.category}`}
          >
            {categoryIcons[group.category]}
            {categoryLabels[group.category] || group.category}
            <span className="ml-1 text-xs" data-testid="category-count">
              {group.keywords.length}
            </span>
          </button>
        ))}
      </div>

      {/* Keyword Groups */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No keywords match your search.</p>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.category} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
              {/* Group Header */}
              <div className="flex items-center gap-2 mb-3" data-testid="category-header">
                {categoryIcons[group.category]}
                <h4 className="font-semibold text-white">
                  {categoryLabels[group.category] || group.category}
                </h4>
                <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                  {group.keywords.length}
                </span>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                {group.keywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
                    data-testid="keyword-item"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        {/* Keyword Name */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-white">{keyword.keyword}</span>

                          {/* ATS Impact */}
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border capitalize ${getImpactColor(keyword.ats_impact)}`}
                            data-testid="ats-impact"
                          >
                            {keyword.ats_impact} impact
                          </span>

                          {/* JD Frequency */}
                          <span
                            className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs rounded"
                            data-testid="jd-frequency"
                          >
                            {keyword.jd_frequency}x in JD
                          </span>
                        </div>

                        {/* Why Added */}
                        <p className="text-sm text-gray-400">{keyword.why_added}</p>

                        {/* Context */}
                        {keyword.context && (
                          <p className="text-xs text-gray-500 italic">&ldquo;{keyword.context}&rdquo;</p>
                        )}

                        {/* Location Link */}
                        <button
                          onClick={() => scrollToResumeSection(keyword.location_in_resume)}
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                          data-testid="keyword-location"
                        >
                          📍 {keyword.location_in_resume}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
