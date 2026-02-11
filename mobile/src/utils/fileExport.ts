import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  downloadAsync,
  writeAsStringAsync,
  readDirectoryAsync,
  deleteAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { Platform, Alert, Share } from 'react-native';
import { api } from '../api/client';

// Try to import expo-sharing, fallback to React Native Share
let Sharing: any = null;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  // expo-sharing not available, will use fallback
}

export type ExportFormat = 'pdf' | 'docx';

interface ExportOptions {
  /** The ID of the tailored resume to export */
  tailoredResumeId: number;
  /** Export format */
  format: ExportFormat;
  /** Optional filename (without extension) */
  filename?: string;
  /** Callback for progress updates */
  onProgress?: (progress: number) => void;
}

interface ExportResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

/**
 * Get the file extension for a given format
 */
function getFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'pdf':
      return '.pdf';
    case 'docx':
      return '.docx';
    default:
      return '.pdf';
  }
}

/**
 * Get the MIME type for a given format
 */
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    /* istanbul ignore next -- defensive default; ExportFormat union ensures only 'pdf'|'docx' reach here */
    default:
      return 'application/octet-stream';
  }
}

/**
 * Generate a safe filename from a string
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * Export a tailored resume to PDF or DOCX format
 */
export async function exportTailoredResume(options: ExportOptions): Promise<ExportResult> {
  const { tailoredResumeId, format, filename, onProgress } = options;

  try {
    onProgress?.(0.1);

    // Call the export API
    const response = await api.exportResumeAnalysis(tailoredResumeId, format);

    onProgress?.(0.5);

    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Failed to export resume',
      };
    }

    // The API should return base64-encoded content or a download URL
    const { content, downloadUrl, originalFilename } = response.data as any;

    const safeFilename = sanitizeFilename(filename || originalFilename || `tailored_resume_${tailoredResumeId}`);
    const extension = getFileExtension(format);
    const fullFilename = `${safeFilename}${extension}`;

    // Ensure the directory exists
    const directory = documentDirectory + 'exports/';
    const dirInfo = await getInfoAsync(directory);
    if (!dirInfo.exists) {
      await makeDirectoryAsync(directory, { intermediates: true });
    }

    const filePath = directory + fullFilename;

    onProgress?.(0.7);

    if (downloadUrl) {
      // Download from URL
      const downloadResult = await downloadAsync(downloadUrl, filePath);
      if (downloadResult.status !== 200) {
        return {
          success: false,
          error: `Download failed with status ${downloadResult.status}`,
        };
      }
    } else if (content) {
      // Write base64 content to file
      await writeAsStringAsync(filePath, content, {
        encoding: EncodingType.Base64,
      });
    } else {
      return {
        success: false,
        error: 'No content or download URL provided',
      };
    }

    onProgress?.(1.0);

    return {
      success: true,
      filePath,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Share an exported file using the system share sheet
 */
export async function shareFile(filePath: string): Promise<boolean> {
  try {
    // Try expo-sharing first if available
    if (Sharing && typeof Sharing.isAvailableAsync === 'function') {
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(filePath, {
          mimeType: getMimeType(filePath.endsWith('.pdf') ? 'pdf' : 'docx'),
          dialogTitle: 'Share Resume',
          UTI: filePath.endsWith('.pdf')
            ? 'com.adobe.pdf'
            : 'org.openxmlformats.wordprocessingml.document',
        });
        return true;
      }
    }

    // Fallback to React Native Share (limited functionality)
    const result = await Share.share({
      url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
      title: 'Share Resume',
    });

    return result.action === Share.sharedAction;
  } catch (error) {
    console.error('Share error:', error);
    Alert.alert(
      'Share Failed',
      'Unable to share the file. The file has been saved to your device.',
      [{ text: 'OK' }]
    );
    return false;
  }
}

/**
 * Export and immediately share a tailored resume
 */
export async function exportAndShare(options: ExportOptions): Promise<boolean> {
  const result = await exportTailoredResume(options);

  if (!result.success || !result.filePath) {
    Alert.alert('Export Failed', result.error || /* istanbul ignore next */ 'Unable to export resume');
    return false;
  }

  return shareFile(result.filePath);
}

/**
 * Get list of exported files
 */
export async function getExportedFiles(): Promise<string[]> {
  try {
    const directory = documentDirectory + 'exports/';
    const dirInfo = await getInfoAsync(directory);

    if (!dirInfo.exists) {
      return [];
    }

    const files = await readDirectoryAsync(directory);
    return files.map((file) => directory + file);
  } catch (error) {
    console.error('Error reading exports directory:', error);
    return [];
  }
}

/**
 * Delete an exported file
 */
export async function deleteExportedFile(filePath: string): Promise<boolean> {
  try {
    await deleteAsync(filePath, { idempotent: true });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Clear all exported files
 */
export async function clearExportedFiles(): Promise<boolean> {
  try {
    const directory = documentDirectory + 'exports/';
    const dirInfo = await getInfoAsync(directory);

    if (dirInfo.exists) {
      await deleteAsync(directory, { idempotent: true });
    }

    return true;
  } catch (error) {
    console.error('Error clearing exports:', error);
    return false;
  }
}

/**
 * Get file info
 */
export async function getFileInfo(filePath: string): Promise<{
  exists: boolean;
  size?: number;
  modificationTime?: number;
}> {
  try {
    const info = await getInfoAsync(filePath);
    return {
      exists: info.exists,
      size: info.exists ? (info as any).size : undefined,
      modificationTime: info.exists ? (info as any).modificationTime : undefined,
    };
  } catch (error) {
    return { exists: false };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
