import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: string;
  props?: Record<string, unknown>;
}

interface UIState {
  // Global loading
  isGlobalLoading: boolean;
  globalLoadingMessage: string | null;

  // Toasts
  toasts: Toast[];

  // Modals
  activeModals: Modal[];

  // Search & Filters
  searchQuery: string;
  activeFilters: Record<string, string | boolean | number>;

  // Keyboard
  isKeyboardVisible: boolean;
  keyboardHeight: number;

  // Actions - Loading
  setGlobalLoading: (isLoading: boolean, message?: string) => void;

  // Actions - Toast
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;

  // Actions - Modal
  openModal: (id: string, component: string, props?: Record<string, unknown>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Actions - Search & Filters
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: string | boolean | number) => void;
  clearFilters: () => void;

  // Actions - Keyboard
  setKeyboardState: (isVisible: boolean, height: number) => void;

  // Reset
  reset: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialState = {
  isGlobalLoading: false,
  globalLoadingMessage: null,
  toasts: [],
  activeModals: [],
  searchQuery: '',
  activeFilters: {},
  isKeyboardVisible: false,
  keyboardHeight: 0,
};

export const useUIStore = create<UIState>((set, get) => ({
  ...initialState,

  // Loading
  setGlobalLoading: (isLoading, message) => {
    set({
      isGlobalLoading: isLoading,
      globalLoadingMessage: message || null,
    });
  },

  // Toast
  showToast: (type, message, duration = 3000) => {
    const id = generateId();
    const toast: Toast = { id, type, message, duration };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        get().hideToast(id);
      }, duration);
    }
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Modal
  openModal: (id, component, props) => {
    const modal: Modal = { id, component, props };
    set((state) => ({
      activeModals: [...state.activeModals, modal],
    }));
  },

  closeModal: (id) => {
    set((state) => ({
      activeModals: state.activeModals.filter((m) => m.id !== id),
    }));
  },

  closeAllModals: () => {
    set({ activeModals: [] });
  },

  // Search & Filters
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setFilter: (key, value) => {
    set((state) => ({
      activeFilters: { ...state.activeFilters, [key]: value },
    }));
  },

  clearFilters: () => {
    set({ activeFilters: {}, searchQuery: '' });
  },

  // Keyboard
  setKeyboardState: (isVisible, height) => {
    set({ isKeyboardVisible: isVisible, keyboardHeight: height });
  },

  // Reset
  reset: () => {
    set(initialState);
  },
}));

// Selector hooks for common use cases
export const useIsLoading = () => useUIStore((state) => state.isGlobalLoading);
export const useToasts = () => useUIStore((state) => state.toasts);
export const useSearchQuery = () => useUIStore((state) => state.searchQuery);

export default useUIStore;
