import { describe, it, expect } from 'vitest'
import { starStoryApi } from './starStoryApi'

describe('starStoryApi', () => {
  it('should export starStoryApi object', () => {
    expect(starStoryApi).toBeDefined()
    expect(typeof starStoryApi).toBe('object')
  })

  it('should have list method', () => {
    expect(typeof starStoryApi.list).toBe('function')
  })

  it('should have create method', () => {
    expect(typeof starStoryApi.create).toBe('function')
  })

  it('should have update method', () => {
    expect(typeof starStoryApi.update).toBe('function')
  })

  it('should have delete method', () => {
    expect(typeof starStoryApi.delete).toBe('function')
  })

  it('should have generate method', () => {
    expect(typeof starStoryApi.generate).toBe('function')
  })

  it('should have matchToQuestions method', () => {
    expect(typeof starStoryApi.matchToQuestions).toBe('function')
  })
})
