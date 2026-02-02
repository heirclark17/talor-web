import {
  validateHost,
  sanitizeInput,
  generateRequestId,
  isValidStorageKey,
  validateResponseIntegrity,
  rateLimiter,
} from '../security';

describe('Security Utilities', () => {
  describe('validateHost', () => {
    it('should accept trusted hosts', () => {
      expect(
        validateHost('https://resume-ai-backend-production-3134.up.railway.app/api/test')
      ).toBe(true);
    });

    it('should reject untrusted hosts', () => {
      expect(validateHost('https://malicious-site.com/api/test')).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(validateHost('not-a-url')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove angle brackets', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
    });

    it('should remove javascript: protocol', () => {
      expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
    });

    it('should remove event handlers', () => {
      expect(sanitizeInput('test onclick=alert(1)')).toBe('test alert(1)');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello world  ')).toBe('hello world');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('generateRequestId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      expect(id1).not.toBe(id2);
    });

    it('should start with req_ prefix', () => {
      const id = generateRequestId();
      expect(id).toMatch(/^req_/);
    });

    it('should be a reasonable length', () => {
      const id = generateRequestId();
      expect(id.length).toBeGreaterThan(10);
      expect(id.length).toBeLessThan(50);
    });
  });

  describe('isValidStorageKey', () => {
    it('should accept valid keys', () => {
      expect(isValidStorageKey('user_id')).toBe(true);
      expect(isValidStorageKey('auth-token')).toBe(true);
      expect(isValidStorageKey('myKey123')).toBe(true);
    });

    it('should reject keys with invalid characters', () => {
      expect(isValidStorageKey('key.with.dots')).toBe(false);
      expect(isValidStorageKey('key with spaces')).toBe(false);
      expect(isValidStorageKey('key@special')).toBe(false);
    });

    it('should reject keys that are too long', () => {
      const longKey = 'a'.repeat(257);
      expect(isValidStorageKey(longKey)).toBe(false);
    });

    it('should accept keys at max length', () => {
      const maxKey = 'a'.repeat(256);
      expect(isValidStorageKey(maxKey)).toBe(true);
    });
  });

  describe('validateResponseIntegrity', () => {
    it('should accept valid responses', () => {
      expect(validateResponseIntegrity({ data: 'test' })).toBe(true);
      expect(validateResponseIntegrity([1, 2, 3])).toBe(true);
      expect(validateResponseIntegrity('string')).toBe(true);
    });

    it('should reject null/undefined', () => {
      expect(validateResponseIntegrity(null)).toBe(false);
      expect(validateResponseIntegrity(undefined)).toBe(false);
    });

    it('should detect prototype pollution attempts', () => {
      expect(validateResponseIntegrity({ __proto__: {} })).toBe(false);
      expect(validateResponseIntegrity({ constructor: {} })).toBe(false);
      expect(validateResponseIntegrity({ prototype: {} })).toBe(false);
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      rateLimiter.clear();
    });

    it('should allow requests within limit', () => {
      for (let i = 0; i < 50; i++) {
        expect(rateLimiter.canMakeRequest('/api/test')).toBe(true);
      }
    });

    it('should track requests per endpoint', () => {
      // Fill up one endpoint
      for (let i = 0; i < 100; i++) {
        rateLimiter.canMakeRequest('/api/endpoint1');
      }

      // Another endpoint should still be available
      expect(rateLimiter.canMakeRequest('/api/endpoint2')).toBe(true);
    });

    it('should block requests when limit exceeded', () => {
      // Make 100 requests (the default limit)
      for (let i = 0; i < 100; i++) {
        rateLimiter.canMakeRequest('/api/test');
      }

      // 101st request should be blocked
      expect(rateLimiter.canMakeRequest('/api/test')).toBe(false);
    });
  });
});
