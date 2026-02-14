import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import STARStoryBuilder from './STARStoryBuilder'

// Mock toast utilities
vi.mock('../utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn()
}))

// Mock PracticeSession component
vi.mock('./PracticeSession', () => ({
  default: ({ story, onClose }: any) => (
    <div data-testid="practice-session">
      <h1>Practice: {story.title}</h1>
      <button onClick={onClose}>Close Practice</button>
    </div>
  )
}))

const mockExperiences = [
  {
    header: 'Senior Software Engineer',
    bullets: [
      'Led team of 5 engineers to deliver new feature',
      'Improved system performance by 50%',
      'Implemented automated testing'
    ]
  },
  {
    title: 'Product Manager',
    bullets: [
      'Managed product roadmap for 6 months',
      'Increased user engagement by 40%'
    ]
  }
]

const mockStories = [
  {
    id: '1',
    title: 'Leadership in Crisis',
    situation: 'During a critical production outage...',
    task: 'Need to restore service quickly...',
    action: 'I coordinated the team...',
    result: 'Service restored in 2 hours, 99.9% uptime maintained.',
    key_themes: ['Leadership', 'Problem Solving'],
    talking_points: ['Quick decision making', 'Team coordination']
  }
]

describe('STARStoryBuilder Component', () => {
  const defaultProps = {
    tailoredResumeId: 1,
    experiences: mockExperiences,
    companyContext: 'Fast-paced tech startup',
    storyThemes: ['Leadership Example', 'Problem Solving', 'Teamwork']
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch to return empty stories by default (component calls this on mount)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, stories: [] })
    })
  })

  describe('Initial Rendering', () => {
    it('should render header', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText('STAR Story Builder')).toBeInTheDocument()
    })

    it('should render description', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText(/Select experiences from your resume/)).toBeInTheDocument()
    })

    it('should render three numbered steps', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText(/1\. Select Your Experiences/)).toBeInTheDocument()
      expect(screen.getByText(/2\. Choose Story Theme/)).toBeInTheDocument()
      expect(screen.getByText(/3\. Choose Tone/)).toBeInTheDocument()
    })

    it('should render Generate STAR Story button', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByRole('button', { name: /Generate STAR Story/i })).toBeInTheDocument()
    })
  })

  describe('Empty Experiences State', () => {
    it('should show warning when no experiences provided', () => {
      render(<STARStoryBuilder {...defaultProps} experiences={[]} />)
      expect(screen.getByText(/Loading resume experiences/)).toBeInTheDocument()
    })

    it('should display helpful message about refreshing', () => {
      render(<STARStoryBuilder {...defaultProps} experiences={[]} />)
      expect(screen.getByText(/If this message persists, please refresh/)).toBeInTheDocument()
    })
  })

  describe('Experience Selection', () => {
    it('should render all experiences', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Product Manager')).toBeInTheDocument()
    })

    it('should render experience bullets', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText(/Led team of 5 engineers/)).toBeInTheDocument()
    })

    it('should limit bullets to first 2', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText(/\+1 more achievements/)).toBeInTheDocument()
    })

    it('should toggle experience selection on checkbox click', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const checkboxes = screen.getAllByRole('checkbox')

      expect(checkboxes[0]).not.toBeChecked()
      fireEvent.click(checkboxes[0])
      expect(checkboxes[0]).toBeChecked()
    })

    it('should apply selected styling when experience is checked', () => {
      const { container } = render(<STARStoryBuilder {...defaultProps} />)
      const checkboxes = screen.getAllByRole('checkbox')

      fireEvent.click(checkboxes[0])

      const selectedLabel = container.querySelector('.border-theme-muted')
      expect(selectedLabel).toBeInTheDocument()
    })
  })

  describe('Theme Selection', () => {
    it('should render theme dropdown', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const themeSelect = screen.getAllByRole('combobox')[0]
      expect(themeSelect).toBeInTheDocument()
    })

    it('should display all story themes', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText('Leadership Example')).toBeInTheDocument()
      expect(screen.getByText('Problem Solving')).toBeInTheDocument()
      expect(screen.getByText('Teamwork')).toBeInTheDocument()
    })

    it('should select first theme by default', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const themeSelect = screen.getAllByRole('combobox')[0] as HTMLSelectElement
      expect(themeSelect.value).toBe('Leadership Example')
    })

    it('should change theme on selection', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const themeSelect = screen.getAllByRole('combobox')[0]

      fireEvent.change(themeSelect, { target: { value: 'Problem Solving' } })
      expect((themeSelect as HTMLSelectElement).value).toBe('Problem Solving')
    })
  })

  describe('Tone Selection', () => {
    it('should render tone dropdown', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const toneSelect = screen.getAllByRole('combobox')[1]
      expect(toneSelect).toBeInTheDocument()
    })

    it('should display tone options', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText(/Professional & Formal/)).toBeInTheDocument()
    })

    it('should show tone description', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      expect(screen.getByText(/Corporate, structured, polished language/)).toBeInTheDocument()
    })

    it('should update description when tone changes', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const toneSelect = screen.getAllByRole('combobox')[1]

      fireEvent.change(toneSelect, { target: { value: 'conversational' } })
      expect(screen.getByText(/Natural, approachable, genuine tone/)).toBeInTheDocument()
    })
  })

  describe('Generate Button State', () => {
    it('should disable button when no experiences selected', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const generateButton = screen.getByRole('button', { name: /Generate STAR Story/i })
      expect(generateButton).toBeDisabled()
    })

    it('should enable button when experiences are selected', () => {
      render(<STARStoryBuilder {...defaultProps} />)
      const checkbox = screen.getAllByRole('checkbox')[0]
      fireEvent.click(checkbox)

      const generateButton = screen.getByRole('button', { name: /Generate STAR Story/i })
      expect(generateButton).not.toBeDisabled()
    })
  })

  describe('Loading Stories', () => {
    it('should fetch existing stories on mount', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/star-stories/list'),
          expect.any(Object)
        )
      })
    })

    it('should display loaded stories', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Leadership in Crisis')).toBeInTheDocument()
      })
    })

    it('should show story count', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText(/Your STAR Stories \(1\)/)).toBeInTheDocument()
      })
    })
  })

  describe('Story Display', () => {
    beforeEach(async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Leadership in Crisis')).toBeInTheDocument()
      })
    })

    it('should display STAR sections', () => {
      expect(screen.getByText('Situation')).toBeInTheDocument()
      expect(screen.getByText('Task')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
      expect(screen.getByText('Result')).toBeInTheDocument()
    })

    it('should display story content', () => {
      expect(screen.getByText(/During a critical production outage/)).toBeInTheDocument()
      expect(screen.getByText(/Need to restore service quickly/)).toBeInTheDocument()
    })

    it('should display key themes', () => {
      // "Leadership" appears only in key themes, but "Problem Solving" is also in theme dropdown
      expect(screen.getByText('Leadership')).toBeInTheDocument()
      const problemSolvingElements = screen.getAllByText('Problem Solving')
      expect(problemSolvingElements.length).toBeGreaterThan(0)
    })

    it('should display talking points', () => {
      expect(screen.getByText('Quick decision making')).toBeInTheDocument()
      expect(screen.getByText('Team coordination')).toBeInTheDocument()
    })
  })

  describe('Story Actions', () => {
    beforeEach(async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Leadership in Crisis')).toBeInTheDocument()
      })
    })

    it('should show action buttons', () => {
      expect(screen.getByLabelText('Collapse story')).toBeInTheDocument()
      expect(screen.getByLabelText('Practice this story')).toBeInTheDocument()
      expect(screen.getByLabelText('Edit story')).toBeInTheDocument()
      expect(screen.getByLabelText('Delete story')).toBeInTheDocument()
    })

    it('should collapse story when collapse button clicked', () => {
      const collapseButton = screen.getByLabelText('Collapse story')
      fireEvent.click(collapseButton)

      expect(screen.getByText(/Story collapsed - click to expand/)).toBeInTheDocument()
      expect(screen.queryByText(/During a critical production outage/)).not.toBeInTheDocument()
    })

    it('should open practice session when practice button clicked', () => {
      const practiceButton = screen.getByLabelText('Practice this story')
      fireEvent.click(practiceButton)

      expect(screen.getByTestId('practice-session')).toBeInTheDocument()
      expect(screen.getByText('Practice: Leadership in Crisis')).toBeInTheDocument()
    })

    it('should close practice session', () => {
      const practiceButton = screen.getByLabelText('Practice this story')
      fireEvent.click(practiceButton)

      const closeButton = screen.getByText('Close Practice')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('practice-session')).not.toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    beforeEach(async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        expect(screen.getByText('Leadership in Crisis')).toBeInTheDocument()
      })

      const editButton = screen.getByLabelText('Edit story')
      fireEvent.click(editButton)
    })

    it('should enter edit mode when edit button clicked', () => {
      expect(screen.getByPlaceholderText('Story Title')).toBeInTheDocument()
    })

    it('should show editable fields', () => {
      expect(screen.getByPlaceholderText('Detailed context and background...')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('What needed to be accomplished and why...')).toBeInTheDocument()
    })

    it('should show save and cancel buttons', () => {
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
    })

    it('should populate fields with current values', () => {
      const titleInput = screen.getByPlaceholderText('Story Title') as HTMLInputElement
      expect(titleInput.value).toBe('Leadership in Crisis')
    })

    it('should allow editing title', () => {
      const titleInput = screen.getByPlaceholderText('Story Title')
      fireEvent.change(titleInput, { target: { value: 'New Title' } })
      expect((titleInput as HTMLInputElement).value).toBe('New Title')
    })

    it('should cancel editing when cancel button clicked', () => {
      const cancelButton = screen.getByRole('button', { name: /Cancel/i })
      fireEvent.click(cancelButton)

      expect(screen.queryByPlaceholderText('Story Title')).not.toBeInTheDocument()
      expect(screen.getByText('Leadership in Crisis')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible action group', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        const actionGroup = screen.getByRole('group', { name: /Actions for Leadership in Crisis/i })
        expect(actionGroup).toBeInTheDocument()
      })
    })

    it('should have aria-expanded on collapse button', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, stories: mockStories })
      })

      render(<STARStoryBuilder {...defaultProps} />)

      await waitFor(() => {
        const collapseButton = screen.getByLabelText('Collapse story')
        expect(collapseButton).toHaveAttribute('aria-expanded', 'true')
      })
    })
  })
})
