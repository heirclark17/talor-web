import { describe, it, expect } from 'vitest'
import {
  sanitizeHTML,
  sanitizeResumeSummary,
  sanitizeResumeBullets,
  sanitizeJobDescription,
  sanitizeUserInput,
  useSanitizedHTML,
  sanitizeObject
} from './sanitizer'

describe('Sanitizer', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags in strict mode', () => {
      const dirty = '<script>alert("XSS")</script>Hello'
      const clean = sanitizeHTML(dirty, 'strict')

      expect(clean).toBe('Hello')
      expect(clean).not.toContain('<script>')
    })

    it('should allow basic formatting in basic mode', () => {
      const dirty = '<b>Bold</b> <script>alert("XSS")</script>'
      const clean = sanitizeHTML(dirty, 'basic')

      expect(clean).toContain('<b>Bold</b>')
      expect(clean).not.toContain('<script>')
    })

    it('should allow rich HTML in rich mode', () => {
      const dirty = '<a href="http://example.com">Link</a>'
      const clean = sanitizeHTML(dirty, 'rich')

      expect(clean).toContain('<a')
      expect(clean).toContain('href')
    })

    it('should return empty string for invalid input', () => {
      expect(sanitizeHTML('', 'basic')).toBe('')
      expect(sanitizeHTML(null as any, 'basic')).toBe('')
    })
  })

  describe('sanitizeResumeSummary', () => {
    it('should preserve line breaks', () => {
      const summary = 'Line 1\nLine 2'
      const clean = sanitizeResumeSummary(summary)

      expect(clean).toContain('<br>')
    })

    it('should return empty for null input', () => {
      expect(sanitizeResumeSummary('')).toBe('')
    })
  })

  describe('sanitizeResumeBullets', () => {
    it('should sanitize array of bullets', () => {
      const bullets = ['<b>Good</b>', '<script>Bad</script>']
      const clean = sanitizeResumeBullets(bullets)

      expect(clean).toHaveLength(2)
      expect(clean[0]).toContain('<b>Good</b>')
      expect(clean[1]).not.toContain('<script>')
    })

    it('should return empty array for invalid input', () => {
      expect(sanitizeResumeBullets(null as any)).toEqual([])
    })
  })

  describe('sanitizeJobDescription', () => {
    it('should use rich mode for job descriptions', () => {
      const desc = '<h2>Job Title</h2><p>Description</p>'
      const clean = sanitizeJobDescription(desc)

      expect(clean).toContain('<h2>')
      expect(clean).toContain('<p>')
    })
  })

  describe('sanitizeUserInput', () => {
    it('should strip all HTML in strict mode', () => {
      const input = '<b>Bold</b> <em>Italic</em> Text'
      const clean = sanitizeUserInput(input)

      expect(clean).toBe('Bold Italic Text')
      expect(clean).not.toContain('<')
    })
  })

  describe('useSanitizedHTML', () => {
    it('should return sanitized HTML and render function', () => {
      const html = '<b>Test</b>'
      const { sanitized, renderSanitized } = useSanitizedHTML(html, 'basic')

      expect(sanitized).toContain('<b>Test</b>')
      expect(renderSanitized()).toHaveProperty('__html')
    })
  })

  describe('sanitizeObject', () => {
    it('should sanitize string values in object', () => {
      const dirty = {
        name: '<script>alert("XSS")</script>John',
        bio: '<b>Developer</b> <script>evil()</script>'
      }

      const clean = sanitizeObject(dirty, 'basic')

      expect(clean.name).toBe('John')
      expect(clean.bio).toContain('<b>Developer</b>')
      expect(clean.bio).not.toContain('<script>')
    })

    it('should sanitize nested objects', () => {
      const dirty = {
        user: {
          name: '<script>XSS</script>Test'
        }
      }

      const clean = sanitizeObject(dirty, 'strict')

      expect(clean.user.name).toBe('Test')
    })

    it('should sanitize arrays', () => {
      const dirty = {
        items: ['<script>Bad</script>', '<b>Good</b>']
      }

      const clean = sanitizeObject(dirty, 'basic')

      expect(clean.items[0]).not.toContain('<script>')
      expect(clean.items[1]).toContain('<b>Good</b>')
    })
  })
})
