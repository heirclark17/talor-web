/**
 * Tailor API - Resume tailoring, comparisons, exports
 */
import { api } from './client'

export const tailorApi = {
  tailorResume: (data: any) => api.tailorResume(data),
  tailorResumeBatch: (data: any) => api.tailorResumeBatch(data),
  getTailoredResume: (id: number) => api.getTailoredResume(id),
  updateTailoredResume: (id: number, data: any) => api.updateTailoredResume(id, data),
  exportResumeAnalysis: (id: number, format: 'pdf' | 'docx') => api.exportResumeAnalysis(id, format),
  analyzeAll: (id: number, force?: boolean) => api.analyzeAll(id, force),
  clearAnalysisCache: (id: number) => api.clearAnalysisCache(id),
  extractJobDetails: (url: string) => api.extractJobDetails(url),
  scoreContentRelevance: (data: any) => api.scoreContentRelevance(data),
  analyzeJobAlignment: (data: any) => api.analyzeJobAlignment(data),
  saveComparison: (data: any) => api.saveComparison(data),
  listSavedComparisons: () => api.listSavedComparisons(),
  getSavedComparison: (id: number) => api.getSavedComparison(id),
  updateSavedComparison: (id: number, data: any) => api.updateSavedComparison(id, data),
  deleteSavedComparison: (id: number) => api.deleteSavedComparison(id),
}
