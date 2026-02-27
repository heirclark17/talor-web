/**
 * Cover Letter API - Generate, CRUD, export
 */
import { api } from './client'

export const coverLetterApi = {
  list: () => api.listCoverLetters(),
  generate: (params: { job_title: string; company_name: string; job_description?: string; job_url?: string; tone?: string; tailored_resume_id?: number; base_resume_id?: number }) => api.generateCoverLetter(params),
  update: (id: number, params: { content?: string; tone?: string }) => api.updateCoverLetter(id, params),
  delete: (id: number) => api.deleteCoverLetter(id),
  export: (id: number, format: 'docx') => api.exportCoverLetter(id, format),
}
