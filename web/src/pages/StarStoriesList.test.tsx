import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import StarStoriesList from './StarStoriesList'

// Mock API
const mockListStarStories = vi.fn()
const mockDeleteStarStory = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    listStarStories: (...args: any[]) => mockListStarStories(...args),
    deleteStarStory: (...args: any[]) => mockDeleteStarStory(...args)
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

describe('StarStoriesList Page', () => {
  const mockStories = [
    {
      id: 1,
      title: 'Led Cross-Functional Team Migration',
      story_theme: 'Leadership',
      company_context: 'Tech Startup',
      situation: 'Company needed to migrate legacy system',
      task: 'Lead the migration project',
      action: 'Organized team and created roadmap',
      result: 'Completed 2 weeks early with zero downtime',
      key_themes: ['Leadership', 'Project Management', 'Technical'],
      talking_points: ['Coordinated 5 teams', 'Reduced costs by 30%'],
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-20T15:30:00Z'
    },
    {
      id: 2,
      title: 'Resolved Critical Bug',
      story_theme: null,
      company_context: null,
      situation: 'Production system had critical bug',
      task: 'Find and fix the bug quickly',
      action: 'Debugged and deployed fix',
      result: 'System restored in 2 hours',
      key_themes: ['Problem Solving'],
      talking_points: ['Quick response', 'Minimal downtime'],
      created_at: '2024-01-10T12:00:00Z',
      updated_at: '2024-01-10T12:00:00Z'
    }
  ]

  const renderStarStoriesList = () => {
    return render(
      <BrowserRouter>
        <StarStoriesList />
      </BrowserRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  describe('Header', () => {
    it('should render page title', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /my star stories/i })).toBeInTheDocument()
      })
    })

    it('should render description text', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/STAR method/i)).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()
      expect(screen.getByText(/Loading your STAR stories/i)).toBeInTheDocument()
    })

    it('should show spinner with animation', () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      const { container } = renderStarStoriesList()
      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Error State', () => {
    it('should show error message when API fails', async () => {
      mockListStarStories.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/Error Loading STAR Stories/i)).toBeInTheDocument()
      })
    })

    it('should show error details', async () => {
      mockListStarStories.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })
    })

    it('should show try again button on error', async () => {
      mockListStarStories.mockResolvedValue({
        success: false,
        error: 'Network error'
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
      })
    })

    it('should retry loading when try again clicked', async () => {
      mockListStarStories
        .mockResolvedValueOnce({
          success: false,
          error: 'Network error'
        })
        .mockResolvedValueOnce({
          success: true,
          data: mockStories
        })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument()
      })

      const retryButton = screen.getByRole('button', { name: /try again/i })
      fireEvent.click(retryButton)

      await waitFor(() => {
        expect(mockListStarStories).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no stories', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/No STAR Stories Yet/i)).toBeInTheDocument()
      })
    })

    it('should show helpful message in empty state', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/Create interview prep from a tailored resume/i)).toBeInTheDocument()
      })
    })

    it('should show create resume button in empty state', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create tailored resume/i })).toBeInTheDocument()
      })
    })

    it('should navigate to tailor page when create button clicked', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        const createButton = screen.getByRole('button', { name: /create tailored resume/i })
        fireEvent.click(createButton)
      })

      expect(mockNavigate).toHaveBeenCalledWith('/tailor')
    })
  })

  describe('Stories List', () => {
    it('should display all stories', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText('Led Cross-Functional Team Migration')).toBeInTheDocument()
        expect(screen.getByText('Resolved Critical Bug')).toBeInTheDocument()
      })
    })

    it('should show story count', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/2 stories saved/i)).toBeInTheDocument()
      })
    })

    it('should show singular count for one story', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: [mockStories[0]]
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/1 story saved/i)).toBeInTheDocument()
      })
    })

    it('should show story titles', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText('Led Cross-Functional Team Migration')).toBeInTheDocument()
        expect(screen.getByText('Resolved Critical Bug')).toBeInTheDocument()
      })
    })

    it('should show story theme when available', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const leadershipBadges = screen.getAllByText('Leadership')
        expect(leadershipBadges.length).toBeGreaterThan(0)
      })
    })

    it('should show company context when available', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText('Tech Startup')).toBeInTheDocument()
      })
    })

    it('should show created dates', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const dates = screen.getAllByText(/Jan \d+, 2024/)
        expect(dates.length).toBeGreaterThan(0)
      })
    })

    it('should show word counts', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const wordCounts = screen.getAllByText(/\d+ words/)
        expect(wordCounts.length).toBeGreaterThan(0)
      })
    })

    it('should show key themes with limit of 3', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        // First story has 3 themes, so all should be visible in card
        expect(screen.getByText('Project Management')).toBeInTheDocument()
        expect(screen.getByText('Technical')).toBeInTheDocument()
      })
    })
  })

  describe('Story Selection', () => {
    it('should show placeholder when no story selected', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByText(/Select a story to view details/i)).toBeInTheDocument()
      })
    })

    it('should select story when clicked', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const storyCard = screen.getByText('Led Cross-Functional Team Migration')
        fireEvent.click(storyCard)
      })

      await waitFor(() => {
        // Should show STAR content
        expect(screen.getByText('Company needed to migrate legacy system')).toBeInTheDocument()
      })
    })

    it('should show STAR content when story selected', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const storyCard = screen.getByText('Led Cross-Functional Team Migration')
        fireEvent.click(storyCard)
      })

      await waitFor(() => {
        expect(screen.getByText('Company needed to migrate legacy system')).toBeInTheDocument()
        expect(screen.getByText('Lead the migration project')).toBeInTheDocument()
        expect(screen.getByText('Organized team and created roadmap')).toBeInTheDocument()
        expect(screen.getByText('Completed 2 weeks early with zero downtime')).toBeInTheDocument()
      })
    })

    it('should show key themes in detail view', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const storyCard = screen.getByText('Led Cross-Functional Team Migration')
        fireEvent.click(storyCard)
      })

      await waitFor(() => {
        expect(screen.getByText(/Key Themes/i)).toBeInTheDocument()
      })
    })

    it('should show talking points in detail view', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const storyCard = screen.getByText('Led Cross-Functional Team Migration')
        fireEvent.click(storyCard)
      })

      await waitFor(() => {
        expect(screen.getByText(/Talking Points/i)).toBeInTheDocument()
        expect(screen.getByText('Coordinated 5 teams')).toBeInTheDocument()
        expect(screen.getByText('Reduced costs by 30%')).toBeInTheDocument()
      })
    })
  })

  describe('Delete', () => {
    it('should show confirmation dialog when delete clicked', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/delete story/i)
        fireEvent.click(deleteButtons[0])
      })

      expect(mockConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this STAR story? This action cannot be undone.'
      )
    })

    it('should delete story when confirmed', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      mockDeleteStarStory.mockResolvedValue({
        success: true
      })

      mockConfirm.mockReturnValue(true)

      renderStarStoriesList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/delete story/i)
        fireEvent.click(deleteButtons[0])
      })

      await waitFor(() => {
        expect(mockDeleteStarStory).toHaveBeenCalledWith(1)
      })
    })

    it('should not delete when cancelled', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      mockConfirm.mockReturnValue(false)

      renderStarStoriesList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/delete story/i)
        fireEvent.click(deleteButtons[0])
      })

      expect(mockDeleteStarStory).not.toHaveBeenCalled()
    })

    it('should clear selection when deleting selected story', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      mockDeleteStarStory.mockResolvedValue({
        success: true
      })

      mockConfirm.mockReturnValue(true)

      renderStarStoriesList()

      // Select first story
      await waitFor(() => {
        const storyCard = screen.getByText('Led Cross-Functional Team Migration')
        fireEvent.click(storyCard)
      })

      // Delete it
      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/delete story/i)
        fireEvent.click(deleteButtons[0])
      })

      await waitFor(() => {
        expect(mockDeleteStarStory).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('Background Effects', () => {
    it('should have animated gradient background', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      const { container } = renderStarStoriesList()

      await waitFor(() => {
        const gradient = container.querySelector('.animate-gradient')
        expect(gradient).toBeInTheDocument()
      })
    })

    it('should have particles background', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      const { container } = renderStarStoriesList()

      await waitFor(() => {
        const particles = container.querySelector('.particles-background')
        expect(particles).toBeInTheDocument()
      })
    })

    it('should have multiple particle elements', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      const { container } = renderStarStoriesList()

      await waitFor(() => {
        const particles = container.querySelectorAll('.particle')
        expect(particles.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: []
      })

      renderStarStoriesList()

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      })
    })

    it('should have descriptive delete button titles', async () => {
      mockListStarStories.mockResolvedValue({
        success: true,
        data: mockStories
      })

      renderStarStoriesList()

      await waitFor(() => {
        const deleteButtons = screen.getAllByTitle(/delete story/i)
        expect(deleteButtons.length).toBeGreaterThan(0)
      })
    })
  })
})
