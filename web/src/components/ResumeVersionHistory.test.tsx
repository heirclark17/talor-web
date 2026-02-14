import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResumeVersionHistory from './ResumeVersionHistory'
import { api } from '../api/client'

vi.mock('../api/client', () => ({
  api: {
    listResumeVersions: vi.fn(),
    restoreResumeVersion: vi.fn(),
  },
}))

const mockVersions = [
  {
    id: 1,
    versionNumber: 3,
    changeSummary: 'Updated skills section',
    createdAt: '2024-02-14T10:30:00Z',
  },
  {
    id: 2,
    versionNumber: 2,
    changeSummary: 'Added new project',
    createdAt: '2024-02-13T15:45:00Z',
  },
  {
    id: 3,
    versionNumber: 1,
    changeSummary: null,
    createdAt: '2024-02-12T09:00:00Z',
  },
]

describe('ResumeVersionHistory Component', () => {
  const mockOnRestore = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn())
  })

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      vi.mocked(api.listResumeVersions).mockImplementation(() => new Promise(() => {}))

      const { container } = render(<ResumeVersionHistory tailoredResumeId={1} />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should center loading spinner', () => {
      vi.mocked(api.listResumeVersions).mockImplementation(() => new Promise(() => {}))

      const { container } = render(<ResumeVersionHistory tailoredResumeId={1} />)

      const loadingContainer = container.querySelector('.flex.items-center.justify-center')
      expect(loadingContainer).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no versions', async () => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: [] },
      })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(screen.getByText('No versions yet')).toBeInTheDocument()
      })
    })

    it('should show helper text in empty state', async () => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: [] },
      })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(screen.getByText(/Versions are saved automatically when you make changes/)).toBeInTheDocument()
      })
    })

    it('should render clock icon in empty state', async () => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: [] },
      })

      const { container } = render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const clockIcon = container.querySelector('.text-theme-tertiary')
        expect(clockIcon).toBeInTheDocument()
      })
    })
  })

  describe('Version List', () => {
    beforeEach(() => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: mockVersions },
      })
    })

    it('should render Version History heading', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(screen.getByText('Version History')).toBeInTheDocument()
      })
    })

    it('should render all versions', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(screen.getByText('Version 3')).toBeInTheDocument()
        expect(screen.getByText('Version 2')).toBeInTheDocument()
        expect(screen.getByText('Version 1')).toBeInTheDocument()
      })
    })

    it('should display version numbers in badges', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const badges = screen.getAllByText(/^[123]$/)
        expect(badges.length).toBe(3)
      })
    })

    it('should show change summary when available', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(screen.getByText(/Updated skills section/)).toBeInTheDocument()
        expect(screen.getByText(/Added new project/)).toBeInTheDocument()
      })
    })

    it('should not show dash separator when changeSummary is null', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const version1Text = screen.getByText(/Version 1/).closest('div')
        expect(version1Text?.textContent).not.toContain(' - ')
      })
    })

    it('should format dates correctly', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        // Date should be formatted (format depends on locale, just check it exists)
        const dateElements = screen.getAllByText(/Feb|Jan|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
        expect(dateElements.length).toBeGreaterThan(0)
      })
    })

    it('should render Restore button for each version', async () => {
      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        expect(restoreButtons.length).toBe(3)
      })
    })
  })

  describe('Restore Functionality', () => {
    beforeEach(() => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: mockVersions },
      })
    })

    it('should show confirmation dialog when Restore is clicked', async () => {
      const confirmSpy = vi.fn(() => true)
      vi.stubGlobal('confirm', confirmSpy)

      vi.mocked(api.restoreResumeVersion).mockResolvedValue({ success: true })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      expect(confirmSpy).toHaveBeenCalledWith(
        'Restore to version 3? Current state will be auto-saved first.'
      )
    })

    it('should call API when restore is confirmed', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({ success: true })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        expect(api.restoreResumeVersion).toHaveBeenCalledWith(1, 1)
      })
    })

    it('should not call API when restore is cancelled', async () => {
      vi.stubGlobal('confirm', vi.fn(() => false))

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      expect(api.restoreResumeVersion).not.toHaveBeenCalled()
    })

    it('should show loading state on restore button', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        const restoreButton = screen.getAllByRole('button', { name: /restore/i })[0]
        const spinner = restoreButton.querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      })
    })

    it('should disable button while restoring', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        const restoreButton = screen.getAllByRole('button', { name: /restore/i })[0]
        expect(restoreButton).toBeDisabled()
      })
    })

    it('should show success message after restore', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({ success: true })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText('Restored to version 3')).toBeInTheDocument()
      })
    })

    it('should call onRestore callback after successful restore', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({ success: true })

      render(<ResumeVersionHistory tailoredResumeId={1} onRestore={mockOnRestore} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        expect(mockOnRestore).toHaveBeenCalledTimes(1)
      })
    })

    it('should reload versions after successful restore', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({ success: true })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => screen.getByText('Version History'))

      // Clear the initial load call
      vi.mocked(api.listResumeVersions).mockClear()

      const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
      fireEvent.click(restoreButtons[0])

      await waitFor(() => {
        // Should call listResumeVersions again after restore
        expect(api.listResumeVersions).toHaveBeenCalled()
      })
    })

    it('should show error message when restore fails', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({
        success: false,
        error: 'Restore failed due to conflict',
      })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText('Restore failed due to conflict')).toBeInTheDocument()
      })
    })

    it('should show generic error when API throws', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockRejectedValue(new Error('Network error'))

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        expect(screen.getByText('Failed to restore version')).toBeInTheDocument()
      })
    })
  })

  describe('Message Display', () => {
    beforeEach(() => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: mockVersions },
      })
    })

    it('should render success message with CheckCircle icon', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({ success: true })

      const { container } = render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        const successMessage = container.querySelector('.bg-green-500\\/10')
        expect(successMessage).toBeInTheDocument()
      })
    })

    it('should render error message with AlertCircle icon', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true))
      vi.mocked(api.restoreResumeVersion).mockResolvedValue({
        success: false,
        error: 'Error',
      })

      const { container } = render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        const restoreButtons = screen.getAllByRole('button', { name: /restore/i })
        fireEvent.click(restoreButtons[0])
      })

      await waitFor(() => {
        const errorMessage = container.querySelector('.bg-red-500\\/10')
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })

  describe('API Error Handling', () => {
    it('should handle API error when loading versions', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.listResumeVersions).mockRejectedValue(new Error('API Error'))

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })

    it('should handle missing data in API response', async () => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: null as any,
      })

      render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => {
        expect(screen.queryByText('Version History')).not.toBeInTheDocument()
      })
    })
  })

  describe('Reload on ID Change', () => {
    it('should reload versions when tailoredResumeId changes', async () => {
      vi.mocked(api.listResumeVersions).mockResolvedValue({
        success: true,
        data: { versions: mockVersions },
      })

      const { rerender } = render(<ResumeVersionHistory tailoredResumeId={1} />)

      await waitFor(() => screen.getByText('Version History'))

      expect(api.listResumeVersions).toHaveBeenCalledWith(1)

      vi.mocked(api.listResumeVersions).mockClear()

      rerender(<ResumeVersionHistory tailoredResumeId={2} />)

      await waitFor(() => {
        expect(api.listResumeVersions).toHaveBeenCalledWith(2)
      })
    })
  })
})
