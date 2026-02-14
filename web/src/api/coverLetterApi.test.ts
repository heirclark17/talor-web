import { describe, it, expect } from 'vitest'
import { coverLetterApi } from './coverLetterApi'

describe('coverLetterApi', () => {
  it('should export coverLetterApi object', () => {
    expect(coverLetterApi).toBeDefined()
    expect(typeof coverLetterApi).toBe('object')
  })

  it('should have list method', () => {
    expect(typeof coverLetterApi.list).toBe('function')
  })

  it('should have generate method', () => {
    expect(typeof coverLetterApi.generate).toBe('function')
  })

  it('should have update method', () => {
    expect(typeof coverLetterApi.update).toBe('function')
  })

  it('should have delete method', () => {
    expect(typeof coverLetterApi.delete).toBe('function')
  })

  it('should have export method', () => {
    expect(typeof coverLetterApi.export).toBe('function')
  })
})
