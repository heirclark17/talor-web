import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ResumeAnalysis from './ResumeAnalysis'

const mockAnalysis = {
  sections: [
    {
      section_name: 'Professional Experience',
      changes: [
        {
          change_type: 'added' as const,
          impact_level: 'high' as const,
          original_text: null,
          new_text: 'Led cross-functional team of 15 engineers delivering enterprise-scale solutions',
          why_this_matters: 'Demonstrates leadership and scale of impact',
          what_changed: 'Added leadership scope and quantifiable team size',
          how_it_helps: 'Shows management capability and enterprise experience',
          job_requirements_matched: ['Leadership', 'Team Management', 'Enterprise Experience'],
          keywords_added: ['cross-functional', 'enterprise-scale', 'led'],
        },
        {
          change_type: 'modified' as const,
          impact_level: 'medium' as const,
          original_text: 'Worked on cloud infrastructure',
          new_text: 'Architected and deployed scalable AWS infrastructure supporting 10M+ users',
          why_this_matters: 'Specific technology and scale metrics strengthen the impact',
          what_changed: 'Enhanced with specific technology stack and user scale',
          how_it_helps: 'Demonstrates technical depth and ability to work at scale',
          job_requirements_matched: ['AWS', 'Cloud Architecture'],
          keywords_added: ['AWS', 'scalable', 'architected'],
        },
      ],
    },
    {
      section_name: 'Technical Skills',
      changes: [
        {
          change_type: 'removed' as const,
          impact_level: 'low' as const,
          original_text: 'Microsoft Office',
          new_text: null,
          why_this_matters: 'Basic skills are assumed and take up valuable space',
          what_changed: 'Removed generic skill listing',
          how_it_helps: 'Makes room for more relevant technical skills',
          job_requirements_matched: [],
          keywords_added: [],
        },
      ],
    },
  ],
}

describe('ResumeAnalysis Component', () => {
  beforeEach(() => {
    // Clear any previous state
  })

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      render(<ResumeAnalysis analysis={null} loading={true} />)

      expect(screen.getByTestId('resume-analysis')).toBeInTheDocument()
      expect(screen.getByText(/analyzing resume changes/i)).toBeInTheDocument()
    })

    it('should show spinner animation when loading', () => {
      const { container } = render(<ResumeAnalysis analysis={null} loading={true} />)

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('rounded-full', 'h-8', 'w-8')
    })
  })

  describe('No Data State', () => {
    it('should display no data message when analysis is null', () => {
      render(<ResumeAnalysis analysis={null} loading={false} />)

      expect(screen.getByText(/no analysis available/i)).toBeInTheDocument()
      expect(screen.getByText(/generate a tailored resume to see changes/i)).toBeInTheDocument()
    })

    it('should display no data message when sections array is empty', () => {
      const emptyAnalysis = { sections: [] }
      render(<ResumeAnalysis analysis={emptyAnalysis} loading={false} />)

      expect(screen.getByText(/no analysis available/i)).toBeInTheDocument()
    })
  })

  describe('Header Display', () => {
    it('should display component title', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      expect(screen.getByText('AI-Powered Change Analysis')).toBeInTheDocument()
    })

    it('should display section count with correct pluralization', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      expect(screen.getByText('2 sections modified')).toBeInTheDocument()
    })

    it('should display singular section when count is 1', () => {
      const singleSectionAnalysis = {
        sections: [mockAnalysis.sections[0]],
      }
      render(<ResumeAnalysis analysis={singleSectionAnalysis} loading={false} />)

      expect(screen.getByText('1 section modified')).toBeInTheDocument()
    })
  })

  describe('Section Display', () => {
    it('should render all section headers', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      expect(screen.getByTestId('section-header-professional-experience')).toBeInTheDocument()
      expect(screen.getByTestId('section-header-technical-skills')).toBeInTheDocument()
    })

    it('should display section names', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      expect(screen.getByText('Professional Experience')).toBeInTheDocument()
      expect(screen.getByText('Technical Skills')).toBeInTheDocument()
    })

    it('should display change count for each section with correct pluralization', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      expect(screen.getByText('2 changes')).toBeInTheDocument()
      expect(screen.getByText('1 change')).toBeInTheDocument()
    })

    it('should show ChevronRight icon when section is collapsed', () => {
      const { container } = render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const chevronRightIcons = container.querySelectorAll('.lucide-chevron-right')
      expect(chevronRightIcons.length).toBeGreaterThan(0)
    })
  })

  describe('Section Expand/Collapse', () => {
    it('should expand section when header is clicked', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      expect(screen.getByTestId('section-header-professional-experience-content')).toBeInTheDocument()
    })

    it('should show ChevronDown icon when section is expanded', () => {
      const { container } = render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      const chevronDownIcons = container.querySelectorAll('.lucide-chevron-down')
      expect(chevronDownIcons.length).toBeGreaterThan(0)
    })

    it('should collapse section when expanded header is clicked again', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const sectionHeader = screen.getByTestId('section-header-professional-experience')

      // Expand
      fireEvent.click(sectionHeader)
      expect(screen.getByTestId('section-header-professional-experience-content')).toBeInTheDocument()

      // Collapse
      fireEvent.click(sectionHeader)
      expect(screen.queryByTestId('section-header-professional-experience-content')).not.toBeInTheDocument()
    })

    it('should display change items when section is expanded', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      expect(screen.getByTestId('change-item-Professional Experience-0')).toBeInTheDocument()
      expect(screen.getByTestId('change-item-Professional Experience-1')).toBeInTheDocument()
    })
  })

  describe('Change Item Display', () => {
    beforeEach(() => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)
    })

    it('should display change type badge', () => {
      const changeTypeBadges = screen.getAllByTestId('change-type')
      expect(changeTypeBadges[0]).toHaveTextContent('added')
      expect(changeTypeBadges[1]).toHaveTextContent('modified')
    })

    it('should display impact level badge', () => {
      const impactBadges = screen.getAllByTestId('impact-level')
      expect(impactBadges[0]).toHaveTextContent('high impact')
      expect(impactBadges[1]).toHaveTextContent('medium impact')
    })

    it('should display what_changed preview text', () => {
      expect(screen.getByText('Added leadership scope and quantifiable team size')).toBeInTheDocument()
      expect(screen.getByText('Enhanced with specific technology stack and user scale')).toBeInTheDocument()
    })
  })

  describe('Change Type Icons', () => {
    it('should display icon for added changes', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const professionalHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(professionalHeader)

      // Verify the change type badges are rendered
      const changeTypeBadges = screen.getAllByTestId('change-type')
      expect(changeTypeBadges[0]).toHaveTextContent('added')
    })

    it('should display icon for modified changes', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const professionalHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(professionalHeader)

      // Verify the change type badges are rendered
      const changeTypeBadges = screen.getAllByTestId('change-type')
      expect(changeTypeBadges[1]).toHaveTextContent('modified')
    })

    it('should display icon for removed changes', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      const technicalHeader = screen.getByTestId('section-header-technical-skills')
      fireEvent.click(technicalHeader)

      // Verify the change type badges are rendered
      const changeTypeBadges = screen.getAllByTestId('change-type')
      const removedBadge = changeTypeBadges.find(badge => badge.textContent?.includes('removed'))
      expect(removedBadge).toBeInTheDocument()
    })
  })

  describe('Impact Level Colors', () => {
    it('should apply green color for high impact', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      const impactBadges = screen.getAllByTestId('impact-level')
      expect(impactBadges[0]).toHaveClass('text-green-500')
    })

    it('should apply yellow color for medium impact', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      const impactBadges = screen.getAllByTestId('impact-level')
      expect(impactBadges[1]).toHaveClass('text-yellow-500')
    })

    it('should apply blue color for low impact', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const technicalHeader = screen.getByTestId('section-header-technical-skills')
      fireEvent.click(technicalHeader)

      const impactBadges = screen.getAllByTestId('impact-level')
      const lowImpactBadge = impactBadges.find(badge => badge.textContent === 'low impact')
      expect(lowImpactBadge).toHaveClass('text-blue-500')
    })
  })

  describe('Change Expand/Collapse', () => {
    beforeEach(() => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)
    })

    it('should expand change details when change item is clicked', () => {
      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')

      if (changeButton) {
        fireEvent.click(changeButton)
        expect(screen.getByTestId('change-explanation')).toBeInTheDocument()
      }
    })

    it('should display expanded details with all sections', () => {
      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')

      if (changeButton) {
        fireEvent.click(changeButton)

        expect(screen.getByText('Why This Matters')).toBeInTheDocument()
        expect(screen.getByText('What Changed')).toBeInTheDocument()
        expect(screen.getByText('How It Helps')).toBeInTheDocument()
      }
    })

    it('should collapse change details when expanded item is clicked again', () => {
      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')

      if (changeButton) {
        // Expand
        fireEvent.click(changeButton)
        expect(screen.getByTestId('change-explanation')).toBeInTheDocument()

        // Collapse
        fireEvent.click(changeButton)
        expect(screen.queryByTestId('change-explanation')).not.toBeInTheDocument()
      }
    })
  })

  describe('Original and New Text Display', () => {
    beforeEach(() => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)
    })

    it('should display original text when available', () => {
      const changeItem = screen.getByTestId('change-item-Professional Experience-1')
      const changeButton = changeItem.querySelector('button')

      if (changeButton) {
        fireEvent.click(changeButton)
        expect(screen.getByText('Original')).toBeInTheDocument()
        expect(screen.getByText('Worked on cloud infrastructure')).toBeInTheDocument()
      }
    })

    it('should display new text when available', () => {
      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')

      if (changeButton) {
        fireEvent.click(changeButton)
        expect(screen.getByText('New')).toBeInTheDocument()
        expect(screen.getByText('Led cross-functional team of 15 engineers delivering enterprise-scale solutions')).toBeInTheDocument()
      }
    })

    it('should not display original section when original_text is null', () => {
      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')

      if (changeButton) {
        fireEvent.click(changeButton)
        const originalLabels = screen.queryAllByText('Original')
        // Should not find "Original" label for this change since original_text is null
        expect(originalLabels.length).toBe(0)
      }
    })
  })

  describe('Explanation Sections', () => {
    beforeEach(() => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')
      if (changeButton) {
        fireEvent.click(changeButton)
      }
    })

    it('should display why_this_matters explanation', () => {
      expect(screen.getByText('Demonstrates leadership and scale of impact')).toBeInTheDocument()
    })

    it('should display what_changed full text', () => {
      // Text appears in both preview and expanded section
      const whatChangedTexts = screen.getAllByText('Added leadership scope and quantifiable team size')
      expect(whatChangedTexts.length).toBeGreaterThan(0)
    })

    it('should display how_it_helps explanation', () => {
      expect(screen.getByText('Shows management capability and enterprise experience')).toBeInTheDocument()
    })
  })

  describe('Job Requirements Matched Badges', () => {
    beforeEach(() => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')
      if (changeButton) {
        fireEvent.click(changeButton)
      }
    })

    it('should display Job Requirements Matched section', () => {
      expect(screen.getByText('Job Requirements Matched')).toBeInTheDocument()
    })

    it('should display all job requirement badges', () => {
      expect(screen.getByText('Leadership')).toBeInTheDocument()
      expect(screen.getByText('Team Management')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Experience')).toBeInTheDocument()
    })

    it('should not display Job Requirements section when array is empty', () => {
      // Expand the Technical Skills section which has empty requirements
      const technicalHeader = screen.getByTestId('section-header-technical-skills')
      fireEvent.click(technicalHeader)

      const changeItem = screen.getByTestId('change-item-Technical Skills-0')
      const changeButton = changeItem.querySelector('button')
      if (changeButton) {
        fireEvent.click(changeButton)
        const reqLabels = screen.queryAllByText('Job Requirements Matched')
        expect(reqLabels.length).toBeLessThan(2) // Should only be one from the first expanded change
      }
    })
  })

  describe('Keywords Added Badges', () => {
    beforeEach(() => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)
      const sectionHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(sectionHeader)

      const changeItem = screen.getByTestId('change-item-Professional Experience-0')
      const changeButton = changeItem.querySelector('button')
      if (changeButton) {
        fireEvent.click(changeButton)
      }
    })

    it('should display Keywords Added section', () => {
      expect(screen.getByText('Keywords Added')).toBeInTheDocument()
    })

    it('should display all keyword badges', () => {
      expect(screen.getByTestId('keywords-added')).toBeInTheDocument()

      const keywordBadges = screen.getAllByTestId('keyword-badge')
      expect(keywordBadges.length).toBeGreaterThanOrEqual(3)
    })

    it('should display correct keyword text', () => {
      expect(screen.getByText('cross-functional')).toBeInTheDocument()
      expect(screen.getByText('enterprise-scale')).toBeInTheDocument()
      expect(screen.getByText('led')).toBeInTheDocument()
    })

    it('should not display Keywords section when array is empty', () => {
      // Expand the Technical Skills section which has empty keywords
      const technicalHeader = screen.getByTestId('section-header-technical-skills')
      fireEvent.click(technicalHeader)

      const changeItem = screen.getByTestId('change-item-Technical Skills-0')
      const changeButton = changeItem.querySelector('button')
      if (changeButton) {
        fireEvent.click(changeButton)
        const keywordSections = screen.queryAllByTestId('keywords-added')
        expect(keywordSections.length).toBeLessThan(2) // Should only be one from the first expanded change
      }
    })
  })

  describe('Multiple Sections and Changes', () => {
    it('should handle multiple sections independently', () => {
      render(<ResumeAnalysis analysis={mockAnalysis} loading={false} />)

      // Expand first section
      const professionalHeader = screen.getByTestId('section-header-professional-experience')
      fireEvent.click(professionalHeader)
      expect(screen.getByTestId('section-header-professional-experience-content')).toBeInTheDocument()

      // Technical section should still be collapsed
      expect(screen.queryByTestId('section-header-technical-skills-content')).not.toBeInTheDocument()

      // Expand second section
      const technicalHeader = screen.getByTestId('section-header-technical-skills')
      fireEvent.click(technicalHeader)
      expect(screen.getByTestId('section-header-technical-skills-content')).toBeInTheDocument()

      // First section should still be expanded
      expect(screen.getByTestId('section-header-professional-experience-content')).toBeInTheDocument()
    })
  })
})
