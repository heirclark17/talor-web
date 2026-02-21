/**
 * Base API utilities
 * Shared types and functions used by all API modules
 */

import { API_BASE_URL } from '../utils/constants';
import { getUserId } from '../utils/userSession';
import { supabase } from '../lib/supabase';
import { validateHost, rateLimiter } from '../utils/security';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Request options with custom additions
 */
export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: object | FormData;
  skipRateLimit?: boolean;
}

/**
 * Convert snake_case keys to camelCase recursively
 * Handles nested objects and arrays
 */
export function snakeToCamel<T>(obj: unknown): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => snakeToCamel(item)) as T;
  }

  if (typeof obj === 'object') {
    const converted: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase()
        );
        converted[camelKey] = snakeToCamel((obj as Record<string, unknown>)[key]);
      }
    }
    return converted as T;
  }

  return obj as T;
}

/**
 * Convert camelCase keys to snake_case for API requests
 */
export function camelToSnake(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item));
  }

  if (typeof obj === 'object' && !(obj instanceof FormData)) {
    const converted: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        converted[snakeKey] = camelToSnake((obj as Record<string, unknown>)[key]);
      }
    }
    return converted;
  }

  return obj;
}

/**
 * Default request timeout in milliseconds (30 seconds)
 */
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Long timeout for AI operations (7 minutes)
 */
const LONG_TIMEOUT_MS = 420000;

/**
 * Endpoints that require longer timeouts (AI processing and file uploads)
 */
const LONG_TIMEOUT_ENDPOINTS = [
  '/api/resumes/upload', // File upload
  '/api/tailor/',
  '/api/resumes/analyze',
  '/api/interview-prep/',
  '/api/career-path/',
  '/api/career/',
  '/api/star-stories/',
  '/api/certifications/',
  '/api/resume-analysis/',
];

/**
 * Check if endpoint requires a longer timeout
 */
function requiresLongTimeout(endpoint: string): boolean {
  return LONG_TIMEOUT_ENDPOINTS.some(prefix => endpoint.startsWith(prefix));
}

/**
 * Base fetch with authentication headers
 * Includes security controls: host validation, rate limiting, timeout
 * Uses Clerk JWT tokens for authentication
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestOptions = {}
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Validate host for security
  if (!validateHost(url)) {
    throw new Error(`Untrusted host in API request: ${url}`);
  }

  // Rate limiting check
  if (!options.skipRateLimit && !rateLimiter.canMakeRequest(endpoint)) {
    throw new Error('Rate limit exceeded. Please wait before making more requests.');
  }

  // Get JWT token directly from Supabase session (always fresh)
  let token: string | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token ?? null;
  } catch (e) {
    console.warn('[API] Failed to get Supabase session:', e);
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Always send X-User-ID as fallback auth
  try {
    const userId = await getUserId();
    if (userId) {
      headers['X-User-ID'] = userId;
    }
  } catch (e) {
    // getUserId failure shouldn't block requests
  }

  let body: string | FormData | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
    // Don't set Content-Type for FormData - browser will set it with boundary
  } else if (options.body) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(camelToSnake(options.body));
  }

  // Create abort controller for timeout
  // Use longer timeout for AI operations
  const timeoutMs = requiresLongTimeout(endpoint) ? LONG_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Log auth headers for debugging (remove once auth is stable)
  if (!headers['Authorization']) {
    console.warn(`[API] No JWT for ${endpoint} — using X-User-ID fallback:`, headers['X-User-ID']?.substring(0, 15));
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please check your connection and try again');
    }
    throw error;
  }
}

/**
 * Make a GET request
 */
export async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || `Server error: ${response.status}`,
      };
    }

    return { success: true, data: snakeToCamel<T>(data) };
  } catch (error) {
    console.error(`GET ${endpoint} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Make a POST request
 */
export async function post<T>(
  endpoint: string,
  body?: object | FormData
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint, {
      method: 'POST',
      body,
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || `Server error: ${response.status}`,
      };
    }

    return { success: true, data: snakeToCamel<T>(data) };
  } catch (error) {
    console.error(`POST ${endpoint} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Make a PUT request
 */
export async function put<T>(
  endpoint: string,
  body?: object
): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint, {
      method: 'PUT',
      body,
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || `Server error: ${response.status}`,
      };
    }

    return { success: true, data: snakeToCamel<T>(data) };
  } catch (error) {
    console.error(`PUT ${endpoint} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Make a DELETE request
 */
export async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetchWithAuth(endpoint, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || `Server error: ${response.status}`,
      };
    }

    return { success: true, data: snakeToCamel<T>(data) };
  } catch (error) {
    console.error(`DELETE ${endpoint} error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
