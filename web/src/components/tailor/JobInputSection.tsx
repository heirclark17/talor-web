/**
 * Job Input Section Component
 * Extracted from TailorResume.tsx to reduce file size
 */

import { useState } from 'react';
import { Link2, Sparkles, Loader2, Bookmark, Trash2, ChevronDown } from 'lucide-react';

interface SavedJob {
  id: number;
  url: string;
  company: string;
  title: string;
  location: string;
  salary: string;
  created_at: string | null;
}

interface JobInputSectionProps {
  jobUrl: string;
  company: string;
  jobTitle: string;
  onJobUrlChange: (url: string) => void;
  onCompanyChange: (company: string) => void;
  onJobTitleChange: (title: string) => void;
  onExtractJobDetails: () => Promise<void>;
  extracting: boolean;
  companyExtracted: boolean;
  titleExtracted: boolean;
  extractionError: { company?: string; title?: string };
  savedJobs: SavedJob[];
  onSelectSavedJob: (job: SavedJob) => void;
  onSaveJob: () => Promise<void>;
  onDeleteSavedJob: (id: number) => Promise<void>;
  savingJob: boolean;
  deletingJobId: number | null;
  loadingSavedJobs: boolean;
}

export default function JobInputSection({
  jobUrl,
  company,
  jobTitle,
  onJobUrlChange,
  onCompanyChange,
  onJobTitleChange,
  onExtractJobDetails,
  extracting,
  companyExtracted,
  titleExtracted,
  extractionError,
  savedJobs,
  onSelectSavedJob,
  onSaveJob,
  onDeleteSavedJob,
  savingJob,
  deletingJobId,
  loadingSavedJobs,
}: JobInputSectionProps) {
  const [showSavedJobs, setShowSavedJobs] = useState(false);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-theme mb-3">Job Details</h3>

      {/* Job URL Input */}
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Job Posting URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={jobUrl}
            onChange={(e) => onJobUrlChange(e.target.value)}
            placeholder="https://linkedin.com/jobs/view/..."
            className="input flex-1"
          />
          <button
            onClick={onExtractJobDetails}
            disabled={!jobUrl.trim() || extracting}
            className="btn-secondary flex items-center gap-2"
            title="Extract company and title from URL"
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Extract
              </>
            )}
          </button>
        </div>
      </div>

      {/* Company Input */}
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Company Name {companyExtracted && <span className="text-green-500 text-xs">✓ Extracted</span>}
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          placeholder="e.g., Google"
          className={`input ${extractionError.company ? 'border-red-500' : ''}`}
        />
        {extractionError.company && (
          <p className="text-xs text-red-500 mt-1">{extractionError.company}</p>
        )}
      </div>

      {/* Job Title Input */}
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          Job Title {titleExtracted && <span className="text-green-500 text-xs">✓ Extracted</span>}
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => onJobTitleChange(e.target.value)}
          placeholder="e.g., Senior Software Engineer"
          className={`input ${extractionError.title ? 'border-red-500' : ''}`}
        />
        {extractionError.title && (
          <p className="text-xs text-red-500 mt-1">{extractionError.title}</p>
        )}
      </div>

      {/* Save Job Button */}
      {jobUrl && company && (
        <button
          onClick={onSaveJob}
          disabled={savingJob}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          {savingJob ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              Save Job for Later
            </>
          )}
        </button>
      )}

      {/* Saved Jobs Dropdown */}
      {savedJobs.length > 0 && (
        <div className="glass rounded-lg p-4">
          <button
            onClick={() => setShowSavedJobs(!showSavedJobs)}
            className="w-full flex items-center justify-between text-theme hover:text-blue-500 transition-colors"
          >
            <span className="font-medium">Saved Jobs ({savedJobs.length})</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${showSavedJobs ? 'rotate-180' : ''}`}
            />
          </button>

          {showSavedJobs && (
            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
              {loadingSavedJobs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                savedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-start justify-between gap-3 p-3 bg-theme-glass-5 rounded-lg hover:bg-theme-glass-10 transition-colors"
                  >
                    <button
                      onClick={() => onSelectSavedJob(job)}
                      className="flex-1 text-left"
                    >
                      <p className="font-semibold text-theme text-sm">{job.title || 'Untitled'}</p>
                      <p className="text-xs text-theme-secondary mt-1">{job.company}</p>
                      {job.location && (
                        <p className="text-xs text-theme-tertiary mt-0.5">{job.location}</p>
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteSavedJob(job.id)}
                      disabled={deletingJobId === job.id}
                      className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                      title="Delete saved job"
                    >
                      {deletingJobId === job.id ? (
                        <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
