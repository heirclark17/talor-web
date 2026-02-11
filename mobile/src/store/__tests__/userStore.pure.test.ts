jest.mock('../../utils/userSession', () => ({
  getUserId: jest.fn(() => Promise.resolve('user_test-123')),
  clearUserSession: jest.fn(() => Promise.resolve()),
  saveSessionData: jest.fn(),
  loadSessionData: jest.fn(),
}));

import { useUserStore } from '../userStore';
import { getUserId, clearUserSession } from '../../utils/userSession';

const mockedGetUserId = getUserId as jest.MockedFunction<typeof getUserId>;
const mockedClearUserSession = clearUserSession as jest.MockedFunction<typeof clearUserSession>;

describe('UserStore', () => {
  beforeEach(() => {
    // Reset the store state manually since persist middleware complicates reset
    useUserStore.setState({
      userId: null,
      isInitialized: false,
      isLoading: false,
      error: null,
      hasCompletedOnboarding: false,
      lastViewedResumeId: null,
      lastViewedInterviewPrepId: null,
    });
    jest.clearAllMocks();
  });

  // ── Initial state ────────────────────────────────────────────

  it('should have correct initial state', () => {
    const state = useUserStore.getState();

    expect(state.userId).toBeNull();
    expect(state.isInitialized).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.lastViewedResumeId).toBeNull();
    expect(state.lastViewedInterviewPrepId).toBeNull();
  });

  // ── initialize ───────────────────────────────────────────────

  it('initialize success: sets userId and isInitialized', async () => {
    mockedGetUserId.mockResolvedValue('user_test-123');

    await useUserStore.getState().initialize();

    const state = useUserStore.getState();
    expect(state.userId).toBe('user_test-123');
    expect(state.isInitialized).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('initialize error: sets error and isInitialized true', async () => {
    mockedGetUserId.mockRejectedValue(new Error('Storage corrupted'));

    await useUserStore.getState().initialize();

    const state = useUserStore.getState();
    expect(state.error).toBe('Storage corrupted');
    expect(state.isInitialized).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('initialize skips if already initialized', async () => {
    // First initialization
    mockedGetUserId.mockResolvedValue('user_test-123');
    await useUserStore.getState().initialize();

    // Clear mock call count
    mockedGetUserId.mockClear();

    // Second call should be a no-op
    await useUserStore.getState().initialize();

    expect(mockedGetUserId).not.toHaveBeenCalled();
  });

  it('initialize sets non-Error thrown values to default message', async () => {
    mockedGetUserId.mockRejectedValue('string error');

    await useUserStore.getState().initialize();

    expect(useUserStore.getState().error).toBe('Failed to initialize user');
    expect(useUserStore.getState().isInitialized).toBe(true);
  });

  // ── setUserId ────────────────────────────────────────────────

  it('setUserId: updates userId', () => {
    useUserStore.getState().setUserId('user_new-456');

    expect(useUserStore.getState().userId).toBe('user_new-456');
  });

  // ── clearUser ────────────────────────────────────────────────

  it('clearUser: calls clearUserSession and resets preferences', async () => {
    // Set some state first
    useUserStore.setState({
      userId: 'user_test-123',
      hasCompletedOnboarding: true,
      lastViewedResumeId: 5,
      lastViewedInterviewPrepId: 3,
    });

    await useUserStore.getState().clearUser();

    expect(mockedClearUserSession).toHaveBeenCalled();
    const state = useUserStore.getState();
    expect(state.userId).toBeNull();
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.lastViewedResumeId).toBeNull();
    expect(state.lastViewedInterviewPrepId).toBeNull();
  });

  // ── setOnboardingComplete ────────────────────────────────────

  it('setOnboardingComplete: sets hasCompletedOnboarding to true', () => {
    useUserStore.getState().setOnboardingComplete();

    expect(useUserStore.getState().hasCompletedOnboarding).toBe(true);
  });

  // ── setLastViewedResume ──────────────────────────────────────

  it('setLastViewedResume: sets lastViewedResumeId', () => {
    useUserStore.getState().setLastViewedResume(42);

    expect(useUserStore.getState().lastViewedResumeId).toBe(42);
  });

  // ── setLastViewedInterviewPrep ───────────────────────────────

  it('setLastViewedInterviewPrep: sets lastViewedInterviewPrepId', () => {
    useUserStore.getState().setLastViewedInterviewPrep(7);

    expect(useUserStore.getState().lastViewedInterviewPrepId).toBe(7);
  });

  // ── setError ─────────────────────────────────────────────────

  it('setError: sets error string', () => {
    useUserStore.getState().setError('Something went wrong');

    expect(useUserStore.getState().error).toBe('Something went wrong');
  });

  it('setError null: clears error', () => {
    useUserStore.setState({ error: 'Previous error' });

    useUserStore.getState().setError(null);

    expect(useUserStore.getState().error).toBeNull();
  });

  // ── partialize (persist middleware) ──────────────────────────

  it('partialize: only persists preference fields', () => {
    // Access the persist configuration via the store's persist API
    const persistApi = (useUserStore as any).persist;
    const options = persistApi?.getOptions?.();

    expect(options).toBeDefined();
    expect(options.partialize).toBeDefined();

    // Build a full state object and check what partialize returns
    const fullState = {
      userId: 'user_test-123',
      isInitialized: true,
      isLoading: false,
      error: 'some error',
      hasCompletedOnboarding: true,
      lastViewedResumeId: 5,
      lastViewedInterviewPrepId: 3,
      initialize: jest.fn(),
      setUserId: jest.fn(),
      clearUser: jest.fn(),
      setOnboardingComplete: jest.fn(),
      setLastViewedResume: jest.fn(),
      setLastViewedInterviewPrep: jest.fn(),
      setError: jest.fn(),
    };

    const partialized = options.partialize(fullState);

    // Should only contain the three preference fields
    expect(partialized).toEqual({
      hasCompletedOnboarding: true,
      lastViewedResumeId: 5,
      lastViewedInterviewPrepId: 3,
    });

    // Should NOT contain non-preference fields
    expect(partialized).not.toHaveProperty('userId');
    expect(partialized).not.toHaveProperty('isInitialized');
    expect(partialized).not.toHaveProperty('isLoading');
    expect(partialized).not.toHaveProperty('error');
  });

  it('persist middleware uses correct storage name', () => {
    const persistApi = (useUserStore as any).persist;
    const options = persistApi?.getOptions?.();

    expect(options?.name).toBe('user-storage');
  });
});
