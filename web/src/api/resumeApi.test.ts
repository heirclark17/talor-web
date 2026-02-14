import { describe, it, expect } from 'vitest'
import { resumeApi } from './resumeApi'

describe('resumeApi', () => {
  it('should export resumeApi object', () => {
    expect(resumeApi).toBeDefined()
    expect(typeof resumeApi).toBe('object')
  })

  it('should have upload method', () => {
    expect(typeof resumeApi.upload).toBe('function')
  })

  it('should have list method', () => {
    expect(typeof resumeApi.list).toBe('function')
  })

  it('should have get method', () => {
    expect(typeof resumeApi.get).toBe('function')
  })

  it('should have delete method', () => {
    expect(typeof resumeApi.delete).toBe('function')
  })

  it('should have analyze method', () => {
    expect(typeof resumeApi.analyze).toBe('function')
  })

  it('should have updateParsedData method', () => {
    expect(typeof resumeApi.updateParsedData).toBe('function')
  })
})
