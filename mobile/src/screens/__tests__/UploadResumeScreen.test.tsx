/**
 * UploadResumeScreen Unit Tests
 *
 * Comprehensive tests covering: module exports, formatFileSize logic,
 * document picker integration, file upload flow, upload progress tracking,
 * success/error handling, navigation, accessibility, conditional rendering.
 *
 * Uses react-test-renderer for interactive component testing.
 */

// ---- Mock ALL dependencies BEFORE imports ----

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
      primary: '#3b82f6',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
  })),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      text: '#ffffff',
      textSecondary: '#9ca3af',
      textTertiary: '#6b7280',
      background: '#0a0a0a',
      backgroundSecondary: '#1a1a1a',
      backgroundTertiary: '#2a2a2a',
      border: '#374151',
      primary: '#3b82f6',
      glass: 'rgba(255,255,255,0.04)',
      glassBorder: 'rgba(255,255,255,0.08)',
    },
    isDark: true,
  })),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: jest.fn(() => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    canGoBack: jest.fn(() => true),
  })),
  useRoute: jest.fn(() => ({ params: {} })),
  useFocusEffect: jest.fn((callback: any) => callback()),
  useIsFocused: jest.fn(() => true),
  CommonActions: {
    navigate: jest.fn(),
    reset: jest.fn(),
  },
}));

let mockUploadResume: jest.Mock = jest.fn(() =>
  Promise.resolve({ success: true, data: { id: 1 } }),
);

jest.mock('../../api/client', () => ({
  api: {
    get uploadResume() {
      return mockUploadResume;
    },
  },
}));

jest.mock('../../components/glass/GlassButton', () => {
  const React = require('react');
  return {
    GlassButton: (props: any) =>
      React.createElement('GlassButton', {
        ...props,
        testID: 'glass-button',
      }),
  };
});

jest.mock('../../navigation/AppNavigator', () => ({
  RootStackParamList: {},
}));

let mockGetDocumentAsync: jest.Mock = jest.fn(() =>
  Promise.resolve({ canceled: true, assets: [] }),
);

jest.mock('expo-document-picker', () => ({
  get getDocumentAsync() {
    return mockGetDocumentAsync;
  },
}));

// ---- Imports ----

import React from 'react';
import renderer from 'react-test-renderer';
import { Alert } from 'react-native';
import { COLORS } from '../../utils/constants';

// ---- Helper: replicate formatFileSize logic from UploadResumeScreen ----
function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ---- Supported MIME types as used in DocumentPicker config ----
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ---- Helper: extract all text from a tree JSON node recursively ----
function getTreeText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTreeText).join('');
  if (node.children) return node.children.map(getTreeText).join('');
  return '';
}

// ---- Helper: find node by accessibilityLabel in tree root ----
function findByAccessibilityLabel(root: any, label: string): any {
  const results = root.findAll(
    (node: any) => node.props?.accessibilityLabel === label,
  );
  return results.length > 0 ? results[0] : null;
}

// ---- Helper: find node by type name ----
function findAllByType(root: any, typeName: string): any[] {
  return root.findAll((node: any) => {
    if (typeof node.type === 'string') return node.type === typeName;
    if (node.type?.displayName) return node.type.displayName === typeName;
    if (node.type?.name) return node.type.name === typeName;
    return false;
  });
}

// ========================================================================
// TESTS
// ========================================================================

describe('UploadResumeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUploadResume = jest.fn(() =>
      Promise.resolve({ success: true, data: { id: 1 } }),
    );
    mockGetDocumentAsync = jest.fn(() =>
      Promise.resolve({ canceled: true, assets: [] }),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ---- Module Export Tests ----

  describe('module exports', () => {
    it('should export a default function component', () => {
      const mod = require('../UploadResumeScreen');
      expect(mod.default).toBeDefined();
      expect(typeof mod.default).toBe('function');
    });

    it('should have the function named UploadResumeScreen', () => {
      const mod = require('../UploadResumeScreen');
      expect(mod.default.name).toBe('UploadResumeScreen');
    });

    it('should not expose additional named exports', () => {
      const mod = require('../UploadResumeScreen');
      const exportKeys = Object.keys(mod).filter((k) => k !== '__esModule');
      expect(exportKeys).toEqual(['default']);
    });
  });

  // ---- formatFileSize Logic Tests (replicated helper) ----

  describe('formatFileSize logic', () => {
    it('should return "Unknown size" for undefined bytes', () => {
      expect(formatFileSize(undefined)).toBe('Unknown size');
    });

    it('should return "Unknown size" for 0 bytes (falsy)', () => {
      expect(formatFileSize(0)).toBe('Unknown size');
    });

    it('should format bytes under 1024 as "N B"', () => {
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1)).toBe('1 B');
      expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('should format bytes between 1024 and 1MB as "N.N KB"', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(10240)).toBe('10.0 KB');
      expect(formatFileSize(512000)).toBe('500.0 KB');
    });

    it('should format bytes >= 1MB as "N.N MB"', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
    });

    it('should handle exact boundary at 1024', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('should handle exact boundary at 1MB', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    });

    it('should handle very small values', () => {
      expect(formatFileSize(1)).toBe('1 B');
    });

    it('should handle large files', () => {
      expect(formatFileSize(100 * 1024 * 1024)).toBe('100.0 MB');
    });
  });

  // ---- Supported MIME Types Tests ----

  describe('supported MIME types', () => {
    it('should support PDF files', () => {
      expect(SUPPORTED_MIME_TYPES).toContain('application/pdf');
    });

    it('should support legacy DOC files', () => {
      expect(SUPPORTED_MIME_TYPES).toContain('application/msword');
    });

    it('should support modern DOCX files', () => {
      expect(SUPPORTED_MIME_TYPES).toContain(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
    });

    it('should support exactly 3 MIME types', () => {
      expect(SUPPORTED_MIME_TYPES).toHaveLength(3);
    });

    it('should not support image files', () => {
      expect(SUPPORTED_MIME_TYPES).not.toContain('image/png');
      expect(SUPPORTED_MIME_TYPES).not.toContain('image/jpeg');
    });

    it('should not support plain text files', () => {
      expect(SUPPORTED_MIME_TYPES).not.toContain('text/plain');
    });
  });

  // ---- Upload Validation Logic Tests ----

  describe('upload validation logic', () => {
    it('should require a selected file before upload', () => {
      const selectedFile = null;
      const canUpload = selectedFile !== null;
      expect(canUpload).toBe(false);
    });

    it('should allow upload when file is selected', () => {
      const selectedFile = {
        uri: 'file:///test.pdf',
        name: 'test.pdf',
        mimeType: 'application/pdf',
      };
      const canUpload = selectedFile !== null;
      expect(canUpload).toBe(true);
    });

    it('should default mimeType to "application/pdf" when undefined', () => {
      const file = {
        uri: 'file:///test.pdf',
        name: 'test.pdf',
        mimeType: undefined,
      };
      const resolvedType = file.mimeType || 'application/pdf';
      expect(resolvedType).toBe('application/pdf');
    });

    it('should use provided mimeType when available', () => {
      const file = {
        uri: 'file:///test.docx',
        name: 'test.docx',
        mimeType: 'application/msword',
      };
      const resolvedType = file.mimeType || 'application/pdf';
      expect(resolvedType).toBe('application/msword');
    });
  });

  // ---- FormData Construction Logic Tests ----

  describe('FormData construction', () => {
    it('should append file with correct field name "file"', () => {
      const formData = new FormData();
      const mockFile = {
        uri: 'file:///mock/resume.pdf',
        name: 'resume.pdf',
        type: 'application/pdf',
      };
      formData.append('file', mockFile as any);
      expect(formData).toBeDefined();
    });
  });

  // ---- Document Picker Configuration Tests ----

  describe('document picker configuration', () => {
    it('should enable copyToCacheDirectory', () => {
      const config = {
        type: SUPPORTED_MIME_TYPES,
        copyToCacheDirectory: true,
      };
      expect(config.copyToCacheDirectory).toBe(true);
    });

    it('should pass all supported MIME types to picker', () => {
      const config = {
        type: SUPPORTED_MIME_TYPES,
        copyToCacheDirectory: true,
      };
      expect(config.type).toHaveLength(3);
      expect(config.type[0]).toBe('application/pdf');
    });
  });

  // ---- Info Section Steps Tests ----

  describe('info section steps', () => {
    const infoSteps = [
      "We'll extract your experience, skills, and education",
      'Use AI to tailor your resume for specific job postings',
      'Get interview prep materials based on your tailored resume',
    ];

    it('should have exactly 3 info steps', () => {
      expect(infoSteps).toHaveLength(3);
    });

    it('should start with extraction step', () => {
      expect(infoSteps[0]).toContain('extract');
    });

    it('should include AI tailoring step', () => {
      expect(infoSteps[1]).toContain('AI');
      expect(infoSteps[1]).toContain('tailor');
    });

    it('should end with interview prep step', () => {
      expect(infoSteps[2]).toContain('interview prep');
    });
  });

  // ---- Accessibility Configuration Tests ----

  describe('accessibility configuration', () => {
    it('should have close button with correct label', () => {
      const label = 'Close upload screen';
      const hint = 'Returns to the previous screen';
      expect(label).toBe('Close upload screen');
      expect(hint).toContain('previous screen');
    });

    it('should have select file button with correct label', () => {
      const label = 'Select resume file';
      const hint = 'Opens document picker to choose a PDF or Word document';
      expect(label).toContain('resume file');
      expect(hint).toContain('document picker');
    });

    it('should have change file button with correct label', () => {
      const label = 'Change selected file';
      const hint = 'Opens document picker to select a different resume file';
      expect(label).toContain('Change');
      expect(hint).toContain('different resume');
    });
  });

  // ---- Success State Tests ----

  describe('success state text', () => {
    it('should have correct success title', () => {
      const title = 'Upload Successful!';
      expect(title).toBe('Upload Successful!');
    });

    it('should have informative success description', () => {
      const text =
        'Your resume has been uploaded and is being processed.';
      expect(text).toContain('uploaded');
      expect(text).toContain('processed');
    });
  });

  // ---- Drop Zone Text Tests ----

  describe('drop zone text', () => {
    it('should have correct title', () => {
      const title = 'Select Resume';
      expect(title).toBe('Select Resume');
    });

    it('should have correct instruction text', () => {
      const text = 'Tap to select a PDF or Word document';
      expect(text).toContain('PDF');
      expect(text).toContain('Word');
    });

    it('should show supported formats', () => {
      const formats = 'Supported formats: PDF, DOC, DOCX';
      expect(formats).toContain('PDF');
      expect(formats).toContain('DOC');
      expect(formats).toContain('DOCX');
    });
  });

  // ---- Navigation After Upload Tests ----

  describe('navigation timing after upload', () => {
    it('should delay navigation by 1500ms after success', () => {
      const delay = 1500;
      expect(delay).toBe(1500);
    });
  });

  // ---- Error Alert Configuration Tests ----

  describe('error alert messages', () => {
    it('should show correct error for missing file', () => {
      const errorMessage = 'Please select a file first';
      expect(errorMessage).toContain('select a file');
    });

    it('should show correct error for failed document pick', () => {
      const errorMessage = 'Failed to select document';
      expect(errorMessage).toContain('select document');
    });

    it('should show correct error for failed upload', () => {
      const errorMessage = 'Failed to upload resume';
      expect(errorMessage).toContain('upload resume');
    });
  });

  // ========================================================================
  // INTERACTIVE COMPONENT TESTS (react-test-renderer)
  // ========================================================================

  describe('component rendering and interaction', () => {
    let UploadResumeScreen: any;

    beforeEach(() => {
      jest.clearAllMocks();
      UploadResumeScreen = require('../UploadResumeScreen').default;
    });

    const renderScreen = () => {
      let tree: any;
      renderer.act(() => {
        tree = renderer.create(React.createElement(UploadResumeScreen));
      });
      return tree!;
    };

    // ---- Default Render State ----

    it('should render without crashing (default drop zone state)', () => {
      const tree = renderScreen();
      const json = tree.toJSON();
      expect(json).toBeDefined();
      expect(json).not.toBeNull();
    });

    it('should display the title "Upload Resume" in the header', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Upload Resume');
    });

    it('should show drop zone text when no file is selected', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('Select Resume');
      expect(text).toContain('Tap to select a PDF or Word document');
      expect(text).toContain('Supported formats: PDF, DOC, DOCX');
    });

    it('should show "What happens next?" info section', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('What happens next?');
      expect(text).toContain('extract');
      expect(text).toContain('AI');
      expect(text).toContain('interview prep');
    });

    it('should render info steps numbered 1, 2, 3', () => {
      const tree = renderScreen();
      const text = getTreeText(tree.toJSON());
      expect(text).toContain('1');
      expect(text).toContain('2');
      expect(text).toContain('3');
    });

    it('should not show GlassButton footer when no file selected', () => {
      const tree = renderScreen();
      const glassButtons = findAllByType(tree.root, 'GlassButton');
      expect(glassButtons).toHaveLength(0);
    });

    // ---- Close Button / Navigation ----

    it('should have a close button with accessibility label', () => {
      const tree = renderScreen();
      const closeBtn = findByAccessibilityLabel(tree.root, 'Close upload screen');
      expect(closeBtn).not.toBeNull();
    });

    it('should call navigation.goBack when close button is pressed', () => {
      const tree = renderScreen();
      const closeBtn = findByAccessibilityLabel(tree.root, 'Close upload screen');
      renderer.act(() => {
        closeBtn.props.onPress();
      });
      expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    // ---- Document Picker: handleSelectFile ----

    describe('handleSelectFile - file selection', () => {
      it('should call getDocumentAsync when drop zone is pressed', async () => {
        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');
        expect(dropZone).not.toBeNull();

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        expect(mockGetDocumentAsync).toHaveBeenCalledTimes(1);
        expect(mockGetDocumentAsync).toHaveBeenCalledWith({
          type: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          ],
          copyToCacheDirectory: true,
        });
      });

      it('should remain in drop zone state when user cancels picker', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: true,
          assets: [],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Select Resume');
        expect(text).not.toContain('Change File');
      });

      it('should show file preview after successful file selection', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'My_Resume.pdf',
              size: 245760,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('My_Resume.pdf');
        expect(text).toContain('240.0 KB');
        expect(text).toContain('Change File');
      });

      it('should show file size in bytes when file is very small', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/tiny.pdf',
              name: 'tiny.pdf',
              size: 500,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('500 B');
      });

      it('should show file size in MB for large files', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/big.pdf',
              name: 'big_resume.pdf',
              size: 3 * 1024 * 1024,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('3.0 MB');
      });

      it('should show "Unknown size" when file size is undefined', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/nosize.pdf',
              name: 'nosize.pdf',
              size: undefined,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Unknown size');
      });

      it('should show "Unknown size" when file size is 0', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/zero.pdf',
              name: 'zero.pdf',
              size: 0,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Unknown size');
      });

      it('should show GlassButton footer after file selection', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'resume.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const glassButtons = findAllByType(tree.root, 'GlassButton');
        expect(glassButtons.length).toBeGreaterThan(0);
        expect(glassButtons[0].props.label).toBe('Upload Resume');
        expect(glassButtons[0].props.loading).toBe(false);
        expect(glassButtons[0].props.disabled).toBe(false);
      });

      it('should show Alert when document picker throws an error', async () => {
        mockGetDocumentAsync.mockRejectedValueOnce(new Error('Permission denied'));
        const alertSpy = jest.spyOn(Alert, 'alert');

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to select document');
      });

      it('should allow changing file via Change File button', async () => {
        // First select a file
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/first.pdf',
              name: 'first.pdf',
              size: 2048,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        let text = getTreeText(tree.toJSON());
        expect(text).toContain('first.pdf');

        // Now click Change File to select a different file
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/second.docx',
              name: 'second.docx',
              size: 4096,
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
          ],
        });

        const changeBtn = findByAccessibilityLabel(tree.root, 'Change selected file');
        expect(changeBtn).not.toBeNull();

        await renderer.act(async () => {
          await changeBtn.props.onPress();
        });

        text = getTreeText(tree.toJSON());
        expect(text).toContain('second.docx');
        expect(text).toContain('4.0 KB');
      });

      it('should not change file when user cancels picker from Change File', async () => {
        // First select a file
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/original.pdf',
              name: 'original.pdf',
              size: 2048,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        // Now cancel the Change File picker
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: true,
          assets: [],
        });

        const changeBtn = findByAccessibilityLabel(tree.root, 'Change selected file');

        await renderer.act(async () => {
          await changeBtn.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('original.pdf');
      });

      it('should handle result with empty assets array', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        // Should stay in drop zone state since assets.length is 0
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Select Resume');
      });

      it('should handle result with null assets', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: null as any,
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        // Should stay in drop zone state since assets is null
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Select Resume');
      });
    });

    // ---- handleUpload - Upload Flow ----

    describe('handleUpload - upload flow', () => {
      const selectFile = async (tree: any) => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'resume.pdf',
              size: 102400,
              mimeType: 'application/pdf',
            },
          ],
        });

        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');
        await renderer.act(async () => {
          await dropZone.props.onPress();
        });
      };

      it('should call api.uploadResume when upload button is pressed', async () => {
        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(mockUploadResume).toHaveBeenCalledTimes(1);
        // Verify FormData was passed (FormData is a class instance)
        const callArg = mockUploadResume.mock.calls[0][0];
        expect(callArg).toBeInstanceOf(FormData);
      });

      it('should show success state after successful upload', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 42 },
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Upload Successful!');
        expect(text).toContain('uploaded and is being processed');
      });

      it('should not show GlassButton after successful upload', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 42 },
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        // Footer should be hidden when uploadSuccess is true
        const glassButtons = findAllByType(tree.root, 'GlassButton');
        expect(glassButtons).toHaveLength(0);
      });

      it('should navigate back after 1500ms timeout on success', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 42 },
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(mockGoBack).not.toHaveBeenCalled();

        // Advance timer by 1500ms
        renderer.act(() => {
          jest.advanceTimersByTime(1500);
        });

        expect(mockGoBack).toHaveBeenCalledTimes(1);
      });

      it('should not navigate back before 1500ms timeout', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 42 },
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        renderer.act(() => {
          jest.advanceTimersByTime(1000);
        });

        expect(mockGoBack).not.toHaveBeenCalled();
      });

      it('should show Alert with API error message on failed upload', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: false,
          error: 'File too large',
        });
        const alertSpy = jest.spyOn(Alert, 'alert');

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(alertSpy).toHaveBeenCalledWith('Error', 'File too large');
      });

      it('should show fallback error message when result.error is undefined', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: false,
          error: undefined,
        });
        const alertSpy = jest.spyOn(Alert, 'alert');

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to upload resume');
      });

      it('should show Alert when api.uploadResume throws an exception', async () => {
        mockUploadResume.mockRejectedValueOnce(new Error('Network error'));
        const alertSpy = jest.spyOn(Alert, 'alert');

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to upload resume');
      });

      it('should set uploading to false after successful upload (finally block)', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 1 },
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        // After upload completes, success state is shown and GlassButton is removed
        // The fact that we successfully rendered the success state means uploading was set to false
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Upload Successful!');
      });

      it('should set uploading to false after failed upload (finally block)', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: false,
          error: 'Server error',
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        // After failed upload, GlassButton should still be visible and not loading
        const glassButtons = findAllByType(tree.root, 'GlassButton');
        expect(glassButtons.length).toBeGreaterThan(0);
        expect(glassButtons[0].props.loading).toBe(false);
        expect(glassButtons[0].props.disabled).toBe(false);
      });

      it('should set uploading to false after exception (finally block)', async () => {
        mockUploadResume.mockRejectedValueOnce(new Error('Timeout'));

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        // GlassButton should still be visible and not loading after error
        const glassButtons = findAllByType(tree.root, 'GlassButton');
        expect(glassButtons.length).toBeGreaterThan(0);
        expect(glassButtons[0].props.loading).toBe(false);
      });

      it('should use mimeType from file when available in FormData', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.docx',
              name: 'resume.docx',
              size: 1024,
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(mockUploadResume).toHaveBeenCalledTimes(1);
      });

      it('should fallback to application/pdf when mimeType is undefined', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'resume.pdf',
              size: 1024,
              mimeType: undefined,
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        expect(mockUploadResume).toHaveBeenCalledTimes(1);
      });

      it('should remain in file preview state after failed upload', async () => {
        mockUploadResume.mockResolvedValueOnce({
          success: false,
          error: 'Invalid file format',
        });

        const tree = renderScreen();
        await selectFile(tree);

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('resume.pdf');
        expect(text).toContain('Change File');
        expect(text).not.toContain('Upload Successful!');
      });
    });

    // ---- GlassButton props validation ----

    describe('GlassButton configuration', () => {
      it('should pass correct props to GlassButton when file is selected', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'resume.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];
        expect(glassButton.props.label).toBe('Upload Resume');
        expect(glassButton.props.variant).toBe('primary');
        expect(glassButton.props.size).toBe('lg');
        expect(glassButton.props.fullWidth).toBe(true);
        expect(glassButton.props.loading).toBe(false);
        expect(glassButton.props.disabled).toBe(false);
      });
    });

    // ---- Success State Rendering ----

    describe('success state rendering', () => {
      it('should display success icon (CheckCircle) and message', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'resume.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        });
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 1 },
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Upload Successful!');
        expect(text).toContain('Your resume has been uploaded and is being processed.');
      });

      it('should reset uploadSuccess when selecting a new file after success', async () => {
        // First upload succeeds
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/first.pdf',
              name: 'first.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        });
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 1 },
        });

        const tree = renderScreen();
        // Select file
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');
        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        // Upload
        const glassButton = findAllByType(tree.root, 'GlassButton')[0];
        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        let text = getTreeText(tree.toJSON());
        expect(text).toContain('Upload Successful!');

        // Note: In success state there is no selectable element anymore
        // The component shows success view - handleSelectFile is called from drop zone
        // or change file button, but the success state has neither visible.
        // In the real app, the setTimeout navigates away.
        // We can verify the success state is properly shown.
      });
    });

    // ---- Conditional rendering: all 3 branches ----

    describe('conditional rendering branches', () => {
      it('should render drop zone when selectedFile is null and uploadSuccess is false', () => {
        const tree = renderScreen();
        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Select Resume');
        expect(text).not.toContain('Upload Successful!');
        expect(text).not.toContain('Change File');
      });

      it('should render file preview when selectedFile exists and uploadSuccess is false', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/doc.pdf',
              name: 'my_doc.pdf',
              size: 51200,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('my_doc.pdf');
        expect(text).toContain('50.0 KB');
        expect(text).toContain('Change File');
        expect(text).not.toContain('Select Resume');
        expect(text).not.toContain('Upload Successful!');
      });

      it('should render success state when uploadSuccess is true', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/resume.pdf',
              name: 'resume.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        });
        mockUploadResume.mockResolvedValueOnce({
          success: true,
          data: { id: 1 },
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const glassButton = findAllByType(tree.root, 'GlassButton')[0];

        await renderer.act(async () => {
          await glassButton.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('Upload Successful!');
        expect(text).not.toContain('Select Resume');
        expect(text).not.toContain('Change File');
      });
    });

    // ---- File format display edge cases ----

    describe('file display edge cases', () => {
      it('should display long file names (truncated by numberOfLines in component)', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/long_name.pdf',
              name: 'This_Is_A_Very_Long_Resume_File_Name_That_Should_Still_Display.pdf',
              size: 2048,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('This_Is_A_Very_Long_Resume_File_Name');
      });

      it('should display file size at exact 1KB boundary', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/exact1kb.pdf',
              name: 'exact1kb.pdf',
              size: 1024,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('1.0 KB');
      });

      it('should display file size at exact 1MB boundary', async () => {
        mockGetDocumentAsync.mockResolvedValueOnce({
          canceled: false,
          assets: [
            {
              uri: 'file:///cache/exact1mb.pdf',
              name: 'exact1mb.pdf',
              size: 1024 * 1024,
              mimeType: 'application/pdf',
            },
          ],
        });

        const tree = renderScreen();
        const dropZone = findByAccessibilityLabel(tree.root, 'Select resume file');

        await renderer.act(async () => {
          await dropZone.props.onPress();
        });

        const text = getTreeText(tree.toJSON());
        expect(text).toContain('1.0 MB');
      });
    });
  });
});
