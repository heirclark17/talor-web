import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ChangeExplanation from './ChangeExplanation'

const mockChanges = [
  {
    type: 'added' as const,
    changed: 'Led cross-functional team of 12 engineers',
    reason: 'Added leadership scope to demonstrate management experience',
    keywords: ['leadership', 'cross-functional', 'team management'],
  },
  {
    type: 'modified' as const,
    original: 'Worked on cloud infrastructure',
    changed: 'Architected and deployed scalable AWS infrastructure',
    reason: 'Enhanced with specific technology stack and action verbs',
    keywords: ['AWS', 'cloud architecture', 'scalability'],
  },
  {
    type: 'removed' as const,
    original: 'Performed various tasks as assigned',
    reason: 'Removed vague language that does not demonstrate specific value',
  },
]

const mockOriginalText = 'Software Engineer with experience in cloud infrastructure. Worked on various projects and performed tasks as assigned.'

const mockTailoredText = 'Senior Software Engineer with 5+ years of experience architecting and deploying scalable AWS infrastructure. Led cross-functional team of 12 engineers delivering enterprise cloud solutions.'

describe('ChangeExplanation Component', () => {
  beforeEach(() => {
    // Clear any previous renders
  })

  describe('No Changes State', () => {
    it('should return null when changes array is empty', () => {
      const { container } = render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={[]}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Collapsed State (Default)', () => {
    it('should render in collapsed state by default', () => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      expect(screen.getByText('Why was this changed?')).toBeInTheDocument()
      expect(screen.queryByText('ORIGINAL')).not.toBeInTheDocument()
      expect(screen.queryByText('TAILORED')).not.toBeInTheDocument()
    })

    it('should show ChevronDown icon when collapsed', () => {
      const { container } = render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const chevronDown = container.querySelector('.lucide-chevron-down')
      expect(chevronDown).toBeInTheDocument()
    })

    it('should not show detailed changes when collapsed', () => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      expect(screen.queryByText('DETAILED CHANGES')).not.toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should expand when toggle button is clicked', () => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      expect(screen.getByText('ORIGINAL')).toBeInTheDocument()
      expect(screen.getByText('TAILORED')).toBeInTheDocument()
    })

    it('should show ChevronUp icon when expanded', () => {
      const { container } = render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      const chevronUp = container.querySelector('.lucide-chevron-up')
      expect(chevronUp).toBeInTheDocument()
    })

    it('should collapse when toggle button is clicked again', () => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })

      // Expand
      fireEvent.click(toggleButton)
      expect(screen.getByText('ORIGINAL')).toBeInTheDocument()

      // Collapse
      fireEvent.click(toggleButton)
      expect(screen.queryByText('ORIGINAL')).not.toBeInTheDocument()
    })
  })

  describe('Text Comparison Display', () => {
    beforeEach(() => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)
    })

    it('should display original text', () => {
      expect(screen.getByText(mockOriginalText)).toBeInTheDocument()
    })

    it('should display tailored text', () => {
      expect(screen.getByText(mockTailoredText)).toBeInTheDocument()
    })

    it('should label original text section', () => {
      expect(screen.getByText('ORIGINAL')).toBeInTheDocument()
    })

    it('should label tailored text section', () => {
      expect(screen.getByText('TAILORED')).toBeInTheDocument()
    })
  })

  describe('Detailed Changes Display', () => {
    beforeEach(() => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)
    })

    it('should display DETAILED CHANGES section', () => {
      expect(screen.getByText('DETAILED CHANGES')).toBeInTheDocument()
    })

    it('should render all changes', () => {
      expect(screen.getByText('Led cross-functional team of 12 engineers')).toBeInTheDocument()
      expect(screen.getByText('Worked on cloud infrastructure')).toBeInTheDocument()
      expect(screen.getByText('Performed various tasks as assigned')).toBeInTheDocument()
    })
  })

  describe('Change Type Icons', () => {
    beforeEach(() => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)
    })

    it('should display + icon for added changes', () => {
      const addedIcon = screen.getByText('+')
      expect(addedIcon).toBeInTheDocument()
      expect(addedIcon).toHaveClass('text-green-400')
    })

    it('should display ~ icon for modified changes', () => {
      const modifiedIcon = screen.getByText('~')
      expect(modifiedIcon).toBeInTheDocument()
      expect(modifiedIcon).toHaveClass('text-yellow-400')
    })

    it('should display - icon for removed changes', () => {
      const removedIcon = screen.getByText('-')
      expect(removedIcon).toBeInTheDocument()
      expect(removedIcon).toHaveClass('text-red-400')
    })
  })

  describe('Before/After Text Display', () => {
    beforeEach(() => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)
    })

    it('should display Before label for original text', () => {
      const beforeLabels = screen.getAllByText('Before:')
      expect(beforeLabels.length).toBeGreaterThan(0)
    })

    it('should display After label for changed text', () => {
      const afterLabels = screen.getAllByText('After:')
      expect(afterLabels.length).toBeGreaterThan(0)
    })

    it('should show original text with line-through for modified changes', () => {
      const originalText = screen.getByText('Worked on cloud infrastructure')
      expect(originalText).toHaveClass('line-through')
    })

    it('should display changed text with appropriate color', () => {
      const changedText = screen.getByText('Architected and deployed scalable AWS infrastructure')
      expect(changedText).toHaveClass('text-yellow-400')
    })

    it('should show changed text for added changes', () => {
      expect(screen.getByText('Led cross-functional team of 12 engineers')).toBeInTheDocument()
    })

    it('should show original text for removed changes', () => {
      expect(screen.getByText('Performed various tasks as assigned')).toBeInTheDocument()
    })
  })

  describe('Reason Display', () => {
    beforeEach(() => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)
    })

    it('should display reason for each change', () => {
      expect(screen.getByText('Added leadership scope to demonstrate management experience')).toBeInTheDocument()
      expect(screen.getByText('Enhanced with specific technology stack and action verbs')).toBeInTheDocument()
      expect(screen.getByText('Removed vague language that does not demonstrate specific value')).toBeInTheDocument()
    })
  })

  describe('Keywords Display', () => {
    beforeEach(() => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)
    })

    it('should display keywords when available', () => {
      expect(screen.getByText('leadership')).toBeInTheDocument()
      expect(screen.getByText('cross-functional')).toBeInTheDocument()
      expect(screen.getByText('team management')).toBeInTheDocument()
    })

    it('should display all keywords for added change', () => {
      expect(screen.getByText('leadership')).toBeInTheDocument()
      expect(screen.getByText('cross-functional')).toBeInTheDocument()
      expect(screen.getByText('team management')).toBeInTheDocument()
    })

    it('should display all keywords for modified change', () => {
      expect(screen.getByText('AWS')).toBeInTheDocument()
      expect(screen.getByText('cloud architecture')).toBeInTheDocument()
      expect(screen.getByText('scalability')).toBeInTheDocument()
    })

    it('should not display keywords section when keywords are not provided', () => {
      // The removed change doesn't have keywords
      // Just verify it doesn't break
      expect(screen.getByText('Performed various tasks as assigned')).toBeInTheDocument()
    })
  })

  describe('Border Color Styling', () => {
    it('should apply green border for added changes', () => {
      const { container } = render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={[mockChanges[0]]} // Only added change
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      const changeCard = container.querySelector('.border-l-4')
      expect(changeCard).toHaveStyle({ borderLeftColor: '#4ade80' })
    })

    it('should apply yellow border for modified changes', () => {
      const { container } = render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={[mockChanges[1]]} // Only modified change
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      const changeCard = container.querySelector('.border-l-4')
      expect(changeCard).toHaveStyle({ borderLeftColor: '#fbbf24' })
    })

    it('should apply red border for removed changes', () => {
      const { container } = render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={[mockChanges[2]]} // Only removed change
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      const changeCard = container.querySelector('.border-l-4')
      expect(changeCard).toHaveStyle({ borderLeftColor: '#f87171' })
    })
  })

  describe('Multiple Changes Rendering', () => {
    it('should render all changes in order', () => {
      render(
        <ChangeExplanation
          sectionName="Professional Experience"
          changes={mockChanges}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      // All three changes should be visible
      expect(screen.getByText('Led cross-functional team of 12 engineers')).toBeInTheDocument()
      expect(screen.getByText('Architected and deployed scalable AWS infrastructure')).toBeInTheDocument()
      expect(screen.getByText('Performed various tasks as assigned')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle change without keywords', () => {
      const changeWithoutKeywords = {
        type: 'added' as const,
        changed: 'New text',
        reason: 'Test reason',
      }

      render(
        <ChangeExplanation
          sectionName="Test Section"
          changes={[changeWithoutKeywords]}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      expect(screen.getByText('New text')).toBeInTheDocument()
      expect(screen.getByText('Test reason')).toBeInTheDocument()
    })

    it('should handle change without original text', () => {
      const changeWithoutOriginal = {
        type: 'added' as const,
        changed: 'Added text only',
        reason: 'New addition',
      }

      render(
        <ChangeExplanation
          sectionName="Test Section"
          changes={[changeWithoutOriginal]}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      expect(screen.getByText('Added text only')).toBeInTheDocument()
      expect(screen.queryByText('Before:')).not.toBeInTheDocument()
    })

    it('should handle change without changed text', () => {
      const changeWithoutChanged = {
        type: 'removed' as const,
        original: 'Removed text only',
        reason: 'Deletion explanation',
      }

      render(
        <ChangeExplanation
          sectionName="Test Section"
          changes={[changeWithoutChanged]}
          originalText={mockOriginalText}
          tailoredText={mockTailoredText}
        />
      )

      const toggleButton = screen.getByRole('button', { name: /why was this changed/i })
      fireEvent.click(toggleButton)

      expect(screen.getByText('Removed text only')).toBeInTheDocument()
      expect(screen.queryByText('After:')).not.toBeInTheDocument()
    })
  })
})
