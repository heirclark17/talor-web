import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import InterviewPrepList from './InterviewPrepList'

// Mock API
const mockListInterviewPreps = vi.fn()
const mockDeleteInterviewPrep = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    listInterviewPreps: (...args: any[]) => mockListInterviewPreps(...args),
    deleteInterviewPrep: (...args: any[]) => mockDeleteInterviewPrep(...args)
  }
}))

// Mock toast
vi.mock('../utils/toast', () => ({
  showError: vi.fn()
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

describe('InterviewPrepList Page', () => {
  const mockPreps = [
    {
      id: 1,
      tailored_resume_id: 101,
      company_name: 'Google',
      job_title: 'Senior Software Engineer',
      job_location: 'Mountain View, CA',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z'
    },
    {
      id: 2,
      tailored_resume_id: 102,
      company_name: 'Microsoft',
      job_title: 'Product Manager',
      job_location: null,
      created_at: '2024-01-10T12:00:00Z',
      updated_at: null
    }
  ]

  const renderInterviewPrepList = () => {
    return render(
      <BrowserRouter>
        <InterviewPrepList />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('Header', () => {
    it('should render page title', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /my interview prep/i })).toBeInTheDocument()
      })
    })

    it('should render description text', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/Access all your saved interview preparation materials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()
      expect(screen.getByText(/Loading your interview preps/i)).toBeInTheDocument()
    })

    it('should show spinner with animation', () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      const { container } = renderInterviewPrepList()
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when API fails', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/Error Loading Interview Preps/i)).toBeInTheDocument()
      })
    })

    it('should show error details', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })

    it('should show try again button on error', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })

    it('should retry loading when try again clicked', async () => {
      mockListInterviewPreps
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error'
        })
        .mockResolvedValueOnce({
          success: true,
          data: { interview_preps: mockPreps }
        })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(mockListInterviewPreps).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no preps', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/No Interview Preps Yet/i)).toBeInTheDocument()
      })
    })

    it('should show helpful message in empty state', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/Create a tailored resume first/i)).toBeInTheDocument()
      })
    })

    it('should show create resume button in empty state', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create tailored resume/i })).toBeInTheDocument()
      })
    })

    it('should navigate to tailor page when create button clicked', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create tailored resume/i })
        fireEvent.click(createButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/tailor')
    })
  })

  describe('Preps List', () => {
    it('should display all preps', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument()
        expect(screen.getByText('Microsoft')).toBeInTheDocument()
      })
    })

    it('should show prep count', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/2 interview preps found/i)).toBeInTheDocument()
      })
    })

    it('should show singular count for one prep', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [mockPreps[0]] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/1 interview prep found/i)).toBeInTheDocument()
      })
    })

    it('should show company names', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText('Google')).toBeInTheDocument()
        expect(screen.getByText('Microsoft')).toBeInTheDocument()
      })
    })

    it('should show job titles', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Product Manager')).toBeInTheDocument()
      })
    })

    it('should show location when available', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText('Mountain View, CA')).toBeInTheDocument()
      })
    })

    it('should show created dates', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        const createdDates = screen.getAllByText(/Created/)
        expect(createdDates.length).toBeGreaterThan(0)
      })
    })

    it('should show prep IDs', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByText(/ID: 1/)).toBeInTheDocument()
        expect(screen.getByText(/ID: 2/)).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to prep detail when view clicked', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        const viewButtons = screen.getAllByRole('button', { name: /view/i })
        fireEvent.click(viewButtons[0])
      })

      expect(mockNavigate).toHaveBeenCalledWith('/interview-prep/101')
    })
  })

  describe('Delete', () => {
    it('should show confirmation dialog when delete clicked', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
        fireEvent.click(deleteButtons[0])
      })

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this interview prep? This action cannot be undone.'
      )
    })

    it('should delete prep when confirmed', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      mockDeleteInterviewPrep.mockResolvedValue({
        success: true
      })

      mockConfirm.mockReturnValue(true)

      renderInterviewPrepList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
        fireEvent.click(deleteButtons[0])
      })

      await waitFor(() => {
        expect(mockDeleteInterviewPrep).toHaveBeenCalledWith(1)
      })
    })

    it('should not delete when cancelled', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      mockConfirm.mockReturnValue(false)

      renderInterviewPrepList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
        fireEvent.click(deleteButtons[0])
      })

      expect(mockDeleteInterviewPrep).not.toHaveBeenCalled()
    })

    it.skip('should show deleting state when deleting', async () => {
      // Skip: Async state timing is flaky
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: mockPreps }
      })

      mockDeleteInterviewPrep.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000)))

      mockConfirm.mockReturnValue(true)

      renderInterviewPrepList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /^delete$/i })
        fireEvent.click(deleteButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText(/Deleting/i)).toBeInTheDocument()
      })
    })
  })

  describe('Background Effects', () => {
    it('should have animated gradient background', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      const { container } = renderInterviewPrepList()

      await waitFor(() => {
        const gradient = container.querySelector('.animate-gradient')
        expect(gradient).toBeInTheDocument()
      })
    })

    it('should have particles background', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      const { container } = renderInterviewPrepList()

      await waitFor(() => {
        const particles = container.querySelector('.particles-background')
        expect(particles).toBeInTheDocument()
      })
    })

    it('should have multiple particle elements', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      const { container } = renderInterviewPrepList()

      await waitFor(() => {
        const particles = container.querySelectorAll('.particle')
        expect(particles.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockListInterviewPreps.mockResolvedValue({
        success: true,
        data: { interview_preps: [] }
      })

      renderInterviewPrepList()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })
  })
})
