/**
 * Jest global setup - runs BEFORE test framework
 * Only set global variables here, no jest.mock() or expect.extend()
 */
(global as any).__DEV__ = true;

// Global AbortController mock (if not available)
if (typeof AbortController === 'undefined') {
  (global as any).AbortController = class {
    signal = { aborted: false };
    abort() {
      (this.signal as any).aborted = true;
    }
  };
}
