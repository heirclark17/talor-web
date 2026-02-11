import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkManager, checkNetworkAndQueue } from '../network';

/**
 * Create an in-memory AsyncStorage simulator so setItem/getItem chain correctly.
 */
function setupAsyncStorageSimulator() {
  const store: Record<string, string> = {};
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    return Promise.resolve(store[key] ?? null);
  });
  (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
    store[key] = value;
    return Promise.resolve();
  });
  (AsyncStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
    delete store[key];
    return Promise.resolve();
  });
  return store;
}

/**
 * Simulate a network state change by calling the private updateState method
 * directly on the singleton networkManager. This is the only reliable way to
 * trigger state changes since the global NetInfo mock's addEventListener callback
 * cannot be overridden by jest.doMock inside jest.isolateModules.
 */
function simulateNetworkChange(state: { isConnected: boolean | null; isInternetReachable: boolean | null; type: string }) {
  (networkManager as any).updateState(state);
}

describe('Network Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  // =====================================================================
  // BASIC SINGLETON TESTS
  // =====================================================================
  describe('networkManager singleton', () => {
    it('should return initial network status with expected shape', () => {
      const status = networkManager.getStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('type');
      expect(status).toHaveProperty('isInternetReachable');
    });

    it('should allow subscribing to network changes', () => {
      const listener = jest.fn();
      const unsubscribe = networkManager.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(networkManager.getStatus());
      unsubscribe();
    });

    it('should properly unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = networkManager.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);
      unsubscribe();

      const listener2 = jest.fn();
      const unsub2 = networkManager.subscribe(listener2);
      expect(listener).toHaveBeenCalledTimes(1);
      unsub2();
    });

    it('should report isOnline based on current state', () => {
      const result = networkManager.isOnline();
      expect(typeof result).toBe('boolean');
    });

    it('should have called NetInfo.fetch and addEventListener during initialization', async () => {
      // initialize() is async: it awaits NetInfo.fetch(), then calls addEventListener.
      // We call it directly and await to allow the async chain to complete.
      await (networkManager as any).initialize();
      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(NetInfo.addEventListener).toHaveBeenCalled();
    });

    it('should handle NetInfo addEventListener callback invoking updateState', async () => {
      // The global mock's addEventListener doesn't call its callback.
      // Override it temporarily to invoke the callback, covering line 68 (callback body).
      let capturedCallback: ((state: any) => void) | null = null;
      (NetInfo.addEventListener as jest.Mock).mockImplementationOnce((cb: any) => {
        capturedCallback = cb;
        return jest.fn(); // unsubscribe
      });

      await (networkManager as any).initialize();

      // Now invoke the captured callback to cover the arrow function body
      expect(capturedCallback).not.toBeNull();
      const listener = jest.fn();
      const unsub = networkManager.subscribe(listener);
      listener.mockClear(); // clear the immediate call from subscribe

      capturedCallback!({
        isConnected: true,
        isInternetReachable: true,
        type: 'cellular',
      });

      // The callback should have invoked updateState, which notifies listeners
      expect(listener).toHaveBeenCalledTimes(1);
      const callArg = listener.mock.calls[0][0];
      expect(callArg.status).toBe('online');
      expect(callArg.type).toBe('cellular');
      unsub();
    });
  });

  // =====================================================================
  // REQUEST QUEUE TESTS
  // =====================================================================
  describe('Request Queue', () => {
    beforeEach(() => {
      setupAsyncStorageSimulator();
    });

    it('should add request to queue with all fields', async () => {
      const requestId = await networkManager.queueRequest(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { Authorization: 'Bearer token' },
        'normal'
      );

      expect(requestId).toBeDefined();
      expect(requestId).toMatch(/^req_/);

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].url).toBe('https://api.example.com/test');
      expect(queue[0].method).toBe('POST');
      expect(queue[0].body).toBe(JSON.stringify({ data: 'test' }));
      expect(queue[0].headers).toEqual({ Authorization: 'Bearer token' });
      expect(queue[0].retryCount).toBe(0);
      expect(queue[0].priority).toBe('normal');
      expect(typeof queue[0].timestamp).toBe('number');
    });

    it('should add request without body (body is undefined)', async () => {
      const requestId = await networkManager.queueRequest(
        'https://api.example.com/test',
        'GET'
      );

      expect(requestId).toMatch(/^req_/);
      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].body).toBeUndefined();
      expect(queue[0].priority).toBe('normal'); // default
    });

    it('should get queue statistics with mixed priorities', async () => {
      await networkManager.queueRequest('https://api.example.com/1', 'POST', undefined, undefined, 'high');
      await networkManager.queueRequest('https://api.example.com/2', 'POST', undefined, undefined, 'normal');
      await networkManager.queueRequest('https://api.example.com/3', 'POST', undefined, undefined, 'low');

      const stats = await networkManager.getQueueStats();

      expect(stats.total).toBe(3);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.normal).toBe(1);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.oldestTimestamp).toBeDefined();
      expect(typeof stats.oldestTimestamp).toBe('number');
    });

    it('should return null oldestTimestamp for empty queue', async () => {
      const stats = await networkManager.getQueueStats();
      expect(stats.total).toBe(0);
      expect(stats.oldestTimestamp).toBeNull();
      expect(stats.byPriority).toEqual({ high: 0, normal: 0, low: 0 });
    });

    it('should remove request from queue by ID', async () => {
      const requestId = await networkManager.queueRequest(
        'https://api.example.com/test',
        'POST'
      );

      await networkManager.removeFromQueue(requestId);

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(0);
    });

    it('should not remove other requests when removing by ID', async () => {
      const id1 = await networkManager.queueRequest('https://api.example.com/1', 'POST');
      const id2 = await networkManager.queueRequest('https://api.example.com/2', 'POST');

      await networkManager.removeFromQueue(id1);

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(id2);
    });

    it('should clear entire queue', async () => {
      await networkManager.queueRequest('https://api.example.com/1', 'POST');
      await networkManager.queueRequest('https://api.example.com/2', 'POST');

      await networkManager.clearQueue();

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(0);
    });

    it('should return empty array when getQueue encounters AsyncStorage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage corrupt'));

      const queue = await networkManager.getQueue();
      expect(queue).toEqual([]);
    });

    it('should return empty array when AsyncStorage returns null', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const queue = await networkManager.getQueue();
      expect(queue).toEqual([]);
    });

    it('should generate unique request IDs', async () => {
      const id1 = await networkManager.queueRequest('https://api.example.com/1', 'GET');
      const id2 = await networkManager.queueRequest('https://api.example.com/2', 'GET');

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/);
    });
  });

  // =====================================================================
  // QUEUE OVERFLOW (MAX_QUEUE_SIZE = 50)
  // =====================================================================
  describe('Queue overflow handling', () => {
    it('should enforce MAX_QUEUE_SIZE by removing lowest-priority oldest requests', async () => {
      const existingQueue: any[] = [];
      for (let i = 0; i < 50; i++) {
        existingQueue.push({
          id: `req_existing_${i}`,
          url: `https://api.example.com/${i}`,
          method: 'POST',
          timestamp: 1000 + i,
          retryCount: 0,
          priority: 'low',
        });
      }

      // getQueue returns the full queue, saveQueue stores the trimmed result
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingQueue));

      const requestId = await networkManager.queueRequest(
        'https://api.example.com/new',
        'POST',
        { data: 'overflow' },
        undefined,
        'high'
      );

      expect(requestId).toMatch(/^req_/);

      const saveCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (c: any[]) => c[0] === 'offline_request_queue'
      );
      expect(saveCall).toBeDefined();
      const savedQueue = JSON.parse(saveCall[1]);
      expect(savedQueue).toHaveLength(50);

      const newReq = savedQueue.find((r: any) => r.url === 'https://api.example.com/new');
      expect(newReq).toBeDefined();
      expect(newReq.priority).toBe('high');
    });

    it('should sort by priority then timestamp when trimming overflow', async () => {
      const existingQueue: any[] = [];
      for (let i = 0; i < 25; i++) {
        existingQueue.push({
          id: `req_high_${i}`,
          url: `https://api.example.com/high/${i}`,
          method: 'POST',
          timestamp: 1000 + i,
          retryCount: 0,
          priority: 'high',
        });
      }
      for (let i = 0; i < 25; i++) {
        existingQueue.push({
          id: `req_low_${i}`,
          url: `https://api.example.com/low/${i}`,
          method: 'POST',
          timestamp: 2000 + i,
          retryCount: 0,
          priority: 'low',
        });
      }

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingQueue));

      await networkManager.queueRequest(
        'https://api.example.com/overflow',
        'POST',
        undefined,
        undefined,
        'normal'
      );

      const saveCall = (AsyncStorage.setItem as jest.Mock).mock.calls.find(
        (c: any[]) => c[0] === 'offline_request_queue'
      );
      expect(saveCall).toBeDefined();
      const savedQueue = JSON.parse(saveCall[1]);
      expect(savedQueue).toHaveLength(50);

      const highPriority = savedQueue.filter((r: any) => r.priority === 'high');
      expect(highPriority.length).toBe(25);

      const newReq = savedQueue.find((r: any) => r.url === 'https://api.example.com/overflow');
      expect(newReq).toBeDefined();
    });
  });

  // =====================================================================
  // UPDATE STATE & LISTENER NOTIFICATION (via direct updateState call)
  // =====================================================================
  describe('updateState and listener notification', () => {
    it('should notify all subscribed listeners when network changes', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const unsub1 = networkManager.subscribe(listener1);
      const unsub2 = networkManager.subscribe(listener2);

      // Both called once on subscribe
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      // Simulate going offline
      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledTimes(2);

      const lastCall = listener1.mock.calls[1][0];
      expect(lastCall.status).toBe('offline');
      expect(lastCall.isConnected).toBe(false);
      expect(lastCall.type).toBe('none');
      expect(lastCall.isInternetReachable).toBe(false);

      unsub1();
      unsub2();
    });

    it('should set status to "unknown" when isConnected is null', () => {
      const listener = jest.fn();
      const unsub = networkManager.subscribe(listener);

      simulateNetworkChange({ isConnected: null, isInternetReachable: null, type: 'unknown' });

      const lastCall = listener.mock.calls[1][0];
      expect(lastCall.status).toBe('unknown');
      expect(lastCall.isConnected).toBe(false); // null ?? false
      expect(lastCall.isInternetReachable).toBeNull();

      unsub();
    });

    it('should set status to "online" when isConnected is true', () => {
      const listener = jest.fn();
      const unsub = networkManager.subscribe(listener);

      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      // subscribe(1) + offline(2) + online(3)
      expect(listener).toHaveBeenCalledTimes(3);
      const lastCall = listener.mock.calls[2][0];
      expect(lastCall.status).toBe('online');
      expect(lastCall.isConnected).toBe(true);

      unsub();
    });

    it('should trigger processQueue when going online', () => {
      const processQueueSpy = jest.spyOn(networkManager, 'processQueue').mockResolvedValue({ success: 0, failed: 0 });

      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      expect(processQueueSpy).toHaveBeenCalledTimes(1);
      processQueueSpy.mockRestore();
    });

    it('should NOT trigger processQueue when going offline', () => {
      const processQueueSpy = jest.spyOn(networkManager, 'processQueue').mockResolvedValue({ success: 0, failed: 0 });

      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      expect(processQueueSpy).not.toHaveBeenCalled();
      processQueueSpy.mockRestore();
    });

    it('should NOT trigger processQueue when status is unknown', () => {
      const processQueueSpy = jest.spyOn(networkManager, 'processQueue').mockResolvedValue({ success: 0, failed: 0 });

      simulateNetworkChange({ isConnected: null, isInternetReachable: null, type: 'unknown' });

      expect(processQueueSpy).not.toHaveBeenCalled();
      processQueueSpy.mockRestore();
    });

    it('should not notify unsubscribed listeners', () => {
      const listener = jest.fn();
      const unsub = networkManager.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();

      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      expect(listener).toHaveBeenCalledTimes(1); // still only the subscribe call
    });
  });

  // =====================================================================
  // PROCESS QUEUE
  // =====================================================================
  describe('processQueue', () => {
    it('should return zeros when offline', async () => {
      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 0 });
    });

    it('should return zeros when queue is empty', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 0 });
    });

    it('should process successful requests and remove them from queue', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [
        {
          id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
          body: '{"data":"test1"}', headers: { Authorization: 'Bearer token' },
          timestamp: 1000, retryCount: 0, priority: 'normal',
        },
        {
          id: 'req_2', url: 'https://api.example.com/2', method: 'PUT',
          timestamp: 2000, retryCount: 0, priority: 'high',
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 2, failed: 0 });

      // Queue should be saved as empty
      const saveCalls = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter((c: any[]) => c[0] === 'offline_request_queue');
      const lastSave = saveCalls[saveCalls.length - 1];
      expect(JSON.parse(lastSave[1])).toEqual([]);
    });

    it('should retry on server error (5xx) when retryCount < MAX_RETRIES', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
        body: '{"data":"test"}', timestamp: 1000, retryCount: 0, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 0 });

      const saveCalls = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter((c: any[]) => c[0] === 'offline_request_queue');
      const remaining = JSON.parse(saveCalls[saveCalls.length - 1][1]);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].retryCount).toBe(1);
      expect(remaining[0].id).toBe('req_1');
    });

    it('should mark as failed on client error (4xx)', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
        timestamp: 1000, retryCount: 0, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404 });

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 1 });

      const saveCalls = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter((c: any[]) => c[0] === 'offline_request_queue');
      expect(JSON.parse(saveCalls[saveCalls.length - 1][1])).toEqual([]);
    });

    it('should mark as failed on server error when retryCount >= MAX_RETRIES', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
        timestamp: 1000, retryCount: 3, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 1 });
    });

    it('should retry on network error (fetch throws) when retryCount < MAX_RETRIES', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
        timestamp: 1000, retryCount: 1, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 0 });

      const saveCalls = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter((c: any[]) => c[0] === 'offline_request_queue');
      const remaining = JSON.parse(saveCalls[saveCalls.length - 1][1]);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].retryCount).toBe(2);
    });

    it('should mark as failed on network error when retryCount >= MAX_RETRIES', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
        timestamp: 1000, retryCount: 3, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 0, failed: 1 });

      const saveCalls = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter((c: any[]) => c[0] === 'offline_request_queue');
      expect(JSON.parse(saveCalls[saveCalls.length - 1][1])).toEqual([]);
    });

    it('should process queue sorted by priority (high > normal > low) then timestamp', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [
        { id: 'req_low', url: 'https://api.example.com/low', method: 'POST', timestamp: 1000, retryCount: 0, priority: 'low' },
        { id: 'req_high', url: 'https://api.example.com/high', method: 'POST', timestamp: 2000, retryCount: 0, priority: 'high' },
        { id: 'req_normal', url: 'https://api.example.com/normal', method: 'POST', timestamp: 1500, retryCount: 0, priority: 'normal' },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));

      const fetchCallUrls: string[] = [];
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        fetchCallUrls.push(url);
        return Promise.resolve({ ok: true, status: 200 });
      });

      await networkManager.processQueue();

      expect(fetchCallUrls).toEqual([
        'https://api.example.com/high',
        'https://api.example.com/normal',
        'https://api.example.com/low',
      ]);
    });

    it('should pass correct headers to fetch including Content-Type', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'POST',
        body: '{"test":true}', headers: { Authorization: 'Bearer xyz' },
        timestamp: 1000, retryCount: 0, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      await networkManager.processQueue();

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer xyz',
        },
        body: '{"test":true}',
      });
    });

    it('should handle mixed success, retry, and failure in one batch', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [
        { id: 'req_success', url: 'https://api.example.com/ok', method: 'GET', timestamp: 1000, retryCount: 0, priority: 'high' },
        { id: 'req_retry', url: 'https://api.example.com/retry', method: 'POST', timestamp: 2000, retryCount: 1, priority: 'normal' },
        { id: 'req_fail', url: 'https://api.example.com/fail', method: 'DELETE', timestamp: 3000, retryCount: 3, priority: 'low' },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, status: 200 })   // success
        .mockResolvedValueOnce({ ok: false, status: 503 })   // retry (server error)
        .mockRejectedValueOnce(new Error('Network failed'));  // fail (max retries)

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 1, failed: 1 });

      const saveCalls = (AsyncStorage.setItem as jest.Mock).mock.calls
        .filter((c: any[]) => c[0] === 'offline_request_queue');
      const remaining = JSON.parse(saveCalls[saveCalls.length - 1][1]);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe('req_retry');
      expect(remaining[0].retryCount).toBe(2);
    });

    it('should sort same-priority requests by timestamp (oldest first)', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [
        { id: 'req_newer', url: 'https://api.example.com/newer', method: 'POST', timestamp: 3000, retryCount: 0, priority: 'normal' },
        { id: 'req_oldest', url: 'https://api.example.com/oldest', method: 'POST', timestamp: 1000, retryCount: 0, priority: 'normal' },
        { id: 'req_middle', url: 'https://api.example.com/middle', method: 'POST', timestamp: 2000, retryCount: 0, priority: 'normal' },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));

      const fetchCallUrls: string[] = [];
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        fetchCallUrls.push(url);
        return Promise.resolve({ ok: true, status: 200 });
      });

      await networkManager.processQueue();

      // Same priority: sorted by timestamp ascending (oldest first)
      expect(fetchCallUrls).toEqual([
        'https://api.example.com/oldest',
        'https://api.example.com/middle',
        'https://api.example.com/newer',
      ]);
    });

    it('should process request with no custom headers', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const queueData = [{
        id: 'req_1', url: 'https://api.example.com/1', method: 'GET',
        timestamp: 1000, retryCount: 0, priority: 'normal',
      }];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(queueData));
      (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true, status: 200 });

      const result = await networkManager.processQueue();
      expect(result).toEqual({ success: 1, failed: 0 });

      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/1', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
      });
    });
  });

  // =====================================================================
  // DESTROY
  // =====================================================================
  describe('destroy', () => {
    it('should unsubscribe from NetInfo and clear all listeners', () => {
      // We can test the destroy behavior on the singleton, then re-add a listener
      // to keep other tests working. Note: after destroy, the singleton's
      // unsubscribe ref is consumed. We test the behavior, then restore.
      const listener = jest.fn();
      const unsub = networkManager.subscribe(listener);
      expect(listener).toHaveBeenCalledTimes(1);

      // Save the unsubscribe ref before destroy
      const origUnsubscribe = (networkManager as any).unsubscribe;

      networkManager.destroy();

      // After destroy, listeners should be cleared
      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });
      expect(listener).toHaveBeenCalledTimes(1); // no new calls

      // Restore the unsubscribe ref so the singleton doesn't break other tests
      (networkManager as any).unsubscribe = origUnsubscribe;
    });

    it('should handle destroy when unsubscribe is null', () => {
      const origUnsubscribe = (networkManager as any).unsubscribe;
      (networkManager as any).unsubscribe = null;

      expect(() => networkManager.destroy()).not.toThrow();

      // Restore
      (networkManager as any).unsubscribe = origUnsubscribe;
    });
  });

  // =====================================================================
  // CHECK NETWORK AND QUEUE
  // =====================================================================
  describe('checkNetworkAndQueue', () => {
    it('should return online: true when connected', async () => {
      simulateNetworkChange({ isConnected: true, isInternetReachable: true, type: 'wifi' });

      const result = await checkNetworkAndQueue('https://api.example.com/test', 'POST', { data: 'test' });
      expect(result.online).toBe(true);
      expect(result.queuedId).toBeUndefined();
    });

    it('should queue request when offline with queueIfOffline: true', async () => {
      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      const result = await checkNetworkAndQueue(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { queueIfOffline: true, priority: 'high', headers: { 'X-Custom': 'value' } }
      );

      expect(result.online).toBe(false);
      expect(result.queuedId).toBeDefined();
      expect(result.queuedId).toMatch(/^req_/);
    });

    it('should not queue when offline with queueIfOffline: false', async () => {
      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      const result = await checkNetworkAndQueue(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { queueIfOffline: false }
      );

      expect(result.online).toBe(false);
      expect(result.queuedId).toBeUndefined();
    });

    it('should not queue when offline and no options provided', async () => {
      simulateNetworkChange({ isConnected: false, isInternetReachable: false, type: 'none' });

      const result = await checkNetworkAndQueue('https://api.example.com/test', 'GET');

      expect(result.online).toBe(false);
      expect(result.queuedId).toBeUndefined();
    });
  });
});
