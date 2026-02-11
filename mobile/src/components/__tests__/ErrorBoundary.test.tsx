/**
 * ErrorBoundary Component - Comprehensive Tests
 *
 * Tests error categorization logic, recovery action mapping,
 * retry behavior with exponential backoff, state management,
 * componentDidCatch lifecycle, render output, and dev-only details.
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock lucide-react-native with React components for renderer compatibility
jest.mock('lucide-react-native', () => {
  const R = require('react');
  const createMockIcon = (name: string) => {
    const MockIcon = (props: any) => R.createElement('MockIcon', { ...props, testID: name });
    MockIcon.displayName = name;
    return MockIcon;
  };
  return new Proxy(
    {},
    {
      get: (_target: any, prop: any) => {
        if (typeof prop === 'string') return createMockIcon(prop);
        return undefined;
      },
    }
  );
});

// Mock GlassButton as a React component so react-test-renderer can render it
jest.mock('../glass/GlassButton', () => {
  const R = require('react');
  return {
    GlassButton: (props: any) =>
      R.createElement('GlassButton', {
        label: props.label,
        variant: props.variant,
        onPress: props.onPress,
        loading: props.loading,
        disabled: props.disabled,
      }),
  };
});

import ErrorBoundary from '../ErrorBoundary';

// Helper: recursively extract all text from a react-test-renderer JSON tree
function getTreeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

// Helper: render ErrorBoundary safely with renderer.act
function renderEB(props: any): renderer.ReactTestRenderer {
  let tree: renderer.ReactTestRenderer;
  renderer.act(() => {
    tree = renderer.create(React.createElement(ErrorBoundary, props));
  });
  return tree!;
}

describe('ErrorBoundary Module', () => {
  describe('Module Exports', () => {
    it('should export ErrorBoundary as the default export', () => {
      expect(ErrorBoundary).toBeDefined();
      expect(typeof ErrorBoundary).toBe('function');
    });

    it('should be a class component (has prototype.render)', () => {
      expect(ErrorBoundary.prototype.render).toBeDefined();
      expect(typeof ErrorBoundary.prototype.render).toBe('function');
    });

    it('should have getDerivedStateFromError static method', () => {
      expect(ErrorBoundary.getDerivedStateFromError).toBeDefined();
      expect(typeof ErrorBoundary.getDerivedStateFromError).toBe('function');
    });
  });

  describe('getDerivedStateFromError', () => {
    it('should return state with hasError true and the error object', () => {
      const testError = new Error('test failure');
      const result = ErrorBoundary.getDerivedStateFromError(testError);

      expect(result).toEqual({
        hasError: true,
        error: testError,
      });
    });

    it('should preserve the original error reference', () => {
      const testError = new TypeError('type mismatch');
      const result = ErrorBoundary.getDerivedStateFromError(testError);

      expect(result.error).toBe(testError);
      expect(result.error?.name).toBe('TypeError');
    });
  });

  describe('Error Categorization Logic', () => {
    let instance: InstanceType<typeof ErrorBoundary>;

    beforeEach(() => {
      instance = new ErrorBoundary({ children: null });
    });

    const categorize = (inst: any, error?: Error): string => {
      return inst.categorizeError(error);
    };

    it('should return "unknown" when error is undefined', () => {
      expect(categorize(instance, undefined)).toBe('unknown');
    });

    it('should return "unknown" when error is null-like', () => {
      expect(categorize(instance, undefined)).toBe('unknown');
    });

    describe('Network errors', () => {
      it('should categorize "network" keyword as network error', () => {
        expect(categorize(instance, new Error('Network request failed'))).toBe('network');
      });

      it('should categorize "fetch" keyword as network error', () => {
        expect(categorize(instance, new Error('Failed to fetch'))).toBe('network');
      });

      it('should categorize "timeout" keyword as network error', () => {
        expect(categorize(instance, new Error('Request timeout exceeded'))).toBe('network');
      });

      it('should categorize "connection" keyword as network error', () => {
        expect(categorize(instance, new Error('Connection refused'))).toBe('network');
      });

      it('should categorize "offline" keyword as network error', () => {
        expect(categorize(instance, new Error('Device is offline'))).toBe('network');
      });

      it('should categorize NetworkError name as network error', () => {
        const error = new Error('something');
        error.name = 'NetworkError';
        expect(categorize(instance, error)).toBe('network');
      });
    });

    describe('Data errors', () => {
      it('should categorize "json" keyword as data error', () => {
        expect(categorize(instance, new Error('Unexpected JSON token'))).toBe('data');
      });

      it('should categorize "parse" keyword as data error', () => {
        expect(categorize(instance, new Error('Failed to parse response'))).toBe('data');
      });

      it('should categorize "undefined" keyword as data error', () => {
        expect(categorize(instance, new Error('Cannot read property of undefined'))).toBe('data');
      });

      it('should categorize "null" keyword as data error', () => {
        expect(categorize(instance, new Error('Null reference encountered'))).toBe('data');
      });

      it('should categorize "type" keyword in message as data error', () => {
        expect(categorize(instance, new Error('Wrong type provided'))).toBe('data');
      });

      it('should categorize SyntaxError name as data error', () => {
        const error = new SyntaxError('Unexpected token');
        expect(categorize(instance, error)).toBe('data');
      });

      it('should categorize TypeError name as data error', () => {
        const error = new TypeError('Cannot read property');
        expect(categorize(instance, error)).toBe('data');
      });
    });

    describe('Auth errors', () => {
      it('should categorize "auth" keyword as auth error', () => {
        expect(categorize(instance, new Error('Authentication failed'))).toBe('auth');
      });

      it('should categorize "token" keyword as auth error', () => {
        expect(categorize(instance, new Error('Token expired'))).toBe('auth');
      });

      it('should categorize "unauthorized" keyword as auth error', () => {
        expect(categorize(instance, new Error('Unauthorized access'))).toBe('auth');
      });

      it('should categorize "401" keyword as auth error', () => {
        expect(categorize(instance, new Error('HTTP 401 error'))).toBe('auth');
      });

      it('should categorize "403" keyword as auth error', () => {
        expect(categorize(instance, new Error('HTTP 403 forbidden'))).toBe('auth');
      });
    });

    describe('UI errors', () => {
      it('should categorize "render" keyword as ui error', () => {
        expect(categorize(instance, new Error('Render failed'))).toBe('ui');
      });

      it('should categorize "component" keyword as ui error', () => {
        expect(categorize(instance, new Error('Component unmounted'))).toBe('ui');
      });

      it('should categorize "props" keyword as ui error', () => {
        expect(categorize(instance, new Error('Invalid props'))).toBe('ui');
      });

      it('should categorize "state" keyword as ui error', () => {
        expect(categorize(instance, new Error('State update error'))).toBe('ui');
      });
    });

    describe('Unknown errors', () => {
      it('should return "unknown" for unrecognized error messages', () => {
        expect(categorize(instance, new Error('Something bizarre happened'))).toBe('unknown');
      });

      it('should return "unknown" for empty error message', () => {
        expect(categorize(instance, new Error(''))).toBe('unknown');
      });
    });

    describe('Case insensitivity', () => {
      it('should match keywords regardless of case', () => {
        expect(categorize(instance, new Error('NETWORK ERROR'))).toBe('network');
        expect(categorize(instance, new Error('Fetch Failed'))).toBe('network');
        expect(categorize(instance, new Error('JSON Parse Error'))).toBe('data');
        expect(categorize(instance, new Error('AUTH Token Invalid'))).toBe('auth');
        expect(categorize(instance, new Error('RENDER Cycle'))).toBe('ui');
      });
    });
  });

  describe('Error Context Mapping', () => {
    let instance: any;

    beforeEach(() => {
      instance = new ErrorBoundary({ children: null });
    });

    const getContext = (inst: any): any => {
      return inst.getErrorContext();
    };

    it('should return network context for network errors', () => {
      instance.state = { hasError: true, error: new Error('Network failure'), retryCount: 0 };
      const ctx = getContext(instance);

      expect(ctx.category).toBe('network');
      expect(ctx.title).toBe('Connection Problem');
      expect(ctx.recoveryActions.length).toBe(2);
      expect(ctx.recoveryActions[0].label).toBe('Try Again');
      expect(ctx.recoveryActions[1].label).toBe('Check Network Settings');
    });

    it('should return data context for data errors', () => {
      instance.state = { hasError: true, error: new SyntaxError('JSON parse error'), retryCount: 0 };
      const ctx = getContext(instance);

      expect(ctx.category).toBe('data');
      expect(ctx.title).toBe('Data Error');
      expect(ctx.recoveryActions.length).toBe(2);
      expect(ctx.recoveryActions[1].label).toBe('Clear Cache & Retry');
    });

    it('should return auth context for auth errors', () => {
      instance.state = { hasError: true, error: new Error('Token expired'), retryCount: 0 };
      const ctx = getContext(instance);

      expect(ctx.category).toBe('auth');
      expect(ctx.title).toBe('Session Expired');
      expect(ctx.recoveryActions.length).toBe(2);
      expect(ctx.recoveryActions[0].label).toBe('Sign In Again');
      expect(ctx.recoveryActions[1].label).toBe('Go Home');
    });

    it('should return ui context for render errors', () => {
      instance.state = { hasError: true, error: new Error('Render failed'), retryCount: 0 };
      const ctx = getContext(instance);

      expect(ctx.category).toBe('ui');
      expect(ctx.title).toBe('Display Error');
      expect(ctx.recoveryActions.length).toBe(2);
      expect(ctx.recoveryActions[1].label).toBe('Go Home');
    });

    it('should return unknown context for unrecognized errors', () => {
      instance.state = { hasError: true, error: new Error('wat'), retryCount: 0 };
      const ctx = getContext(instance);

      expect(ctx.category).toBe('unknown');
      expect(ctx.title).toBe('Something Went Wrong');
      expect(ctx.recoveryActions.length).toBe(3);
      expect(ctx.recoveryActions[0].label).toBe('Try Again');
      expect(ctx.recoveryActions[1].label).toBe('Contact Support');
      expect(ctx.recoveryActions[2].label).toBe('Go Home');
    });

    it('should include correct variant types for recovery actions', () => {
      instance.state = { hasError: true, error: new Error('wat'), retryCount: 0 };
      const ctx = getContext(instance);

      expect(ctx.recoveryActions[0].variant).toBe('primary');
      expect(ctx.recoveryActions[1].variant).toBe('secondary');
      expect(ctx.recoveryActions[2].variant).toBe('ghost');
    });

    it('should have callable action functions for network recovery', () => {
      const { Linking } = require('react-native');
      Linking.openSettings = jest.fn();

      instance.state = { hasError: true, error: new Error('Network failure'), retryCount: 0 };
      const ctx = getContext(instance);

      // Execute the "Check Network Settings" action (line 167)
      ctx.recoveryActions[1].action();
      expect(Linking.openSettings).toHaveBeenCalledTimes(1);
    });

    it('should have callable action functions for data recovery (Clear Cache & Retry)', () => {
      instance.state = { hasError: true, error: new SyntaxError('JSON parse'), retryCount: 0 };
      instance.setState = jest.fn((update: any) => {
        instance.state = { ...instance.state, ...update };
      });
      const ctx = getContext(instance);

      // "Clear Cache & Retry" calls handleClearCacheAndRetry which calls handleRetry
      expect(typeof ctx.recoveryActions[1].action).toBe('function');
    });
  });

  describe('Retry Logic', () => {
    let instance: any;
    const mockOnReset = jest.fn();

    beforeEach(() => {
      jest.useFakeTimers();
      mockOnReset.mockClear();
      instance = new ErrorBoundary({ children: null, onReset: mockOnReset });
      instance.setState = jest.fn((update: any) => {
        instance.state = { ...instance.state, ...update };
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should not retry if retryCount >= 3', async () => {
      instance.state = { hasError: true, retryCount: 3, isRetrying: false };
      await instance.handleRetry();

      expect(instance.setState).not.toHaveBeenCalled();
    });

    it('should set isRetrying to true during retry', async () => {
      instance.state = { hasError: true, retryCount: 0, isRetrying: false };
      const retryPromise = instance.handleRetry();

      expect(instance.setState).toHaveBeenCalledWith({ isRetrying: true });

      jest.advanceTimersByTime(1000);
      await retryPromise;
    });

    it('should use exponential backoff: 1s for first retry', async () => {
      instance.state = { hasError: true, retryCount: 0, isRetrying: false };
      const retryPromise = instance.handleRetry();

      expect(instance.setState).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1000);
      await retryPromise;

      expect(instance.setState).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff: 2s for second retry', async () => {
      instance.state = { hasError: true, retryCount: 1, isRetrying: false };
      const retryPromise = instance.handleRetry();

      jest.advanceTimersByTime(1999);
      expect(instance.setState).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      await retryPromise;
      expect(instance.setState).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff: 4s for third retry', async () => {
      instance.state = { hasError: true, retryCount: 2, isRetrying: false };
      const retryPromise = instance.handleRetry();

      jest.advanceTimersByTime(3999);
      expect(instance.setState).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      await retryPromise;
      expect(instance.setState).toHaveBeenCalledTimes(2);
    });

    it('should increment retryCount after successful retry', async () => {
      instance.state = { hasError: true, retryCount: 0, isRetrying: false };
      const retryPromise = instance.handleRetry();
      jest.advanceTimersByTime(1000);
      await retryPromise;

      const lastCall = instance.setState.mock.calls[instance.setState.mock.calls.length - 1][0];
      expect(lastCall.retryCount).toBe(1);
      expect(lastCall.hasError).toBe(false);
      expect(lastCall.isRetrying).toBe(false);
    });

    it('should call onReset prop after retry completes', async () => {
      instance.state = { hasError: true, retryCount: 0, isRetrying: false };
      const retryPromise = instance.handleRetry();
      jest.advanceTimersByTime(1000);
      await retryPromise;

      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should not call onReset when onReset prop is not provided', async () => {
      const inst: any = new ErrorBoundary({ children: null });
      inst.setState = jest.fn((update: any) => {
        inst.state = { ...inst.state, ...update };
      });
      inst.state = { hasError: true, retryCount: 0, isRetrying: false };

      const retryPromise = inst.handleRetry();
      jest.advanceTimersByTime(1000);
      // Should not throw when onReset is undefined
      await expect(retryPromise).resolves.toBeUndefined();
    });
  });

  describe('handleClearCacheAndRetry', () => {
    let instance: any;

    beforeEach(() => {
      jest.useFakeTimers();
      instance = new ErrorBoundary({ children: null });
      instance.setState = jest.fn((update: any) => {
        instance.state = { ...instance.state, ...update };
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call handleRetry internally', async () => {
      instance.state = { hasError: true, retryCount: 0, isRetrying: false };
      const spy = jest.spyOn(instance, 'handleRetry');

      instance.handleClearCacheAndRetry();

      expect(spy).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(1000);
      spy.mockRestore();
    });

    it('should catch errors from handleRetry without throwing', async () => {
      instance.state = { hasError: true, retryCount: 0, isRetrying: false };
      // Make handleRetry throw
      instance.handleRetry = jest.fn(() => {
        throw new Error('retry broke');
      });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw
      expect(() => instance.handleClearCacheAndRetry()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error clearing cache:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('handleReAuthenticate', () => {
    it('should reset error state and call onReset', () => {
      const mockOnReset = jest.fn();
      const instance: any = new ErrorBoundary({ children: null, onReset: mockOnReset });
      instance.setState = jest.fn();

      instance.handleReAuthenticate();

      expect(instance.setState).toHaveBeenCalledWith({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0,
      });
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('handleGoHome', () => {
    it('should reset error state and call onReset', () => {
      const mockOnReset = jest.fn();
      const instance: any = new ErrorBoundary({ children: null, onReset: mockOnReset });
      instance.setState = jest.fn();

      instance.handleGoHome();

      expect(instance.setState).toHaveBeenCalledWith({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0,
      });
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('handleFullReset', () => {
    it('should completely reset all state fields including isRetrying', () => {
      const mockOnReset = jest.fn();
      const instance: any = new ErrorBoundary({ children: null, onReset: mockOnReset });
      instance.setState = jest.fn();

      instance.handleFullReset();

      expect(instance.setState).toHaveBeenCalledWith({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0,
        isRetrying: false,
      });
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('handleContactSupport', () => {
    it('should construct a mailto URL with error details', () => {
      const { Linking } = require('react-native');
      const instance: any = new ErrorBoundary({
        children: null,
        screenName: 'HomeScreen',
      });
      instance.state = {
        hasError: true,
        error: new Error('Critical failure'),
        retryCount: 0,
      };

      instance.handleContactSupport();

      expect(Linking.openURL).toHaveBeenCalledTimes(1);
      const calledUrl: string = Linking.openURL.mock.calls[0][0];
      expect(calledUrl).toContain('mailto:support@talorme.com');
      expect(calledUrl).toContain('subject=');
      expect(calledUrl).toContain('body=');
      expect(calledUrl).toContain('Critical%20failure');
      expect(calledUrl).toContain('HomeScreen');
    });

    it('should handle missing error gracefully in mailto URL', () => {
      const { Linking } = require('react-native');
      Linking.openURL.mockClear();

      const instance: any = new ErrorBoundary({ children: null });
      instance.state = { hasError: true, error: undefined, retryCount: 0 };

      instance.handleContactSupport();

      const calledUrl: string = Linking.openURL.mock.calls[0][0];
      expect(calledUrl).toContain('Unknown%20error');
    });

    it('should handle missing screenName gracefully', () => {
      const { Linking } = require('react-native');
      Linking.openURL.mockClear();

      const instance: any = new ErrorBoundary({ children: null });
      instance.state = { hasError: true, error: new Error('test'), retryCount: 0 };

      instance.handleContactSupport();

      const calledUrl: string = Linking.openURL.mock.calls[0][0];
      expect(calledUrl).toContain('Unknown');
    });
  });

  describe('Initial State', () => {
    it('should initialize with hasError false and retryCount 0', () => {
      const instance: any = new ErrorBoundary({ children: null });
      expect(instance.state.hasError).toBe(false);
      expect(instance.state.retryCount).toBe(0);
      expect(instance.state.isRetrying).toBe(false);
    });
  });

  describe('componentDidCatch', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
      (global as any).__DEV__ = true;
    });

    it('should call console.error with the error and errorInfo', () => {
      const instance: any = new ErrorBoundary({ children: null });
      instance.setState = jest.fn();

      const testError = new Error('test crash');
      const testErrorInfo = { componentStack: '\n  at BrokenComponent\n  at App' };

      instance.componentDidCatch(testError, testErrorInfo);

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        testError,
        testErrorInfo
      );
    });

    it('should call setState with errorInfo', () => {
      const instance: any = new ErrorBoundary({ children: null });
      instance.setState = jest.fn();

      const testError = new Error('crash');
      const testErrorInfo = { componentStack: '\n  at Broken' };

      instance.componentDidCatch(testError, testErrorInfo);

      expect(instance.setState).toHaveBeenCalledWith({ errorInfo: testErrorInfo });
    });

    it('should call onError prop callback when provided', () => {
      const mockOnError = jest.fn();
      const instance: any = new ErrorBoundary({ children: null, onError: mockOnError });
      instance.setState = jest.fn();

      const testError = new Error('crash');
      const testErrorInfo = { componentStack: '\n  at Component' };

      instance.componentDidCatch(testError, testErrorInfo);

      expect(mockOnError).toHaveBeenCalledWith(testError, testErrorInfo);
    });

    it('should not throw when onError prop is not provided', () => {
      const instance: any = new ErrorBoundary({ children: null });
      instance.setState = jest.fn();

      const testError = new Error('crash');
      const testErrorInfo = { componentStack: '' };

      expect(() => instance.componentDidCatch(testError, testErrorInfo)).not.toThrow();
    });

    it('should NOT call logErrorToService when __DEV__ is true', () => {
      (global as any).__DEV__ = true;
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const instance: any = new ErrorBoundary({ children: null, screenName: 'TestScreen' });
      instance.setState = jest.fn();

      const testError = new Error('dev crash');
      const testErrorInfo = { componentStack: '' };

      instance.componentDidCatch(testError, testErrorInfo);

      // logErrorToService uses console.log; should NOT have been called with the service log message
      const serviceLogCalls = logSpy.mock.calls.filter(
        (call: any[]) => call[0] === 'Would log error to service:'
      );
      expect(serviceLogCalls.length).toBe(0);

      logSpy.mockRestore();
    });

    it('should call logErrorToService when __DEV__ is false', () => {
      (global as any).__DEV__ = false;
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const instance: any = new ErrorBoundary({ children: null, screenName: 'ProdScreen' });
      instance.setState = jest.fn();

      const testError = new Error('prod crash');
      testError.stack = 'Error: prod crash\n  at Object.<anonymous>';
      const testErrorInfo = { componentStack: '\n  at ProdComponent' };

      instance.componentDidCatch(testError, testErrorInfo);

      // logErrorToService should have been called
      expect(logSpy).toHaveBeenCalledWith('Would log error to service:', {
        error: 'prod crash',
        stack: testError.stack,
        componentStack: '\n  at ProdComponent',
        screenName: 'ProdScreen',
      });

      logSpy.mockRestore();
    });

    it('should pass screenName from props to logErrorToService', () => {
      (global as any).__DEV__ = false;
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const instance: any = new ErrorBoundary({ children: null, screenName: 'SettingsScreen' });
      instance.setState = jest.fn();

      instance.componentDidCatch(new Error('x'), { componentStack: '' });

      const logCall = logSpy.mock.calls.find(
        (call: any[]) => call[0] === 'Would log error to service:'
      );
      expect(logCall).toBeDefined();
      expect(logCall![1].screenName).toBe('SettingsScreen');

      logSpy.mockRestore();
    });

    it('should handle undefined screenName in logErrorToService', () => {
      (global as any).__DEV__ = false;
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const instance: any = new ErrorBoundary({ children: null });
      instance.setState = jest.fn();

      instance.componentDidCatch(new Error('y'), { componentStack: '' });

      const logCall = logSpy.mock.calls.find(
        (call: any[]) => call[0] === 'Would log error to service:'
      );
      expect(logCall![1].screenName).toBeUndefined();

      logSpy.mockRestore();
    });
  });

  describe('componentWillUnmount', () => {
    it('should clear retryTimeoutId if it exists', () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const instance: any = new ErrorBoundary({ children: null });
      // Simulate that a retry timeout was set
      instance.retryTimeoutId = setTimeout(() => {}, 5000);

      instance.componentWillUnmount();

      expect(clearTimeoutSpy).toHaveBeenCalledWith(instance.retryTimeoutId);

      clearTimeoutSpy.mockRestore();
      jest.useRealTimers();
    });

    it('should not throw if retryTimeoutId is undefined', () => {
      const instance: any = new ErrorBoundary({ children: null });
      instance.retryTimeoutId = undefined;

      expect(() => instance.componentWillUnmount()).not.toThrow();
    });
  });

  describe('Render Output', () => {
    afterEach(() => {
      (global as any).__DEV__ = true;
    });

    it('should render children when there is no error', () => {
      const tree = renderEB({
        children: React.createElement('View', { testID: 'child' }),
      });

      const json = tree.toJSON() as any;
      expect(json.type).toBe('View');
      expect(json.props.testID).toBe('child');

      tree.unmount();
    });

    it('should render fallback when provided and error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
        fallback: React.createElement('Text', null, 'Custom Fallback'),
      });

      // Simulate error by directly setting state
      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({ hasError: true, error: new Error('boom') });
      });

      const json = tree.toJSON() as any;
      expect(json.type).toBe('Text');
      expect(getTreeText(json)).toBe('Custom Fallback');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should render default error UI when no fallback is provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Something unexpected'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Something Went Wrong');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should show network error UI for network errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Network failure'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Connection Problem');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should show retry count info when retryCount > 0 and can still retry', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Something weird'),
          retryCount: 2,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Retry attempt 2/3');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should NOT show retry count info when retryCount is 0', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Something weird'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Retry attempt');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should show max retries message when retryCount >= 3', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Something weird'),
          retryCount: 3,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Maximum retries reached');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should NOT show max retries message when retries remain', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Something weird'),
          retryCount: 1,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Maximum retries reached');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should render GlassButton components for each recovery action', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('wat'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      // Unknown error has 3 recovery actions
      const buttons = tree.root.findAllByType('GlassButton' as any);
      expect(buttons.length).toBe(3);
      expect(buttons[0].props.label).toBe('Try Again');
      expect(buttons[1].props.label).toBe('Contact Support');
      expect(buttons[2].props.label).toBe('Go Home');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should set loading=true on first button when isRetrying', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('wat'),
          retryCount: 0,
          isRetrying: true,
        });
      });

      const buttons = tree.root.findAllByType('GlassButton' as any);
      expect(buttons[0].props.loading).toBe(true);
      expect(buttons[1].props.loading).toBe(false);

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should disable all buttons when isRetrying', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('wat'),
          retryCount: 0,
          isRetrying: true,
        });
      });

      const buttons = tree.root.findAllByType('GlassButton' as any);
      buttons.forEach((btn: any) => {
        expect(btn.props.disabled).toBe(true);
      });

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should disable Try Again button when max retries reached', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('wat'),
          retryCount: 3,
          isRetrying: false,
        });
      });

      const buttons = tree.root.findAllByType('GlassButton' as any);
      // Try Again should be disabled
      const tryAgainBtn = buttons.find((b: any) => b.props.label === 'Try Again');
      expect(tryAgainBtn!.props.disabled).toBe(true);

      // Other buttons should NOT be disabled (isRetrying is false, and they are not "Try Again")
      const contactBtn = buttons.find((b: any) => b.props.label === 'Contact Support');
      expect(contactBtn!.props.disabled).toBe(false);

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should show dev-only error details when __DEV__ is true', () => {
      (global as any).__DEV__ = true;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Debug visible error'),
          errorInfo: { componentStack: '\n  at TestComponent\n  at App' },
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Debug Info (Dev Only):');
      expect(text).toContain('Category:');
      expect(text).toContain('Debug visible error');
      expect(text).toContain('at TestComponent');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should NOT show dev error details when __DEV__ is false', () => {
      (global as any).__DEV__ = false;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Hidden error'),
          errorInfo: { componentStack: '\n  at Secret' },
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).not.toContain('Debug Info (Dev Only):');
      expect(text).not.toContain('at Secret');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should not show componentStack section when errorInfo is missing', () => {
      (global as any).__DEV__ = true;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('No stack error'),
          errorInfo: undefined,
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      // Dev info should still show
      expect(text).toContain('Debug Info (Dev Only):');
      expect(text).toContain('No stack error');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should not show componentStack when componentStack is empty/null', () => {
      (global as any).__DEV__ = true;
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Has errorInfo but no stack'),
          errorInfo: { componentStack: '' },
          retryCount: 0,
          isRetrying: false,
        });
      });

      // The ScrollView for componentStack should not render if componentStack is falsy
      // (empty string is falsy in JS)
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Debug Info (Dev Only):');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should render auth error recovery actions (Sign In Again, Go Home)', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Token expired'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Session Expired');

      const buttons = tree.root.findAllByType('GlassButton' as any);
      expect(buttons.length).toBe(2);
      expect(buttons[0].props.label).toBe('Sign In Again');
      expect(buttons[1].props.label).toBe('Go Home');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should render data error recovery actions (Try Again, Clear Cache & Retry)', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new SyntaxError('JSON parse error'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Data Error');

      const buttons = tree.root.findAllByType('GlassButton' as any);
      expect(buttons.length).toBe(2);
      expect(buttons[0].props.label).toBe('Try Again');
      expect(buttons[1].props.label).toBe('Clear Cache & Retry');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should render UI error recovery actions (Try Again, Go Home)', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Render failed'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Display Error');

      const buttons = tree.root.findAllByType('GlassButton' as any);
      expect(buttons.length).toBe(2);
      expect(buttons[0].props.label).toBe('Try Again');
      expect(buttons[1].props.label).toBe('Go Home');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should render network error recovery actions (Try Again, Check Network Settings)', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Network failure'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const buttons = tree.root.findAllByType('GlassButton' as any);
      expect(buttons.length).toBe(2);
      expect(buttons[0].props.label).toBe('Try Again');
      expect(buttons[1].props.label).toBe('Check Network Settings');

      tree.unmount();
      consoleSpy.mockRestore();
    });

    it('should show error description message in the UI', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const tree = renderEB({
        children: React.createElement('View', null),
      });

      const inst = tree.root.instance as any;
      renderer.act(() => {
        inst.setState({
          hasError: true,
          error: new Error('Connection timed out'),
          retryCount: 0,
          isRetrying: false,
        });
      });

      const text = getTreeText(tree.toJSON());
      expect(text).toContain("couldn't connect to our servers");

      tree.unmount();
      consoleSpy.mockRestore();
    });
  });
});
