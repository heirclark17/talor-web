import { describe, it, expect } from 'vitest'
import { applicationApi } from './applicationApi'

describe('applicationApi', () => {
  it('should export applicationApi object', () => {
    expect(applicationApi).toBeDefined()
    expect(typeof applicationApi).toBe('object')
  })

  it('should have list method', () => {
    expect(typeof applicationApi.list).toBe('function')
  })

  it('should have create method', () => {
    expect(typeof applicationApi.create).toBe('function')
  })

  it('should have update method', () => {
    expect(typeof applicationApi.update).toBe('function')
  })

  it('should have delete method', () => {
    expect(typeof applicationApi.delete).toBe('function')
  })

  it('should have getStats method', () => {
    expect(typeof applicationApi.getStats).toBe('function')
  })
})
