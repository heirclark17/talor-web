import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SavedComparisons from './SavedComparisons'

// Mock API
const mockListSavedComparisons = vi.fn()
const mockDeleteSavedComparison = vi.fn()
const mockUpdateSavedComparison = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    listSavedComparisons: (...args: any[]) => mockListSavedComparisons(...args),
    deleteSavedComparison: (...args: any[]) => mockDeleteSavedComparison(...args),
    updateSavedComparison: (...args: any[]) => mockUpdateSavedComparison(...args)
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

describe('SavedComparisons Page', () => {
  const mockComparisons = [
    {
      id: 1,
      tailored_resume_id: 101,
      title: 'Google Senior Engineer',
      company: 'Google',
      position: 'Senior Software Engineer',
      saved_at: '2024-01-15T10:00:00Z',
      last_viewed_at: '2024-01-20T15:30:00Z',
      is_pinned: true,
      tags: ['Tech', 'Remote']
    },
    {
      id: 2,
      tailored_resume_id: 102,
      title: null,
      company: 'Microsoft',
      position: 'Product Manager',
      saved_at: '2024-01-10T12:00:00Z',
      last_viewed_at: null,
      is_pinned: false,
      tags: null
    }
  ]

  const renderSavedComparisons = () => {
    return render(
      <BrowserRouter>
        <SavedComparisons />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: []
      })

      renderSavedComparisons()
      expect(screen.getByText(/Loading saved comparisons/i)).toBeInTheDocument()
    })

    it('should show loading spinner with animation', () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: []
      })

      const { container } = renderSavedComparisons()
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when API fails', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })

    it('should show retry button on error', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
      })
    })

    it('should retry loading when retry button clicked', async () => {
      mockListSavedComparisons
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error'
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockComparisons
        })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(mockListSavedComparisons).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no comparisons', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: []
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText(/No Saved Comparisons/i)).toBeInTheDocument()
      })
    })

    it('should show create resume button in empty state', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: []
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create a tailored resume/i })).toBeInTheDocument()
      })
    })

    it('should navigate to tailor page when create button clicked', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: []
      })

      renderSavedComparisons()

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create a tailored resume/i })
        fireEvent.click(createButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/tailor')
    })
  })

  describe('Comparisons List', () => {
    it('should display all comparisons', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText('Google Senior Engineer')).toBeInTheDocument()
        expect(screen.getByText('Microsoft - Product Manager')).toBeInTheDocument()
      })
    })

    it('should show company names', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        const companies = screen.getAllByText(/Google|Microsoft/)
        expect(companies.length).toBeGreaterThan(0)
      })
    })

    it('should show position names', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Product Manager')).toBeInTheDocument()
      })
    })

    it('should show saved dates', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        const savedDates = screen.getAllByText(/Saved/)
        expect(savedDates.length).toBeGreaterThan(0)
      })
    })

    it('should show last viewed dates when available', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText(/Last viewed/)).toBeInTheDocument()
      })
    })

    it('should show pinned indicator for pinned comparisons', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        const pinnedIcons = screen.getAllByTitle(/Unpin/)
        expect(pinnedIcons.length).toBeGreaterThan(0)
      })
    })

    it('should show tags when available', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByText('Tech')).toBeInTheDocument()
        expect(screen.getByText('Remote')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate to comparison when clicked', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        const comparison = screen.getByText('Google Senior Engineer')
        fireEvent.click(comparison)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/tailor?comparison=1')
    })
  })

  describe('Pin/Unpin', () => {
    it('should toggle pin when pin button clicked', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      mockUpdateSavedComparison.mockResolvedValue({
        success: true
      })

      renderSavedComparisons()

      await waitFor(() => {
        const pinButtons = screen.getAllByTitle(/Unpin|Pin to top/)
        fireEvent.click(pinButtons[0])
      })

      await waitFor(() => {
        expect(mockUpdateSavedComparison).toHaveBeenCalledWith(1, {
          is_pinned: false
        })
      })
    })

    it('should update local state after successful pin toggle', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      mockUpdateSavedComparison.mockResolvedValue({
        success: true
      })

      renderSavedComparisons()

      await waitFor(() => {
        const pinButtons = screen.getAllByTitle(/Unpin|Pin to top/)
        fireEvent.click(pinButtons[1])
      })

      await waitFor(() => {
        expect(mockUpdateSavedComparison).toHaveBeenCalled()
      })
    })
  })

  describe('Delete', () => {
    it('should show confirmation dialog when delete clicked', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/Delete/)
        fireEvent.click(deleteButtons[0])
      })

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this saved comparison?')
    })

    it('should delete comparison when confirmed', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      mockDeleteSavedComparison.mockResolvedValue({
        success: true
      })

      mockConfirm.mockReturnValue(true)

      renderSavedComparisons()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/Delete/)
        fireEvent.click(deleteButtons[0])
      })

      await waitFor(() => {
        expect(mockDeleteSavedComparison).toHaveBeenCalledWith(1)
      })
    })

    it('should not delete when cancelled', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      mockConfirm.mockReturnValue(false)

      renderSavedComparisons()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/Delete/)
        fireEvent.click(deleteButtons[0])
      })

      expect(mockDeleteSavedComparison).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: []
      })

      renderSavedComparisons()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /saved comparisons/i, level: 1 })).toBeInTheDocument()
      })
    })

    it('should have descriptive button titles', async () => {
      mockListSavedComparisons.mockResolvedValue({
        success: true,
        data: mockComparisons
      })

      renderSavedComparisons()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle('Delete')
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })
  })
})
