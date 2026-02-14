import { describe, it, expect } from 'vitest'
import { careerPathApi } from './careerPathApi'

describe('careerPathApi', () => {
  it('should export careerPathApi object', () => {
    expect(careerPathApi).toBeDefined()
    expect(typeof careerPathApi).toBe('object')
  })

  it('should have generate method', () => {
    expect(typeof careerPathApi.generate).toBe('function')
  })

  it('should have get method', () => {
    expect(typeof careerPathApi.get).toBe('function')
  })

  it('should have list method', () => {
    expect(typeof careerPathApi.list).toBe('function')
  })

  it('should have delete method', () => {
    expect(typeof careerPathApi.delete).toBe('function')
  })

  it('should have refreshEvents method', () => {
    expect(typeof careerPathApi.refreshEvents).toBe('function')
  })
})
