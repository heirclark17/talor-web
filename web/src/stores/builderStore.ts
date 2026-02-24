import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types matching ResumePreview's expected ResumeData
export interface BuilderContactInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
}

export interface BuilderExperience {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface BuilderEducation {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
}

export interface BuilderResumeData {
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  location?: string
  summary?: string
  skills?: string[]
  experience?: Array<{
    company?: string
    title?: string
    location?: string
    dates?: string
    bullets?: string[]
    description?: string
  }>
  education?: string
  certifications?: string
}

interface BuilderState {
  // Data
  contactInfo: BuilderContactInfo
  summary: string
  experiences: BuilderExperience[]
  educations: BuilderEducation[]
  skills: string[]
  certifications: string
  selectedTemplateId: string | null
  currentStep: number

  // Actions
  setContact: (info: Partial<BuilderContactInfo>) => void
  setSummary: (summary: string) => void
  addExperience: () => void
  updateExperience: (id: string, data: Partial<BuilderExperience>) => void
  removeExperience: (id: string) => void
  addExperienceBullet: (expId: string) => void
  updateExperienceBullet: (expId: string, index: number, value: string) => void
  removeExperienceBullet: (expId: string, index: number) => void
  setExperienceBullets: (expId: string, bullets: string[]) => void
  addEducation: () => void
  updateEducation: (id: string, data: Partial<BuilderEducation>) => void
  removeEducation: (id: string) => void
  setSkills: (skills: string[]) => void
  addSkill: (skill: string) => void
  removeSkill: (skill: string) => void
  setCertifications: (certs: string) => void
  setStep: (step: number) => void
  setTemplate: (templateId: string | null) => void
  resetAll: () => void

  // Computed
  getResumeData: () => BuilderResumeData
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function formatDates(startDate: string, endDate: string, current: boolean): string {
  const start = startDate || ''
  const end = current ? 'Present' : endDate || ''
  if (!start && !end) return ''
  if (!start) return end
  if (!end) return start
  return `${start} – ${end}`
}

function formatEducationString(educations: BuilderEducation[]): string {
  return educations
    .filter((e) => e.school)
    .map((e) => {
      const parts: string[] = []
      if (e.degree && e.field) parts.push(`${e.degree} in ${e.field}`)
      else if (e.degree) parts.push(e.degree)
      else if (e.field) parts.push(e.field)
      if (e.school) parts.push(e.school)
      const years = formatDates(e.startDate, e.endDate, false)
      if (years) parts.push(years)
      if (e.gpa) parts.push(`GPA: ${e.gpa}`)
      return parts.join(' | ')
    })
    .join('\n')
}

const emptyContact: BuilderContactInfo = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      contactInfo: { ...emptyContact },
      summary: '',
      experiences: [
        {
          id: generateId(),
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          bullets: [''],
        },
      ],
      educations: [
        {
          id: generateId(),
          school: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
        },
      ],
      skills: [],
      certifications: '',
      selectedTemplateId: null,
      currentStep: 0,

      setContact: (info) =>
        set((s) => ({ contactInfo: { ...s.contactInfo, ...info } })),

      setSummary: (summary) => set({ summary }),

      addExperience: () =>
        set((s) => ({
          experiences: [
            ...s.experiences,
            {
              id: generateId(),
              title: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              bullets: [''],
            },
          ],
        })),

      updateExperience: (id, data) =>
        set((s) => ({
          experiences: s.experiences.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      removeExperience: (id) =>
        set((s) => ({
          experiences: s.experiences.filter((e) => e.id !== id),
        })),

      addExperienceBullet: (expId) =>
        set((s) => ({
          experiences: s.experiences.map((e) =>
            e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
          ),
        })),

      updateExperienceBullet: (expId, index, value) =>
        set((s) => ({
          experiences: s.experiences.map((e) => {
            if (e.id !== expId) return e
            const bullets = [...e.bullets]
            bullets[index] = value
            return { ...e, bullets }
          }),
        })),

      removeExperienceBullet: (expId, index) =>
        set((s) => ({
          experiences: s.experiences.map((e) => {
            if (e.id !== expId) return e
            return { ...e, bullets: e.bullets.filter((_, i) => i !== index) }
          }),
        })),

      setExperienceBullets: (expId, bullets) =>
        set((s) => ({
          experiences: s.experiences.map((e) =>
            e.id === expId ? { ...e, bullets } : e
          ),
        })),

      addEducation: () =>
        set((s) => ({
          educations: [
            ...s.educations,
            {
              id: generateId(),
              school: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              gpa: '',
            },
          ],
        })),

      updateEducation: (id, data) =>
        set((s) => ({
          educations: s.educations.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      removeEducation: (id) =>
        set((s) => ({
          educations: s.educations.filter((e) => e.id !== id),
        })),

      setSkills: (skills) => set({ skills }),

      addSkill: (skill) =>
        set((s) => {
          if (s.skills.includes(skill)) return s
          return { skills: [...s.skills, skill] }
        }),

      removeSkill: (skill) =>
        set((s) => ({ skills: s.skills.filter((sk) => sk !== skill) })),

      setCertifications: (certifications) => set({ certifications }),

      setStep: (currentStep) => set({ currentStep }),

      setTemplate: (selectedTemplateId) => set({ selectedTemplateId }),

      resetAll: () =>
        set({
          contactInfo: { ...emptyContact },
          summary: '',
          experiences: [
            {
              id: generateId(),
              title: '',
              company: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              bullets: [''],
            },
          ],
          educations: [
            {
              id: generateId(),
              school: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              gpa: '',
            },
          ],
          skills: [],
          certifications: '',
          selectedTemplateId: null,
          currentStep: 0,
        }),

      getResumeData: (): BuilderResumeData => {
        const s = get()
        return {
          name: s.contactInfo.name || undefined,
          email: s.contactInfo.email || undefined,
          phone: s.contactInfo.phone || undefined,
          linkedin: s.contactInfo.linkedin || undefined,
          location: s.contactInfo.location || undefined,
          summary: s.summary || undefined,
          skills: s.skills.length > 0 ? s.skills : undefined,
          experience: s.experiences
            .filter((e) => e.company || e.title)
            .map((e) => ({
              company: e.company || undefined,
              title: e.title || undefined,
              location: e.location || undefined,
              dates: formatDates(e.startDate, e.endDate, e.current) || undefined,
              bullets: e.bullets.filter((b) => b.trim()) || undefined,
              description: e.bullets.filter((b) => b.trim()).join('\n') || undefined,
            })),
          education: formatEducationString(s.educations) || undefined,
          certifications: s.certifications || undefined,
        }
      },
    }),
    {
      name: 'resume-builder-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
