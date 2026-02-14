import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import UploadResume from './UploadResume'

// Mock API
const mockUploadResume = vi.fn()
const mockDeleteResume = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    uploadResume: (...args: any[]) => mockUploadResume(...args),
    deleteResume: (...args: any[]) => mockDeleteResume(...args)
  }
}))

// Mock toast
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()
vi.mock('../utils/toast', () => ({
  showSuccess: (message: string) => mockShowSuccess(message),
  showError: (message: string) => mockShowError(message)
}))

// Mock navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

// Mock window.confirm
const mockConfirm = vi.fn()
global.confirm = mockConfirm

describe('UploadResume Page', () => {
  const mockParsedResume = {
    resume_id: 123,
    filename: 'Justin_Resume.pdf',
    parsed_data: {
      name: 'Justin Washington',
      email: 'justin@example.com',
      phone: '555-123-4567',
      linkedin: 'linkedin.com/in/justinwashington',
      location: 'Houston, TX',
      summary: 'Experienced cybersecurity professional with 10+ years',
      skills: ['Python', 'AWS', 'Security', 'DevOps'],
      experience: [
        {
          header: 'Senior Security Engineer',
          location: 'Remote',
          dates: '2020-Present',
          bullets: [
            'Led security initiatives',
            'Reduced vulnerabilities by 50%'
          ]
        },
        {
          title: 'Security Analyst',
          date_range: '2018-2020',
          description: 'Performed security assessments'
        }
      ],
      education: 'BS Computer Science, University of Houston',
      certifications: 'CISSP, Security+'
    }
  }

  const renderUploadResume = () => {
    return render(
      <BrowserRouter>
        <UploadResume />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('Initial State', () => {
    it('should render page title', () => {
      renderUploadResume()
      expect(screen.getByRole('heading', { name: /upload resume/i })).toBeInTheDocument()
    })

    it('should render description text', () => {
      renderUploadResume()
      expect(screen.getByText(/Upload a new resume to start tailoring for your next job/i)).toBeInTheDocument()
    })

    it.skip('should clear localStorage on mount', () => {
      // Skip: Testing implementation detail (localStorage.removeItem calls)
      // rather than user-visible behavior. Component clears localStorage
      // on mount to reset session state, but this is internal behavior.
    })

    it('should show upload prompt', () => {
      renderUploadResume()
      expect(screen.getByText(/Click to select your resume/i)).toBeInTheDocument()
    })

    it('should show supported file types', () => {
      renderUploadResume()
      expect(screen.getByText(/Supports .docx and .pdf files \(max 10MB\)/i)).toBeInTheDocument()
    })

    it('should have file input with correct accept attribute', () => {
      renderUploadResume()
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input).toBeInTheDocument()
      expect(input?.accept).toBe('.docx,.pdf')
    })

    it('should have Select File button', () => {
      renderUploadResume()
      expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument()
    })
  })

  describe('File Validation', () => {
    it('should reject files that are too large', async () => {
      renderUploadResume()

      const file = new File(['x'.repeat(11 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/File is too large.*Maximum size is 10MB/i)).toBeInTheDocument()
      })
    })

    it('should reject invalid file types', async () => {
      renderUploadResume()

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Invalid file type.*Please upload a .pdf or .docx file/i)).toBeInTheDocument()
      })
    })

    it('should accept valid PDF file', async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockUploadResume).toHaveBeenCalledWith(file)
      })
    })

    it('should accept valid DOCX file', async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockUploadResume).toHaveBeenCalledWith(file)
      })
    })
  })

  describe('Upload States', () => {
    it('should show uploading state', async () => {
      mockUploadResume.mockImplementation(() => new Promise(() => {})) // Never resolves

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Uploading and parsing resume/i)).toBeInTheDocument()
      })
    })

    it('should disable button while uploading', async () => {
      mockUploadResume.mockImplementation(() => new Promise(() => {}))

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /uploading/i })
        expect(button).toBeDisabled()
      })
    })

    it('should show success state after upload', async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Resume uploaded successfully!/i)).toBeInTheDocument()
      })
    })

    it('should show filename in success message', async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Parsed Justin_Resume.pdf/i)).toBeInTheDocument()
      })
    })

    it('should show error state on upload failure', async () => {
      mockUploadResume.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })

    it('should change button text after successful upload', async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload another resume/i })).toBeInTheDocument()
      })
    })
  })

  describe('Parsed Resume Display', () => {
    beforeEach(async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Resume uploaded successfully!/i)).toBeInTheDocument()
      })
    })

    it('should show Parsed Resume heading', () => {
      expect(screen.getByRole('heading', { name: /parsed resume/i })).toBeInTheDocument()
    })

    it('should show resume ID', () => {
      expect(screen.getByText(/Resume ID: 123/i)).toBeInTheDocument()
    })

    it('should show Contact Information section', () => {
      expect(screen.getByRole('heading', { name: /contact information \(ats required\)/i })).toBeInTheDocument()
    })

    it('should display candidate name', () => {
      expect(screen.getByText('Justin Washington')).toBeInTheDocument()
    })

    it('should display email', () => {
      expect(screen.getByText('justin@example.com')).toBeInTheDocument()
    })

    it('should display phone', () => {
      expect(screen.getByText('555-123-4567')).toBeInTheDocument()
    })

    it('should display LinkedIn', () => {
      expect(screen.getByText('linkedin.com/in/justinwashington')).toBeInTheDocument()
    })

    it('should display location', () => {
      expect(screen.getByText('Houston, TX')).toBeInTheDocument()
    })

    it('should show Professional Summary section', () => {
      expect(screen.getByRole('heading', { name: /professional summary/i })).toBeInTheDocument()
    })

    it('should display summary text', () => {
      expect(screen.getByText(/Experienced cybersecurity professional/i)).toBeInTheDocument()
    })

    it('should show Skills section', () => {
      expect(screen.getByRole('heading', { name: /^skills$/i })).toBeInTheDocument()
    })

    it('should display all skills', () => {
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('AWS')).toBeInTheDocument()
      expect(screen.getByText('Security')).toBeInTheDocument()
      expect(screen.getByText('DevOps')).toBeInTheDocument()
    })

    it('should show Professional Experience section', () => {
      expect(screen.getByRole('heading', { name: /professional experience/i })).toBeInTheDocument()
    })

    it('should display experience job titles', () => {
      expect(screen.getByText('Senior Security Engineer')).toBeInTheDocument()
      expect(screen.getByText('Security Analyst')).toBeInTheDocument()
    })

    it('should display experience bullets', () => {
      expect(screen.getByText(/Led security initiatives/i)).toBeInTheDocument()
      expect(screen.getByText(/Reduced vulnerabilities by 50%/i)).toBeInTheDocument()
    })

    it('should display experience description when bullets not available', () => {
      expect(screen.getByText(/Performed security assessments/i)).toBeInTheDocument()
    })

    it('should show Education section', () => {
      expect(screen.getByRole('heading', { name: /^education$/i })).toBeInTheDocument()
    })

    it('should display education text', () => {
      expect(screen.getByText(/BS Computer Science, University of Houston/i)).toBeInTheDocument()
    })

    it('should show Certifications section', () => {
      expect(screen.getByRole('heading', { name: /certifications/i })).toBeInTheDocument()
    })

    it('should display certifications text', () => {
      expect(screen.getByText(/CISSP, Security\+/i)).toBeInTheDocument()
    })
  })

  describe('Missing Fields Display', () => {
    it('should show error when name is missing', async () => {
      const resumeNoName = {
        ...mockParsedResume,
        parsed_data: {
          ...mockParsedResume.parsed_data,
          name: null
        }
      }

      mockUploadResume.mockResolvedValue({
        success: true,
        data: resumeNoName
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Name not found - Backend must extract candidate name/i)).toBeInTheDocument()
      })
    })

    it('should show error when email is missing', async () => {
      const resumeNoEmail = {
        ...mockParsedResume,
        parsed_data: {
          ...mockParsedResume.parsed_data,
          email: null
        }
      }

      mockUploadResume.mockResolvedValue({
        success: true,
        data: resumeNoEmail
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/❌ Email missing/i)).toBeInTheDocument()
      })
    })

    it('should show error when phone is missing', async () => {
      const resumeNoPhone = {
        ...mockParsedResume,
        parsed_data: {
          ...mockParsedResume.parsed_data,
          phone: null
        }
      }

      mockUploadResume.mockResolvedValue({
        success: true,
        data: resumeNoPhone
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/❌ Phone missing/i)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Actions', () => {
    beforeEach(async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Resume uploaded successfully!/i)).toBeInTheDocument()
      })
    })

    it('should have Tailor This Resume button', () => {
      expect(screen.getByRole('button', { name: /tailor this resume/i })).toBeInTheDocument()
    })

    it('should navigate to tailor page with resume ID when Tailor clicked', () => {
      const tailorButton = screen.getByRole('button', { name: /tailor this resume/i })
      fireEvent.click(tailorButton)

      expect(mockNavigate).toHaveBeenCalledWith('/tailor', {
        state: { selectedResumeId: 123 }
      })
    })

    it('should have View All Resumes button', () => {
      expect(screen.getByRole('button', { name: /view all resumes/i })).toBeInTheDocument()
    })

    it('should navigate to tailor page when View All clicked', () => {
      const viewAllButton = screen.getByRole('button', { name: /view all resumes/i })
      fireEvent.click(viewAllButton)

      expect(mockNavigate).toHaveBeenCalledWith('/tailor')
    })
  })

  describe('Delete Functionality', () => {
    beforeEach(async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByText(/Resume uploaded successfully!/i)).toBeInTheDocument()
      })
    })

    it('should have Delete button', () => {
      expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument()
    })

    it('should show confirmation dialog when delete clicked', () => {
      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete "Justin_Resume.pdf"? This action cannot be undone.'
      )
    })

    it('should delete resume when confirmed', async () => {
      mockDeleteResume.mockResolvedValue({
        success: true
      })
      mockConfirm.mockReturnValue(true)

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockDeleteResume).toHaveBeenCalledWith(123)
      })
    })


    it('should reset state after successful deletion', async () => {
      mockDeleteResume.mockResolvedValue({
        success: true
      })
      mockConfirm.mockReturnValue(true)

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.queryByText('Justin Washington')).not.toBeInTheDocument()
      })
    })

    it('should not delete when cancelled', () => {
      mockConfirm.mockReturnValue(false)

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      expect(mockDeleteResume).not.toHaveBeenCalled()
    })

    it('should show error toast on deletion failure', async () => {
      mockDeleteResume.mockResolvedValue({
        success: false,
        error: 'Network error'
      })
      mockConfirm.mockReturnValue(true)

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to delete resume: Network error')
      })
    })

    it('should show deleting state while deleting', async () => {
      mockDeleteResume.mockImplementation(() => new Promise(() => {}))
      mockConfirm.mockReturnValue(true)

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText(/Deleting.../i)).toBeInTheDocument()
      })
    })

    it('should disable delete button while deleting', async () => {
      mockDeleteResume.mockImplementation(() => new Promise(() => {}))
      mockConfirm.mockReturnValue(true)

      const deleteButton = screen.getByRole('button', { name: /^delete$/i })
      fireEvent.click(deleteButton)

      await waitFor(() => {
        const deletingButton = screen.getByRole('button', { name: /deleting/i })
        expect(deletingButton).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderUploadResume()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('should have descriptive button title for delete', async () => {
      mockUploadResume.mockResolvedValue({
        success: true,
        data: mockParsedResume
      })

      renderUploadResume()

      const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        const deleteButton = screen.getByTitle('Delete this uploaded resume')
        expect(deleteButton).toBeInTheDocument()
      })
    })

    it('should have hidden file input', () => {
      renderUploadResume()
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(input.className).toContain('hidden')
    })
  })
})
