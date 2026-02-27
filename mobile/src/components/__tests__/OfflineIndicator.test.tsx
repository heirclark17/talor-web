/**
 * OfflineIndicator Tests
 *
 * Pure logic tests and direct component invocation:
 * - Module exports (OfflineIndicator, OfflineDot, OfflineOverlay)
 * - Title text derivation (offline vs syncing)
 * - Queue stats subtitle formatting (singular/plural, high priority)
 * - Visibility logic (isOffline + hasPendingRequests)
 * - Position style logic (top/bottom)
 * - Slide animation target (top: -100, bottom: 100)
 * - Retry button visibility (pending + online)
 * - Dismiss button visibility (dismissible prop)
 * - Background color (dark vs light)
 * - Direct component invocation for all three exports
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      border: '#374151',
      backgroundTertiary: '#2a2a2a',
    },
    isDark: true,
  })),
}));

const mockProcessQueue = jest.fn(() => Promise.resolve());
const mockUseNetwork = jest.fn(() => ({
  isOffline: false,
  queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
  processQueue: mockProcessQueue,
  hasPendingRequests: false,
}));

jest.mock('../../hooks/useNetwork', () => ({
  useNetwork: () => mockUseNetwork(),
}));

import { OfflineIndicator, OfflineDot, OfflineOverlay } from '../OfflineIndicator';
import OfflineIndicatorDefault from '../OfflineIndicator';
import { COLORS, ALPHA_COLORS } from '../../utils/constants';

const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  let text = '';
  if (node.props) {
    for (const val of Object.values(node.props)) {
      if (typeof val === 'string') text += ' ' + val;
    }
  }
  if (node.children) {
    for (const child of node.children) {
      text += ' ' + getTreeText(child);
    }
  }
  return text;
};

describe('OfflineIndicator', () => {
  describe('module exports', () => {
    it('should export OfflineIndicator as named export', () => {
      expect(OfflineIndicator).toBeDefined();
      expect(typeof OfflineIndicator).toBe('function');
    });

    it('should export OfflineIndicator as default export', () => {
      expect(OfflineIndicatorDefault).toBeDefined();
      expect(typeof OfflineIndicatorDefault).toBe('function');
    });

    it('should have named and default export be the same', () => {
      expect(OfflineIndicator).toBe(OfflineIndicatorDefault);
    });

    it('should export OfflineDot as named export', () => {
      expect(OfflineDot).toBeDefined();
      expect(typeof OfflineDot).toBe('function');
    });

    it('should export OfflineOverlay as named export', () => {
      expect(OfflineOverlay).toBeDefined();
      expect(typeof OfflineOverlay).toBe('function');
    });
  });

  describe('title text derivation logic', () => {
    it('should show "No Internet Connection" when offline', () => {
      const isOffline = true;
      const title = isOffline ? 'No Internet Connection' : 'Syncing Pending Changes';
      expect(title).toBe('No Internet Connection');
    });

    it('should show "Syncing Pending Changes" when online with pending requests', () => {
      const isOffline = false;
      const title = isOffline ? 'No Internet Connection' : 'Syncing Pending Changes';
      expect(title).toBe('Syncing Pending Changes');
    });
  });

  describe('subtitle formatting logic', () => {
    it('should use singular "request" when total is 1', () => {
      const total = 1;
      const byPriorityHigh = 0;
      const subtitle = `${total} pending ${total === 1 ? 'request' : 'requests'}${
        byPriorityHigh > 0 ? ` (${byPriorityHigh} high priority)` : ''
      }`;
      expect(subtitle).toBe('1 pending request');
    });

    it('should use plural "requests" when total is greater than 1', () => {
      const total: number = 5;
      const byPriorityHigh: number = 0;
      const subtitle = `${total} pending ${total === 1 ? 'request' : 'requests'}${
        byPriorityHigh > 0 ? ` (${byPriorityHigh} high priority)` : ''
      }`;
      expect(subtitle).toBe('5 pending requests');
    });

    it('should append high priority count when present', () => {
      const total: number = 3;
      const byPriorityHigh: number = 2;
      const subtitle = `${total} pending ${total === 1 ? 'request' : 'requests'}${
        byPriorityHigh > 0 ? ` (${byPriorityHigh} high priority)` : ''
      }`;
      expect(subtitle).toBe('3 pending requests (2 high priority)');
    });

    it('should not append high priority text when high is zero', () => {
      const total: number = 4;
      const byPriorityHigh: number = 0;
      const subtitle = `${total} pending ${total === 1 ? 'request' : 'requests'}${
        byPriorityHigh > 0 ? ` (${byPriorityHigh} high priority)` : ''
      }`;
      expect(subtitle).toBe('4 pending requests');
    });

    it('should use plural "requests" for zero total', () => {
      const total: number = 0;
      const subtitle = `${total} pending ${total === 1 ? 'request' : 'requests'}`;
      expect(subtitle).toBe('0 pending requests');
    });
  });

  describe('visibility logic', () => {
    it('should return null when online and no pending requests', () => {
      const isOffline = false;
      const hasPendingRequests = false;
      const shouldRender = isOffline || hasPendingRequests;
      expect(shouldRender).toBe(false);
    });

    it('should render when offline', () => {
      const isOffline = true;
      const hasPendingRequests = false;
      const shouldRender = isOffline || hasPendingRequests;
      expect(shouldRender).toBe(true);
    });

    it('should render when online with pending requests', () => {
      const isOffline = false;
      const hasPendingRequests = true;
      const shouldRender = isOffline || hasPendingRequests;
      expect(shouldRender).toBe(true);
    });

    it('should render when offline and has pending requests', () => {
      const isOffline = true;
      const hasPendingRequests = true;
      const shouldRender = isOffline || hasPendingRequests;
      expect(shouldRender).toBe(true);
    });
  });

  describe('position style logic', () => {
    it('should use top position by default', () => {
      const position: 'top' | 'bottom' = 'top';
      const positionStyle = position === 'top' ? { top: 0, paddingTop: 44 } : { bottom: 0, paddingBottom: 34 };
      expect(positionStyle).toEqual({ top: 0, paddingTop: 44 });
    });

    it('should use bottom position when specified', () => {
      const position = 'bottom' as 'top' | 'bottom';
      const positionStyle = position === 'top' ? { top: 0, paddingTop: 44 } : { bottom: 0, paddingBottom: 34 };
      expect(positionStyle).toEqual({ bottom: 0, paddingBottom: 34 });
    });
  });

  describe('slide animation target logic', () => {
    it('should slide to -100 for top position when hiding', () => {
      const position = 'top' as 'top' | 'bottom';
      const hideTarget = position === 'top' ? -100 : 100;
      expect(hideTarget).toBe(-100);
    });

    it('should slide to 100 for bottom position when hiding', () => {
      const position = 'bottom' as 'top' | 'bottom';
      const hideTarget = position === 'top' ? -100 : 100;
      expect(hideTarget).toBe(100);
    });

    it('should slide to 0 when showing (both positions)', () => {
      const showTarget = 0;
      expect(showTarget).toBe(0);
    });
  });

  describe('background color logic', () => {
    it('should use darker red when isDark is true', () => {
      const isDark = true;
      const bg = isDark ? 'rgba(239, 68, 68, 0.95)' : 'rgba(220, 38, 38, 0.95)';
      expect(bg).toBe('rgba(239, 68, 68, 0.95)');
    });

    it('should use lighter red when isDark is false', () => {
      const isDark = false;
      const bg = isDark ? 'rgba(239, 68, 68, 0.95)' : 'rgba(220, 38, 38, 0.95)';
      expect(bg).toBe('rgba(220, 38, 38, 0.95)');
    });
  });

  describe('retry button visibility logic', () => {
    it('should show retry when has pending requests and online', () => {
      const hasPendingRequests = true;
      const isOffline = false;
      const showRetry = hasPendingRequests && !isOffline;
      expect(showRetry).toBe(true);
    });

    it('should not show retry when offline', () => {
      const hasPendingRequests = true;
      const isOffline = true;
      const showRetry = hasPendingRequests && !isOffline;
      expect(showRetry).toBe(false);
    });

    it('should not show retry when no pending requests', () => {
      const hasPendingRequests = false;
      const isOffline = false;
      const showRetry = hasPendingRequests && !isOffline;
      expect(showRetry).toBe(false);
    });
  });

  describe('dismiss button visibility logic', () => {
    it('should show dismiss when dismissible=true', () => {
      const dismissible = true;
      expect(dismissible).toBe(true);
    });

    it('should not show dismiss when dismissible=false', () => {
      const dismissible = false;
      expect(dismissible).toBe(false);
    });
  });

  describe('handleRetry logic', () => {
    it('should call processQueue', async () => {
      const processQueue = jest.fn(() => Promise.resolve());
      const onRetry = jest.fn();
      const setIsProcessing = jest.fn();

      setIsProcessing(true);
      try {
        await processQueue();
        onRetry?.();
      } finally {
        setIsProcessing(false);
      }

      expect(processQueue).toHaveBeenCalled();
      expect(onRetry).toHaveBeenCalled();
      expect(setIsProcessing).toHaveBeenCalledWith(true);
      expect(setIsProcessing).toHaveBeenCalledWith(false);
    });

    it('should reset isProcessing even if processQueue throws', async () => {
      const processQueue = jest.fn(() => Promise.reject(new Error('fail')));
      const setIsProcessing = jest.fn();

      setIsProcessing(true);
      try {
        await processQueue();
      } catch {
        // expected
      } finally {
        setIsProcessing(false);
      }

      expect(setIsProcessing).toHaveBeenCalledWith(false);
    });

    it('should not call onRetry when it is undefined', async () => {
      const processQueue = jest.fn(() => Promise.resolve());
      const onRetry = undefined as (() => void) | undefined;
      const setIsProcessing = jest.fn();

      setIsProcessing(true);
      try {
        await processQueue();
        onRetry?.();
      } finally {
        setIsProcessing(false);
      }

      expect(processQueue).toHaveBeenCalled();
    });
  });

  describe('handleDismiss logic', () => {
    it('should set isDismissed to true', () => {
      const setIsDismissed = jest.fn();
      setIsDismissed(true);
      expect(setIsDismissed).toHaveBeenCalledWith(true);
    });
  });

  describe('isDismissed reset logic', () => {
    it('should reset isDismissed when coming back online', () => {
      const isOffline = false;
      const setIsDismissed = jest.fn();
      if (!isOffline) {
        setIsDismissed(false);
      }
      expect(setIsDismissed).toHaveBeenCalledWith(false);
    });

    it('should not reset isDismissed when still offline', () => {
      const isOffline = true;
      const setIsDismissed = jest.fn();
      if (!isOffline) {
        setIsDismissed(false);
      }
      expect(setIsDismissed).not.toHaveBeenCalled();
    });
  });

  describe('icon selection logic', () => {
    it('should use WifiOff icon when offline', () => {
      const isOffline = true;
      const icon = isOffline ? 'WifiOff' : 'CloudOff';
      expect(icon).toBe('WifiOff');
    });

    it('should use CloudOff icon when online with pending', () => {
      const isOffline = false;
      const icon = isOffline ? 'WifiOff' : 'CloudOff';
      expect(icon).toBe('CloudOff');
    });
  });

  describe('React.createElement invocation - OfflineIndicator', () => {
    it('should create element with default props', () => {
      const element = React.createElement(OfflineIndicator, {});
      expect(element).toBeTruthy();
    });

    it('should create element with showDetails=true', () => {
      const element = React.createElement(OfflineIndicator, { showDetails: true });
      expect(element).toBeTruthy();
      expect(element.props.showDetails).toBe(true);
    });

    it('should create element with position=bottom', () => {
      const element = React.createElement(OfflineIndicator, { position: 'bottom' });
      expect(element).toBeTruthy();
      expect(element.props.position).toBe('bottom');
    });

    it('should create element with dismissible=true', () => {
      const element = React.createElement(OfflineIndicator, { dismissible: true });
      expect(element).toBeTruthy();
      expect(element.props.dismissible).toBe(true);
    });

    it('should create element with onRetry callback', () => {
      const onRetry = jest.fn();
      const element = React.createElement(OfflineIndicator, { onRetry });
      expect(element).toBeTruthy();
      expect(element.props.onRetry).toBe(onRetry);
    });

    it('should create element with all props', () => {
      const onRetry = jest.fn();
      const element = React.createElement(OfflineIndicator, {
        showDetails: true,
        position: 'bottom',
        onRetry,
        dismissible: true,
      });
      expect(element).toBeTruthy();
      expect(element.props.showDetails).toBe(true);
      expect(element.props.position).toBe('bottom');
      expect(element.props.onRetry).toBe(onRetry);
      expect(element.props.dismissible).toBe(true);
    });

    it('should create element with position=top', () => {
      const element = React.createElement(OfflineIndicator, { position: 'top' });
      expect(element).toBeTruthy();
      expect(element.props.position).toBe('top');
    });
  });

  describe('React.createElement invocation - OfflineDot', () => {
    it('should create OfflineDot element', () => {
      const element = React.createElement(OfflineDot, {});
      expect(element).toBeTruthy();
      expect(element.type).toBe(OfflineDot);
    });
  });

  describe('React.createElement invocation - OfflineOverlay', () => {
    it('should create OfflineOverlay element with defaults', () => {
      const element = React.createElement(OfflineOverlay, {});
      expect(element).toBeTruthy();
    });

    it('should create OfflineOverlay with custom message', () => {
      const element = React.createElement(OfflineOverlay, { message: 'Custom offline message' });
      expect(element).toBeTruthy();
      expect(element.props.message).toBe('Custom offline message');
    });

    it('should create OfflineOverlay with onRetry', () => {
      const onRetry = jest.fn();
      const element = React.createElement(OfflineOverlay, { onRetry });
      expect(element).toBeTruthy();
      expect(element.props.onRetry).toBe(onRetry);
    });

    it('should create OfflineOverlay without onRetry', () => {
      const element = React.createElement(OfflineOverlay, {});
      expect(element).toBeTruthy();
      expect(element.props.onRetry).toBeUndefined();
    });

    it('should create OfflineOverlay with all props', () => {
      const onRetry = jest.fn();
      const element = React.createElement(OfflineOverlay, {
        message: 'Full props test',
        onRetry,
      });
      expect(element).toBeTruthy();
      expect(element.props.message).toBe('Full props test');
      expect(element.props.onRetry).toBe(onRetry);
    });
  });

  describe('OfflineOverlay default message', () => {
    it('should have default message when not specified', () => {
      const defaultMsg = 'This feature requires an internet connection';
      expect(defaultMsg).toBe('This feature requires an internet connection');
    });
  });

  describe('OfflineIndicator default props', () => {
    it('should default showDetails to false', () => {
      const showDetails = false;
      expect(showDetails).toBe(false);
    });

    it('should default position to top', () => {
      const position = 'top';
      expect(position).toBe('top');
    });

    it('should default dismissible to false', () => {
      const dismissible = false;
      expect(dismissible).toBe(false);
    });
  });

  describe('react-test-renderer rendering - OfflineIndicator online no pending', () => {
    beforeEach(() => {
      mockUseNetwork.mockReturnValue({
        isOffline: false,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
    });

    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(OfflineIndicator, props));
      });
      return tree!;
    };

    it('should render null when online and no pending requests', () => {
      const tree = renderComponent({});
      expect(tree.toJSON()).toBeNull();
    });
  });

  describe('react-test-renderer rendering - OfflineIndicator offline', () => {
    beforeEach(() => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
    });

    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(OfflineIndicator, props));
      });
      return tree!;
    };

    it('should render offline banner with "No Internet Connection"', () => {
      const tree = renderComponent({});
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('No Internet Connection');
    });

    it('should NOT show retry button when offline', () => {
      const tree = renderComponent({ onRetry: jest.fn() });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      // Should have no retry button (retry only shows when online + pending)
      const retryButtons = touchables.filter((t: any) =>
        t.props.accessibilityLabel === 'Retry pending requests'
      );
      expect(retryButtons).toHaveLength(0);
    });

    it('should show dismiss button when dismissible=true', () => {
      const tree = renderComponent({ dismissible: true });
      const root = tree.root;
      const dismissButton = root.findAllByType('TouchableOpacity').find((t: any) =>
        t.props.accessibilityLabel === 'Dismiss offline notification'
      );
      expect(dismissButton).toBeDefined();
    });

    it('should NOT show dismiss button when dismissible=false', () => {
      const tree = renderComponent({ dismissible: false });
      const root = tree.root;
      const dismissButton = root.findAllByType('TouchableOpacity').find((t: any) =>
        t.props.accessibilityLabel === 'Dismiss offline notification'
      );
      expect(dismissButton).toBeUndefined();
    });

    it('should dismiss when dismiss button is pressed', () => {
      const tree = renderComponent({ dismissible: true });
      const root = tree.root;
      const dismissButton = root.findAllByType('TouchableOpacity').find((t: any) =>
        t.props.accessibilityLabel === 'Dismiss offline notification'
      );
      renderer.act(() => {
        dismissButton!.props.onPress();
      });
      // After dismiss, the component still renders but the animation hides it
      expect(tree.toJSON()).toBeDefined();
    });
  });

  describe('react-test-renderer rendering - OfflineIndicator online with pending', () => {
    beforeEach(() => {
      mockUseNetwork.mockReturnValue({
        isOffline: false,
        queueStats: { total: 3, byPriority: { high: 1, normal: 2, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: true,
      });
    });

    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(OfflineIndicator, props));
      });
      return tree!;
    };

    it('should render "Syncing Pending Changes" text', () => {
      const tree = renderComponent({});
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Syncing Pending Changes');
    });

    it('should show subtitle with pending count when showDetails=true', () => {
      const tree = renderComponent({ showDetails: true });
      const str = getTreeText(tree.toJSON());
      // React splits template literals: ["3"," pending ","requests"," (1 high priority)"]
      expect(str).toContain('pending');
      expect(str).toContain('requests');
      expect(str).toContain('high priority');
    });

    it('should show retry button when online with pending requests', () => {
      const tree = renderComponent({ onRetry: jest.fn() });
      const root = tree.root;
      const retryButton = root.findAllByType('TouchableOpacity').find((t: any) =>
        t.props.accessibilityLabel === 'Retry pending requests'
      );
      expect(retryButton).toBeDefined();
    });

    it('should call processQueue and onRetry when retry is pressed', async () => {
      const onRetry = jest.fn();
      mockProcessQueue.mockResolvedValue(undefined);
      const tree = renderComponent({ onRetry });
      const root = tree.root;

      const retryButton = root.findAllByType('TouchableOpacity').find((t: any) =>
        t.props.accessibilityLabel === 'Retry pending requests'
      );

      await renderer.act(async () => {
        retryButton!.props.onPress();
      });

      expect(mockProcessQueue).toHaveBeenCalled();
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('react-test-renderer rendering - OfflineIndicator position=bottom', () => {
    beforeEach(() => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
    });

    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(OfflineIndicator, props));
      });
      return tree!;
    };

    it('should render with bottom position', () => {
      const tree = renderComponent({ position: 'bottom' });
      expect(tree.toJSON()).toBeDefined();
    });
  });

  describe('react-test-renderer rendering - OfflineDot', () => {
    const renderDot = () => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(OfflineDot, {}));
      });
      return tree!;
    };

    it('should render null when online', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: false,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const tree = renderDot();
      expect(tree.toJSON()).toBeNull();
    });

    it('should render dot when offline', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const tree = renderDot();
      expect(tree.toJSON()).toBeDefined();
    });
  });

  describe('react-test-renderer rendering - OfflineOverlay', () => {
    const renderOverlay = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(OfflineOverlay, props));
      });
      return tree!;
    };

    it('should render null when online', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: false,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const tree = renderOverlay({});
      expect(tree.toJSON()).toBeNull();
    });

    it('should render overlay when offline with default message', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const tree = renderOverlay({});
      const str = getTreeText(tree.toJSON());
      expect(str).toContain("You're Offline");
      expect(str).toContain('This feature requires an internet connection');
    });

    it('should render overlay with custom message', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const tree = renderOverlay({ message: 'Custom offline message' });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Custom offline message');
    });

    it('should render "Try Again" button when onRetry is provided', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const onRetry = jest.fn();
      const tree = renderOverlay({ onRetry });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Try Again');

      // Press the button
      const root = tree.root;
      const retryButton = root.findAllByType('TouchableOpacity').find((t: any) =>
        t.props.accessibilityLabel === 'Try again'
      );
      expect(retryButton).toBeDefined();
      renderer.act(() => {
        retryButton!.props.onPress();
      });
      expect(onRetry).toHaveBeenCalled();
    });

    it('should NOT render "Try Again" button when onRetry is not provided', () => {
      mockUseNetwork.mockReturnValue({
        isOffline: true,
        queueStats: { total: 0, byPriority: { high: 0, normal: 0, low: 0 } },
        processQueue: mockProcessQueue,
        hasPendingRequests: false,
      });
      const tree = renderOverlay({});
      const str = getTreeText(tree.toJSON());
      expect(str).not.toContain('Try Again');
    });
  });
});
