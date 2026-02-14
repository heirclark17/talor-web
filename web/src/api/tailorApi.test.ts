import { describe, it, expect } from 'vitest'
import { tailorApi } from './tailorApi'

describe('tailorApi', () => {
  it('should export tailorApi object', () => {
    expect(tailorApi).toBeDefined()
    expect(typeof tailorApi).toBe('object')
  })

  it('should have tailorResume method', () => {
    expect(typeof tailorApi.tailorResume).toBe('function')
  })

  it('should have getTailoredResume method', () => {
    expect(typeof tailorApi.getTailoredResume).toBe('function')
  })

  it('should have updateTailoredResume method', () => {
    expect(typeof tailorApi.updateTailoredResume).toBe('function')
  })

  it('should have extractJobDetails method', () => {
    expect(typeof tailorApi.extractJobDetails).toBe('function')
  })

  it('should have analyzeAll method', () => {
    expect(typeof tailorApi.analyzeAll).toBe('function')
  })

  it('should have saveComparison method', () => {
    expect(typeof tailorApi.saveComparison).toBe('function')
  })
})
