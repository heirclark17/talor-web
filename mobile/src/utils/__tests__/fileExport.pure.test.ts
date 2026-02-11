/**
 * File Export Utilities Tests
 *
 * Tests for formatFileSize (pure) and async export/file management functions
 * Covers: exportTailoredResume, shareFile, exportAndShare, getExportedFiles,
 *         deleteExportedFile, clearExportedFiles, getFileInfo, formatFileSize
 */

jest.mock('../../api/client', () => ({
  api: {
    exportResumeAnalysis: jest.fn(),
  },
}));

import {
  formatFileSize,
  exportTailoredResume,
  shareFile,
  exportAndShare,
  getExportedFiles,
  deleteExportedFile,
  clearExportedFiles,
  getFileInfo,
  ExportFormat,
} from '../fileExport';
import { api } from '../../api/client';
import { Platform, Alert, Share } from 'react-native';
import {
  getInfoAsync,
  readDirectoryAsync,
  deleteAsync,
  downloadAsync,
  writeAsStringAsync,
  makeDirectoryAsync,
} from 'expo-file-system/legacy';

const mockApi = api.exportResumeAnalysis as jest.Mock;
const mockGetInfoAsync = getInfoAsync as jest.Mock;
const mockReadDirectoryAsync = readDirectoryAsync as jest.Mock;
const mockDeleteAsync = deleteAsync as jest.Mock;
const mockDownloadAsync = downloadAsync as jest.Mock;
const mockWriteAsStringAsync = writeAsStringAsync as jest.Mock;
const mockMakeDirectoryAsync = makeDirectoryAsync as jest.Mock;
const mockShare = Share.share as jest.Mock;
const mockAlert = Alert.alert as jest.Mock;

// Access the expo-sharing mock that was loaded at module init time
const Sharing = require('expo-sharing');
const mockIsAvailableAsync = Sharing.isAvailableAsync as jest.Mock;
const mockShareAsync = Sharing.shareAsync as jest.Mock;

describe('File Export Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // formatFileSize (pure function)
  // =========================================================================
  describe('formatFileSize', () => {
    it('should return "0 B" for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should format fractional sizes with one decimal', () => {
      // 1.5 KB = 1536 bytes
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should drop trailing zero in decimal', () => {
      // 2.0 MB = 2097152 bytes
      expect(formatFileSize(2097152)).toBe('2 MB');
    });
  });

  // =========================================================================
  // exportTailoredResume
  // =========================================================================
  describe('exportTailoredResume', () => {
    it('should return error when API call fails with Error instance', async () => {
      mockApi.mockRejectedValueOnce(new Error('Network error'));

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should return "Unknown error occurred" when catch receives non-Error', async () => {
      mockApi.mockRejectedValueOnce('string error');

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should return error when API returns unsuccessful response', async () => {
      mockApi.mockResolvedValueOnce({
        success: false,
        error: 'Resume not found',
        data: null,
      });

      const result = await exportTailoredResume({
        tailoredResumeId: 999,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Resume not found');
    });

    it('should return default error when API returns unsuccessful response with no error message', async () => {
      mockApi.mockResolvedValueOnce({
        success: false,
        data: null,
      });

      const result = await exportTailoredResume({
        tailoredResumeId: 999,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to export resume');
    });

    it('should return error when API response data is null', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: null,
      });

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to export resume');
    });

    it('should return error when response has no content or downloadUrl', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {},
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockMakeDirectoryAsync.mockResolvedValueOnce(undefined);

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('No content or download URL provided');
    });

    it('should download file when downloadUrl is provided', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          downloadUrl: 'https://example.com/resume.pdf',
          originalFilename: 'my_resume',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      mockDownloadAsync.mockResolvedValueOnce({ status: 200, uri: '/mock/file' });

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('my_resume');
      expect(result.filePath).toContain('.pdf');
      expect(mockDownloadAsync).toHaveBeenCalledWith(
        'https://example.com/resume.pdf',
        expect.stringContaining('my_resume')
      );
    });

    it('should return error when download fails with non-200 status', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          downloadUrl: 'https://example.com/resume.pdf',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      mockDownloadAsync.mockResolvedValueOnce({ status: 404, uri: '' });

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Download failed with status 404');
    });

    it('should write base64 content when content is provided', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64encodedcontent',
          originalFilename: 'test_resume',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockMakeDirectoryAsync.mockResolvedValueOnce(undefined);

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'docx',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('.docx');
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('test_resume'),
        'base64encodedcontent',
        { encoding: 'base64' }
      );
    });

    it('should call onProgress callbacks at correct stages', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
          originalFilename: 'resume',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });

      const onProgress = jest.fn();

      await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith(0.1);
      expect(onProgress).toHaveBeenCalledWith(0.5);
      expect(onProgress).toHaveBeenCalledWith(0.7);
      expect(onProgress).toHaveBeenCalledWith(1.0);
    });

    it('should create exports directory if it does not exist', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });
      mockMakeDirectoryAsync.mockResolvedValueOnce(undefined);

      await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(mockMakeDirectoryAsync).toHaveBeenCalledWith(
        expect.stringContaining('exports/'),
        { intermediates: true }
      );
    });

    it('should use custom filename when provided', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
          originalFilename: 'original_name',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
        filename: 'custom_filename',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('custom_filename');
      expect(result.filePath).not.toContain('original_name');
    });

    it('should use default fallback filename when no filename or originalFilename', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });

      const result = await exportTailoredResume({
        tailoredResumeId: 42,
        format: 'pdf',
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toContain('tailored_resume_42');
    });

    it('should sanitize filename by removing special characters', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
          originalFilename: 'my@resume#2024!.final',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });

      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result.success).toBe(true);
      // Special chars removed, spaces replaced with underscores
      expect(result.filePath).not.toContain('@');
      expect(result.filePath).not.toContain('#');
      expect(result.filePath).not.toContain('!');
    });

    it('should not skip directory creation when directory already exists', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });

      await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(mockMakeDirectoryAsync).not.toHaveBeenCalled();
    });

    it('should fall back to .pdf extension for unknown format values', async () => {
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
          originalFilename: 'fallback_test',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });

      // Cast unknown format to ExportFormat to test the default switch branch
      const result = await exportTailoredResume({
        tailoredResumeId: 1,
        format: 'txt' as ExportFormat,
      });

      expect(result.success).toBe(true);
      // getFileExtension default returns '.pdf'
      expect(result.filePath).toContain('.pdf');
    });
  });

  // =========================================================================
  // shareFile
  // =========================================================================
  describe('shareFile', () => {
    it('should share a PDF file via expo-sharing when available', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(true);
      mockShareAsync.mockResolvedValueOnce(undefined);

      const result = await shareFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(true);
      expect(mockShareAsync).toHaveBeenCalledWith(
        '/mock/documents/exports/resume.pdf',
        expect.objectContaining({
          mimeType: 'application/pdf',
          dialogTitle: 'Share Resume',
          UTI: 'com.adobe.pdf',
        })
      );
    });

    it('should share a DOCX file via expo-sharing when available', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(true);
      mockShareAsync.mockResolvedValueOnce(undefined);

      const result = await shareFile('/mock/documents/exports/resume.docx');

      expect(result).toBe(true);
      expect(mockShareAsync).toHaveBeenCalledWith(
        '/mock/documents/exports/resume.docx',
        expect.objectContaining({
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          dialogTitle: 'Share Resume',
          UTI: 'org.openxmlformats.wordprocessingml.document',
        })
      );
    });

    it('should fall back to RN Share when expo-sharing is not available', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(false);
      mockShare.mockResolvedValueOnce({ action: 'sharedAction' });

      const result = await shareFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(true);
      expect(mockShareAsync).not.toHaveBeenCalled();
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Share Resume',
        })
      );
    });

    it('should return false when RN Share action is dismissed', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(false);
      mockShare.mockResolvedValueOnce({ action: 'dismissedAction' });

      const result = await shareFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(false);
    });

    it('should show Alert and return false when sharing throws an error', async () => {
      mockIsAvailableAsync.mockRejectedValueOnce(new Error('Share failed'));

      const result = await shareFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith(
        'Share Failed',
        'Unable to share the file. The file has been saved to your device.',
        [{ text: 'OK' }]
      );
    });

    it('should use ios URL format on iOS platform', async () => {
      mockIsAvailableAsync.mockResolvedValueOnce(false);
      mockShare.mockResolvedValueOnce({ action: 'sharedAction' });
      // Platform is already mocked as 'ios' in jest.setup.ts

      await shareFile('/mock/documents/exports/resume.pdf');

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/mock/documents/exports/resume.pdf',
        })
      );
    });

    it('should use file:// URL format on Android platform', async () => {
      // Temporarily change Platform.OS to android
      const origOS = Platform.OS;
      (Platform as any).OS = 'android';

      mockIsAvailableAsync.mockResolvedValueOnce(false);
      mockShare.mockResolvedValueOnce({ action: 'sharedAction' });

      await shareFile('/mock/documents/exports/resume.pdf');

      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'file:///mock/documents/exports/resume.pdf',
        })
      );

      // Restore original Platform.OS
      (Platform as any).OS = origOS;
    });

    it('should skip expo-sharing and use RN Share when isAvailableAsync is not a function', async () => {
      // Temporarily remove isAvailableAsync to make the Sharing check fail
      const origIsAvailable = Sharing.isAvailableAsync;
      Sharing.isAvailableAsync = 'not-a-function';

      mockShare.mockResolvedValueOnce({ action: 'sharedAction' });

      const result = await shareFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(true);
      expect(mockShare).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Share Resume',
        })
      );
      // mockShareAsync should NOT have been called since Sharing check failed
      expect(mockShareAsync).not.toHaveBeenCalled();

      // Restore
      Sharing.isAvailableAsync = origIsAvailable;
    });
  });

  // =========================================================================
  // exportAndShare
  // =========================================================================
  describe('exportAndShare', () => {
    it('should export and then share a resume successfully', async () => {
      // Setup export to succeed
      mockApi.mockResolvedValueOnce({
        success: true,
        data: {
          content: 'base64content',
          originalFilename: 'shared_resume',
        },
      });
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      // Setup share to succeed
      mockIsAvailableAsync.mockResolvedValueOnce(true);
      mockShareAsync.mockResolvedValueOnce(undefined);

      const result = await exportAndShare({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result).toBe(true);
    });

    it('should show Alert and return false when export fails', async () => {
      mockApi.mockResolvedValueOnce({
        success: false,
        error: 'Export error',
        data: null,
      });

      const result = await exportAndShare({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith(
        'Export Failed',
        'Export error'
      );
    });

    it('should show Alert with default message when export fails with no error string', async () => {
      mockApi.mockRejectedValueOnce(new Error('crash'));

      const result = await exportAndShare({
        tailoredResumeId: 1,
        format: 'pdf',
      });

      expect(result).toBe(false);
      expect(mockAlert).toHaveBeenCalledWith(
        'Export Failed',
        'crash'
      );
    });

  });

  // =========================================================================
  // getExportedFiles
  // =========================================================================
  describe('getExportedFiles', () => {
    it('should return empty array when exports directory does not exist', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });

      const files = await getExportedFiles();

      expect(files).toEqual([]);
    });

    it('should return file paths when directory exists with files', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      mockReadDirectoryAsync.mockResolvedValueOnce(['resume1.pdf', 'resume2.docx']);

      const files = await getExportedFiles();

      expect(files).toHaveLength(2);
      expect(files[0]).toContain('resume1.pdf');
      expect(files[1]).toContain('resume2.docx');
    });

    it('should return empty array when readDirectoryAsync throws', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      mockReadDirectoryAsync.mockRejectedValueOnce(new Error('Read error'));

      const files = await getExportedFiles();

      expect(files).toEqual([]);
    });
  });

  // =========================================================================
  // deleteExportedFile
  // =========================================================================
  describe('deleteExportedFile', () => {
    it('should return true on successful deletion', async () => {
      mockDeleteAsync.mockResolvedValueOnce(undefined);

      const result = await deleteExportedFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(true);
      expect(mockDeleteAsync).toHaveBeenCalledWith(
        '/mock/documents/exports/resume.pdf',
        { idempotent: true }
      );
    });

    it('should return false when deletion fails', async () => {
      mockDeleteAsync.mockRejectedValueOnce(new Error('Delete error'));

      const result = await deleteExportedFile('/mock/documents/exports/resume.pdf');

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // clearExportedFiles
  // =========================================================================
  describe('clearExportedFiles', () => {
    it('should delete exports directory when it exists', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      mockDeleteAsync.mockResolvedValueOnce(undefined);

      const result = await clearExportedFiles();

      expect(result).toBe(true);
      expect(mockDeleteAsync).toHaveBeenCalledWith(
        expect.stringContaining('exports/'),
        { idempotent: true }
      );
    });

    it('should return true when exports directory does not exist', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: false });

      const result = await clearExportedFiles();

      expect(result).toBe(true);
      expect(mockDeleteAsync).not.toHaveBeenCalled();
    });

    it('should return false when deletion throws an error', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true });
      mockDeleteAsync.mockRejectedValueOnce(new Error('Permission denied'));

      const result = await clearExportedFiles();

      expect(result).toBe(false);
    });
  });

  // =========================================================================
  // getFileInfo
  // =========================================================================
  describe('getFileInfo', () => {
    it('should return file info when file exists', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({
        exists: true,
        size: 1024,
        modificationTime: 1700000000,
      });

      const info = await getFileInfo('/mock/documents/exports/resume.pdf');

      expect(info.exists).toBe(true);
      expect(info.size).toBe(1024);
      expect(info.modificationTime).toBe(1700000000);
    });

    it('should return exists false with no size or modTime when file does not exist', async () => {
      mockGetInfoAsync.mockResolvedValueOnce({
        exists: false,
      });

      const info = await getFileInfo('/mock/documents/exports/nonexistent.pdf');

      expect(info.exists).toBe(false);
      expect(info.size).toBeUndefined();
      expect(info.modificationTime).toBeUndefined();
    });

    it('should return exists false when getInfoAsync throws', async () => {
      mockGetInfoAsync.mockRejectedValueOnce(new Error('Permission denied'));

      const info = await getFileInfo('/mock/documents/exports/resume.pdf');

      expect(info).toEqual({ exists: false });
    });
  });
});
