/**
 * Form Validation Utilities
 * Provides consistent validation across the app
 */

import { validateJobUrl } from './security';

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Field validation rule
 */
export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

/**
 * Validate that a value is not empty
 */
export function required(value: string | undefined | null): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

/**
 * Validate minimum length
 */
export function minLength(value: string, min: number): ValidationResult {
  if (value.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }
  return { valid: true };
}

/**
 * Validate maximum length
 */
export function maxLength(value: string, max: number): ValidationResult {
  if (value.length > max) {
    return { valid: false, error: `Must be no more than ${max} characters` };
  }
  return { valid: true };
}

/**
 * Validate email format
 */
export function email(value: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

/**
 * Validate URL format
 */
export function url(value: string): ValidationResult {
  try {
    const urlObj = new URL(value);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must start with http:// or https://' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validate job URL (uses security validation)
 */
export function jobUrl(value: string): ValidationResult {
  return validateJobUrl(value);
}

/**
 * Validate company name
 */
export function companyName(value: string): ValidationResult {
  const requiredResult = required(value);
  if (!requiredResult.valid) {
    return { valid: false, error: 'Company name is required' };
  }

  if (value.length < 2) {
    return { valid: false, error: 'Company name must be at least 2 characters' };
  }

  if (value.length > 100) {
    return { valid: false, error: 'Company name must be no more than 100 characters' };
  }

  return { valid: true };
}

/**
 * Validate job title
 */
export function jobTitle(value: string): ValidationResult {
  const requiredResult = required(value);
  if (!requiredResult.valid) {
    return { valid: false, error: 'Job title is required' };
  }

  if (value.length < 2) {
    return { valid: false, error: 'Job title must be at least 2 characters' };
  }

  if (value.length > 150) {
    return { valid: false, error: 'Job title must be no more than 150 characters' };
  }

  return { valid: true };
}

/**
 * Validate file size (in bytes)
 */
export function fileSize(size: number, maxSizeMB: number = 10): ValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `File must be smaller than ${maxSizeMB}MB`,
    };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
export function fileType(
  mimeType: string,
  allowedTypes: string[] = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
): ValidationResult {
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: 'File must be a PDF or Word document (.docx)',
    };
  }
  return { valid: true };
}

/**
 * Run multiple validations and return first error
 */
export function validate(
  value: string,
  rules: Array<(value: string) => ValidationResult>
): ValidationResult {
  for (const rule of rules) {
    const result = rule(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Validate an entire form object
 */
export function validateForm<T extends Record<string, string>>(
  values: T,
  validators: Partial<Record<keyof T, Array<(value: string) => ValidationResult>>>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;

  for (const key in values) {
    const fieldValidators = validators[key];
    if (fieldValidators) {
      results[key] = validate(values[key], fieldValidators);
    } else {
      results[key] = { valid: true };
    }
  }

  return results;
}

/**
 * Check if all form validations passed
 */
export function isFormValid(results: Record<string, ValidationResult>): boolean {
  return Object.values(results).every((r) => r.valid);
}

/**
 * Get first error from form validation results
 */
export function getFirstError(results: Record<string, ValidationResult>): string | null {
  for (const key in results) {
    if (!results[key].valid && results[key].error) {
      return results[key].error!;
    }
  }
  return null;
}

/**
 * Pre-built validator combinations for common fields
 */
export const validators = {
  jobUrl: (value: string) => validate(value, [required, jobUrl]),
  companyName: (value: string) => validate(value, [required, companyName]),
  jobTitle: (value: string) => validate(value, [required, jobTitle]),
  optionalUrl: (value: string) => (value ? url(value) : { valid: true }),
  optionalCompany: (value: string) => (value ? companyName(value) : { valid: true }),
  optionalJobTitle: (value: string) => (value ? jobTitle(value) : { valid: true }),
};
