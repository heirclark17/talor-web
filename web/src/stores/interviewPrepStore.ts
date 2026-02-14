import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '../api/client'

// Interview Prep interface matching API response
export interface InterviewQuestion {
  question: string
  category: string
  why_relevant: string
  sample_answer: string
  star_story_suggestion?: string
}

export interface InterviewPrep {
  tailored_resume_id: number
  company_name: string
  job_title: string
  questions: InterviewQuestion[]
  company_insights: {
    culture?: string
    values?: string[]
    recent_news?: string[]
  }
  talking_points: string[]
  questions_to_ask: string[]
  created_at: string
}

interface InterviewPrepState {
  // Map-based cache: tailored_resume_id -> InterviewPrep data
  prepCache: Map<number, InterviewPrep>

  // Loading states
  loadingIds: Set<number>

  // Actions
  fetchInterviewPrep: (tailoredResumeId: number) => Promise<InterviewPrep | null>
  getCachedPrep: (tailoredResumeId: number) => InterviewPrep | null
  clearCache: () => void
  clearPrepForResume: (tailoredResumeId: number) => void
}

const initialState = {
  prepCache: new Map<number, InterviewPrep>(),
  loadingIds: new Set<number>(),
}

export const useInterviewPrepStore = create<InterviewPrepState>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchInterviewPrep: async (tailoredResumeId: number) => {
        // Check cache first
        const cached = get().prepCache.get(tailoredResumeId)
        if (cached) {
          console.log('[InterviewPrepStore] Returning cached data for resume:', tailoredResumeId)
          return cached
        }

        // Check if already loading
        if (get().loadingIds.has(tailoredResumeId)) {
          console.log('[InterviewPrepStore] Already loading resume:', tailoredResumeId)
          return null
        }

        // Add to loading set
        set((state) => ({
          loadingIds: new Set(state.loadingIds).add(tailoredResumeId),
        }))

        try {
          const result = await api.getInterviewPrep(tailoredResumeId)

          if (result.success && result.data) {
            // Store in cache
            set((state) => {
              const newCache = new Map(state.prepCache)
              newCache.set(tailoredResumeId, result.data)
              const newLoadingIds = new Set(state.loadingIds)
              newLoadingIds.delete(tailoredResumeId)

              return {
                prepCache: newCache,
                loadingIds: newLoadingIds,
              }
            })

            return result.data
          } else {
            console.error('[InterviewPrepStore] Failed to fetch:', result.error)

            // Remove from loading set
            set((state) => {
              const newLoadingIds = new Set(state.loadingIds)
              newLoadingIds.delete(tailoredResumeId)
              return { loadingIds: newLoadingIds }
            })

            return null
          }
        } catch (error) {
          console.error('[InterviewPrepStore] Error fetching interview prep:', error)

          // Remove from loading set
          set((state) => {
            const newLoadingIds = new Set(state.loadingIds)
            newLoadingIds.delete(tailoredResumeId)
            return { loadingIds: newLoadingIds }
          })

          return null
        }
      },

      getCachedPrep: (tailoredResumeId: number) => {
        return get().prepCache.get(tailoredResumeId) || null
      },

      clearCache: () => {
        set({ prepCache: new Map(), loadingIds: new Set() })
      },

      clearPrepForResume: (tailoredResumeId: number) => {
        set((state) => {
          const newCache = new Map(state.prepCache)
          newCache.delete(tailoredResumeId)
          return { prepCache: newCache }
        })
      },
    }),
    {
      name: 'interview-prep-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist the cache, not loading states
        // Convert Map to array for JSON serialization
        prepCache: Array.from(state.prepCache.entries()),
      }),
      // Custom merge to handle Map deserialization
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          prepCache: new Map(persistedState?.prepCache || []),
        }
      },
    }
  )
)

// Selectors for common queries
export const selectIsLoading = (state: InterviewPrepState, tailoredResumeId: number) =>
  state.loadingIds.has(tailoredResumeId)

export const selectHasCachedData = (state: InterviewPrepState, tailoredResumeId: number) =>
  state.prepCache.has(tailoredResumeId)
