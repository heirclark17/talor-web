/**
 * Career Path API - Plan generation, management
 */
import { api } from './client'

export const careerPathApi = {
  generateAsync: (intake: any) => api.generateCareerPlanAsync(intake),
  getJobStatus: (jobId: string) => api.getCareerPlanJobStatus(jobId),
  generate: (intake: any) => api.generateCareerPlan(intake),
  get: (id: number) => api.getCareerPlan(id),
  list: () => api.listCareerPlans(),
  refreshEvents: (id: number, location: string) => api.refreshCareerPlanEvents(id, location),
  delete: (id: number) => api.deleteCareerPlan(id),
  deleteAll: () => api.deleteAllCareerPlans(),
  generateTasks: (title: string, industry?: string, bullets?: string[]) => api.generateTasksForRole(title, industry, bullets),
}
