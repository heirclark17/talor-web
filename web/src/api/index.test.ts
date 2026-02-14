import { describe, it, expect } from 'vitest'
import {
  api,
  resumeApi,
  tailorApi,
  interviewApi,
  starStoryApi,
  careerPathApi,
  applicationApi,
  coverLetterApi
} from './index'

describe('API Index Module', () => {
  it('should export api singleton', () => {
    expect(api).toBeDefined()
    expect(typeof api).toBe('object')
  })

  it('should export resumeApi', () => {
    expect(resumeApi).toBeDefined()
    expect(typeof resumeApi).toBe('object')
  })

  it('should export tailorApi', () => {
    expect(tailorApi).toBeDefined()
    expect(typeof tailorApi).toBe('object')
  })

  it('should export interviewApi', () => {
    expect(interviewApi).toBeDefined()
    expect(typeof interviewApi).toBe('object')
  })

  it('should export starStoryApi', () => {
    expect(starStoryApi).toBeDefined()
    expect(typeof starStoryApi).toBe('object')
  })

  it('should export careerPathApi', () => {
    expect(careerPathApi).toBeDefined()
    expect(typeof careerPathApi).toBe('object')
  })

  it('should export applicationApi', () => {
    expect(applicationApi).toBeDefined()
    expect(typeof applicationApi).toBe('object')
  })

  it('should export coverLetterApi', () => {
    expect(coverLetterApi).toBeDefined()
    expect(typeof coverLetterApi).toBe('object')
  })
})
