/**
 * STAR Stories API - CRUD, generation, matching
 */
import { api } from './client'

export const starStoryApi = {
  list: (tailoredResumeId?: number) => api.listStarStories(tailoredResumeId),
  create: (data: any) => api.createStarStory(data),
  update: (id: number, data: any) => api.updateStarStory(id, data),
  delete: (id: number) => api.deleteStarStory(id),
  generate: (data: any) => api.generateStarStory(data),
  generateFromExperience: (data: any) => api.generateStarStoryFromExperience(data),
  matchToQuestions: (data: { star_story_ids: number[]; questions: string[] }) => api.matchStarStoriesToQuestions(data),
}
