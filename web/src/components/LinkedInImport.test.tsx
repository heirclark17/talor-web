/**
 * Tests for LinkedInImport Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LinkedInImport from './LinkedInImport';
import * as linkedinParser from '../lib/linkedinParser';

// Mock linkedinParser
vi.mock('../lib/linkedinParser');

describe('LinkedInImport', () => {
  const mockOnImportComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(/Import from LinkedIn/i)).toBeInTheDocument();
    expect(screen.getByText(/How to export from LinkedIn:/i)).toBeInTheDocument();
  });

  it('should show instructions for exporting from LinkedIn', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    expect(screen.getByText(/Go to your LinkedIn profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Click "More" → "Save to PDF"/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload it here/i)).toBeInTheDocument();
  });

  it('should show error for non-PDF file', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/Please upload a PDF file/i)).toBeInTheDocument();
  });

  it('should show error for oversized file', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    // Create a file larger than 10MB
    const largeContent = new Array(11 * 1024 * 1024).fill('a').join('');
    const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/File size must be less than 10MB/i)).toBeInTheDocument();
  });

  it('should accept valid PDF file', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test pdf content'], 'linkedin.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('linkedin.pdf')).toBeInTheDocument();
  });

  it('should call onImportComplete after successful import', async () => {
    const mockProfile = {
      name: 'John Doe',
      headline: 'Software Engineer',
      location: 'SF',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    const mockResumeData = {
      personalInfo: { name: 'John Doe', email: '', phone: '', location: 'SF' },
      summary: 'Software Engineer',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    vi.mocked(linkedinParser.parseLinkedInPDF).mockResolvedValue(mockProfile);
    vi.mocked(linkedinParser.linkedInToResumeData).mockReturnValue(mockResumeData);

    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'linkedin.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    const importButton = screen.getByRole('button', { name: /Import Profile/i });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(mockOnImportComplete).toHaveBeenCalledWith(mockResumeData);
    });
  });

  it('should show error message on import failure', async () => {
    vi.mocked(linkedinParser.parseLinkedInPDF).mockRejectedValue(
      new Error('Failed to parse PDF')
    );

    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'linkedin.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    const importButton = screen.getByRole('button', { name: /Import Profile/i });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText(/Import Failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to parse PDF/i)).toBeInTheDocument();
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <LinkedInImport
        onImportComplete={mockOnImportComplete}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable import button when no file selected', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const importButton = screen.getByRole('button', { name: /Import Profile/i });
    expect(importButton).toBeDisabled();
  });

  it('should show loading state during import', async () => {
    vi.mocked(linkedinParser.parseLinkedInPDF).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'linkedin.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    const importButton = screen.getByRole('button', { name: /Import Profile/i });
    fireEvent.click(importButton);

    expect(screen.getByText(/Parsing LinkedIn profile.../i)).toBeInTheDocument();
    expect(screen.getByText(/Importing.../i)).toBeInTheDocument();
  });

  it('should show success state after import', async () => {
    const mockProfile = {
      name: 'John Doe',
      headline: 'Engineer',
      location: 'SF',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    const mockResumeData = {
      personalInfo: { name: 'John Doe', email: '', phone: '', location: 'SF' },
      summary: 'Engineer',
      experience: [],
      education: [],
      skills: [],
      certifications: [],
    };

    vi.mocked(linkedinParser.parseLinkedInPDF).mockResolvedValue(mockProfile);
    vi.mocked(linkedinParser.linkedInToResumeData).mockReturnValue(mockResumeData);

    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    const input = screen.getByRole('button', { name: /Drop your LinkedIn PDF here/i })
      .parentElement!.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(['test'], 'linkedin.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [file] } });

    const importButton = screen.getByRole('button', { name: /Import Profile/i });
    fireEvent.click(importButton);

    await waitFor(() => {
      expect(screen.getByText(/Profile imported successfully!/i)).toBeInTheDocument();
    });
  });

  it('should show privacy notice', () => {
    render(<LinkedInImport onImportComplete={mockOnImportComplete} />);

    expect(
      screen.getByText(/Your LinkedIn data is processed locally/i)
    ).toBeInTheDocument();
  });
});
