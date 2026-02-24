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

// Normalize backend field names (candidate_name → name, etc.)
function normalizeResume(r: any): Resume {
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
    experience: r.experience || [],
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
