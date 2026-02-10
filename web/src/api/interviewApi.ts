/**
 * Interview Prep API - Generation, questions, practice
 */
import { api } from './client'

export const interviewApi = {
  generate: (id: number) => api.generateInterviewPrep(id),
  get: (id: number) => api.getInterviewPrep(id),
  list: () => api.listInterviewPreps(),
  delete: (id: number) => api.deleteInterviewPrep(id),
  generatePracticeQuestions: (data: any) => api.generatePracticeQuestions(data),
  generateTalkingPoints: (data: any) => api.generateTalkingPoints(data),
  generateValuesAlignment: (data: any) => api.generateValuesAlignment(data),
  calculateInterviewReadiness: (data: any) => api.calculateInterviewReadiness(data),
  generateBehavioralTechnicalQuestions: (data: any) => api.generateBehavioralTechnicalQuestions(data),
  savePracticeResponse: (data: any) => api.savePracticeResponse(data),
  getPracticeResponses: (id: number) => api.getPracticeResponses(id),
  getCompanyResearch: (name: string, industry?: string, title?: string) => api.getCompanyResearch(name, industry, title),
  getCompanyNews: (name: string, industry?: string, title?: string, days?: number) => api.getCompanyNews(name, industry, title, days),
  getCompanyValues: (name: string) => api.getCompanyValues(name),
  getInterviewQuestions: (name: string, title?: string, max?: number) => api.getInterviewQuestions(name, title, max),
  getCertificationRecommendations: (id: number) => api.getCertificationRecommendations(id),
}
