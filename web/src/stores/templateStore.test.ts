import { describe, it, expect, beforeEach } from 'vitest'
import { useTemplateStore } from './templateStore'
import { defaultTemplates } from '../data/templates'

describe('templateStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useTemplateStore.setState({
      selectedTemplate: null,
      templates: defaultTemplates,
      filter: {},
    })
    localStorage.clear()
  })

  describe('initial state', () => {
    it('has no selected template by default', () => {
      const { selectedTemplate } = useTemplateStore.getState()
      expect(selectedTemplate).toBeNull()
    })

    it('loads default templates', () => {
      const { templates } = useTemplateStore.getState()
      expect(templates).toHaveLength(15)
      expect(templates).toEqual(defaultTemplates)
    })

    it('has no active filters by default', () => {
      const { filter } = useTemplateStore.getState()
      expect(filter).toEqual({})
    })
  })

  describe('setSelectedTemplate', () => {
    it('sets the selected template', () => {
      const { setSelectedTemplate } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)

      expect(useTemplateStore.getState().selectedTemplate).toEqual(template)
    })

    it('persists selected template to localStorage', () => {
      const { setSelectedTemplate } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)

      const stored = localStorage.getItem('template-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.selectedTemplate).toEqual(template)
    })
  })

  describe('clearSelectedTemplate', () => {
    it('clears the selected template', () => {
      const { setSelectedTemplate, clearSelectedTemplate } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)
      expect(useTemplateStore.getState().selectedTemplate).toEqual(template)

      clearSelectedTemplate()
      expect(useTemplateStore.getState().selectedTemplate).toBeNull()
    })
  })

  describe('getTemplateById', () => {
    it('returns template by id', () => {
      const { getTemplateById } = useTemplateStore.getState()
      const template = getTemplateById('classic-professional')

      expect(template).toBeDefined()
      expect(template?.id).toBe('classic-professional')
      expect(template?.name).toBe('Classic Professional')
    })

    it('returns undefined for non-existent id', () => {
      const { getTemplateById } = useTemplateStore.getState()
      const template = getTemplateById('non-existent')

      expect(template).toBeUndefined()
    })
  })

  describe('filterTemplates', () => {
    it('returns all templates with empty filter', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({})

      expect(filtered).toHaveLength(15)
    })

    it('filters by category', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({ category: 'modern' })

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach((template) => {
        expect(template.category).toBe('modern')
      })
    })

    it('filters by ATS score', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({ atsMinScore: 9 })

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach((template) => {
        expect(template.atsScore).toBeGreaterThanOrEqual(9)
      })
    })

    it('filters by premium status', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const premiumOnly = filterTemplates({ isPremium: true })
      const freeOnly = filterTemplates({ isPremium: false })

      premiumOnly.forEach((template) => {
        expect(template.isPremium).toBe(true)
      })

      freeOnly.forEach((template) => {
        expect(template.isPremium).toBe(false)
      })
    })

    it('searches by name', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({ search: 'Modern' })

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach((template) => {
        expect(template.name.toLowerCase()).toContain('modern')
      })
    })

    it('searches by description', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({ search: 'ATS' })

      expect(filtered.length).toBeGreaterThan(0)
      filtered.forEach((template) => {
        const matches =
          template.name.toLowerCase().includes('ats') ||
          template.description.toLowerCase().includes('ats') ||
          template.tags.some((tag) => tag.toLowerCase().includes('ats'))
        expect(matches).toBe(true)
      })
    })

    it('searches by tags', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({ search: 'professional' })

      expect(filtered.length).toBeGreaterThan(0)
    })

    it('combines multiple filters', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({
        category: 'ats-friendly',
        atsMinScore: 9,
        isPremium: false,
      })

      filtered.forEach((template) => {
        expect(template.category).toBe('ats-friendly')
        expect(template.atsScore).toBeGreaterThanOrEqual(9)
        expect(template.isPremium).toBe(false)
      })
    })

    it('sorts results by popularity rank', () => {
      const { filterTemplates } = useTemplateStore.getState()
      const filtered = filterTemplates({})

      for (let i = 1; i < filtered.length; i++) {
        expect(filtered[i].popularityRank).toBeGreaterThanOrEqual(
          filtered[i - 1].popularityRank
        )
      }
    })
  })

  describe('setFilter', () => {
    it('sets the filter', () => {
      const { setFilter } = useTemplateStore.getState()
      const filter = { category: 'modern' as const, atsMinScore: 8 }

      setFilter(filter)

      expect(useTemplateStore.getState().filter).toEqual(filter)
    })
  })

  describe('resetFilter', () => {
    it('resets the filter to empty object', () => {
      const { setFilter, resetFilter } = useTemplateStore.getState()
      const filter = { category: 'modern' as const, atsMinScore: 8 }

      setFilter(filter)
      expect(useTemplateStore.getState().filter).toEqual(filter)

      resetFilter()
      expect(useTemplateStore.getState().filter).toEqual({})
    })
  })

  describe('persistence', () => {
    it('persists selected template to localStorage', () => {
      const { setSelectedTemplate } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)

      const stored = localStorage.getItem('template-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.selectedTemplate).toEqual(template)
    })

    it('restores selected template from localStorage', () => {
      const template = defaultTemplates[1]

      localStorage.setItem(
        'template-storage',
        JSON.stringify({ state: { selectedTemplate: template }, version: 0 })
      )

      const store = useTemplateStore.getState()
      expect(store.selectedTemplate).toEqual(template)
    })

    it('does not persist templates array', () => {
      const { setSelectedTemplate } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)

      const stored = localStorage.getItem('template-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.templates).toBeUndefined()
    })

    it('does not persist filter', () => {
      const { setSelectedTemplate, setFilter } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)
      setFilter({ category: 'modern' })

      const stored = localStorage.getItem('template-storage')
      expect(stored).toBeTruthy()

      const parsed = JSON.parse(stored!)
      expect(parsed.state.filter).toBeUndefined()
    })
  })

  describe('selectors', () => {
    it('selectSelectedTemplate returns selected template', () => {
      const { selectSelectedTemplate } = require('./templateStore')
      const { setSelectedTemplate } = useTemplateStore.getState()
      const template = defaultTemplates[0]

      setSelectedTemplate(template)

      expect(selectSelectedTemplate(useTemplateStore.getState())).toEqual(template)
    })

    it('selectTemplates returns all templates', () => {
      const { selectTemplates } = require('./templateStore')
      expect(selectTemplates(useTemplateStore.getState())).toEqual(defaultTemplates)
    })

    it('selectFilter returns current filter', () => {
      const { selectFilter } = require('./templateStore')
      const { setFilter } = useTemplateStore.getState()
      const filter = { category: 'modern' as const }

      setFilter(filter)

      expect(selectFilter(useTemplateStore.getState())).toEqual(filter)
    })
  })
})
