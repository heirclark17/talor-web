/**
 * Application Tracking API - CRUD, stats
 */
import { api } from './client'

export const applicationApi = {
  list: (status?: string) => api.listApplications(status),
  create: (data: any) => api.createApplication(data),
  update: (id: number, data: any) => api.updateApplication(id, data),
  delete: (id: number) => api.deleteApplication(id),
  getStats: () => api.getApplicationStats(),
}
