/**
 * Pure unit tests for src/api/base.ts
 *
 * Tests: snakeToCamel, camelToSnake, fetchWithAuth, get, post, put, del
 * All external dependencies are mocked.
 */

// ---------------------------------------------------------------------------
// Mocks  (must appear before imports)
// ---------------------------------------------------------------------------

jest.mock('../../utils/security', () => ({
  secureFetch: jest.fn(),
  validateHost: jest.fn(() => true),
  rateLimiter: {
    canMakeRequest: jest.fn(() => true),
    getTimeUntilReset: jest.fn(() => 0),
    clear: jest.fn(),
  },
}));

jest.mock('../../utils/userSession', () => ({
  getUserId: jest.fn(() => Promise.resolve('test-user-123')),
}));

jest.mock('../../utils/constants', () => ({
  API_BASE_URL: 'https://test-api.example.com',
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
  snakeToCamel,
  camelToSnake,
  fetchWithAuth,
  get,
  post,
  put,
  del,
} from '../base';

import { validateHost, rateLimiter } from '../../utils/security';
import { getUserId } from '../../utils/userSession';

// Cast mocks for type-safe assertions
const mockValidateHost = validateHost as jest.Mock;
const mockCanMakeRequest = rateLimiter.canMakeRequest as jest.Mock;
const mockGetUserId = getUserId as jest.Mock;

// ---------------------------------------------------------------------------
// Global fetch mock
// ---------------------------------------------------------------------------

const mockFetch = jest.fn();
(global as unknown as Record<string, unknown>).fetch = mockFetch;

// ---------------------------------------------------------------------------
// Reset state before every test
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();

  // Default: fetch resolves with a 200 OK empty-body response
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  });

  // Defaults for security mocks
  mockValidateHost.mockReturnValue(true);
  mockCanMakeRequest.mockReturnValue(true);
  mockGetUserId.mockResolvedValue('test-user-123');
});

afterEach(() => {
  jest.useRealTimers();
});

// ===========================================================================
// snakeToCamel
// ===========================================================================

describe('snakeToCamel', () => {
  it('returns null for null input', () => {
    expect(snakeToCamel(null)).toBeNull();
  });

  it('returns undefined for undefined input', () => {
    expect(snakeToCamel(undefined)).toBeUndefined();
  });

  it('returns a number primitive unchanged', () => {
    expect(snakeToCamel(42)).toBe(42);
  });

  it('returns a string primitive unchanged', () => {
    expect(snakeToCamel('hello_world')).toBe('hello_world');
  });

  it('returns a boolean primitive unchanged', () => {
    expect(snakeToCamel(true)).toBe(true);
  });

  it('converts a simple snake_case key', () => {
    const input = { first_name: 'Alice' };
    expect(snakeToCamel(input)).toEqual({ firstName: 'Alice' });
  });

  it('converts nested objects recursively', () => {
    const input = {
      user_info: {
        first_name: 'Alice',
        last_name: 'Smith',
      },
    };
    expect(snakeToCamel(input)).toEqual({
      userInfo: {
        firstName: 'Alice',
        lastName: 'Smith',
      },
    });
  });

  it('converts arrays of objects', () => {
    const input = [
      { user_id: 1 },
      { user_id: 2 },
    ];
    expect(snakeToCamel(input)).toEqual([
      { userId: 1 },
      { userId: 2 },
    ]);
  });

  it('converts deeply nested structures (object > array > object)', () => {
    const input = {
      data_list: [
        { nested_key: { deep_value: 10 } },
      ],
    };
    expect(snakeToCamel(input)).toEqual({
      dataList: [
        { nestedKey: { deepValue: 10 } },
      ],
    });
  });

  it('handles empty objects', () => {
    expect(snakeToCamel({})).toEqual({});
  });

  it('converts multi-underscore keys', () => {
    const input = { long_multi_word_key: 'value' };
    expect(snakeToCamel(input)).toEqual({ longMultiWordKey: 'value' });
  });

  it('preserves keys that are already camelCase (no underscores)', () => {
    const input = { alreadyCamel: true, simple: 'yes' };
    expect(snakeToCamel(input)).toEqual({ alreadyCamel: true, simple: 'yes' });
  });
});

// ===========================================================================
// camelToSnake
// ===========================================================================

describe('camelToSnake', () => {
  it('returns null for null input', () => {
    expect(camelToSnake(null)).toBeNull();
  });

  it('returns undefined for undefined input', () => {
    expect(camelToSnake(undefined)).toBeUndefined();
  });

  it('returns a number primitive unchanged', () => {
    expect(camelToSnake(99)).toBe(99);
  });

  it('returns a string primitive unchanged', () => {
    expect(camelToSnake('helloWorld')).toBe('helloWorld');
  });

  it('returns a boolean primitive unchanged', () => {
    expect(camelToSnake(false)).toBe(false);
  });

  it('converts a simple camelCase key', () => {
    const input = { firstName: 'Bob' };
    expect(camelToSnake(input)).toEqual({ first_name: 'Bob' });
  });

  it('converts nested objects recursively', () => {
    const input = {
      userInfo: {
        firstName: 'Bob',
        lastName: 'Jones',
      },
    };
    expect(camelToSnake(input)).toEqual({
      user_info: {
        first_name: 'Bob',
        last_name: 'Jones',
      },
    });
  });

  it('converts arrays of objects', () => {
    const input = [{ userId: 1 }, { userId: 2 }];
    expect(camelToSnake(input)).toEqual([{ user_id: 1 }, { user_id: 2 }]);
  });

  it('passes FormData through unchanged (instanceof check)', () => {
    const formData = new FormData();
    formData.append('file', 'content');
    expect(camelToSnake(formData)).toBe(formData);
  });

  it('handles empty objects', () => {
    expect(camelToSnake({})).toEqual({});
  });
});

// ===========================================================================
// fetchWithAuth
// ===========================================================================

describe('fetchWithAuth', () => {
  it('constructs the full URL from API_BASE_URL + endpoint', async () => {
    const promise = fetchWithAuth('/api/test');
    jest.runAllTimers();
    await promise;

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe('https://test-api.example.com/api/test');
  });

  it('sets X-User-ID header from getUserId()', async () => {
    const promise = fetchWithAuth('/api/data');
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.headers['X-User-ID']).toBe('test-user-123');
  });

  it('sets Content-Type: application/json when body is a plain object', async () => {
    const promise = fetchWithAuth('/api/submit', { body: { key: 'value' } });
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.headers['Content-Type']).toBe('application/json');
  });

  it('does NOT set Content-Type when body is FormData', async () => {
    const formData = new FormData();
    formData.append('file', 'blob');

    const promise = fetchWithAuth('/api/upload', { body: formData });
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.headers['Content-Type']).toBeUndefined();
  });

  it('converts camelCase body keys to snake_case in the JSON string', async () => {
    const promise = fetchWithAuth('/api/create', {
      body: { firstName: 'Alice', lastName: 'Smith' },
    });
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    const parsedBody = JSON.parse(calledOptions.body as string);
    expect(parsedBody).toEqual({ first_name: 'Alice', last_name: 'Smith' });
  });

  it('throws when validateHost returns false', async () => {
    mockValidateHost.mockReturnValue(false);

    await expect(fetchWithAuth('/api/evil')).rejects.toThrow(
      /Untrusted host/
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('throws when rateLimiter.canMakeRequest returns false', async () => {
    mockCanMakeRequest.mockReturnValue(false);

    await expect(fetchWithAuth('/api/flood')).rejects.toThrow(
      /Rate limit exceeded/
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('bypasses rate limiter when skipRateLimit is true', async () => {
    mockCanMakeRequest.mockReturnValue(false);

    const promise = fetchWithAuth('/api/priority', { skipRateLimit: true });
    jest.runAllTimers();
    await promise;

    // Even though canMakeRequest returns false, fetch is still called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('uses 30 000 ms default timeout for regular endpoints', async () => {
    // Capture the signal passed to fetch to check its aborted state
    let capturedSignal: AbortSignal | undefined;
    mockFetch.mockImplementation((_url: string, opts: any) => {
      capturedSignal = opts?.signal;
      return new Promise(() => {}); // hang forever
    });

    fetchWithAuth('/api/regular');

    // Wait for the async getUserId to resolve
    await Promise.resolve();
    await Promise.resolve();

    // Advance to just before the 30s mark -- should NOT have aborted
    jest.advanceTimersByTime(29999);
    expect(capturedSignal?.aborted).toBe(false);

    // Advance past the 30s mark -- should abort
    jest.advanceTimersByTime(2);
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('uses 420 000 ms timeout for AI endpoints (/api/tailor/)', async () => {
    let capturedSignal: AbortSignal | undefined;
    mockFetch.mockImplementation((_url: string, opts: any) => {
      capturedSignal = opts?.signal;
      return new Promise(() => {}); // hang forever
    });

    fetchWithAuth('/api/tailor/generate');

    await Promise.resolve();
    await Promise.resolve();

    // Advance to 30 s -- should NOT have aborted (it uses the long timeout)
    jest.advanceTimersByTime(30000);
    expect(capturedSignal?.aborted).toBe(false);

    // Advance to just past 420 s -- should abort
    jest.advanceTimersByTime(390001);
    expect(capturedSignal?.aborted).toBe(true);
  });

  it('maps AbortError to a friendly timeout message', async () => {
    // Create an error with name 'AbortError' which is what fetchWithAuth checks
    const abortError = new Error('The operation was aborted.');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValue(abortError);

    const promise = fetchWithAuth('/api/slow');
    jest.runAllTimers();

    await expect(promise).rejects.toThrow(
      'Request timeout - please check your connection and try again'
    );
  });

  it('passes through non-abort errors unmodified', async () => {
    const networkError = new TypeError('Failed to fetch');
    mockFetch.mockRejectedValue(networkError);

    const promise = fetchWithAuth('/api/broken');
    jest.runAllTimers();

    await expect(promise).rejects.toThrow('Failed to fetch');
  });

  it('passes the abort signal to the underlying fetch call', async () => {
    const promise = fetchWithAuth('/api/signal-check');
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.signal).toBeInstanceOf(AbortSignal);
  });
});

// ===========================================================================
// get
// ===========================================================================

describe('get', () => {
  it('returns { success: true, data } with camelCase keys on 200', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ user_name: 'Alice', user_age: 30 }),
    });

    const promise = get('/api/users/1');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: true,
      data: { userName: 'Alice', userAge: 30 },
    });
  });

  it('returns error from data.error on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Bad request payload' }),
    });

    const promise = get('/api/bad');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Bad request payload',
    });
  });

  it('returns error from data.detail when data.error is absent', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: 'Not found' }),
    });

    const promise = get('/api/missing');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Not found',
    });
  });

  it('falls back to status code message when no error/detail field', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    });

    const promise = get('/api/crash');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Server error: 500',
    });
  });

  it('returns { success: false, error: message } on network exception', async () => {
    mockFetch.mockRejectedValue(new Error('Network failure'));

    const promise = get('/api/down');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Network failure',
    });
  });
});

// ===========================================================================
// post
// ===========================================================================

describe('post', () => {
  it('sends a POST method with body', async () => {
    const promise = post('/api/items', { itemName: 'Widget' });
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.method).toBe('POST');
    expect(JSON.parse(calledOptions.body)).toEqual({ item_name: 'Widget' });
  });

  it('returns { success: true, data } with camelCase keys on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ item_id: 99, created_at: '2026-01-01' }),
    });

    const promise = post('/api/items', { itemName: 'Widget' });
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: true,
      data: { itemId: 99, createdAt: '2026-01-01' },
    });
  });

  it('returns { success: false, error } on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      json: () => Promise.resolve({ error: 'Validation failed' }),
    });

    const promise = post('/api/items', { bad: true });
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Validation failed',
    });
  });

  it('returns { success: false, error } on exception', async () => {
    mockFetch.mockRejectedValue(new Error('Connection refused'));

    const promise = post('/api/items', { test: true });
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Connection refused',
    });
  });
});

// ===========================================================================
// put
// ===========================================================================

describe('put', () => {
  it('sends a PUT method with body', async () => {
    const promise = put('/api/items/1', { itemName: 'Updated' });
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.method).toBe('PUT');
    expect(JSON.parse(calledOptions.body)).toEqual({ item_name: 'Updated' });
  });

  it('returns { success: true, data } on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ item_id: 1, updated_at: '2026-02-01' }),
    });

    const promise = put('/api/items/1', { itemName: 'Updated' });
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: true,
      data: { itemId: 1, updatedAt: '2026-02-01' },
    });
  });

  it('returns { success: false, error } on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ detail: 'Forbidden' }),
    });

    const promise = put('/api/items/1', { itemName: 'Nope' });
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Forbidden',
    });
  });
});

// ===========================================================================
// del
// ===========================================================================

describe('del', () => {
  it('sends a DELETE method', async () => {
    const promise = del('/api/items/1');
    jest.runAllTimers();
    await promise;

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.method).toBe('DELETE');
  });

  it('returns { success: true, data } on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ deleted: true }),
    });

    const promise = del('/api/items/1');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: true,
      data: { deleted: true },
    });
  });

  it('returns { success: false, error } on failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'Item not found' }),
    });

    const promise = del('/api/items/999');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Item not found',
    });
  });

  it('returns { success: false, error } on exception', async () => {
    mockFetch.mockRejectedValue(new Error('Socket hang up'));

    const promise = del('/api/items/1');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({
      success: false,
      error: 'Socket hang up',
    });
  });
});

// ===========================================================================
// Cross-cutting: all HTTP helpers handle non-Error exceptions
// ===========================================================================

describe('HTTP helpers - non-Error exception handling', () => {
  it('get returns "Unknown error" when exception is not an Error instance', async () => {
    mockFetch.mockRejectedValue('string error');

    const promise = get('/api/x');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ success: false, error: 'Unknown error' });
  });

  it('post returns "Unknown error" when exception is not an Error instance', async () => {
    mockFetch.mockRejectedValue(12345);

    const promise = post('/api/x');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ success: false, error: 'Unknown error' });
  });

  it('put returns "Unknown error" when exception is not an Error instance', async () => {
    mockFetch.mockRejectedValue(null);

    const promise = put('/api/x');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ success: false, error: 'Unknown error' });
  });

  it('del returns "Unknown error" when exception is not an Error instance', async () => {
    mockFetch.mockRejectedValue(undefined);

    const promise = del('/api/x');
    jest.runAllTimers();
    const result = await promise;

    expect(result).toEqual({ success: false, error: 'Unknown error' });
  });
});
