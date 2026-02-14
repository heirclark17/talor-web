import { describe, it, expect, vi, beforeEach } from 'vitest'
import toast from 'react-hot-toast'
import { showSuccess, showError, showInfo } from './toast'

// Mock react-hot-toast
vi.mock('react-hot-toast')

describe('Toast Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showSuccess', () => {
    it('should call toast.success with correct message and styling', () => {
      const message = 'Operation successful!'

      showSuccess(message)

      expect(toast.success).toHaveBeenCalledWith(message, {
        style: {
          background: '#1a1a2e',
          color: '#f0f0f0',
          border: '1px solid rgba(255,255,255,0.1)',
        },
        iconTheme: {
          primary: '#22c55e',
          secondary: '#1a1a2e',
        },
      })
    })
  })

  describe('showError', () => {
    it('should call toast.error with correct message, duration, and styling', () => {
      const message = 'Operation failed!'

      showError(message)

      expect(toast.error).toHaveBeenCalledWith(message, {
        duration: 5000,
        style: {
          background: '#1a1a2e',
          color: '#f0f0f0',
          border: '1px solid rgba(255,255,255,0.1)',
        },
        iconTheme: {
          primary: '#ef4444',
          secondary: '#1a1a2e',
        },
      })
    })
  })

  describe('showInfo', () => {
    it('should call toast with correct message and styling', () => {
      const message = 'Info message'

      showInfo(message)

      expect(toast).toHaveBeenCalledWith(message, {
        style: {
          background: '#1a1a2e',
          color: '#f0f0f0',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      })
    })
  })
})
