/**
 * useAsyncJob — generic polling hook for async backend jobs.
 *
 * Usage:
 *   const { start, status, progress, message, result, error, isLoading } =
 *     useAsyncJob<TailoredResume>();
 *
 *   // Kick off an async job
 *   start(
 *     () => tailorApi.tailorResumeAsync(params),   // submit function
 *     (jobId) => `/api/tailor/job/${jobId}`,         // poll URL builder
 *   );
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchWithAuth, snakeToCamel } from '../api/base';
import { classifyError, classifyException } from '../utils/errorClassifier';

export type JobStatus = 'idle' | 'pending' | 'processing' | 'completed' | 'failed';

export interface AsyncJobOptions {
  /** Milliseconds between polls (default 2000) */
  pollIntervalMs?: number;
  /** Maximum total polling time before giving up (default 420000 = 7 min) */
  maxPollTimeMs?: number;
  /** Called on each progress update */
  onProgress?: (progress: number, message: string) => void;
  /** Called when job completes successfully */
  onComplete?: (result: unknown) => void;
  /** Called on failure */
  onError?: (error: string) => void;
}

interface SubmitResponse {
  success: boolean;
  jobId?: string;
  error?: string;
  data?: { success: boolean; jobId: string };
}

export function useAsyncJob<TResult = unknown>(options: AsyncJobOptions = {}) {
  const {
    pollIntervalMs = 2000,
    maxPollTimeMs = 420000,
    onProgress,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<JobStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const jobIdRef = useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const poll = useCallback(
    async (pollUrl: string) => {
      // Check timeout
      if (Date.now() - startTimeRef.current > maxPollTimeMs) {
        stopPolling();
        const msg = 'Job timed out — please try again';
        setStatus('failed');
        setError(msg);
        onError?.(msg);
        return;
      }

      try {
        const response = await fetchWithAuth(pollUrl);
        const data = await response.json();

        if (!response.ok) {
          const classified = classifyError(
            response.status,
            data.detail || data.error || 'Unknown error',
            response.headers.get('Retry-After'),
          );

          if (classified.retryable) {
            // Back off and retry
            pollingRef.current = setTimeout(() => poll(pollUrl), classified.retryAfterMs);
            return;
          }

          stopPolling();
          setStatus('failed');
          setError(classified.message);
          onError?.(classified.message);
          return;
        }

        const jobData = snakeToCamel<{
          status: string;
          progress: number;
          message: string;
          result: TResult;
          error: string;
        }>(data);

        setProgress(jobData.progress ?? 0);
        setMessage(jobData.message ?? '');
        onProgress?.(jobData.progress ?? 0, jobData.message ?? '');

        if (jobData.status === 'completed') {
          stopPolling();
          setStatus('completed');
          setResult(jobData.result ?? null);
          onComplete?.(jobData.result);
          return;
        }

        if (jobData.status === 'failed') {
          stopPolling();
          const errMsg = jobData.error || 'Job failed';
          setStatus('failed');
          setError(errMsg);
          onError?.(errMsg);
          return;
        }

        // Still processing — schedule next poll
        setStatus(jobData.status === 'processing' ? 'processing' : 'pending');
        pollingRef.current = setTimeout(() => poll(pollUrl), pollIntervalMs);
      } catch (err) {
        const classified = classifyException(err instanceof Error ? err : new Error(String(err)));
        if (classified.retryable) {
          pollingRef.current = setTimeout(() => poll(pollUrl), classified.retryAfterMs);
          return;
        }
        stopPolling();
        setStatus('failed');
        setError(classified.message);
        onError?.(classified.message);
      }
    },
    [maxPollTimeMs, pollIntervalMs, onProgress, onComplete, onError, stopPolling],
  );

  /**
   * Start an async job.
   *
   * @param submitFn  Async function that POSTs to the backend and returns { success, jobId }
   * @param pollUrlFn Function that builds the poll URL from a jobId
   */
  const start = useCallback(
    async (
      submitFn: () => Promise<SubmitResponse>,
      pollUrlFn: (jobId: string) => string,
    ) => {
      // Reset state
      setStatus('pending');
      setProgress(0);
      setMessage('Submitting...');
      setResult(null);
      setError(null);
      stopPolling();
      startTimeRef.current = Date.now();

      try {
        const res = await submitFn();
        const jobId = res.jobId || res.data?.jobId;

        if (!res.success || !jobId) {
          const msg = res.error || 'Failed to start job';
          setStatus('failed');
          setError(msg);
          onError?.(msg);
          return;
        }

        jobIdRef.current = jobId;
        const pollUrl = pollUrlFn(jobId);
        // Start polling after a short initial delay
        pollingRef.current = setTimeout(() => poll(pollUrl), pollIntervalMs);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to submit job';
        setStatus('failed');
        setError(msg);
        onError?.(msg);
      }
    },
    [poll, pollIntervalMs, onError, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setProgress(0);
    setMessage('');
    setResult(null);
    setError(null);
    jobIdRef.current = null;
  }, [stopPolling]);

  return {
    start,
    reset,
    status,
    progress,
    message,
    result,
    error,
    isLoading: status === 'pending' || status === 'processing',
    jobId: jobIdRef.current,
  };
}
