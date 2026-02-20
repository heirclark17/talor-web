/**
 * LinkedIn Profile Import Component
 *
 * Allows users to import their LinkedIn profile by uploading
 * a LinkedIn PDF export.
 */

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Linkedin } from 'lucide-react';
import { parseLinkedInPDF, linkedInToResumeData } from '../lib/linkedinParser';

interface LinkedInImportProps {
  onImportComplete: (resumeData: any) => void;
  onCancel?: () => void;
}

export default function LinkedInImport({ onImportComplete, onCancel }: LinkedInImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Parse LinkedIn PDF
      const profile = await parseLinkedInPDF(file);

      // Convert to resume data format
      const resumeData = linkedInToResumeData(profile);

      // Show success
      setSuccess(true);

      // Call completion handler after short delay
      setTimeout(() => {
        onImportComplete(resumeData);
      }, 1000);
    } catch (err) {
      console.error('LinkedIn import error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse LinkedIn profile');
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else {
      setError('Please drop a PDF file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <Linkedin className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-theme mb-2">Import from LinkedIn</h2>
        <p className="text-theme-secondary max-w-md mx-auto">
          Upload your LinkedIn profile PDF to automatically populate your resume with your experience, education, and skills.
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <h3 className="font-semibold text-theme mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          How to export from LinkedIn:
        </h3>
        <ol className="text-sm text-theme-secondary space-y-1 list-decimal list-inside">
          <li>Go to your LinkedIn profile</li>
          <li>Click "More" → "Save to PDF"</li>
          <li>Download the PDF file</li>
          <li>Upload it here</li>
        </ol>
      </div>

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${file ? 'border-blue-500 bg-blue-500/5' : 'border-border hover:border-blue-500/50'}
          ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !loading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {success ? (
          <div className="flex flex-col items-center gap-3">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-medium text-green-500">Profile imported successfully!</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="font-medium text-theme">Parsing LinkedIn profile...</p>
            <p className="text-sm text-theme-secondary">This may take a few seconds</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 text-blue-500" />
            <div>
              <p className="font-medium text-theme">{file.name}</p>
              <p className="text-sm text-theme-secondary">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setError(null);
              }}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Choose different file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-theme-secondary" />
            <div>
              <p className="font-medium text-theme">Drop your LinkedIn PDF here</p>
              <p className="text-sm text-theme-secondary">or click to browse</p>
            </div>
            <p className="text-xs text-theme-tertiary">Max file size: 10MB</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-500">Import Failed</p>
            <p className="text-sm text-red-500/80 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-border rounded-lg text-theme hover:bg-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleImport}
          disabled={!file || loading || success}
          className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Importing...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Imported
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Import Profile
            </>
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-theme-tertiary text-center">
        Your LinkedIn data is processed locally and never stored on our servers.
        We only extract publicly visible information from your profile.
      </p>
    </div>
  );
}
