/**
 * Cover Letter API - Generate, CRUD, export
 */
import { api } from './client'

export const coverLetterApi = {
  list: () => api.listCoverLetters(),
  generate: (params: { jobTitle: string; companyName: string; jobDescription: string; tone?: 'professional' | 'enthusiastic' | 'strategic' | 'technical'; tailoredResumeId?: number }) => api.generateCoverLetter(params),
  update: (id: number, params: { content?: string; tone?: string }) => api.updateCoverLetter(id, params),
  delete: (id: number) => api.deleteCoverLetter(id),
  export: (id: number, format: 'docx') => api.exportCoverLetter(id, format),
}
