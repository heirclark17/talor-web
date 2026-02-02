import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = 'offline_request_queue';
const MAX_QUEUE_SIZE = 50;
const MAX_RETRIES = 3;

/**
 * Queued request interface
 */
export interface QueuedRequest {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: string;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'normal' | 'low';
}

/**
 * Network status types
 */
export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface NetworkInfo {
  status: NetworkStatus;
  type: NetInfoStateType | null;
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Generate unique ID for queued requests
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Network utility class for managing offline support
 */
class NetworkManager {
  private listeners: Set<(info: NetworkInfo) => void> = new Set();
  private currentState: NetworkInfo = {
    status: 'unknown',
    type: null,
    isConnected: false,
    isInternetReachable: null,
  };
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize network monitoring
   */
  private async initialize() {
    // Get initial state
    const state = await NetInfo.fetch();
    this.updateState(state);

    // Subscribe to network changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      this.updateState(state);
    });
  }

  /**
   * Update internal state and notify listeners
   */
  private updateState(state: NetInfoState) {
    const status: NetworkStatus = state.isConnected === null
      ? 'unknown'
      : state.isConnected
        ? 'online'
        : 'offline';

    this.currentState = {
      status,
      type: state.type,
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
    };

    // Notify all listeners
    this.listeners.forEach((listener) => {
      listener(this.currentState);
    });

    // Process queue when coming back online
    if (status === 'online') {
      this.processQueue();
    }
  }

  /**
   * Subscribe to network changes
   */
  subscribe(listener: (info: NetworkInfo) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current network status
   */
  getStatus(): NetworkInfo {
    return this.currentState;
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.currentState.status === 'online';
  }

  /**
   * Add request to offline queue
   */
  async queueRequest(
    url: string,
    method: QueuedRequest['method'],
    body?: object,
    headers?: Record<string, string>,
    priority: QueuedRequest['priority'] = 'normal'
  ): Promise<string> {
    const request: QueuedRequest = {
      id: generateRequestId(),
      url,
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
    };

    const queue = await this.getQueue();

    // Check queue size limit
    if (queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest low-priority requests
      const filtered = queue
        .sort((a, b) => {
          const priorityOrder = { high: 0, normal: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority] || a.timestamp - b.timestamp;
        })
        .slice(0, MAX_QUEUE_SIZE - 1);
      await this.saveQueue([...filtered, request]);
    } else {
      await this.saveQueue([...queue, request]);
    }

    return request.id;
  }

  /**
   * Get the current queue
   */
  async getQueue(): Promise<QueuedRequest[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueuedRequest[]): Promise<void> {
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }

  /**
   * Remove request from queue
   */
  async removeFromQueue(requestId: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((r) => r.id !== requestId);
    await this.saveQueue(filtered);
  }

  /**
   * Process queued requests when online
   */
  async processQueue(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline()) {
      return { success: 0, failed: 0 };
    }

    const queue = await this.getQueue();
    if (queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    const remainingRequests: QueuedRequest[] = [];

    // Sort by priority and timestamp
    const sortedQueue = queue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || a.timestamp - b.timestamp;
    });

    for (const request of sortedQueue) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...request.headers,
          },
          body: request.body,
        });

        if (response.ok) {
          success++;
        } else if (response.status >= 500 && request.retryCount < MAX_RETRIES) {
          // Server error - retry later
          remainingRequests.push({
            ...request,
            retryCount: request.retryCount + 1,
          });
        } else {
          failed++;
        }
      } catch (error) {
        if (request.retryCount < MAX_RETRIES) {
          remainingRequests.push({
            ...request,
            retryCount: request.retryCount + 1,
          });
        } else {
          failed++;
        }
      }
    }

    await this.saveQueue(remainingRequests);
    return { success, failed };
  }

  /**
   * Clear all queued requests
   */
  async clearQueue(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number;
    byPriority: Record<QueuedRequest['priority'], number>;
    oldestTimestamp: number | null;
  }> {
    const queue = await this.getQueue();

    const byPriority = {
      high: 0,
      normal: 0,
      low: 0,
    };

    queue.forEach((r) => {
      byPriority[r.priority]++;
    });

    return {
      total: queue.length,
      byPriority,
      oldestTimestamp: queue.length > 0 ? Math.min(...queue.map((r) => r.timestamp)) : null,
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const networkManager = new NetworkManager();

/**
 * Utility function to check network before making a request
 * Returns true if online, false if offline (and optionally queues the request)
 */
export async function checkNetworkAndQueue(
  url: string,
  method: QueuedRequest['method'],
  body?: object,
  options?: {
    queueIfOffline?: boolean;
    priority?: QueuedRequest['priority'];
    headers?: Record<string, string>;
  }
): Promise<{ online: boolean; queuedId?: string }> {
  const isOnline = networkManager.isOnline();

  if (isOnline) {
    return { online: true };
  }

  if (options?.queueIfOffline) {
    const queuedId = await networkManager.queueRequest(
      url,
      method,
      body,
      options.headers,
      options.priority
    );
    return { online: false, queuedId };
  }

  return { online: false };
}
