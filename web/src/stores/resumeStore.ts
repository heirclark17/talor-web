import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../api/client'

// Resume interface matching API response
export interface Resume {
  id: number
  filename: string
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  location?: string
  summary?: string
  skills: string[]
  experience?: any[]
  education?: string
  certifications?: string
  skills_count: number
  uploaded_at: string
}

interface ResumeState {
  // Data
  resumes: Resume[]
  selectedResumeId: number | null
  currentAnalysis: any | null

  // Loading states
  loading: boolean
  refreshing: boolean
  deletingId: number | null
  analyzingId: number | null

  // Actions
  fetchResumes: () => Promise<void>
  refreshResumes: () => Promise<void>
  deleteResume: (resumeId: number) => Promise<boolean>
  analyzeResume: (resumeId: number) => Promise<any | null>
  setSelectedResumeId: (id: number | null) => void
  clearAnalysis: () => void
  reset: () => void
}

// Parse experience items that may use "header" field instead of separate title/company.
// Backend stores: {header: "Title, Company", location, dates, bullets}
// Tailored AI may output: {header: "Title – Company | Location | Dates", bullets}
export function parseExperienceItem(exp: any) {
  if (!exp) return { title: '', company: '', location: '', dates: '', bullets: [] }

  let title = exp.title || ''
  let company = exp.company || ''
  let location = exp.location || ''
  let dates = exp.dates || ''
  const bullets = exp.bullets || (exp.description ? [exp.description] : [])

  // If any fields missing and header exists, parse it
  if ((!title || !company || !location || !dates) && exp.header) {
    const h = exp.header as string

    // Try AI format: "Title – Company | Location | Dates"
    const dashMatch = h.match(/^(.+?)\s+[–—-]\s+(.+)$/)
    if (dashMatch) {
      if (!title) title = dashMatch[1].trim()

      // Split the part after the dash by pipes
      const afterDash = dashMatch[2].trim()
      const parts = afterDash.split('|').map(p => p.trim())

      if (parts.length >= 3) {
        // Format: "Company | Location | Dates"
        if (!company) company = parts[0]
        if (!location) location = parts[1]
        if (!dates) dates = parts[2]
      } else if (parts.length === 2) {
        // Format: "Company | Location" or "Company | Dates"
        if (!company) company = parts[0]
        // Heuristic: if second part has numbers/hyphen, it's dates; otherwise location
        const secondPart = parts[1]
        if (/\d{4}|\d{1,2}\/\d{1,2}|\d{1,2}-\d{1,2}/.test(secondPart)) {
          if (!dates) dates = secondPart
        } else {
          if (!location) location = secondPart
        }
      } else {
        // Format: "Company" (no pipes)
        if (!company) company = afterDash
      }
    } else {
      // Fallback: Try comma split for "Title, Company" format
      const lastComma = h.lastIndexOf(',')
      if (lastComma > 0) {
        if (!title) title = h.substring(0, lastComma).trim()
        if (!company) company = h.substring(lastComma + 1).trim()
      } else {
        // Use whole header as title
        if (!title) title = h.trim()
      }
    }
  }

  // Fallback to title_options[0] if still no title but options exist
  if (!title && exp.title_options && exp.title_options.length > 0) {
    title = exp.title_options[0]
  }

  return { title, company, location, dates, bullets }
}

// Normalize backend field names (candidate_name → name, etc.)
function normalizeResume(r: any): Resume {
  const rawExp = r.experience || []
  return {
    id: r.id,
    filename: r.filename,
    name: r.candidate_name || r.name,
    email: r.candidate_email || r.email,
    phone: r.candidate_phone || r.phone,
    linkedin: r.candidate_linkedin || r.linkedin,
    location: r.candidate_location || r.location,
    summary: r.summary,
    skills: r.skills || [],
    experience: Array.isArray(rawExp) ? rawExp.map(parseExperienceItem) : [],
    education: r.education,
    certifications: r.certifications,
    skills_count: r.skills_count ?? (r.skills ? r.skills.length : 0),
    uploaded_at: r.uploaded_at,
  }
}

const initialState = {
  resumes: [],
  selectedResumeId: null,
  currentAnalysis: null,
  loading: false,
  refreshing: false,
  deletingId: null,
  analyzingId: null,
}

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchResumes: async () => {
        set({ loading: true })
        // Guard against the backend hanging indefinitely: if the API does not
        // respond within 15 seconds we clear the loading flag so callers that
        // rely on it (e.g. a local spinner) are unblocked. Preserve existing resumes.
        const timeoutId = setTimeout(() => {
          console.error('[ResumeStore] fetchResumes timed out after 15 s')
          set({ loading: false })
        }, 15_000)
        try {
          const result = await api.listResumes()
          clearTimeout(timeoutId)
          if (result.success && result.data) {
            const resumeList = Array.isArray(result.data.resumes)
              ? result.data.resumes.map(normalizeResume)
              : []
            set({ resumes: resumeList })
          } else {
            set({ resumes: [] })
          }
        } catch (error) {
          clearTimeout(timeoutId)
          set({ resumes: [] })
        } finally {
          clearTimeout(timeoutId)
          set({ loading: false })
        }
      },

      refreshResumes: async () => {
        set({ refreshing: true })
        try {
          const result = await api.listResumes()
          if (result.success && result.data) {
            const resumeList = Array.isArray(result.data.resumes)
              ? result.data.resumes.map(normalizeResume)
              : []
            set({ resumes: resumeList })
          }
        } catch (error) {
        } finally {
          set({ refreshing: false })
        }
      },

      deleteResume: async (resumeId: number) => {
        set({ deletingId: resumeId })
        try {
          const result = await api.deleteResume(resumeId)
          if (result.success) {
            // Remove from local state
            set((state) => ({
              resumes: state.resumes.filter((r) => r.id !== resumeId),
              // Clear selection if deleted resume was selected
              selectedResumeId: state.selectedResumeId === resumeId ? null : state.selectedResumeId,
            }))
            return true
          }
          return false
        } catch (error) {
          return false
        } finally {
          set({ deletingId: null })
        }
      },

      analyzeResume: async (resumeId: number) => {
        set({ analyzingId: resumeId })
        try {
          const result = await api.analyzeResume(resumeId)
          if (result.success && result.data) {
            set({ currentAnalysis: result.data })
            return result.data
          }
          return null
        } catch (error) {
          return null
        } finally {
          set({ analyzingId: null })
        }
      },

      setSelectedResumeId: (id: number | null) => {
        set({ selectedResumeId: id })
      },

      clearAnalysis: () => {
        set({ currentAnalysis: null })
      },

      reset: () => {
        set(initialState)
      },
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist resumes and selectedResumeId, not loading states
        resumes: state.resumes,
        selectedResumeId: state.selectedResumeId,
      }),
    }
  )
)

// Selectors for common derived state
export const selectResumeById = (state: ResumeState, id: number) =>
  state.resumes.find((r) => r.id === id)

export const selectSelectedResume = (state: ResumeState) =>
  state.selectedResumeId ? selectResumeById(state, state.selectedResumeId) : null
