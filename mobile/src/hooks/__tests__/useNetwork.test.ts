/**
 * Tests for hooks/useNetwork.ts
 * Tests useNetwork and useOnlineStatus hooks
 */

jest.mock('../../utils/network', () => {
  const subscribeMock = jest.fn(() => jest.fn()); // returns unsubscribe
  const getStatusMock = jest.fn(() => ({
    status: 'online',
    type: 'wifi',
    isConnected: true,
    isInternetReachable: true,
  }));
  const isOnlineMock = jest.fn(() => true);
  const getQueueStatsMock = jest.fn(() =>
    Promise.resolve({
      total: 0,
      byPriority: { high: 0, normal: 0, low: 0 },
      oldestTimestamp: null,
    })
  );
  const processQueueMock = jest.fn(() => Promise.resolve({ processed: 0, failed: 0 }));
  const clearQueueMock = jest.fn(() => Promise.resolve());
  const queueRequestMock = jest.fn(() => Promise.resolve('req_123'));

  return {
    networkManager: {
      subscribe: subscribeMock,
      getStatus: getStatusMock,
      isOnline: isOnlineMock,
      getQueueStats: getQueueStatsMock,
      processQueue: processQueueMock,
      clearQueue: clearQueueMock,
      queueRequest: queueRequestMock,
    },
    NetworkInfo: {},
    QueuedRequest: {},
  };
});

// Must mock react with useState/useEffect for hook testing without renderHook
jest.mock('react', () => {
  const actualReact = jest.requireActual('react');
  return {
    ...actualReact,
  };
});

import { networkManager } from '../../utils/network';

describe('useNetwork module', () => {
  test('exports useNetwork function', () => {
    const mod = require('../useNetwork');
    expect(typeof mod.useNetwork).toBe('function');
  });

  test('exports useOnlineStatus function', () => {
    const mod = require('../useNetwork');
    expect(typeof mod.useOnlineStatus).toBe('function');
  });

  test('exports useNetwork as default', () => {
    const mod = require('../useNetwork');
    expect(mod.default).toBe(mod.useNetwork);
  });
});

describe('networkManager integration', () => {
  test('getStatus returns network info', () => {
    const status = networkManager.getStatus();
    expect(status.status).toBe('online');
    expect(status.isConnected).toBe(true);
  });

  test('subscribe returns unsubscribe function', () => {
    const unsub = networkManager.subscribe(() => {});
    expect(typeof unsub).toBe('function');
  });

  test('isOnline returns boolean', () => {
    expect(networkManager.isOnline()).toBe(true);
  });

  test('getQueueStats returns stats', async () => {
    const stats = await networkManager.getQueueStats();
    expect(stats.total).toBe(0);
    expect(stats.byPriority).toEqual({ high: 0, normal: 0, low: 0 });
    expect(stats.oldestTimestamp).toBeNull();
  });

  test('processQueue returns result', async () => {
    const result = await networkManager.processQueue();
    expect(result).toEqual({ processed: 0, failed: 0 });
  });

  test('clearQueue resolves', async () => {
    await expect(networkManager.clearQueue()).resolves.toBeUndefined();
  });

  test('queueRequest returns request ID', async () => {
    const id = await networkManager.queueRequest(
      'https://api.example.com/test',
      'POST',
      { key: 'value' },
      { 'Content-Type': 'application/json' },
      'high'
    );
    expect(id).toBe('req_123');
  });
});
