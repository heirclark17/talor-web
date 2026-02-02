import { useState, useEffect, useCallback } from 'react';
import { networkManager, NetworkInfo, QueuedRequest } from '../utils/network';

/**
 * Hook for monitoring network status
 * Returns current network state and utility functions
 */
export function useNetwork() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(networkManager.getStatus());
  const [queueStats, setQueueStats] = useState<{
    total: number;
    byPriority: Record<QueuedRequest['priority'], number>;
    oldestTimestamp: number | null;
  }>({
    total: 0,
    byPriority: { high: 0, normal: 0, low: 0 },
    oldestTimestamp: null,
  });

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = networkManager.subscribe((info) => {
      setNetworkInfo(info);
    });

    // Load initial queue stats
    loadQueueStats();

    return unsubscribe;
  }, []);

  const loadQueueStats = useCallback(async () => {
    const stats = await networkManager.getQueueStats();
    setQueueStats(stats);
  }, []);

  const processQueue = useCallback(async () => {
    const result = await networkManager.processQueue();
    await loadQueueStats();
    return result;
  }, [loadQueueStats]);

  const clearQueue = useCallback(async () => {
    await networkManager.clearQueue();
    await loadQueueStats();
  }, [loadQueueStats]);

  const queueRequest = useCallback(
    async (
      url: string,
      method: QueuedRequest['method'],
      body?: object,
      headers?: Record<string, string>,
      priority?: QueuedRequest['priority']
    ) => {
      const id = await networkManager.queueRequest(url, method, body, headers, priority);
      await loadQueueStats();
      return id;
    },
    [loadQueueStats]
  );

  return {
    // Status
    isOnline: networkInfo.status === 'online',
    isOffline: networkInfo.status === 'offline',
    networkStatus: networkInfo.status,
    networkType: networkInfo.type,
    isInternetReachable: networkInfo.isInternetReachable,

    // Queue
    queueStats,
    hasPendingRequests: queueStats.total > 0,

    // Actions
    processQueue,
    clearQueue,
    queueRequest,
    refreshQueueStats: loadQueueStats,
  };
}

/**
 * Hook for simple online/offline status
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(networkManager.isOnline());

  useEffect(() => {
    const unsubscribe = networkManager.subscribe((info) => {
      setIsOnline(info.status === 'online');
    });

    return unsubscribe;
  }, []);

  return isOnline;
}

export default useNetwork;
