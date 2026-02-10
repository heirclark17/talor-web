/**
 * Resume API - Upload, parse, list, get, delete, analyze
 */
import { api } from './client'

export const resumeApi = {
  upload: (file: File) => api.uploadResume(file),
  list: () => api.listResumes(),
  get: (id: number) => api.getResume(id),
  delete: (id: number) => api.deleteResume(id),
  analyze: (id: number) => api.analyzeResume(id),
  updateParsedData: (id: number, data: Record<string, any>) => api.updateParsedResumeData(id, data),
}
