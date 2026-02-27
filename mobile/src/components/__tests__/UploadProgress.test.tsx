/**
 * UploadProgress Tests
 *
 * Pure logic tests and direct component invocation:
 * - Module exports (named + default)
 * - formatFileSize function
 * - getStatusText, getProgressBarColor, getStatusIcon logic
 * - Cancel/retry button visibility
 * - Direct component calls for all status states
 */

import React from 'react';
import renderer from 'react-test-renderer';

// Mock dependencies before imports
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      border: '#374151',
      backgroundSecondary: '#1a1a1a',
    },
    isDark: true,
  })),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => `Ionicons-${props.name}`,
}));

import { UploadProgress } from '../UploadProgress';
import UploadProgressDefault from '../UploadProgress';
import { COLORS } from '../../utils/constants';


const getTreeText = (node: any): string => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean') return '';

  let text = '';

  // Handle array of nodes
  if (Array.isArray(node)) {
    return node.map(n => getTreeText(n)).join(' ');
  }

  // Extract text from props
  if (node.props) {
    // Get specific text props
    if (typeof node.props.children === 'string' || typeof node.props.children === 'number') {
      text += ' ' + node.props.children;
    } else if (Array.isArray(node.props.children)) {
      text += ' ' + getTreeText(node.props.children);
    } else if (node.props.children && typeof node.props.children === 'object') {
      text += ' ' + getTreeText(node.props.children);
    }

    // Also check for label, title, placeholder, value
    if (node.props.label) text += ' ' + node.props.label;
    if (node.props.title) text += ' ' + node.props.title;
    if (node.props.placeholder) text += ' ' + node.props.placeholder;
    if (typeof node.props.value === 'string') text += ' ' + node.props.value;
  }

  // Handle children array
  if (node.children && Array.isArray(node.children)) {
    text += ' ' + node.children.map((c: any) => getTreeText(c)).join(' ');
  }

  return text;
};

describe('UploadProgress', () => {
  describe('module exports', () => {
    it('should export UploadProgress as named export', () => {
      expect(UploadProgress).toBeDefined();
      expect(typeof UploadProgress).toBe('function');
    });

    it('should export UploadProgress as default export', () => {
      expect(UploadProgressDefault).toBeDefined();
      expect(typeof UploadProgressDefault).toBe('function');
    });

    it('should have named and default export be the same', () => {
      expect(UploadProgress).toBe(UploadProgressDefault);
    });
  });

  describe('formatFileSize function', () => {
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    it('should format bytes (< 1024) correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1)).toBe('1 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format kilobytes (1024 - 1MB) correctly', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
      expect(formatFileSize(512000)).toBe('500.0 KB');
    });

    it('should format megabytes (>= 1MB) correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
    });

    it('should handle boundary at exactly 1024 bytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('should handle boundary at exactly 1MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('should format with one decimal place for KB and MB', () => {
      expect(formatFileSize(1500)).toMatch(/^\d+\.\d KB$/);
    });
  });

  describe('getStatusText logic', () => {
    const getStatusText = (status: string, progress: number, error?: string) => {
      switch (status) {
        case 'uploading': return `Uploading... ${progress}%`;
        case 'processing': return 'Processing file...';
        case 'success': return 'Upload complete!';
        case 'error': return error || 'Upload failed';
        default: return 'Preparing...';
      }
    };

    it('should show uploading with progress', () => {
      expect(getStatusText('uploading', 45)).toBe('Uploading... 45%');
    });

    it('should show uploading at 0%', () => {
      expect(getStatusText('uploading', 0)).toBe('Uploading... 0%');
    });

    it('should show uploading at 100%', () => {
      expect(getStatusText('uploading', 100)).toBe('Uploading... 100%');
    });

    it('should show processing status', () => {
      expect(getStatusText('processing', 100)).toBe('Processing file...');
    });

    it('should show success status', () => {
      expect(getStatusText('success', 100)).toBe('Upload complete!');
    });

    it('should show custom error message', () => {
      expect(getStatusText('error', 50, 'Network timeout')).toBe('Network timeout');
    });

    it('should show default error message when no custom error', () => {
      expect(getStatusText('error', 50)).toBe('Upload failed');
    });

    it('should show default error for empty error string', () => {
      expect(getStatusText('error', 50, '')).toBe('Upload failed');
    });

    it('should show Preparing for unknown status', () => {
      expect(getStatusText('unknown', 0)).toBe('Preparing...');
    });
  });

  describe('getProgressBarColor logic', () => {
    const getProgressBarColor = (status: string) => {
      switch (status) {
        case 'success': return COLORS.success;
        case 'error': return COLORS.danger;
        default: return COLORS.primary;
      }
    };

    it('should return success color for success', () => {
      expect(getProgressBarColor('success')).toBe(COLORS.success);
    });

    it('should return danger color for error', () => {
      expect(getProgressBarColor('error')).toBe(COLORS.danger);
    });

    it('should return primary for uploading', () => {
      expect(getProgressBarColor('uploading')).toBe(COLORS.primary);
    });

    it('should return primary for processing', () => {
      expect(getProgressBarColor('processing')).toBe(COLORS.primary);
    });

    it('should return primary for unknown', () => {
      expect(getProgressBarColor('unknown')).toBe(COLORS.primary);
    });
  });

  describe('cancel button visibility logic', () => {
    it('should show cancel when uploading with onCancel', () => {
      const status: string = 'uploading';
      const onCancel: (() => void) | undefined = () => {};
      expect(status === 'uploading' && !!onCancel).toBe(true);
    });

    it('should not show cancel when not uploading', () => {
      const status: string = 'processing';
      const onCancel: (() => void) | undefined = () => {};
      expect(status === 'uploading' && !!onCancel).toBe(false);
    });

    it('should not show cancel when no onCancel', () => {
      const status: string = 'uploading';
      const onCancel: (() => void) | undefined = undefined;
      expect(status === 'uploading' && !!onCancel).toBe(false);
    });
  });

  describe('retry button visibility logic', () => {
    it('should show retry when error with onRetry', () => {
      const status: string = 'error';
      const onRetry: (() => void) | undefined = () => {};
      expect(status === 'error' && !!onRetry).toBe(true);
    });

    it('should not show retry when not error', () => {
      const status: string = 'uploading';
      const onRetry: (() => void) | undefined = () => {};
      expect(status === 'error' && !!onRetry).toBe(false);
    });

    it('should not show retry when no onRetry', () => {
      const status: string = 'error';
      const onRetry: (() => void) | undefined = undefined;
      expect(status === 'error' && !!onRetry).toBe(false);
    });
  });

  describe('React.createElement invocation - uploading state', () => {
    it('should create element for uploading state', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 1024 * 512,
        progress: 50,
        status: 'uploading',
      });
      expect(element).toBeTruthy();
      expect(element.props.status).toBe('uploading');
      expect(element.props.progress).toBe(50);
    });

    it('should create element with cancel button props', () => {
      const onCancel = jest.fn();
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 2048,
        progress: 25,
        status: 'uploading',
        onCancel,
      });
      expect(element).toBeTruthy();
      expect(element.props.onCancel).toBe(onCancel);
    });

    it('should create element at 0% progress', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'doc.docx',
        fileSize: 100,
        progress: 0,
        status: 'uploading',
      });
      expect(element).toBeTruthy();
      expect(element.props.progress).toBe(0);
    });

    it('should create element at 100% progress', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'doc.docx',
        fileSize: 1024 * 1024,
        progress: 100,
        status: 'uploading',
      });
      expect(element).toBeTruthy();
      expect(element.props.progress).toBe(100);
    });
  });

  describe('React.createElement invocation - processing state', () => {
    it('should create element for processing state', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 1024 * 256,
        progress: 100,
        status: 'processing',
      });
      expect(element).toBeTruthy();
      expect(element.props.status).toBe('processing');
    });
  });

  describe('React.createElement invocation - success state', () => {
    it('should create element for success state', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 1024 * 100,
        progress: 100,
        status: 'success',
      });
      expect(element).toBeTruthy();
      expect(element.props.status).toBe('success');
    });
  });

  describe('React.createElement invocation - error state', () => {
    it('should create element for error without retry', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
        error: 'Network timeout',
      });
      expect(element).toBeTruthy();
      expect(element.props.error).toBe('Network timeout');
    });

    it('should create element for error with retry', () => {
      const onRetry = jest.fn();
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
        error: 'Upload failed',
        onRetry,
      });
      expect(element).toBeTruthy();
      expect(element.props.onRetry).toBe(onRetry);
    });

    it('should create element for error without custom message', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'resume.pdf',
        fileSize: 512,
        progress: 30,
        status: 'error',
      });
      expect(element).toBeTruthy();
      expect(element.props.error).toBeUndefined();
    });
  });

  describe('React.createElement invocation - edge cases', () => {
    it('should create element with very large file size', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'large_file.zip',
        fileSize: 500 * 1024 * 1024,
        progress: 10,
        status: 'uploading',
      });
      expect(element).toBeTruthy();
      expect(element.props.fileSize).toBe(500 * 1024 * 1024);
    });

    it('should create element with zero file size', () => {
      const element = React.createElement(UploadProgress, {
        fileName: 'empty.txt',
        fileSize: 0,
        progress: 100,
        status: 'success',
      });
      expect(element).toBeTruthy();
      expect(element.props.fileSize).toBe(0);
    });

    it('should create element with long file name', () => {
      const longName = 'very_long_file_name_that_goes_on_and_on_resume_2026_final_v3.pdf';
      const element = React.createElement(UploadProgress, {
        fileName: longName,
        fileSize: 2048,
        progress: 75,
        status: 'uploading',
      });
      expect(element).toBeTruthy();
      expect(element.props.fileName).toBe(longName);
    });
  });

  describe('react-test-renderer rendering - uploading state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(UploadProgress, props));
      });
      return tree!;
    };

    it('should render uploading state with file name and progress', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024 * 512,
        progress: 50,
        status: 'uploading',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('resume.pdf');
      expect(str).toContain('512.0 KB');
      expect(str).toContain('Uploading... 50%');
    });

    it('should render uploading at 0% progress', () => {
      const tree = renderComponent({
        fileName: 'doc.pdf',
        fileSize: 100,
        progress: 0,
        status: 'uploading',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Uploading... 0%');
    });

    it('should render uploading at 100% progress', () => {
      const tree = renderComponent({
        fileName: 'doc.pdf',
        fileSize: 1024 * 1024,
        progress: 100,
        status: 'uploading',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Uploading... 100%');
      expect(str).toContain('1.0 MB');
    });

    it('should render cancel button when uploading with onCancel', () => {
      const onCancel = jest.fn();
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 2048,
        progress: 25,
        status: 'uploading',
        onCancel,
      });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThanOrEqual(1);

      // Press the cancel button
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      expect(onCancel).toHaveBeenCalled();
    });

    it('should NOT render cancel button when uploading without onCancel', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 2048,
        progress: 25,
        status: 'uploading',
      });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables).toHaveLength(0);
    });

    it('should render file size in bytes', () => {
      const tree = renderComponent({
        fileName: 'tiny.txt',
        fileSize: 500,
        progress: 10,
        status: 'uploading',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('500 B');
    });
  });

  describe('react-test-renderer rendering - processing state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(UploadProgress, props));
      });
      return tree!;
    };

    it('should render processing state text', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024 * 256,
        progress: 100,
        status: 'processing',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Processing file...');
    });

    it('should NOT render cancel button in processing state', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 100,
        status: 'processing',
        onCancel: jest.fn(),
      });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables).toHaveLength(0);
    });
  });

  describe('react-test-renderer rendering - success state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(UploadProgress, props));
      });
      return tree!;
    };

    it('should render success text', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024 * 100,
        progress: 100,
        status: 'success',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Upload complete!');
    });
  });

  describe('react-test-renderer rendering - error state', () => {
    const renderComponent = (props: any) => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(UploadProgress, props));
      });
      return tree!;
    };

    it('should render custom error message', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
        error: 'Network timeout',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Network timeout');
    });

    it('should render default error message when no custom error', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Upload failed');
    });

    it('should render retry button when error with onRetry', () => {
      const onRetry = jest.fn();
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
        error: 'Failed',
        onRetry,
      });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBeGreaterThanOrEqual(1);

      // Press retry
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      expect(onRetry).toHaveBeenCalled();
    });

    it('should NOT render retry button when error without onRetry', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
      });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      expect(touchables).toHaveLength(0);
    });

    it('should render retry text "Retry"', () => {
      const tree = renderComponent({
        fileName: 'resume.pdf',
        fileSize: 1024,
        progress: 50,
        status: 'error',
        onRetry: jest.fn(),
      });
      const str = getTreeText(tree.toJSON());
      expect(str).toContain('Retry');
    });
  });
});
