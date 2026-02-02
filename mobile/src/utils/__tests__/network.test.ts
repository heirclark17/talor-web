import { networkManager, checkNetworkAndQueue } from '../network';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('Network Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('networkManager', () => {
    it('should return initial network status', () => {
      const status = networkManager.getStatus();
      expect(status).toHaveProperty('status');
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('type');
    });

    it('should allow subscribing to network changes', () => {
      const listener = jest.fn();
      const unsubscribe = networkManager.subscribe(listener);

      // Should call listener immediately with current state
      expect(listener).toHaveBeenCalledTimes(1);

      // Cleanup
      unsubscribe();
    });

    it('should properly unsubscribe listeners', () => {
      const listener = jest.fn();
      const unsubscribe = networkManager.subscribe(listener);

      // First call on subscribe
      expect(listener).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Subscribe another listener - the first one should not be called
      const listener2 = jest.fn();
      networkManager.subscribe(listener2);

      // Original listener should still only have 1 call
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Request Queue', () => {
    beforeEach(async () => {
      await networkManager.clearQueue();
    });

    it('should add request to queue', async () => {
      const requestId = await networkManager.queueRequest(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { 'Content-Type': 'application/json' },
        'normal'
      );

      expect(requestId).toBeDefined();
      expect(requestId).toMatch(/^req_/);

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].url).toBe('https://api.example.com/test');
      expect(queue[0].method).toBe('POST');
    });

    it('should get queue statistics', async () => {
      await networkManager.queueRequest('https://api.example.com/1', 'POST', undefined, undefined, 'high');
      await networkManager.queueRequest('https://api.example.com/2', 'POST', undefined, undefined, 'normal');
      await networkManager.queueRequest('https://api.example.com/3', 'POST', undefined, undefined, 'low');

      const stats = await networkManager.getQueueStats();

      expect(stats.total).toBe(3);
      expect(stats.byPriority.high).toBe(1);
      expect(stats.byPriority.normal).toBe(1);
      expect(stats.byPriority.low).toBe(1);
      expect(stats.oldestTimestamp).toBeDefined();
    });

    it('should remove request from queue', async () => {
      const requestId = await networkManager.queueRequest(
        'https://api.example.com/test',
        'POST'
      );

      await networkManager.removeFromQueue(requestId);

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(0);
    });

    it('should clear entire queue', async () => {
      await networkManager.queueRequest('https://api.example.com/1', 'POST');
      await networkManager.queueRequest('https://api.example.com/2', 'POST');

      await networkManager.clearQueue();

      const queue = await networkManager.getQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('checkNetworkAndQueue', () => {
    it('should return online status when connected', async () => {
      // Mock networkManager to return online
      jest.spyOn(networkManager, 'isOnline').mockReturnValue(true);

      const result = await checkNetworkAndQueue(
        'https://api.example.com/test',
        'POST',
        { data: 'test' }
      );

      expect(result.online).toBe(true);
      expect(result.queuedId).toBeUndefined();
    });

    it('should queue request when offline and option is set', async () => {
      jest.spyOn(networkManager, 'isOnline').mockReturnValue(false);
      await networkManager.clearQueue();

      const result = await checkNetworkAndQueue(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { queueIfOffline: true, priority: 'high' }
      );

      expect(result.online).toBe(false);
      expect(result.queuedId).toBeDefined();
    });

    it('should not queue when offline but queueIfOffline is false', async () => {
      jest.spyOn(networkManager, 'isOnline').mockReturnValue(false);

      const result = await checkNetworkAndQueue(
        'https://api.example.com/test',
        'POST',
        { data: 'test' },
        { queueIfOffline: false }
      );

      expect(result.online).toBe(false);
      expect(result.queuedId).toBeUndefined();
    });
  });
});
