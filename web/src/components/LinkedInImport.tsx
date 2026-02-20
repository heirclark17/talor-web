/**
 * LinkedIn Profile Import Component
 *
 * Allows users to import their LinkedIn profile by pasting
 * their profile URL.
 */

import { useState } from 'react';
import { Link2, CheckCircle, AlertCircle, Loader2, Linkedin } from 'lucide-react';

interface LinkedInImportProps {
  onImportComplete: (resumeData: any) => void;
  onCancel?: () => void;
}

export default function LinkedInImport({ onImportComplete, onCancel }: LinkedInImportProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateLinkedInUrl = (url: string): boolean => {
    // Accept various LinkedIn URL formats
    const patterns = [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      /^linkedin\.com\/in\/[\w-]+\/?$/,
      /^www\.linkedin\.com\/in\/[\w-]+\/?$/,
    ];
    return patterns.some(pattern => pattern.test(url.trim()));
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setProfileUrl(url);
    if (url && !validateLinkedInUrl(url)) {
      setError('Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/yourname)');
    } else {
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!profileUrl) return;

    // Validate URL format
    if (!validateLinkedInUrl(profileUrl)) {
      setError('Please enter a valid LinkedIn profile URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Normalize URL to include https://
      let normalizedUrl = profileUrl.trim();
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // Note: LinkedIn actively blocks automated scraping
      // This will likely fail due to LinkedIn's anti-bot protection
      // The user should use the PDF export method instead

      // Try to scrape the LinkedIn profile
      const response = await fetch('/api/linkedin/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_url: normalizedUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import LinkedIn profile');
      }

      const resumeData = await response.json();

      // Show success
      setSuccess(true);

      // Call completion handler
      setTimeout(() => {
        onImportComplete(resumeData);
      }, 1000);

    } catch (err) {
      console.error('LinkedIn import error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to import LinkedIn profile';

      // Provide helpful fallback message
      setError(
        `${errorMessage}\n\nLinkedIn blocks automated profile access. Please use the "Upload Resume" tab and upload a PDF of your LinkedIn profile instead. To export: Go to your LinkedIn profile → More → Save to PDF`
      );
      setLoading(false);
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
          <Link2 className="w-4 h-4" />
          How to find your LinkedIn URL:
        </h3>
        <ol className="text-sm text-theme-secondary space-y-1 list-decimal list-inside">
          <li>Go to your LinkedIn profile page</li>
          <li>Copy the URL from your browser address bar</li>
          <li>It should look like: linkedin.com/in/yourname</li>
          <li>Paste it below</li>
        </ol>
      </div>

      {/* URL Input Area */}
      <div className="space-y-4">
        <div>
          <label htmlFor="linkedin-url" className="block text-sm font-medium text-theme mb-2">
            LinkedIn Profile URL
          </label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-secondary" />
            <input
              id="linkedin-url"
              type="url"
              value={profileUrl}
              onChange={handleUrlChange}
              placeholder="https://linkedin.com/in/yourname"
              disabled={loading || success}
              className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-theme placeholder:text-theme-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
          </div>
          <p className="text-xs text-theme-tertiary mt-2">
            Example: https://linkedin.com/in/johndoe or linkedin.com/in/johndoe
          </p>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="font-medium text-green-500">Profile imported successfully!</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
            <div>
              <p className="font-medium text-theme">Importing LinkedIn profile...</p>
              <p className="text-sm text-theme-secondary">This may take a few seconds</p>
            </div>
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
          disabled={!profileUrl || loading || success || !!error}
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
              <Linkedin className="w-4 h-4" />
              Import Profile
            </>
          )}
        </button>
      </div>

      {/* Privacy Notice */}
      <p className="text-xs text-theme-tertiary text-center">
        We'll extract publicly visible information from your LinkedIn profile.
        Your data is never stored on our servers without your consent.
      </p>
    </div>
  );
}
