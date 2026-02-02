/**
 * Validation Utilities Tests
 */

// Mock the security module to avoid React Native imports
jest.mock('../security', () => ({
  validateJobUrl: jest.fn((url: string) => {
    if (!url || url.trim() === '') {
      return { valid: false, error: 'URL is required' };
    }
    try {
      const urlObj = new URL(url);
      if (urlObj.protocol !== 'https:') {
        return { valid: false, error: 'URL must use HTTPS' };
      }
      if (urlObj.hostname.includes('linkedin.com') || urlObj.hostname.includes('indeed.com')) {
        return { valid: true };
      }
      return { valid: false, error: 'Please enter a URL from LinkedIn, Indeed, or another major job site' };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }),
}));

import {
  required,
  minLength,
  maxLength,
  email,
  url,
  companyName,
  jobTitle,
  fileSize,
  fileType,
  validate,
  validateForm,
  isFormValid,
  getFirstError,
} from '../validation';

describe('Validation Utilities', () => {
  describe('required', () => {
    it('should fail for empty string', () => {
      expect(required('')).toEqual({ valid: false, error: 'This field is required' });
    });

    it('should fail for whitespace only', () => {
      expect(required('   ')).toEqual({ valid: false, error: 'This field is required' });
    });

    it('should fail for null', () => {
      expect(required(null as any)).toEqual({ valid: false, error: 'This field is required' });
    });

    it('should fail for undefined', () => {
      expect(required(undefined)).toEqual({ valid: false, error: 'This field is required' });
    });

    it('should pass for valid string', () => {
      expect(required('hello')).toEqual({ valid: true });
    });
  });

  describe('minLength', () => {
    it('should fail for string shorter than min', () => {
      expect(minLength('ab', 3)).toEqual({ valid: false, error: 'Must be at least 3 characters' });
    });

    it('should pass for string equal to min', () => {
      expect(minLength('abc', 3)).toEqual({ valid: true });
    });

    it('should pass for string longer than min', () => {
      expect(minLength('abcd', 3)).toEqual({ valid: true });
    });
  });

  describe('maxLength', () => {
    it('should fail for string longer than max', () => {
      expect(maxLength('abcd', 3)).toEqual({ valid: false, error: 'Must be no more than 3 characters' });
    });

    it('should pass for string equal to max', () => {
      expect(maxLength('abc', 3)).toEqual({ valid: true });
    });

    it('should pass for string shorter than max', () => {
      expect(maxLength('ab', 3)).toEqual({ valid: true });
    });
  });

  describe('email', () => {
    it('should fail for invalid email', () => {
      expect(email('notanemail')).toEqual({ valid: false, error: 'Please enter a valid email address' });
    });

    it('should fail for email without @', () => {
      expect(email('test.example.com')).toEqual({ valid: false, error: 'Please enter a valid email address' });
    });

    it('should pass for valid email', () => {
      expect(email('test@example.com')).toEqual({ valid: true });
    });
  });

  describe('url', () => {
    it('should fail for invalid URL', () => {
      expect(url('notaurl')).toEqual({ valid: false, error: 'Please enter a valid URL' });
    });

    it('should fail for ftp URL', () => {
      expect(url('ftp://example.com')).toEqual({ valid: false, error: 'URL must start with http:// or https://' });
    });

    it('should pass for http URL', () => {
      expect(url('http://example.com')).toEqual({ valid: true });
    });

    it('should pass for https URL', () => {
      expect(url('https://example.com')).toEqual({ valid: true });
    });
  });

  describe('companyName', () => {
    it('should fail for empty string', () => {
      expect(companyName('')).toEqual({ valid: false, error: 'Company name is required' });
    });

    it('should fail for too short name', () => {
      expect(companyName('A')).toEqual({ valid: false, error: 'Company name must be at least 2 characters' });
    });

    it('should pass for valid company name', () => {
      expect(companyName('Acme Corp')).toEqual({ valid: true });
    });
  });

  describe('jobTitle', () => {
    it('should fail for empty string', () => {
      expect(jobTitle('')).toEqual({ valid: false, error: 'Job title is required' });
    });

    it('should fail for too short title', () => {
      expect(jobTitle('A')).toEqual({ valid: false, error: 'Job title must be at least 2 characters' });
    });

    it('should pass for valid job title', () => {
      expect(jobTitle('Software Engineer')).toEqual({ valid: true });
    });
  });

  describe('fileSize', () => {
    it('should fail for file over limit', () => {
      const size = 11 * 1024 * 1024; // 11MB
      expect(fileSize(size, 10)).toEqual({ valid: false, error: 'File must be smaller than 10MB' });
    });

    it('should pass for file under limit', () => {
      const size = 5 * 1024 * 1024; // 5MB
      expect(fileSize(size, 10)).toEqual({ valid: true });
    });

    it('should pass for file at limit', () => {
      const size = 10 * 1024 * 1024; // 10MB
      expect(fileSize(size, 10)).toEqual({ valid: true });
    });
  });

  describe('fileType', () => {
    it('should fail for invalid file type', () => {
      expect(fileType('image/png')).toEqual({
        valid: false,
        error: 'File must be a PDF or Word document (.docx)',
      });
    });

    it('should pass for PDF', () => {
      expect(fileType('application/pdf')).toEqual({ valid: true });
    });

    it('should pass for DOCX', () => {
      expect(
        fileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      ).toEqual({ valid: true });
    });
  });

  describe('validate', () => {
    it('should return first error', () => {
      const result = validate('', [required, (v) => minLength(v, 3)]);
      expect(result).toEqual({ valid: false, error: 'This field is required' });
    });

    it('should run all validators and return valid', () => {
      const result = validate('hello', [required, (v) => minLength(v, 3)]);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('validateForm', () => {
    it('should validate all fields', () => {
      const values = { name: '', email: 'invalid' };
      const validators = {
        name: [required],
        email: [required, email],
      };
      const results = validateForm(values, validators);

      expect(results.name.valid).toBe(false);
      expect(results.email.valid).toBe(false);
    });

    it('should return valid for all valid fields', () => {
      const values = { name: 'John', email: 'john@example.com' };
      const validators = {
        name: [required],
        email: [required, email],
      };
      const results = validateForm(values, validators);

      expect(results.name.valid).toBe(true);
      expect(results.email.valid).toBe(true);
    });
  });

  describe('isFormValid', () => {
    it('should return false if any field is invalid', () => {
      const results = {
        name: { valid: true },
        email: { valid: false, error: 'Invalid' },
      };
      expect(isFormValid(results)).toBe(false);
    });

    it('should return true if all fields are valid', () => {
      const results = {
        name: { valid: true },
        email: { valid: true },
      };
      expect(isFormValid(results)).toBe(true);
    });
  });

  describe('getFirstError', () => {
    it('should return first error message', () => {
      const results = {
        name: { valid: false, error: 'Name required' },
        email: { valid: false, error: 'Email required' },
      };
      expect(getFirstError(results)).toBe('Name required');
    });

    it('should return null if no errors', () => {
      const results = {
        name: { valid: true },
        email: { valid: true },
      };
      expect(getFirstError(results)).toBeNull();
    });
  });
});
