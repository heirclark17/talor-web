import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ResumeTemplate, TemplateFilter } from '../types/template'
import { defaultTemplates } from '../data/templates'

interface TemplateState {
  selectedTemplate: ResumeTemplate | null
  templates: ResumeTemplate[]
  filter: TemplateFilter

  // Actions
  setSelectedTemplate: (template: ResumeTemplate) => void
  clearSelectedTemplate: () => void
  getTemplateById: (id: string) => ResumeTemplate | undefined
  filterTemplates: (filter: TemplateFilter) => ResumeTemplate[]
  setFilter: (filter: TemplateFilter) => void
  resetFilter: () => void
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

      setSelectedTemplate: (template: ResumeTemplate) => {
        set({ selectedTemplate: template })
      },

      clearSelectedTemplate: () => {
        set({ selectedTemplate: null })
      },

      getTemplateById: (id: string) => {
        return get().templates.find((t) => t.id === id)
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
