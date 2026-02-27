/**
 * Error classifier for API responses.
 *
 * Categorises HTTP errors as retryable (transient) vs terminal so that
 * callers can decide whether to retry automatically.
 */

export interface ClassifiedError {
  /** Original HTTP status code */
  status: number;
  /** Human-readable error message */
  message: string;
  /** Whether the caller should retry the request */
  retryable: boolean;
  /** Suggested delay (ms) before retrying. 0 if not retryable. */
  retryAfterMs: number;
}

/** Status codes that are worth retrying (server overloaded / temporary). */
const RETRYABLE_CODES = new Set([429, 500, 502, 503, 504]);

/** Status codes that should never be retried (client error). */
const TERMINAL_CODES = new Set([400, 401, 403, 404, 409, 422]);

/**
 * Classify an HTTP error response.
 *
 * @param status HTTP status code
 * @param message Error message from response body
 * @param retryAfterHeader Value of the `Retry-After` response header (seconds or HTTP-date)
 */
export function classifyError(
  status: number,
  message: string,
  retryAfterHeader?: string | null,
): ClassifiedError {
  const retryable = RETRYABLE_CODES.has(status);

  let retryAfterMs = 0;
  if (retryable) {
    if (retryAfterHeader) {
      const seconds = Number(retryAfterHeader);
      if (!Number.isNaN(seconds)) {
        retryAfterMs = seconds * 1000;
      } else {
        // Try parsing as HTTP-date
        const date = Date.parse(retryAfterHeader);
        if (!Number.isNaN(date)) {
          retryAfterMs = Math.max(0, date - Date.now());
        }
      }
    }
    // Minimum sensible retry delay
    if (retryAfterMs === 0) {
      retryAfterMs = status === 429 ? 5000 : 2000;
    }
  }

  return { status, message, retryable, retryAfterMs };
}

/**
 * Classify a caught Error (network failure, timeout, etc.).
 *
 * Network errors and timeouts are always retryable.
 */
export function classifyException(error: Error): ClassifiedError {
  const isTimeout = error.message.includes('timeout') || error.name === 'AbortError';
  const isNetwork =
    error.message.includes('Network request failed') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('network');

  return {
    status: 0,
    message: error.message,
    retryable: isTimeout || isNetwork,
    retryAfterMs: isTimeout ? 3000 : isNetwork ? 2000 : 0,
  };
}
