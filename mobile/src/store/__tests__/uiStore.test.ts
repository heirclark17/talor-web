import { useUIStore } from '../uiStore';

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUIStore.getState().reset();
  });

  describe('Global Loading', () => {
    it('should set global loading state', () => {
      const store = useUIStore.getState();

      store.setGlobalLoading(true, 'Loading...');

      expect(useUIStore.getState().isGlobalLoading).toBe(true);
      expect(useUIStore.getState().globalLoadingMessage).toBe('Loading...');
    });

    it('should clear global loading state', () => {
      const store = useUIStore.getState();

      store.setGlobalLoading(true, 'Loading...');
      store.setGlobalLoading(false);

      expect(useUIStore.getState().isGlobalLoading).toBe(false);
      expect(useUIStore.getState().globalLoadingMessage).toBe(null);
    });
  });

  describe('Toast Management', () => {
    it('should add a toast', () => {
      const store = useUIStore.getState();

      store.showToast('success', 'Operation successful');

      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Operation successful');
    });

    it('should add multiple toasts', () => {
      const store = useUIStore.getState();

      store.showToast('success', 'Success');
      store.showToast('error', 'Error');
      store.showToast('warning', 'Warning');

      expect(useUIStore.getState().toasts).toHaveLength(3);
    });

    it('should remove a specific toast', () => {
      const store = useUIStore.getState();

      store.showToast('success', 'Toast 1');
      const toast1Id = useUIStore.getState().toasts[0].id;

      store.showToast('error', 'Toast 2');

      store.hideToast(toast1Id);

      const remainingToasts = useUIStore.getState().toasts;
      expect(remainingToasts).toHaveLength(1);
      expect(remainingToasts[0].message).toBe('Toast 2');
    });

    it('should clear all toasts', () => {
      const store = useUIStore.getState();

      store.showToast('success', 'Toast 1');
      store.showToast('error', 'Toast 2');
      store.clearAllToasts();

      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('should generate unique toast IDs', () => {
      const store = useUIStore.getState();

      store.showToast('success', 'Toast 1');
      store.showToast('success', 'Toast 2');

      const toasts = useUIStore.getState().toasts;
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });
  });

  describe('Modal Management', () => {
    it('should open a modal', () => {
      const store = useUIStore.getState();

      store.openModal('confirm-delete', 'ConfirmDialog', { title: 'Delete?' });

      const modals = useUIStore.getState().activeModals;
      expect(modals).toHaveLength(1);
      expect(modals[0].id).toBe('confirm-delete');
      expect(modals[0].component).toBe('ConfirmDialog');
      expect(modals[0].props).toEqual({ title: 'Delete?' });
    });

    it('should close a specific modal', () => {
      const store = useUIStore.getState();

      store.openModal('modal1', 'Component1');
      store.openModal('modal2', 'Component2');
      store.closeModal('modal1');

      const modals = useUIStore.getState().activeModals;
      expect(modals).toHaveLength(1);
      expect(modals[0].id).toBe('modal2');
    });

    it('should close all modals', () => {
      const store = useUIStore.getState();

      store.openModal('modal1', 'Component1');
      store.openModal('modal2', 'Component2');
      store.closeAllModals();

      expect(useUIStore.getState().activeModals).toHaveLength(0);
    });
  });

  describe('Search & Filters', () => {
    it('should set search query', () => {
      const store = useUIStore.getState();

      store.setSearchQuery('test query');

      expect(useUIStore.getState().searchQuery).toBe('test query');
    });

    it('should set a filter', () => {
      const store = useUIStore.getState();

      store.setFilter('status', 'active');
      store.setFilter('count', 10);
      store.setFilter('enabled', true);

      const filters = useUIStore.getState().activeFilters;
      expect(filters.status).toBe('active');
      expect(filters.count).toBe(10);
      expect(filters.enabled).toBe(true);
    });

    it('should clear all filters', () => {
      const store = useUIStore.getState();

      store.setSearchQuery('test');
      store.setFilter('status', 'active');
      store.clearFilters();

      expect(useUIStore.getState().searchQuery).toBe('');
      expect(useUIStore.getState().activeFilters).toEqual({});
    });
  });

  describe('Keyboard State', () => {
    it('should track keyboard visibility', () => {
      const store = useUIStore.getState();

      store.setKeyboardState(true, 300);

      expect(useUIStore.getState().isKeyboardVisible).toBe(true);
      expect(useUIStore.getState().keyboardHeight).toBe(300);
    });

    it('should update keyboard state on hide', () => {
      const store = useUIStore.getState();

      store.setKeyboardState(true, 300);
      store.setKeyboardState(false, 0);

      expect(useUIStore.getState().isKeyboardVisible).toBe(false);
      expect(useUIStore.getState().keyboardHeight).toBe(0);
    });
  });

  describe('Reset', () => {
    it('should reset all state to initial values', () => {
      const store = useUIStore.getState();

      // Modify state
      store.setGlobalLoading(true, 'Loading');
      store.showToast('success', 'Test');
      store.openModal('test', 'TestComponent');
      store.setSearchQuery('query');
      store.setFilter('key', 'value');

      // Reset
      store.reset();

      const state = useUIStore.getState();
      expect(state.isGlobalLoading).toBe(false);
      expect(state.globalLoadingMessage).toBe(null);
      expect(state.toasts).toHaveLength(0);
      expect(state.activeModals).toHaveLength(0);
      expect(state.searchQuery).toBe('');
      expect(state.activeFilters).toEqual({});
    });
  });
});
