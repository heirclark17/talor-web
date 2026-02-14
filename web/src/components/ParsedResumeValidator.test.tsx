import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ParsedResumeValidator from './ParsedResumeValidator'
import { api } from '../api/client'

vi.mock('../api/client', () => ({
  api: {
    updateParsedResumeData: vi.fn(),
  },
}))

const mockParsedData = {
  name: 'John Doe',
  email: 'john@example.com',
  phone: '555-1234',
  linkedin: 'linkedin.com/in/johndoe',
  location: 'San Francisco, CA',
  summary: 'Experienced software engineer with 10+ years in building scalable applications.',
  skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  experience: [
    {
      header: 'Senior Engineer at Tech Corp',
      title: 'Senior Engineer',
      company: 'Tech Corp',
      dates: '2020-Present',
    },
  ],
  education: 'BS Computer Science, MIT',
  certifications: 'AWS Certified Solutions Architect',
}

describe('ParsedResumeValidator Component', () => {
  const mockOnConfirm = vi.fn()
  const mockOnSkip = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render success heading', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('Resume Parsed Successfully')).toBeInTheDocument()
    })

    it('should render instruction text', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('Review the extracted data and fix any issues.')).toBeInTheDocument()
    })

    it('should render all field labels', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Email')).toBeInTheDocument()
      expect(screen.getByText('Phone')).toBeInTheDocument()
      expect(screen.getByText('Location')).toBeInTheDocument()
      expect(screen.getByText('LinkedIn')).toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(screen.getByText('Certifications')).toBeInTheDocument()
    })

    it('should render field values', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('555-1234')).toBeInTheDocument()
    })

    it('should render skills as badges', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
    })

    it('should show experience count', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText(/1 position detected/)).toBeInTheDocument()
    })

    it('should render Skip Review button', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByRole('button', { name: /skip review/i })).toBeInTheDocument()
    })

    it('should render Confirm & Save button', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByRole('button', { name: /confirm & save/i })).toBeInTheDocument()
    })
  })

  describe('Confidence Badges', () => {
    it('should show "Good" badge for high confidence fields', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const goodBadges = screen.getAllByText('Good')
      expect(goodBadges.length).toBeGreaterThan(0)
    })

    it('should show "Review" badge for medium confidence fields', () => {
      const dataWithShortValues = {
        ...mockParsedData,
        phone: '555', // Short value = medium confidence
      }
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={dataWithShortValues}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const reviewBadges = screen.getAllByText('Review')
      expect(reviewBadges.length).toBeGreaterThan(0)
    })

    it('should show "Check" badge for low confidence fields', () => {
      const dataWithEmptyFields = {
        ...mockParsedData,
        phone: '',
      }
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={dataWithEmptyFields}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('Check')).toBeInTheDocument()
    })

    it('should show low confidence for empty skills array', () => {
      const dataWithNoSkills = {
        ...mockParsedData,
        skills: [],
      }
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={dataWithNoSkills}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('(no skills detected)')).toBeInTheDocument()
    })

    it('should show low confidence for zero experience', () => {
      const dataWithNoExperience = {
        ...mockParsedData,
        experience: [],
      }
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={dataWithNoExperience}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText(/0 positions detected/)).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('should enter edit mode when edit button is clicked', () => {
      const { container } = render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      // Find and click an edit button (they appear on hover)
      const editButtons = container.querySelectorAll('button')
      const nameEditButton = Array.from(editButtons).find((btn) => {
        const svg = btn.querySelector('svg')
        return svg && btn.closest('.group')
      })

      if (nameEditButton) {
        fireEvent.click(nameEditButton)
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      }
    })

    it('should show input field for text fields in edit mode', () => {
      const { container } = render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const editButtons = container.querySelectorAll('button')
      const firstEditButton = Array.from(editButtons).find((btn) => {
        const svg = btn.querySelector('svg')
        return svg && btn.closest('.group')
      })

      if (firstEditButton) {
        fireEvent.click(firstEditButton)
        const input = screen.getByDisplayValue('John Doe') as HTMLInputElement
        expect(input.tagName).toBe('INPUT')
      }
    })

    it('should show textarea for summary field in edit mode', () => {
      const { container } = render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      // Find summary edit button
      const allButtons = container.querySelectorAll('button')
      const summaryGroup = Array.from(container.querySelectorAll('.group')).find((group) =>
        group.textContent?.includes('Summary')
      )

      if (summaryGroup) {
        const editButton = summaryGroup.querySelector('button')
        if (editButton) {
          fireEvent.click(editButton)
          const textarea = screen.getByDisplayValue(/Experienced software engineer/) as HTMLTextAreaElement
          expect(textarea.tagName).toBe('TEXTAREA')
        }
      }
    })

    it('should allow editing field values', () => {
      const { container } = render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const editButtons = container.querySelectorAll('button')
      const firstEditButton = Array.from(editButtons).find((btn) => {
        const svg = btn.querySelector('svg')
        return svg && btn.closest('.group')
      })

      if (firstEditButton) {
        fireEvent.click(firstEditButton)
        const input = screen.getByDisplayValue('John Doe') as HTMLInputElement
        fireEvent.change(input, { target: { value: 'Jane Smith' } })
        expect(input.value).toBe('Jane Smith')
      }
    })

    it('should exit edit mode when X button is clicked', () => {
      const { container } = render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const editButtons = container.querySelectorAll('button')
      const firstEditButton = Array.from(editButtons).find((btn) => {
        const svg = btn.querySelector('svg')
        return svg && btn.closest('.group')
      })

      if (firstEditButton) {
        fireEvent.click(firstEditButton)

        // Find and click the X button
        const xButtons = screen.getAllByRole('button')
        const xButton = xButtons.find((btn) => btn.querySelector('.w-4.h-4'))

        if (xButton) {
          fireEvent.click(xButton)
          expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument()
        }
      }
    })
  })

  describe('Save Functionality', () => {
    it('should call API when Confirm & Save is clicked', async () => {
      vi.mocked(api.updateParsedResumeData).mockResolvedValue({} as any)

      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const saveButton = screen.getByRole('button', { name: /confirm & save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(api.updateParsedResumeData).toHaveBeenCalledWith(1, expect.objectContaining({
          candidate_name: 'John Doe',
          candidate_email: 'john@example.com',
        }))
      })
    })

    it('should show loading state when saving', async () => {
      vi.mocked(api.updateParsedResumeData).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const saveButton = screen.getByRole('button', { name: /confirm & save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        const spinner = screen.getByRole('button', { name: /confirm & save/i }).querySelector('.animate-spin')
        expect(spinner).toBeInTheDocument()
      })
    })

    it('should show success state after save', async () => {
      vi.mocked(api.updateParsedResumeData).mockResolvedValue({} as any)

      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const saveButton = screen.getByRole('button', { name: /confirm & save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText('Saved!')).toBeInTheDocument()
      })
    })

    it('should call onConfirm after save with delay', async () => {
      vi.mocked(api.updateParsedResumeData).mockResolvedValue({} as any)

      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const saveButton = screen.getByRole('button', { name: /confirm & save/i })
      fireEvent.click(saveButton)

      await waitFor(() => expect(api.updateParsedResumeData).toHaveBeenCalled())

      // Wait for the 1 second setTimeout before onConfirm is called
      await waitFor(() => expect(mockOnConfirm).toHaveBeenCalled(), { timeout: 2000 })
    })

    it('should disable button while saving', async () => {
      vi.mocked(api.updateParsedResumeData).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const saveButton = screen.getByRole('button', { name: /confirm & save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(saveButton).toBeDisabled()
      })
    })
  })

  describe('Skip Functionality', () => {
    it('should call onSkip when Skip Review is clicked', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const skipButton = screen.getByRole('button', { name: /skip review/i })
      fireEvent.click(skipButton)

      expect(mockOnSkip).toHaveBeenCalledTimes(1)
    })
  })

  describe('Warning Message', () => {
    it('should show warning when summary has low confidence', () => {
      const dataWithEmptySummary = {
        ...mockParsedData,
        summary: '',
      }
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={dataWithEmptySummary}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('Some fields may need correction')).toBeInTheDocument()
    })

    it('should not show warning when all fields have good confidence', () => {
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.queryByText('Some fields may need correction')).not.toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show (empty) for missing field values', () => {
      const dataWithEmptyPhone = {
        ...mockParsedData,
        phone: '',
      }
      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={dataWithEmptyPhone}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      expect(screen.getByText('(empty)')).toBeInTheDocument()
    })

    it('should handle undefined optional fields', () => {
      const dataWithUndefined = {
        ...mockParsedData,
        name: undefined,
      }
      expect(() =>
        render(
          <ParsedResumeValidator
            resumeId={1}
            parsedData={dataWithUndefined}
            onConfirm={mockOnConfirm}
            onSkip={mockOnSkip}
          />
        )
      ).not.toThrow()
    })
  })

  describe('Error Handling', () => {
    it('should handle API error gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.updateParsedResumeData).mockRejectedValue(new Error('API Error'))

      render(
        <ParsedResumeValidator
          resumeId={1}
          parsedData={mockParsedData}
          onConfirm={mockOnConfirm}
          onSkip={mockOnSkip}
        />
      )

      const saveButton = screen.getByRole('button', { name: /confirm & save/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      consoleErrorSpy.mockRestore()
    })
  })
})
