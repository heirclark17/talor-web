import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ResumeTemplate, TemplateFilter } from '../types/template'
import { defaultTemplates } from '../data/templates'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

interface TemplateState {
  selectedTemplate: ResumeTemplate | null
  templates: ResumeTemplate[]
  filter: TemplateFilter
  previewsLoaded: boolean

  // Actions
  setSelectedTemplate: (template: ResumeTemplate) => void
  clearSelectedTemplate: () => void
  getTemplateById: (id: string) => ResumeTemplate | undefined
  filterTemplates: (filter: TemplateFilter) => ResumeTemplate[]
  setFilter: (filter: TemplateFilter) => void
  resetFilter: () => void
  fetchPreviewUrls: () => Promise<void>
}

/**
 * Template Store
 *
 * Manages resume template selection and filtering
 *
 * Usage:
 * ```tsx
 * const { selectedTemplate, setSelectedTemplate } = useTemplateStore()
 *
 * // Select a template
 * setSelectedTemplate(template)
 *
 * // Filter templates
 * const filtered = filterTemplates({ category: 'modern', atsMinScore: 7 })
 * ```
 */
export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      selectedTemplate: null,
      templates: defaultTemplates,
      filter: {},
      previewsLoaded: false,

      setSelectedTemplate: (template: ResumeTemplate) => {
        set({ selectedTemplate: template })
      },

      clearSelectedTemplate: () => {
        set({ selectedTemplate: null })
      },

      getTemplateById: (id: string) => {
        return get().templates.find((t) => t.id === id)
      },

      fetchPreviewUrls: async () => {
        if (get().previewsLoaded) return
        try {
          const res = await fetch(`${API_BASE_URL}/api/templates/previews`)
          if (!res.ok) return
          const data = await res.json()
          const previews: Record<string, string> = data.previews || {}
          // Merge preview URLs into templates
          const updated = get().templates.map((t) => ({
            ...t,
            preview: previews[t.id] || t.preview,
          }))
          set({ templates: updated, previewsLoaded: true })
        } catch {
          // Silently fail - live rendering fallback will be used
        }
      },

      filterTemplates: (filter: TemplateFilter) => {
        const { templates } = get()
        let filtered = templates

        // Filter by category
        if (filter.category) {
          filtered = filtered.filter((t) => t.category === filter.category)
        }

        // Filter by ATS score
        if (filter.atsMinScore !== undefined) {
          filtered = filtered.filter((t) => t.atsScore >= filter.atsMinScore)
        }

        // Filter by premium status
        if (filter.isPremium !== undefined) {
          filtered = filtered.filter((t) => t.isPremium === filter.isPremium)
        }

        // Search by name, description, or tags
        if (filter.search) {
          const searchLower = filter.search.toLowerCase()
          filtered = filtered.filter(
            (t) =>
              t.name.toLowerCase().includes(searchLower) ||
              t.description.toLowerCase().includes(searchLower) ||
              t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
          )
        }

        // Sort by popularity
        return filtered.sort((a, b) => a.popularityRank - b.popularityRank)
      },

      setFilter: (filter: TemplateFilter) => {
        set({ filter })
      },

      resetFilter: () => {
        set({ filter: {} })
      },
    }),
    {
      name: 'template-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist selected template, not all templates or filter
      partialize: (state) => ({
        selectedTemplate: state.selectedTemplate,
      }),
    }
  )
)

// Export selectors
export const selectSelectedTemplate = (state: TemplateState) => state.selectedTemplate
export const selectTemplates = (state: TemplateState) => state.templates
export const selectFilter = (state: TemplateState) => state.filter
