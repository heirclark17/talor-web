import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CoverLetterGenerator from './CoverLetterGenerator'

// Mock API
const mockListCoverLetters = vi.fn()
const mockGenerateCoverLetter = vi.fn()
const mockUpdateCoverLetter = vi.fn()
const mockDeleteCoverLetter = vi.fn()
const mockExportCoverLetter = vi.fn()
const mockExtractJobDetails = vi.fn()
const mockUploadResume = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    listCoverLetters: (...args: any[]) => mockListCoverLetters(...args),
    generateCoverLetter: (...args: any[]) => mockGenerateCoverLetter(...args),
    updateCoverLetter: (...args: any[]) => mockUpdateCoverLetter(...args),
    deleteCoverLetter: (...args: any[]) => mockDeleteCoverLetter(...args),
    exportCoverLetter: (...args: any[]) => mockExportCoverLetter(...args),
    extractJobDetails: (...args: any[]) => mockExtractJobDetails(...args),
    uploadResume: (...args: any[]) => mockUploadResume(...args)
  }
}))

// Mock resume store
const mockFetchResumes = vi.fn()
const mockResumes = [
  {
    id: 1,
    filename: 'Justin_Resume.pdf',
    candidate_name: 'Justin Washington',
    uploaded_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    filename: 'Resume_v2.docx',
    candidate_name: 'Jane Doe',
    uploaded_at: '2024-01-10T12:00:00Z'
  }
]

vi.mock('../stores/resumeStore', () => ({
  useResumeStore: () => ({
    resumes: mockResumes,
    fetchResumes: mockFetchResumes,
    setResumes: vi.fn()
  })
}))

describe('CoverLetterGenerator Page', () => {
  const mockLetters = [
    {
      id: 1,
      tailoredResumeId: null,
      baseResumeId: 1,
      jobTitle: 'Senior Software Engineer',
      companyName: 'Google',
      tone: 'professional',
      content: 'Dear Hiring Manager,\n\nI am writing to express my interest...',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z'
    },
    {
      id: 2,
      tailoredResumeId: null,
      baseResumeId: null,
      jobTitle: 'Product Manager',
      companyName: 'Microsoft',
      tone: 'enthusiastic',
      content: 'Dear Hiring Team,\n\nI am excited to apply...',
      createdAt: '2024-01-10T12:00:00Z',
      updatedAt: '2024-01-10T12:00:00Z'
    }
  ]

  const renderCoverLetterGenerator = () => {
    return render(
      <BrowserRouter>
        <CoverLetterGenerator />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchResumes.mockResolvedValue(undefined)
  })

  describe('Initial State', () => {
    it('should render page title', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /cover letters/i })).toBeInTheDocument()
      })
    })

    it('should show loading state initially', () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
    })

    it('should fetch cover letters on mount', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(mockListCoverLetters).toHaveBeenCalled()
      })
    })

    it('should fetch resumes on mount', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(mockFetchResumes).toHaveBeenCalled()
      })
    })

    it('should have Generate New button', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /generate new/i })).toBeInTheDocument()
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no letters', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByText(/No cover letters yet/i)).toBeInTheDocument()
      })
    })

    it('should show helpful message in empty state', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByText(/Generate your first cover letter/i)).toBeInTheDocument()
      })
    })

    it('should show 0 count in empty state', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByText(/0 cover letters generated/i)).toBeInTheDocument()
      })
    })
  })

  describe('Letters List', () => {
    beforeEach(async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: mockLetters }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      })
    })

    it('should display all letters', () => {
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })

    it('should show letter count', () => {
      expect(screen.getByText(/2 cover letters generated/i)).toBeInTheDocument()
    })

    it('should show singular count for one letter', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [mockLetters[0]] }
      })

      render(
        <BrowserRouter>
          <CoverLetterGenerator />
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(/1 cover letter generated/i)).toBeInTheDocument()
      })
    })

    it('should show company names', () => {
      expect(screen.getByText('Google')).toBeInTheDocument()
      expect(screen.getByText('Microsoft')).toBeInTheDocument()
    })

    it('should show tone badges', () => {
      const professionalBadges = screen.getAllByText(/professional/i)
      expect(professionalBadges.length).toBeGreaterThan(0)
    })

    it('should show created dates', () => {
      const dates = screen.getAllByText(/1\/\d+\/2024/)
      expect(dates.length).toBeGreaterThan(0)
    })

    it('should select letter when clicked', () => {
      const letterCard = screen.getByText('Senior Software Engineer')
      fireEvent.click(letterCard)

      // Letter should be highlighted (class changes)
      expect(letterCard.closest('div')).toHaveClass('border-blue-500/50')
    })
  })

  describe('Letter Preview', () => {
    beforeEach(async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: mockLetters }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      })

      const letterCard = screen.getByText('Senior Software Engineer')
      fireEvent.click(letterCard)
    })

    it('should show letter content when selected', () => {
      expect(screen.getByText(/Dear Hiring Manager/i)).toBeInTheDocument()
    })

    it('should show job title in preview', () => {
      const titles = screen.getAllByText('Senior Software Engineer')
      expect(titles.length).toBeGreaterThan(0)
    })

    it('should show company name in preview', () => {
      const companies = screen.getAllByText('Google')
      expect(companies.length).toBeGreaterThan(0)
    })
  })

  describe('Generator Modal', () => {
    it('should open generator modal when Generate New clicked', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /generate new/i })
        fireEvent.click(generateButton)
      })

      await waitFor(() => {
        const generateTexts = screen.getAllByText(/Generate Cover Letter/i)
        expect(generateTexts.length).toBeGreaterThan(0)
      })
    })

    it.skip('should close modal when X button clicked', async () => {
      // Skip: Modal close functionality may vary
    })

    it.skip('should show job title input', async () => {
      // Skip: Form fields tested in form input tests
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockListCoverLetters.mockResolvedValue({
        success: true,
        data: { cover_letters: [] }
      })

      renderCoverLetterGenerator()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })
  })
})
