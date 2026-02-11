/**
 * Comprehensive tests for useNetwork and useOnlineStatus hooks
 * Tests all hook functionality including state updates, callbacks, and effects
 *
 * Fixed: Switched from @testing-library/react-hooks (incompatible with React 19)
 * to @testing-library/react-native which exports a compatible renderHook.
 * Replaced waitForNextUpdate() with a separate await act(async () => {}) to flush
 * the microtask queue after the initial render.
 */

import { renderHook, act } from '@testing-library/react-native';
import { useNetwork, useOnlineStatus } from '../useNetwork';
import { networkManager } from '../../utils/network';

// Mock the network manager
jest.mock('../../utils/network', () => {
  let subscribers: Array<(info: any) => void> = [];
  let currentStatus = {
    status: 'online' as const,
    type: 'wifi' as const,
    isConnected: true,
    isInternetReachable: true,
  };

  return {
    networkManager: {
      getStatus: jest.fn(() => currentStatus),
      isOnline: jest.fn(() => currentStatus.status === 'online'),
      subscribe: jest.fn((callback: (info: any) => void) => {
        subscribers.push(callback);
        return () => {
          subscribers = subscribers.filter((s) => s !== callback);
        };
      }),
      getQueueStats: jest.fn(() =>
        Promise.resolve({
          total: 5,
          byPriority: { high: 2, normal: 2, low: 1 },
          oldestTimestamp: Date.now() - 1000,
        })
      ),
      processQueue: jest.fn(() => Promise.resolve({ processed: 3, failed: 0 })),
      clearQueue: jest.fn(() => Promise.resolve()),
      queueRequest: jest.fn(() => Promise.resolve('req_abc123')),
      // Helper to trigger status change in tests
      _triggerStatusChange: (newStatus: any) => {
        currentStatus = newStatus;
        subscribers.forEach((cb) => cb(newStatus));
      },
      _resetSubscribers: () => {
        subscribers = [];
      },
      _setCurrentStatus: (newStatus: any) => {
        currentStatus = newStatus;
      },
    },
  };
});

/**
 * Helper: render the hook then flush the initial useEffect + loadQueueStats promise.
 * renderHook must be called OUTSIDE act(), then a separate act() flushes pending async work.
 */
async function renderUseNetwork() {
  const hookResult = renderHook(() => useNetwork());
  // Flush the useEffect + async loadQueueStats call
  await act(async () => {});
  return hookResult;
}

async function renderUseOnlineStatus() {
  const hookResult = renderHook(() => useOnlineStatus());
  // Flush any pending effects
  await act(async () => {});
  return hookResult;
}

describe('useNetwork hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (networkManager as any)._resetSubscribers();
    // Reset the current status back to online/wifi default
    (networkManager as any)._setCurrentStatus({
      status: 'online',
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('initialization', () => {
    it('should return initial network status from networkManager', async () => {
      const { result } = await renderUseNetwork();

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isOffline).toBe(false);
      expect(result.current.networkStatus).toBe('online');
      expect(result.current.networkType).toBe('wifi');
      expect(result.current.isInternetReachable).toBe(true);
    });

    it('should subscribe to network changes on mount', async () => {
      await renderUseNetwork();
      expect(networkManager.subscribe).toHaveBeenCalled();
    });

    it('should load initial queue stats on mount', async () => {
      const { result } = await renderUseNetwork();

      expect(networkManager.getQueueStats).toHaveBeenCalled();
      expect(result.current.queueStats.total).toBe(5);
      expect(result.current.queueStats.byPriority).toEqual({
        high: 2,
        normal: 2,
        low: 1,
      });
    });

    it('should set hasPendingRequests to true when queue has items', async () => {
      const { result } = await renderUseNetwork();

      expect(result.current.hasPendingRequests).toBe(true);
    });

    it('should set hasPendingRequests to false when queue is empty', async () => {
      (networkManager.getQueueStats as jest.Mock).mockResolvedValueOnce({
        total: 0,
        byPriority: { high: 0, normal: 0, low: 0 },
        oldestTimestamp: null,
      });

      const { result } = await renderUseNetwork();

      expect(result.current.hasPendingRequests).toBe(false);
      expect(result.current.queueStats.total).toBe(0);
    });

    it('should return initial offline status when networkManager reports offline', async () => {
      (networkManager.getStatus as jest.Mock).mockReturnValue({
        status: 'offline',
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });

      const { result } = await renderUseNetwork();

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
      expect(result.current.networkStatus).toBe('offline');
      expect(result.current.networkType).toBe('none');
      expect(result.current.isInternetReachable).toBe(false);
    });
  });

  describe('network status updates', () => {
    it('should update isOnline when network status changes to offline', async () => {
      const { result } = await renderUseNetwork();

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'offline',
          type: 'none',
          isConnected: false,
          isInternetReachable: false,
        });
      });

      expect(result.current.isOnline).toBe(false);
      expect(result.current.isOffline).toBe(true);
      expect(result.current.networkStatus).toBe('offline');
    });

    it('should update networkType when connection type changes', async () => {
      const { result } = await renderUseNetwork();

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'online',
          type: 'cellular',
          isConnected: true,
          isInternetReachable: true,
        });
      });

      expect(result.current.networkType).toBe('cellular');
    });

    it('should update isInternetReachable when reachability changes', async () => {
      const { result } = await renderUseNetwork();

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'online',
          type: 'wifi',
          isConnected: true,
          isInternetReachable: false,
        });
      });

      expect(result.current.isInternetReachable).toBe(false);
      expect(result.current.isOnline).toBe(true);
    });

    it('should handle transition from offline back to online', async () => {
      const { result } = await renderUseNetwork();

      // Go offline
      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'offline',
          type: 'none',
          isConnected: false,
          isInternetReachable: false,
        });
      });
      expect(result.current.isOnline).toBe(false);

      // Come back online
      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'online',
          type: 'wifi',
          isConnected: true,
          isInternetReachable: true,
        });
      });
      expect(result.current.isOnline).toBe(true);
      expect(result.current.networkType).toBe('wifi');
    });
  });

  describe('processQueue action', () => {
    it('should call networkManager.processQueue', async () => {
      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.processQueue();
      });

      expect(networkManager.processQueue).toHaveBeenCalled();
    });

    it('should refresh queue stats after processing', async () => {
      (networkManager.getQueueStats as jest.Mock)
        .mockResolvedValueOnce({
          total: 5,
          byPriority: { high: 2, normal: 2, low: 1 },
          oldestTimestamp: Date.now(),
        })
        .mockResolvedValueOnce({
          total: 2,
          byPriority: { high: 0, normal: 2, low: 0 },
          oldestTimestamp: Date.now(),
        });

      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.processQueue();
      });

      expect(result.current.queueStats.total).toBe(2);
    });

    it('should return processing result', async () => {
      const { result } = await renderUseNetwork();

      let processResult: any;
      await act(async () => {
        processResult = await result.current.processQueue();
      });

      expect(processResult).toEqual({ processed: 3, failed: 0 });
    });
  });

  describe('clearQueue action', () => {
    it('should call networkManager.clearQueue', async () => {
      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.clearQueue();
      });

      expect(networkManager.clearQueue).toHaveBeenCalled();
    });

    it('should refresh queue stats after clearing', async () => {
      (networkManager.getQueueStats as jest.Mock)
        .mockResolvedValueOnce({
          total: 5,
          byPriority: { high: 2, normal: 2, low: 1 },
          oldestTimestamp: Date.now(),
        })
        .mockResolvedValueOnce({
          total: 0,
          byPriority: { high: 0, normal: 0, low: 0 },
          oldestTimestamp: null,
        });

      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.clearQueue();
      });

      expect(result.current.queueStats.total).toBe(0);
      expect(result.current.hasPendingRequests).toBe(false);
    });
  });

  describe('queueRequest action', () => {
    it('should call networkManager.queueRequest with correct params', async () => {
      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.queueRequest(
          'https://api.example.com/test',
          'POST',
          { data: 'test' },
          { 'Content-Type': 'application/json' },
          'high'
        );
      });

      expect(networkManager.queueRequest).toHaveBeenCalledWith(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { 'Content-Type': 'application/json' },
        'high'
      );
    });

    it('should return request ID', async () => {
      const { result } = await renderUseNetwork();

      let requestId: any;
      await act(async () => {
        requestId = await result.current.queueRequest(
          'https://api.example.com/test',
          'GET'
        );
      });

      expect(requestId).toBe('req_abc123');
    });

    it('should refresh queue stats after queuing', async () => {
      (networkManager.getQueueStats as jest.Mock)
        .mockResolvedValueOnce({
          total: 0,
          byPriority: { high: 0, normal: 0, low: 0 },
          oldestTimestamp: null,
        })
        .mockResolvedValueOnce({
          total: 1,
          byPriority: { high: 1, normal: 0, low: 0 },
          oldestTimestamp: Date.now(),
        });

      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.queueRequest('https://api.example.com/test', 'POST');
      });

      expect(result.current.queueStats.total).toBe(1);
    });

    it('should call queueRequest with minimal params (no body, headers, priority)', async () => {
      const { result } = await renderUseNetwork();

      await act(async () => {
        await result.current.queueRequest('https://api.example.com/test', 'GET');
      });

      expect(networkManager.queueRequest).toHaveBeenCalledWith(
        'https://api.example.com/test',
        'GET',
        undefined,
        undefined,
        undefined
      );
    });
  });

  describe('refreshQueueStats action', () => {
    it('should manually refresh queue stats', async () => {
      const { result } = await renderUseNetwork();

      // Clear initial call count
      (networkManager.getQueueStats as jest.Mock).mockClear();

      await act(async () => {
        await result.current.refreshQueueStats();
      });

      expect(networkManager.getQueueStats).toHaveBeenCalledTimes(1);
    });

    it('should update queueStats state with fresh data', async () => {
      const { result } = await renderUseNetwork();

      (networkManager.getQueueStats as jest.Mock).mockResolvedValueOnce({
        total: 10,
        byPriority: { high: 5, normal: 3, low: 2 },
        oldestTimestamp: Date.now() - 5000,
      });

      await act(async () => {
        await result.current.refreshQueueStats();
      });

      expect(result.current.queueStats.total).toBe(10);
      expect(result.current.queueStats.byPriority.high).toBe(5);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from network changes on unmount', async () => {
      const unsubscribeMock = jest.fn();
      (networkManager.subscribe as jest.Mock).mockReturnValueOnce(unsubscribeMock);

      const { unmount } = await renderUseNetwork();
      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });

  describe('default export', () => {
    it('should export useNetwork as default', () => {
      const defaultExport = require('../useNetwork').default;
      expect(defaultExport).toBe(useNetwork);
    });
  });
});

describe('useOnlineStatus hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (networkManager as any)._resetSubscribers();
    (networkManager as any)._setCurrentStatus({
      status: 'online',
      type: 'wifi',
      isConnected: true,
      isInternetReachable: true,
    });
  });

  describe('initialization', () => {
    it('should return initial online status from networkManager', async () => {
      const { result } = await renderUseOnlineStatus();
      expect(result.current).toBe(true);
    });

    it('should return false when initially offline', async () => {
      (networkManager.isOnline as jest.Mock).mockReturnValue(false);
      const { result } = await renderUseOnlineStatus();
      expect(result.current).toBe(false);
    });

    it('should subscribe to network changes on mount', async () => {
      await renderUseOnlineStatus();
      expect(networkManager.subscribe).toHaveBeenCalled();
    });
  });

  describe('status updates', () => {
    it('should update to false when network goes offline', async () => {
      const { result } = await renderUseOnlineStatus();

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'offline',
          type: 'none',
          isConnected: false,
          isInternetReachable: false,
        });
      });

      expect(result.current).toBe(false);
    });

    it('should update to true when network comes online', async () => {
      (networkManager.isOnline as jest.Mock).mockReturnValue(false);
      const { result } = await renderUseOnlineStatus();

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'online',
          type: 'wifi',
          isConnected: true,
          isInternetReachable: true,
        });
      });

      expect(result.current).toBe(true);
    });

    it('should handle multiple rapid status changes', async () => {
      const { result } = await renderUseOnlineStatus();

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'offline',
          type: 'none',
          isConnected: false,
          isInternetReachable: false,
        });
      });
      expect(result.current).toBe(false);

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'online',
          type: 'cellular',
          isConnected: true,
          isInternetReachable: true,
        });
      });
      expect(result.current).toBe(true);

      act(() => {
        (networkManager as any)._triggerStatusChange({
          status: 'offline',
          type: 'none',
          isConnected: false,
          isInternetReachable: false,
        });
      });
      expect(result.current).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should unsubscribe from network changes on unmount', async () => {
      const unsubscribeMock = jest.fn();
      (networkManager.subscribe as jest.Mock).mockReturnValueOnce(unsubscribeMock);

      const { unmount } = await renderUseOnlineStatus();
      unmount();

      expect(unsubscribeMock).toHaveBeenCalled();
    });
  });
});
