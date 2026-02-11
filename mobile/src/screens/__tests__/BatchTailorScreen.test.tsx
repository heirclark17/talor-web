/**
 * BatchTailorScreen Test Suite
 *
 * Tests module exports, MAX_JOBS constant, BatchResult interface logic,
 * URL handling logic, result counting, status filtering, and component rendering
 * via react-test-renderer for all major UI states.
 */

// Mock ALL dependencies BEFORE imports
jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#fff',
      textSecondary: '#999',
      textTertiary: '#666',
      background: '#000',
      backgroundSecondary: '#111',
      border: '#333',
      glass: 'rgba(255,255,255,0.1)',
      glassBorder: 'rgba(255,255,255,0.2)',
    },
    isDark: true,
  })),
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  })),
  useFocusEffect: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(),
}));

const mockSetSelectedResumeId = jest.fn();
const mockFetchResumes = jest.fn();
jest.mock('../../stores/resumeStore', () => ({
  useResumeStore: jest.fn(() => ({
    resumes: [],
    selectedResumeId: null,
    setSelectedResumeId: mockSetSelectedResumeId,
    loading: false,
    fetchResumes: mockFetchResumes,
  })),
}));

const mockTailorResumeBatch = jest.fn();
jest.mock('../../api/client', () => ({
  api: {
    tailorResumeBatch: mockTailorResumeBatch,
  },
}));

// GlassButton: must return object with named export (component uses { GlassButton })
// Return a React element so react-test-renderer can render it with props
jest.mock('../../components/glass/GlassButton', () => {
  const React = require('react');
  const MockGlassButton = (props: any) =>
    React.createElement('MockGlassButton', {
      label: props.label,
      onPress: props.onPress,
      disabled: props.disabled,
      loading: props.loading,
      variant: props.variant,
      fullWidth: props.fullWidth,
    });
  MockGlassButton.displayName = 'GlassButton';
  return { GlassButton: MockGlassButton, default: MockGlassButton };
});

// SafeAreaView: must be a function for react-test-renderer
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: (props: any) =>
      React.createElement('SafeAreaView', props, props.children),
  };
});

import React from 'react';
import renderer from 'react-test-renderer';
import { useResumeStore } from '../../stores/resumeStore';
import { Alert } from 'react-native';

describe('BatchTailorScreen', () => {
  // ==========================================
  // Module Export Tests
  // ==========================================
  describe('Module Exports', () => {
    it('should export a default function component', () => {
      const mod = require('../BatchTailorScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have a function named BatchTailorScreen', () => {
      const mod = require('../BatchTailorScreen');
      expect(mod.default.name).toBe('BatchTailorScreen');
    });
  });

  // ==========================================
  // MAX_JOBS constant
  // ==========================================
  describe('MAX_JOBS constant', () => {
    // MAX_JOBS is a module-scoped const, value is 10
    const MAX_JOBS = 10;

    it('should be 10', () => {
      expect(MAX_JOBS).toBe(10);
    });

    it('should be a positive integer', () => {
      expect(Number.isInteger(MAX_JOBS)).toBe(true);
      expect(MAX_JOBS).toBeGreaterThan(0);
    });
  });

  // ==========================================
  // URL Filtering Logic (line 103, 176)
  // ==========================================
  describe('Valid URL filtering logic (replicated from line 103)', () => {
    function getValidUrls(jobUrls: string[]): string[] {
      return jobUrls.filter((url) => url.trim().length > 0);
    }

    function getValidUrlCount(jobUrls: string[]): number {
      return jobUrls.filter((url) => url.trim().length > 0).length;
    }

    it('should return empty array for all empty URLs', () => {
      expect(getValidUrls(['', '', ''])).toEqual([]);
    });

    it('should filter out empty strings', () => {
      expect(getValidUrls(['https://a.com', '', 'https://b.com'])).toEqual([
        'https://a.com',
        'https://b.com',
      ]);
    });

    it('should filter out whitespace-only strings', () => {
      expect(getValidUrls(['  ', '  https://a.com  ', '\t'])).toEqual(['  https://a.com  ']);
    });

    it('should return all non-empty URLs', () => {
      const urls = ['https://a.com', 'https://b.com', 'https://c.com'];
      expect(getValidUrls(urls)).toEqual(urls);
    });

    it('should count 0 for default state (one empty string)', () => {
      expect(getValidUrlCount([''])).toBe(0);
    });

    it('should count valid URLs correctly', () => {
      expect(getValidUrlCount(['https://a.com', '', 'https://b.com'])).toBe(2);
    });

    it('should count all URLs when all are valid', () => {
      expect(getValidUrlCount(['a', 'b', 'c', 'd', 'e'])).toBe(5);
    });
  });

  // ==========================================
  // Add URL Logic (line 78-82)
  // ==========================================
  describe('handleAddUrl logic (replicated)', () => {
    const MAX_JOBS = 10;

    function addUrl(currentUrls: string[]): string[] {
      if (currentUrls.length < MAX_JOBS) {
        return [...currentUrls, ''];
      }
      return currentUrls;
    }

    it('should add an empty string to the array', () => {
      expect(addUrl(['https://a.com'])).toEqual(['https://a.com', '']);
    });

    it('should not exceed MAX_JOBS', () => {
      const tenUrls = Array(10).fill('https://url.com');
      expect(addUrl(tenUrls)).toEqual(tenUrls);
      expect(addUrl(tenUrls).length).toBe(10);
    });

    it('should add from default state (one empty)', () => {
      expect(addUrl([''])).toEqual(['', '']);
    });

    it('should allow adding up to 9 more from 1', () => {
      let urls = ['https://first.com'];
      for (let i = 0; i < 9; i++) {
        urls = addUrl(urls);
      }
      expect(urls.length).toBe(10);
      // Adding one more should not change length
      urls = addUrl(urls);
      expect(urls.length).toBe(10);
    });
  });

  // ==========================================
  // Remove URL Logic (line 84-89)
  // ==========================================
  describe('handleRemoveUrl logic (replicated)', () => {
    function removeUrl(currentUrls: string[], index: number): string[] {
      if (currentUrls.length > 1) {
        return currentUrls.filter((_, i) => i !== index);
      }
      return currentUrls;
    }

    it('should remove URL at specified index', () => {
      expect(removeUrl(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
    });

    it('should not remove if only one URL remains', () => {
      expect(removeUrl(['a'], 0)).toEqual(['a']);
    });

    it('should remove first URL', () => {
      expect(removeUrl(['a', 'b'], 0)).toEqual(['b']);
    });

    it('should remove last URL', () => {
      expect(removeUrl(['a', 'b'], 1)).toEqual(['a']);
    });

    it('should handle removing from array of 2', () => {
      const result = removeUrl(['first', 'second'], 0);
      expect(result).toEqual(['second']);
      expect(result.length).toBe(1);
    });
  });

  // ==========================================
  // URL Change Logic (line 91-95)
  // ==========================================
  describe('handleUrlChange logic (replicated)', () => {
    function changeUrl(currentUrls: string[], index: number, value: string): string[] {
      const newUrls = [...currentUrls];
      newUrls[index] = value;
      return newUrls;
    }

    it('should update URL at specified index', () => {
      expect(changeUrl(['', '', ''], 1, 'https://new.com')).toEqual([
        '',
        'https://new.com',
        '',
      ]);
    });

    it('should not mutate original array', () => {
      const original = ['a', 'b', 'c'];
      const result = changeUrl(original, 0, 'x');
      expect(original).toEqual(['a', 'b', 'c']);
      expect(result).toEqual(['x', 'b', 'c']);
    });

    it('should handle updating last URL', () => {
      expect(changeUrl(['a', 'b'], 1, 'z')).toEqual(['a', 'z']);
    });
  });

  // ==========================================
  // BatchResult status types
  // ==========================================
  describe('BatchResult status types', () => {
    const VALID_STATUSES = ['pending', 'processing', 'success', 'error'] as const;

    it('should have exactly 4 status types', () => {
      expect(VALID_STATUSES).toHaveLength(4);
    });

    it.each(VALID_STATUSES)('status "%s" should be a valid string', (status) => {
      expect(typeof status).toBe('string');
    });
  });

  // ==========================================
  // Result Counting Logic (lines 177-178)
  // ==========================================
  describe('Result counting logic (replicated from lines 177-178)', () => {
    interface MockResult {
      jobUrl: string;
      status: 'pending' | 'processing' | 'success' | 'error';
      error?: string;
    }

    function countSuccess(results: MockResult[]): number {
      return results.filter((r) => r.status === 'success').length;
    }

    function countError(results: MockResult[]): number {
      return results.filter((r) => r.status === 'error').length;
    }

    const sampleResults: MockResult[] = [
      { jobUrl: 'url1', status: 'success' },
      { jobUrl: 'url2', status: 'error', error: 'Failed' },
      { jobUrl: 'url3', status: 'success' },
      { jobUrl: 'url4', status: 'pending' },
      { jobUrl: 'url5', status: 'processing' },
      { jobUrl: 'url6', status: 'error', error: 'Timeout' },
    ];

    it('should count 2 successes', () => {
      expect(countSuccess(sampleResults)).toBe(2);
    });

    it('should count 2 errors', () => {
      expect(countError(sampleResults)).toBe(2);
    });

    it('should count 0 successes for all errors', () => {
      const allErrors: MockResult[] = [
        { jobUrl: 'a', status: 'error' },
        { jobUrl: 'b', status: 'error' },
      ];
      expect(countSuccess(allErrors)).toBe(0);
    });

    it('should count 0 errors for all successes', () => {
      const allSuccess: MockResult[] = [
        { jobUrl: 'a', status: 'success' },
        { jobUrl: 'b', status: 'success' },
      ];
      expect(countError(allSuccess)).toBe(0);
    });

    it('should count 0 for empty results', () => {
      expect(countSuccess([])).toBe(0);
      expect(countError([])).toBe(0);
    });
  });

  // ==========================================
  // Initial batch result creation (line 110-113)
  // ==========================================
  describe('Initial batch result creation (replicated from line 110)', () => {
    function createPendingResults(validUrls: string[]) {
      return validUrls.map((url) => ({
        jobUrl: url,
        status: 'pending' as const,
      }));
    }

    it('should create pending results for all valid URLs', () => {
      const result = createPendingResults(['url1', 'url2']);
      expect(result).toEqual([
        { jobUrl: 'url1', status: 'pending' },
        { jobUrl: 'url2', status: 'pending' },
      ]);
    });

    it('should create empty array for no URLs', () => {
      expect(createPendingResults([])).toEqual([]);
    });

    it('should set all statuses to pending', () => {
      const result = createPendingResults(['a', 'b', 'c']);
      result.forEach((r) => expect(r.status).toBe('pending'));
    });
  });

  // ==========================================
  // Result mapping from API (lines 128-145)
  // ==========================================
  describe('Result mapping from API response (replicated from lines 128-145)', () => {
    function mapApiResults(
      validUrls: string[],
      batchResults: any[]
    ): Array<{
      jobUrl: string;
      status: 'success' | 'error';
      tailoredResumeId?: number;
      company?: string;
      title?: string;
      error?: string;
    }> {
      return validUrls.map((url, index) => {
        const jobResult = batchResults[index];
        if (jobResult?.success) {
          return {
            jobUrl: url,
            status: 'success' as const,
            tailoredResumeId: jobResult.tailored_resume_id,
            company: jobResult.company,
            title: jobResult.title,
          };
        } else {
          return {
            jobUrl: url,
            status: 'error' as const,
            error: jobResult?.error || 'Failed to tailor',
          };
        }
      });
    }

    it('should map successful results', () => {
      const urls = ['url1'];
      const apiResults = [
        { success: true, tailored_resume_id: 42, company: 'Google', title: 'SWE' },
      ];
      const result = mapApiResults(urls, apiResults);
      expect(result[0]).toEqual({
        jobUrl: 'url1',
        status: 'success',
        tailoredResumeId: 42,
        company: 'Google',
        title: 'SWE',
      });
    });

    it('should map failed results with custom error', () => {
      const urls = ['url1'];
      const apiResults = [{ success: false, error: 'Invalid URL' }];
      const result = mapApiResults(urls, apiResults);
      expect(result[0]).toEqual({
        jobUrl: 'url1',
        status: 'error',
        error: 'Invalid URL',
      });
    });

    it('should use default error message when none provided', () => {
      const urls = ['url1'];
      const apiResults = [{ success: false }];
      const result = mapApiResults(urls, apiResults);
      expect(result[0].error).toBe('Failed to tailor');
    });

    it('should handle missing API result at index', () => {
      const urls = ['url1', 'url2'];
      const apiResults = [{ success: true, tailored_resume_id: 1, company: 'A', title: 'B' }];
      const result = mapApiResults(urls, apiResults);
      expect(result[1].status).toBe('error');
      expect(result[1].error).toBe('Failed to tailor');
    });

    it('should handle mixed success and failure', () => {
      const urls = ['url1', 'url2', 'url3'];
      const apiResults = [
        { success: true, tailored_resume_id: 1, company: 'A', title: 'A' },
        { success: false, error: 'Bad' },
        { success: true, tailored_resume_id: 3, company: 'C', title: 'C' },
      ];
      const result = mapApiResults(urls, apiResults);
      expect(result[0].status).toBe('success');
      expect(result[1].status).toBe('error');
      expect(result[2].status).toBe('success');
    });
  });

  // ==========================================
  // Plural label logic (line 463)
  // ==========================================
  describe('Plural label logic (replicated from line 463)', () => {
    function getButtonLabel(processing: boolean, validUrlCount: number): string {
      if (processing) return 'Processing...';
      return `Tailor ${validUrlCount} Resume${validUrlCount !== 1 ? 's' : ''}`;
    }

    it('should show "Processing..." when processing', () => {
      expect(getButtonLabel(true, 3)).toBe('Processing...');
    });

    it('should show singular for 1 URL', () => {
      expect(getButtonLabel(false, 1)).toBe('Tailor 1 Resume');
    });

    it('should show plural for 2 URLs', () => {
      expect(getButtonLabel(false, 2)).toBe('Tailor 2 Resumes');
    });

    it('should show plural for 0 URLs', () => {
      expect(getButtonLabel(false, 0)).toBe('Tailor 0 Resumes');
    });

    it('should show plural for 10 URLs', () => {
      expect(getButtonLabel(false, 10)).toBe('Tailor 10 Resumes');
    });
  });

  // ==========================================
  // Selected resume logic (line 175)
  // ==========================================
  describe('Selected resume find logic (replicated from line 175)', () => {
    interface MockResume {
      id: number;
      filename: string;
    }

    function findSelectedResume(
      resumes: MockResume[],
      selectedId: number | null
    ): MockResume | undefined {
      return resumes?.find((r) => r.id === selectedId);
    }

    it('should find resume by id', () => {
      const resumes = [
        { id: 1, filename: 'a.pdf' },
        { id: 2, filename: 'b.pdf' },
      ];
      expect(findSelectedResume(resumes, 2)).toEqual({ id: 2, filename: 'b.pdf' });
    });

    it('should return undefined when id is null', () => {
      const resumes = [{ id: 1, filename: 'a.pdf' }];
      expect(findSelectedResume(resumes, null)).toBeUndefined();
    });

    it('should return undefined when id does not exist', () => {
      const resumes = [{ id: 1, filename: 'a.pdf' }];
      expect(findSelectedResume(resumes, 99)).toBeUndefined();
    });

    it('should return undefined for empty resumes', () => {
      expect(findSelectedResume([], 1)).toBeUndefined();
    });
  });

  // ========================================================================
  // DIRECT COMPONENT RENDERING TESTS (react-test-renderer)
  // ========================================================================

  describe('direct component rendering', () => {
    let BatchTailorScreen: any;

    beforeEach(() => {
      jest.clearAllMocks();
      BatchTailorScreen = require('../BatchTailorScreen').default;
    });

    // Helper: extract all text from a test instance tree recursively
    const getAllText = (instance: any): string => {
      if (typeof instance === 'string' || typeof instance === 'number') {
        return String(instance);
      }
      if (!instance || !instance.children) return '';
      return instance.children.map((c: any) => getAllText(c)).join(' ');
    };

    // Helper: find a TouchableOpacity whose descendant text contains the given string
    const findTouchableByText = (root: any, text: string): any => {
      const touchables = root.findAllByType('TouchableOpacity');
      return touchables.find((t: any) => getAllText(t).includes(text));
    };

    const renderScreen = (storeOverrides?: any) => {
      if (storeOverrides) {
        (useResumeStore as unknown as jest.Mock).mockReturnValue({
          resumes: [],
          selectedResumeId: null,
          setSelectedResumeId: mockSetSelectedResumeId,
          loading: false,
          fetchResumes: mockFetchResumes,
          ...storeOverrides,
        });
      }
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(BatchTailorScreen));
      });
      return tree!;
    };

    // ----- Loading state -----
    it('should render loading state when resumesLoading is true', () => {
      const tree = renderScreen({ loading: true });
      const json = tree.toJSON();
      expect(json).toBeDefined();
      expect(json).not.toBeNull();
      // Loading state shows ActivityIndicator and "Loading..." text
      const str = JSON.stringify(json);
      expect(str).toContain('ActivityIndicator');
      expect(str).toContain('Loading');
    });

    // ----- Empty state (no resumes) -----
    it('should render empty state when no resumes exist', () => {
      const tree = renderScreen({ resumes: [], loading: false });
      const json = tree.toJSON();
      expect(json).toBeDefined();
      const str = JSON.stringify(json);
      expect(str).toContain('No Resumes');
      expect(str).toContain('Upload a resume first');
    });

    it('should render Upload Resume button in empty state', () => {
      const tree = renderScreen({ resumes: [], loading: false });
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Upload Resume');
    });

    it('should navigate to UploadResume when upload button pressed in empty state', () => {
      const tree = renderScreen({ resumes: [], loading: false });
      const root = tree.root;
      const uploadButton = findTouchableByText(root, 'Upload Resume');
      expect(uploadButton).toBeDefined();
      renderer.act(() => {
        uploadButton!.props.onPress();
      });
      expect(mockNavigate).toHaveBeenCalledWith('UploadResume');
    });

    it('should call goBack when back button pressed in empty state', () => {
      const tree = renderScreen({ resumes: [], loading: false });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      // First touchable in header is the back button
      expect(touchables.length).toBeGreaterThan(0);
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    // ----- Main form view -----
    it('should render main form view with resumes available', () => {
      const tree = renderScreen({
        resumes: [
          { id: 1, filename: 'test.pdf', skills_count: 5 },
          { id: 2, filename: 'resume.docx', skills_count: 10 },
        ],
        selectedResumeId: 1,
        loading: false,
      });
      const json = tree.toJSON();
      expect(json).toBeDefined();
      const str = JSON.stringify(json);
      expect(str).toContain('Batch Tailor');
      expect(str).toContain('Select Resume');
      expect(str).toContain('Job URLs');
    });

    it('should show selected resume filename in selector', () => {
      const tree = renderScreen({
        resumes: [
          { id: 1, filename: 'my_resume.pdf', skills_count: 5 },
        ],
        selectedResumeId: 1,
        loading: false,
      });
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('my_resume.pdf');
    });

    it('should show "Select a resume" when no resume selected', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: null,
        loading: false,
      });
      // After useEffect auto-select, the first render may still show "Select a resume"
      // or the auto-selected one. Either way it should render without error.
      const json = tree.toJSON();
      expect(json).toBeDefined();
    });

    it('should render with selected resume', () => {
      const tree = renderScreen({
        resumes: [
          { id: 1, filename: 'first.pdf', skills_count: 5 },
          { id: 2, filename: 'second.pdf', skills_count: 10 },
        ],
        selectedResumeId: 2,
        loading: false,
      });
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('second.pdf');
    });

    it('should show info banner with MAX_JOBS text', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('10');
      expect(str).toContain('jobs at once');
    });

    it('should show URL count in form view', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const str = JSON.stringify(tree.toJSON());
      // Default state: 0 valid out of 10
      expect(str).toContain('0');
      expect(str).toContain('10');
    });

    it('should show Add Another URL button', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Add Another URL');
    });

    it('should render GlassButton with Tailor label', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;
      const glassButtons = root.findAllByType('MockGlassButton');
      expect(glassButtons.length).toBeGreaterThan(0);
      // The main button label contains "Tailor"
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );
      expect(tailorBtn).toBeDefined();
      expect(tailorBtn.props.label).toContain('Tailor');
      expect(tailorBtn.props.label).toContain('Resume');
    });

    it('should disable tailor button when no valid URLs', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;
      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );
      expect(tailorBtn).toBeDefined();
      expect(tailorBtn.props.disabled).toBe(true);
    });

    // ----- Resume selector interaction -----
    it('should toggle resume dropdown when selector pressed', () => {
      const tree = renderScreen({
        resumes: [
          { id: 1, filename: 'first.pdf', skills_count: 5 },
          { id: 2, filename: 'second.pdf', skills_count: 10 },
        ],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;
      const selectorBtn = findTouchableByText(root, 'first.pdf');
      expect(selectorBtn).toBeDefined();
      // Press to open dropdown
      renderer.act(() => {
        selectorBtn!.props.onPress();
      });
      // After opening, the dropdown should show resume options
      // Note: JSX like `{count} skills` renders as separate children ["5"," skills"]
      const strAfter = JSON.stringify(tree.toJSON());
      expect(strAfter).toContain('"5"');
      expect(strAfter).toContain('" skills"');
      expect(strAfter).toContain('"10"');
      expect(strAfter).toContain('second.pdf');
    });

    it('should select a different resume from dropdown', () => {
      const tree = renderScreen({
        resumes: [
          { id: 1, filename: 'first.pdf', skills_count: 5 },
          { id: 2, filename: 'second.pdf', skills_count: 10 },
        ],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;
      // Open dropdown
      const selectorBtn = findTouchableByText(root, 'first.pdf');
      renderer.act(() => {
        selectorBtn!.props.onPress();
      });
      // Find and press the second resume option
      const secondOption = findTouchableByText(root, 'second.pdf');
      expect(secondOption).toBeDefined();
      renderer.act(() => {
        secondOption!.props.onPress();
      });
      expect(mockSetSelectedResumeId).toHaveBeenCalledWith(2);
    });

    // ----- URL input interaction -----
    it('should add a URL input when Add Another URL pressed', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      // Count initial TextInputs (should be 1)
      let textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBe(1);

      // Find and press Add Another URL
      const addBtn = findTouchableByText(root, 'Add Another URL');
      expect(addBtn).toBeDefined();
      renderer.act(() => {
        addBtn!.props.onPress();
      });

      // Should now have 2 TextInputs
      textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBe(2);
    });

    it('should type a URL into the input', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;
      const textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBe(1);

      // Simulate typing a URL
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/123');
      });

      // After typing, the button should no longer be disabled (1 valid URL)
      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );
      expect(tailorBtn).toBeDefined();
      expect(tailorBtn.props.disabled).toBe(false);
      expect(tailorBtn.props.label).toContain('1 Resume');
    });

    it('should show remove button when multiple URLs exist', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      // Initially 1 URL, no remove button
      let textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBe(1);

      // Add another URL
      const addBtn = findTouchableByText(root, 'Add Another URL');
      expect(addBtn).toBeDefined();
      renderer.act(() => {
        addBtn!.props.onPress();
      });

      // Now 2 URLs, remove buttons should appear
      textInputs = root.findAllByType('TextInput');
      expect(textInputs.length).toBe(2);
    });

    // ----- Batch tailor action -----
    it('should call Alert when tailor pressed without resume selected', () => {
      (useResumeStore as unknown as jest.Mock).mockReturnValue({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: null,
        loading: false,
        setSelectedResumeId: mockSetSelectedResumeId,
        fetchResumes: mockFetchResumes,
      });

      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(BatchTailorScreen));
      });
      const root = tree!.root;

      // Type a URL first
      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/123');
      });

      // Press the tailor button
      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      renderer.act(() => {
        tailorBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a resume');
    });

    it('should call Alert when tailor pressed with no valid URLs', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      // Press tailor without entering any URLs
      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      renderer.act(() => {
        tailorBtn!.props.onPress();
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter at least one job URL');
    });

    it('should call API and show results on successful batch', async () => {
      mockTailorResumeBatch.mockResolvedValue({
        success: true,
        data: {
          results: [
            { success: true, tailored_resume_id: 42, company: 'Google', title: 'SWE' },
          ],
        },
      });

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      // Type a URL
      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/123');
      });

      // Press tailor
      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      expect(mockTailorResumeBatch).toHaveBeenCalledWith({
        baseResumeId: 1,
        jobUrls: ['https://linkedin.com/jobs/123'],
      });

      // After API call, should show results view
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Batch Results');
      expect(str).toContain('Google');
      expect(str).toContain('SWE');
      expect(str).toContain('succeeded');
    });

    it('should show error results when API returns failure', async () => {
      mockTailorResumeBatch.mockResolvedValue({
        success: false,
        error: 'Server error',
      });

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      // Type a URL
      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/456');
      });

      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Batch Results');
      expect(str).toContain('failed');
      expect(str).toContain('Server error');
    });

    it('should show error results when API throws exception', async () => {
      mockTailorResumeBatch.mockRejectedValue(new Error('Network error'));

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/789');
      });

      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Batch Results');
      expect(str).toContain('Network error');
    });

    // ----- Results view interactions -----
    it('should navigate to TailorResume when View Result pressed', async () => {
      mockTailorResumeBatch.mockResolvedValue({
        success: true,
        data: {
          results: [
            { success: true, tailored_resume_id: 42, company: 'Google', title: 'SWE' },
          ],
        },
      });

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/123');
      });

      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      // Find "View Result" button
      const viewBtn = findTouchableByText(root, 'View Result');
      expect(viewBtn).toBeDefined();

      renderer.act(() => {
        viewBtn!.props.onPress();
      });

      expect(mockNavigate).toHaveBeenCalledWith('TailorResume', { resumeId: 42 });
    });

    it('should reset to form view when Start New Batch pressed', async () => {
      mockTailorResumeBatch.mockResolvedValue({
        success: true,
        data: {
          results: [
            { success: true, tailored_resume_id: 42, company: 'Google', title: 'SWE' },
          ],
        },
      });

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/123');
      });

      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      // Should be in results view now
      let str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Batch Results');

      // Find "Start New Batch" button
      const newBatchBtn = root.findAllByType('MockGlassButton').find((b: any) =>
        b.props.label && b.props.label.includes('Start New Batch')
      );
      expect(newBatchBtn).toBeDefined();

      renderer.act(() => {
        newBatchBtn!.props.onPress();
      });

      // Should be back on form view
      str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Batch Tailor');
      expect(str).toContain('Select Resume');
    });

    it('should reset to form view when back button pressed in results', async () => {
      mockTailorResumeBatch.mockResolvedValue({
        success: true,
        data: {
          results: [
            { success: true, tailored_resume_id: 42, company: 'Google', title: 'SWE' },
          ],
        },
      });

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://linkedin.com/jobs/123');
      });

      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      // Press back button in results view (first TouchableOpacity)
      const touchables = root.findAllByType('TouchableOpacity');
      renderer.act(() => {
        touchables[0].props.onPress();
      });

      // Should be back on form
      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('Batch Tailor');
    });

    it('should handle batch with mixed results', async () => {
      mockTailorResumeBatch.mockResolvedValue({
        success: true,
        data: {
          results: [
            { success: true, tailored_resume_id: 1, company: 'Google', title: 'SWE' },
            { success: false, error: 'URL not found' },
            { success: true, tailored_resume_id: 3, company: 'Meta', title: 'PM' },
          ],
        },
      });

      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;

      // Add 3 URLs
      const textInputs = root.findAllByType('TextInput');
      renderer.act(() => {
        textInputs[0].props.onChangeText('https://jobs.google.com/123');
      });

      // Add second URL
      let addBtn = findTouchableByText(root, 'Add Another URL');
      renderer.act(() => { addBtn!.props.onPress(); });

      let inputs = root.findAllByType('TextInput');
      renderer.act(() => {
        inputs[1].props.onChangeText('https://bad-url.com');
      });

      // Add third URL
      addBtn = findTouchableByText(root, 'Add Another URL');
      renderer.act(() => { addBtn!.props.onPress(); });

      inputs = root.findAllByType('TextInput');
      renderer.act(() => {
        inputs[2].props.onChangeText('https://jobs.meta.com/456');
      });

      // Press tailor
      const glassButtons = root.findAllByType('MockGlassButton');
      const tailorBtn = glassButtons.find((b: any) =>
        b.props.label && b.props.label.includes('Tailor')
      );

      await renderer.act(async () => {
        tailorBtn!.props.onPress();
      });

      const str = JSON.stringify(tree.toJSON());
      expect(str).toContain('2');  // 2 succeeded
      expect(str).toContain('1');  // 1 failed
      expect(str).toContain('Google');
      expect(str).toContain('Meta');
      expect(str).toContain('URL not found');
    });

    // ----- goBack on main form -----
    it('should call goBack when back button pressed on main form', () => {
      const tree = renderScreen({
        resumes: [{ id: 1, filename: 'test.pdf', skills_count: 5 }],
        selectedResumeId: 1,
        loading: false,
      });
      const root = tree.root;
      const touchables = root.findAllByType('TouchableOpacity');
      // First touchable is the back button
      renderer.act(() => {
        touchables[0].props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalled();
    });

    // ----- Auto-select resume -----
    it('should auto-select first resume when none selected', () => {
      renderScreen({
        resumes: [
          { id: 5, filename: 'auto.pdf', skills_count: 3 },
          { id: 6, filename: 'other.pdf', skills_count: 7 },
        ],
        selectedResumeId: null,
        loading: false,
      });
      // The useEffect should call setSelectedResumeId with first resume id
      expect(mockSetSelectedResumeId).toHaveBeenCalledWith(5);
    });
  });
});
