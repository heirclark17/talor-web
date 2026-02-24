import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
  // Activation checklist steps
  activationSteps: {
    upload_resume: boolean
    select_template: boolean
    tailor_resume: boolean
    generate_cover_letter: boolean
  }
  checklistDismissed: boolean

  // Tooltip dismissals
  dismissedTooltips: string[]

  // Feature beacons
  dismissedBeacons: string[]

  // Success celebrations
  celebratedEvents: string[]

  // Sample data mode
  sampleDataMode: boolean

  // Actions
  markStepComplete: (stepId: keyof OnboardingState['activationSteps']) => void
  dismissChecklist: () => void
  dismissTooltip: (tooltipId: string) => void
  dismissBeacon: (beaconId: string) => void
  celebrateEvent: (eventId: string) => void
  toggleSampleMode: () => void
  reset: () => void
  isTooltipDismissed: (tooltipId: string) => boolean
  isBeaconDismissed: (beaconId: string) => boolean
  isEventCelebrated: (eventId: string) => boolean
}

const initialState = {
  activationSteps: {
    upload_resume: false,
    select_template: false,
    tailor_resume: false,
    generate_cover_letter: false,
  },
  checklistDismissed: false,
  dismissedTooltips: [],
  dismissedBeacons: [],
  celebratedEvents: [],
  sampleDataMode: false,
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      markStepComplete: (stepId) =>
        set((state) => ({
          activationSteps: {
            ...state.activationSteps,
            [stepId]: true,
          },
        })),

      dismissChecklist: () =>
        set({
          checklistDismissed: true,
        }),

      dismissTooltip: (tooltipId) =>
        set((state) => ({
          dismissedTooltips: [...state.dismissedTooltips, tooltipId],
        })),

      dismissBeacon: (beaconId) =>
        set((state) => ({
          dismissedBeacons: [...state.dismissedBeacons, beaconId],
        })),

      celebrateEvent: (eventId) =>
        set((state) => ({
          celebratedEvents: [...state.celebratedEvents, eventId],
        })),

      toggleSampleMode: () =>
        set((state) => ({
          sampleDataMode: !state.sampleDataMode,
        })),

      reset: () => set(initialState),

      isTooltipDismissed: (tooltipId) => get().dismissedTooltips.includes(tooltipId),

      isBeaconDismissed: (beaconId) => get().dismissedBeacons.includes(beaconId),

      isEventCelebrated: (eventId) => get().celebratedEvents.includes(eventId),
    }),
    {
      name: 'talor-onboarding-storage',
    }
  )
)
