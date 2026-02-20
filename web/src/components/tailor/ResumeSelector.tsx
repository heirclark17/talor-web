/**
 * Resume Selector Component
 * Extracted from TailorResume.tsx to reduce file size
 */

import { useState } from 'react';
import { FileText, Trash2, Loader2, CheckSquare, Square } from 'lucide-react';

interface BaseResume {
  id: number;
  filename: string;
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
  summary: string;
  skills: string[];
  experience: any[];
  education: string;
  certifications: string;
  skills_count: number;
  uploaded_at: string;
}

interface ResumeSelectorProps {
  resumes: BaseResume[];
  selectedResumeId: number | null;
  onSelectResume: (id: number) => void;
  onDeleteResume: (id: number, filename: string) => Promise<void>;
  selectedResumeIds?: Set<number>;
  onToggleResumeSelection?: (id: number) => void;
  deletingResumeId?: number | null;
  showBulkActions?: boolean;
}

export default function ResumeSelector({
  resumes,
  selectedResumeId,
  onSelectResume,
  onDeleteResume,
  selectedResumeIds = new Set(),
  onToggleResumeSelection,
  deletingResumeId,
  showBulkActions = false,
}: ResumeSelectorProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-theme mb-3">Select Resume</h3>
      {resumes.length === 0 ? (
        <div className="text-center py-12 glass rounded-xl">
          <FileText className="w-16 h-16 mx-auto text-theme-secondary mb-3" />
          <p className="text-theme-secondary">No resumes found</p>
          <p className="text-sm text-theme-tertiary mt-2">Upload a resume to get started</p>
        </div>
      ) : (
        <div className="space-y-2">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className={`glass rounded-lg p-4 cursor-pointer transition-all ${
                selectedResumeId === resume.id
                  ? 'ring-2 ring-blue-500 bg-blue-500/10'
                  : 'hover:bg-theme-glass-10'
              }`}
              onClick={() => onSelectResume(resume.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {showBulkActions && onToggleResumeSelection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleResumeSelection(resume.id);
                      }}
                      className="mt-1"
                    >
                      {selectedResumeIds.has(resume.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Square className="w-5 h-5 text-theme-secondary" />
                      )}
                    </button>
                  )}
                  <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-theme truncate">{resume.filename}</h4>
                    <p className="text-sm text-theme-secondary mt-1">
                      {resume.skills_count} skills • Uploaded{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString()}
                    </p>
                    {resume.name && (
                      <p className="text-xs text-theme-tertiary mt-1">{resume.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteResume(resume.id, resume.filename);
                  }}
                  disabled={deletingResumeId === resume.id}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete resume"
                >
                  {deletingResumeId === resume.id ? (
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5 text-red-500" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
