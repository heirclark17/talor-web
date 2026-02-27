/**
 * Cover Letter API - Generate, CRUD, export
 */
import { api } from './client'

export const coverLetterApi = {
  list: () => api.listCoverLetters(),
  generate: (params: { jobTitle: string; companyName: string; jobDescription?: string; jobUrl?: string; tone?: 'professional' | 'enthusiastic' | 'strategic' | 'technical'; length?: 'concise' | 'standard' | 'detailed'; focus?: 'leadership' | 'technical' | 'program_management' | 'cross_functional'; tailoredResumeId?: number; baseResumeId?: number }) => api.generateCoverLetter(params),
  update: (id: number, params: { content?: string; tone?: string }) => api.updateCoverLetter(id, params),
  delete: (id: number) => api.deleteCoverLetter(id),
  export: (id: number, format: 'docx' = 'docx') => api.exportCoverLetter(id, format),
}
