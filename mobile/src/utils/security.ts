import { Platform } from 'react-native';

/**
 * Security utilities for the mobile application
 *
 * Certificate Pinning Implementation Notes:
 * -----------------------------------------
 * In Expo managed workflow, native certificate pinning requires EAS Build
 * with a development client or a bare workflow.
 *
 * For production apps, consider:
 * 1. Using EAS Build with expo-dev-client
 * 2. Ejecting to bare workflow and using react-native-ssl-pinning
 * 3. Using a proxy server with TLS termination
 *
 * This module provides a configurable fetch wrapper that can be enhanced
 * with native pinning when the app is built with EAS.
 */

// Backend API certificate fingerprints
// Update these when the certificate is renewed
// Last updated: 2026-01-31
// To regenerate: openssl s_client -connect domain:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
const CERTIFICATE_PINS = {
  // Railway.app backend
  'resume-ai-backend-production-3134.up.railway.app': [
    // SHA-256 fingerprint of the leaf certificate
    'sha256/i+fyVetXyACCzW7mWtTNzuYIjv0JpKqW00eIiiuLp1o=',
    // SHA-256 fingerprint of the intermediate certificate (backup)
    'sha256/kZwN96eHtZftBWrOZUsd6cA4es80n3NzSk/XtYz2EqQ=',
  ],
};

// Allowed hosts for API requests
const ALLOWED_HOSTS = [
  'resume-ai-backend-production-3134.up.railway.app',
  'api.talorme.com', // Future production domain
];

/**
 * Configuration for security features
 */
interface SecurityConfig {
  enablePinning: boolean;
  enableHostValidation: boolean;
  trustedHosts: string[];
  onPinningFailure?: (error: Error, url: string) => void;
}

const defaultConfig: SecurityConfig = {
  enablePinning: __DEV__ ? false : true, // Disable in development
  enableHostValidation: true,
  trustedHosts: ALLOWED_HOSTS,
  onPinningFailure: (error, url) => {
    console.error(`Certificate pinning failed for ${url}:`, error);
    // In production, you might want to report this to analytics
  },
};

let securityConfig: SecurityConfig = { ...defaultConfig };

/**
 * Configure security settings
 */
export function configureSecurityPolicy(config: Partial<SecurityConfig>) {
  securityConfig = { ...securityConfig, ...config };
}

/**
 * Validate that a URL is targeting a trusted host over HTTPS
 */
export function validateHost(url: string): boolean {
  if (!securityConfig.enableHostValidation) {
    return true;
  }

  try {
    const urlObj = new URL(url);

    // Enforce HTTPS protocol (security requirement)
    if (urlObj.protocol !== 'https:') {
      console.warn(`Security: Rejected non-HTTPS URL: ${urlObj.protocol}`);
      return false;
    }

    return securityConfig.trustedHosts.includes(urlObj.hostname);
  } catch {
    return false;
  }
}

/**
 * Get certificate pins for a host
 */
export function getCertificatePins(host: string): string[] | null {
  return CERTIFICATE_PINS[host as keyof typeof CERTIFICATE_PINS] || null;
}

/**
 * Secure fetch wrapper
 *
 * This wrapper:
 * 1. Validates the host is trusted
 * 2. Adds security headers
 * 3. Can be enhanced with native pinning in production builds
 */
export async function secureFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Validate host
  if (!validateHost(url)) {
    throw new Error(`Untrusted host: ${new URL(url).hostname}`);
  }

  // Add security headers
  const securityHeaders: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest', // Prevent CSRF
    'X-Client-Platform': Platform.OS,
    'X-Client-Version': '1.0.0', // Should come from app.json
  };

  const mergedHeaders = {
    ...securityHeaders,
    ...(options.headers as Record<string, string>),
  };

  // In a production build with native modules, this is where
  // you would use react-native-ssl-pinning or similar
  //
  // Example with react-native-ssl-pinning:
  // import { fetch as pinnedFetch } from 'react-native-ssl-pinning';
  // return pinnedFetch(url, {
  //   ...options,
  //   headers: mergedHeaders,
  //   sslPinning: {
  //     certs: ['cert1', 'cert2'],
  //   },
  //   timeoutInterval: 30000,
  // });

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });

    return response;
  } catch (error) {
    // Handle potential pinning failures
    if (securityConfig.onPinningFailure && error instanceof Error) {
      securityConfig.onPinningFailure(error, url);
    }
    throw error;
  }
}

/**
 * Validate response integrity
 * Checks for common attack patterns in API responses
 */
export function validateResponseIntegrity(response: unknown): boolean {
  if (response === null || response === undefined) {
    return false;
  }

  // Check for prototype pollution attempts
  if (typeof response === 'object') {
    const obj = response as Record<string, unknown>;
    if ('__proto__' in obj || 'constructor' in obj || 'prototype' in obj) {
      console.warn('Potential prototype pollution detected in response');
      return false;
    }
  }

  return true;
}

/**
 * Sanitize user input before sending to API
 */
export function sanitizeInput(input: string): string {
  // Remove potential XSS vectors
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Secure logging utility
 * Only logs in development mode to prevent PII exposure in production
 */
export function secureLog(message: string, data?: unknown): void {
  if (__DEV__) {
    if (data !== undefined) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
  // In production, logs are suppressed to prevent PII in device logs
  // Consider integrating with a secure analytics service for production logging
}

/**
 * Secure error logging - always logs but sanitizes data
 */
export function secureError(message: string, error?: unknown): void {
  const sanitizedError = error instanceof Error ? error.message : 'Unknown error';
  console.error(message, sanitizedError);
  // In production, send to crash reporting service (e.g., Sentry)
}

/**
 * Allowed job URL hosts for SSRF prevention
 */
const ALLOWED_JOB_HOSTS = [
  'linkedin.com',
  'www.linkedin.com',
  'indeed.com',
  'www.indeed.com',
  'glassdoor.com',
  'www.glassdoor.com',
  'monster.com',
  'www.monster.com',
  'ziprecruiter.com',
  'www.ziprecruiter.com',
  'lever.co',
  'greenhouse.io',
  'boards.greenhouse.io',
  'jobs.lever.co',
  'workday.com',
  'myworkdayjobs.com',
];

/**
 * Validate job URL to prevent SSRF attacks
 * Only allows URLs from known job posting sites
 */
export function validateJobUrl(url: string): { valid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { valid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url);

    // Must be HTTPS
    if (urlObj.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS' };
    }

    // Check against allowlist
    const isAllowedHost = ALLOWED_JOB_HOSTS.some(
      (host) => urlObj.hostname === host || urlObj.hostname.endsWith('.' + host)
    );

    if (!isAllowedHost) {
      return {
        valid: false,
        error: 'Please enter a URL from LinkedIn, Indeed, Glassdoor, or another major job site',
      };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Generate a secure request ID for tracing
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `req_${timestamp}_${randomPart}`;
}

/**
 * Rate limiting helper
 * Prevents excessive API calls from the client
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const requests = this.requests.get(endpoint) || [];
    const recentRequests = requests.filter((time) => time > windowStart);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(endpoint, recentRequests);
    return true;
  }

  getTimeUntilReset(endpoint: string): number {
    const requests = this.requests.get(endpoint) || [];
    if (requests.length === 0) return 0;

    const oldestRequest = Math.min(...requests);
    const resetTime = oldestRequest + this.windowMs;
    return Math.max(0, resetTime - Date.now());
  }

  clear() {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure storage key validation
 * Ensures storage keys follow a safe pattern
 */
export function isValidStorageKey(key: string): boolean {
  // Only allow alphanumeric characters, underscores, and hyphens
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(key) && key.length <= 256;
}
