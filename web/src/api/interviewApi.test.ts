import { describe, it, expect } from 'vitest'
import { interviewApi } from './interviewApi'

describe('interviewApi', () => {
  it('should export interviewApi object', () => {
    expect(interviewApi).toBeDefined()
    expect(typeof interviewApi).toBe('object')
  })

  it('should have generate method', () => {
    expect(typeof interviewApi.generate).toBe('function')
  })

  it('should have get method', () => {
    expect(typeof interviewApi.get).toBe('function')
  })

  it('should have list method', () => {
    expect(typeof interviewApi.list).toBe('function')
  })

  it('should have delete method', () => {
    expect(typeof interviewApi.delete).toBe('function')
  })
})
