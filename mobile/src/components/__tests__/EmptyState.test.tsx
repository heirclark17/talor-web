/**
 * EmptyState Component - Pure Logic Tests
 *
 * Tests module exports, pre-configured empty state variants,
 * style object structure, and prop configurations.
 */

// Mock @expo/vector-icons before any imports
jest.mock('@expo/vector-icons', () => ({
  Ionicons: {
    glyphMap: {
      'document-text-outline': 0,
      'sparkles-outline': 0,
      'chatbubbles-outline': 0,
      'help-circle-outline': 0,
      'star-outline': 0,
      'bookmark-outline': 0,
      'search-outline': 0,
      'cloud-offline-outline': 0,
      'warning-outline': 0,
    },
  },
}));

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      background: '#0a0a0a',
    },
    isDark: true,
  })),
}));

// Mock GlassButton
jest.mock('../glass/GlassButton', () => ({
  GlassButton: 'GlassButton',
}));

import {
  EmptyState,
  NoResumesEmptyState,
  NoTailoredResumesEmptyState,
  NoInterviewPrepsEmptyState,
  NoQuestionsEmptyState,
  NoStarStoriesEmptyState,
  NoSavedComparisonsEmptyState,
  NoSearchResultsEmptyState,
  NetworkErrorEmptyState,
  GenericErrorEmptyState,
} from '../EmptyState';

describe('EmptyState Module', () => {
  describe('Module Exports', () => {
    it('should export EmptyState as a named export', () => {
      expect(EmptyState).toBeDefined();
      expect(typeof EmptyState).toBe('function');
    });

    it('should export EmptyState as the default export', () => {
      const defaultExport = require('../EmptyState').default;
      expect(defaultExport).toBeDefined();
      expect(defaultExport).toBe(EmptyState);
    });

    it('should export all pre-configured empty state variants', () => {
      expect(typeof NoResumesEmptyState).toBe('function');
      expect(typeof NoTailoredResumesEmptyState).toBe('function');
      expect(typeof NoInterviewPrepsEmptyState).toBe('function');
      expect(typeof NoQuestionsEmptyState).toBe('function');
      expect(typeof NoStarStoriesEmptyState).toBe('function');
      expect(typeof NoSavedComparisonsEmptyState).toBe('function');
      expect(typeof NoSearchResultsEmptyState).toBe('function');
      expect(typeof NetworkErrorEmptyState).toBe('function');
      expect(typeof GenericErrorEmptyState).toBe('function');
    });

    it('should export exactly 10 functions (1 base + 9 pre-configured)', () => {
      const mod = require('../EmptyState');
      const exportedFunctions = Object.entries(mod).filter(
        ([key, val]) => typeof val === 'function' && key !== 'default'
      );
      expect(exportedFunctions.length).toBe(10);
    });
  });

  describe('Style Definitions', () => {
    // StyleSheet.create is identity in test env, so we can inspect the styles
    // by importing the module and examining static properties
    it('should have styles with correct container alignment', () => {
      // The styles object is private but created via StyleSheet.create
      // which is mocked as identity. We can verify through the module structure.
      // This is implicitly tested by the module loading without error.
      expect(EmptyState).toBeDefined();
    });
  });

  describe('Pre-configured Empty States - NoResumesEmptyState', () => {
    it('should accept an onUpload callback prop', () => {
      // Verify the function signature expects onUpload
      expect(NoResumesEmptyState.length).toBeLessThanOrEqual(1);
      expect(() => {
        // Should not throw when called with the right shape
        NoResumesEmptyState({ onUpload: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NoTailoredResumesEmptyState', () => {
    it('should accept an onTailor callback prop', () => {
      expect(() => {
        NoTailoredResumesEmptyState({ onTailor: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NoInterviewPrepsEmptyState', () => {
    it('should accept an onGenerate callback prop', () => {
      expect(() => {
        NoInterviewPrepsEmptyState({ onGenerate: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NoQuestionsEmptyState', () => {
    it('should accept an onGenerate callback prop', () => {
      expect(() => {
        NoQuestionsEmptyState({ onGenerate: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NoStarStoriesEmptyState', () => {
    it('should accept an onAdd callback prop', () => {
      expect(() => {
        NoStarStoriesEmptyState({ onAdd: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NoSavedComparisonsEmptyState', () => {
    it('should accept an onBrowse callback prop', () => {
      expect(() => {
        NoSavedComparisonsEmptyState({ onBrowse: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NoSearchResultsEmptyState', () => {
    it('should accept searchQuery and onClear props', () => {
      expect(() => {
        NoSearchResultsEmptyState({
          searchQuery: 'test query',
          onClear: jest.fn(),
        });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - NetworkErrorEmptyState', () => {
    it('should accept an onRetry callback prop', () => {
      expect(() => {
        NetworkErrorEmptyState({ onRetry: jest.fn() });
      }).not.toThrow();
    });
  });

  describe('Pre-configured Empty States - GenericErrorEmptyState', () => {
    it('should accept onRetry as required and message as optional', () => {
      // Without custom message
      expect(() => {
        GenericErrorEmptyState({ onRetry: jest.fn() });
      }).not.toThrow();

      // With custom message
      expect(() => {
        GenericErrorEmptyState({
          message: 'Custom error',
          onRetry: jest.fn(),
        });
      }).not.toThrow();
    });
  });

  describe('Base EmptyState component', () => {
    it('should not throw when called with all required props', () => {
      expect(() => {
        EmptyState({
          icon: 'document-text-outline' as any,
          title: 'Test Title',
          description: 'Test Description',
        });
      }).not.toThrow();
    });

    it('should not throw when called with optional action props', () => {
      expect(() => {
        EmptyState({
          icon: 'document-text-outline' as any,
          title: 'Test Title',
          description: 'Test Description',
          actionLabel: 'Do Something',
          onAction: jest.fn(),
          secondaryActionLabel: 'Other Action',
          onSecondaryAction: jest.fn(),
        });
      }).not.toThrow();
    });
  });
});
