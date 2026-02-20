import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplateCard from './TemplateCard'
import { useSubscriptionStore } from '../../stores/subscriptionStore'
import type { ResumeTemplate } from '../../types/template'

// Mock subscription store
vi.mock('../../stores/subscriptionStore', () => ({
  useSubscriptionStore: vi.fn(),
}))

const mockTemplate: ResumeTemplate = {
  id: 'test-template',
  name: 'Test Template',
  category: 'modern',
  description: 'A modern test template for testing purposes',
  preview: '',
  layout: {
    type: 'single-column',
    sectionOrder: ['summary', 'experience', 'education'],
    showIcons: false,
    showBorders: false,
    showDividers: true,
  },
  style: {
    colors: {
      primary: '#3b82f6',
      secondary: '#60a5fa',
      text: '#374151',
      heading: '#1f2937',
      background: '#ffffff',
      border: '#e5e7eb',
      subtle: '#9ca3af',
    },
    fonts: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      accent: 'Inter, sans-serif',
      headingSize: {
        name: '30px',
        section: '15px',
        job: '13px',
      },
      bodySize: '11px',
      lineHeight: '1.6',
    },
    spacing: {
      section: '20px',
      subsection: '12px',
      line: '1.6',
      margin: '0.75in',
      padding: '0',
    },
    borderRadius: '4px',
    accentWidth: '2px',
    shadowEffect: false,
  },
  atsScore: 8,
  isPremium: false,
  tags: ['modern', 'test'],
  popularityRank: 1,
  createdAt: '2026-02-20',
  updatedAt: '2026-02-20',
}

describe('TemplateCard', () => {
  const mockOnSelect = vi.fn()
  const mockOnPreview = vi.fn()
  const mockCheckFeatureAccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckFeatureAccess.mockReturnValue(true)
    ;(useSubscriptionStore as any).mockReturnValue({
      checkFeatureAccess: mockCheckFeatureAccess,
    })
  })

  it('renders template name and description', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.getByText('Test Template')).toBeInTheDocument()
    expect(screen.getByText(/A modern test template/)).toBeInTheDocument()
  })

  it('displays ATS score badge', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.getByText('ATS 8/10')).toBeInTheDocument()
  })

  it('displays category badge', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.getByText('modern')).toBeInTheDocument()
  })

  it('shows selected indicator when isSelected is true', () => {
    render(
      <TemplateCard template={mockTemplate} isSelected={true} onSelect={mockOnSelect} />
    )

    expect(screen.getByText('Selected')).toBeInTheDocument()
  })

  it('does not show selected indicator when isSelected is false', () => {
    render(
      <TemplateCard template={mockTemplate} isSelected={false} onSelect={mockOnSelect} />
    )

    expect(screen.queryByText('Selected')).not.toBeInTheDocument()
  })

  it('shows premium badge for premium templates', () => {
    const premiumTemplate = { ...mockTemplate, isPremium: true }
    render(
      <TemplateCard template={premiumTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.getByText('PRO')).toBeInTheDocument()
  })

  it('does not show premium badge for free templates', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.queryByText('PRO')).not.toBeInTheDocument()
  })

  it('calls onSelect when clicked (free template with access)', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} />
    )

    const card = screen.getByText('Test Template').closest('div')!.parentElement!
    fireEvent.click(card)

    expect(mockOnSelect).toHaveBeenCalledWith(mockTemplate)
    expect(mockOnSelect).toHaveBeenCalledTimes(1)
  })

  it('calls onSelect for premium template when user has access', () => {
    mockCheckFeatureAccess.mockReturnValue(true)
    const premiumTemplate = { ...mockTemplate, isPremium: true }

    render(
      <TemplateCard template={premiumTemplate} onSelect={mockOnSelect} />
    )

    const card = screen.getByText('Test Template').closest('div')!.parentElement!
    fireEvent.click(card)

    expect(mockOnSelect).toHaveBeenCalledWith(premiumTemplate)
  })

  it('does not call onSelect for premium template when user lacks access', () => {
    mockCheckFeatureAccess.mockReturnValue(false)
    const premiumTemplate = { ...mockTemplate, isPremium: true }

    render(
      <TemplateCard template={premiumTemplate} onSelect={mockOnSelect} />
    )

    const card = screen.getByText('Test Template').closest('div')!.parentElement!
    fireEvent.click(card)

    expect(mockOnSelect).not.toHaveBeenCalled()
  })

  it('shows upgrade message for locked premium templates', () => {
    mockCheckFeatureAccess.mockReturnValue(false)
    const premiumTemplate = { ...mockTemplate, isPremium: true }

    render(
      <TemplateCard template={premiumTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.getByText(/Upgrade to Pro to use this template/)).toBeInTheDocument()
  })

  it('applies correct styling for selected template', () => {
    const { container } = render(
      <TemplateCard template={mockTemplate} isSelected={true} onSelect={mockOnSelect} />
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-accent')
    expect(card.className).toContain('ring-2')
  })

  it('applies correct styling for non-selected template with access', () => {
    const { container } = render(
      <TemplateCard template={mockTemplate} isSelected={false} onSelect={mockOnSelect} />
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('cursor-pointer')
    expect(card.className).not.toContain('opacity-60')
  })

  it('applies correct styling for locked template', () => {
    mockCheckFeatureAccess.mockReturnValue(false)
    const premiumTemplate = { ...mockTemplate, isPremium: true }

    const { container } = render(
      <TemplateCard template={premiumTemplate} onSelect={mockOnSelect} />
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-60')
    expect(card.className).toContain('cursor-not-allowed')
  })

  it('shows preview button on hover when onPreview is provided', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} onPreview={mockOnPreview} />
    )

    expect(screen.getByText('Preview')).toBeInTheDocument()
  })

  it('calls onPreview when preview button is clicked', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} onPreview={mockOnPreview} />
    )

    const previewButton = screen.getByText('Preview')
    fireEvent.click(previewButton)

    expect(mockOnPreview).toHaveBeenCalledWith(mockTemplate)
    expect(mockOnSelect).not.toHaveBeenCalled() // Should not trigger onSelect
  })

  it('does not show preview button when onPreview is not provided', () => {
    render(
      <TemplateCard template={mockTemplate} onSelect={mockOnSelect} />
    )

    expect(screen.queryByText('Preview')).not.toBeInTheDocument()
  })

  describe('category badge colors', () => {
    it('applies correct color for ats-friendly category', () => {
      const template = { ...mockTemplate, category: 'ats-friendly' as const }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('ats-friendly')
      expect(badge.className).toContain('text-green-400')
    })

    it('applies correct color for modern category', () => {
      const template = { ...mockTemplate, category: 'modern' as const }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('modern')
      expect(badge.className).toContain('text-blue-400')
    })

    it('applies correct color for creative category', () => {
      const template = { ...mockTemplate, category: 'creative' as const }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('creative')
      expect(badge.className).toContain('text-purple-400')
    })

    it('applies correct color for executive category', () => {
      const template = { ...mockTemplate, category: 'executive' as const }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('executive')
      expect(badge.className).toContain('text-amber-400')
    })

    it('applies correct color for minimal category', () => {
      const template = { ...mockTemplate, category: 'minimal' as const }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('minimal')
      expect(badge.className).toContain('text-gray-400')
    })
  })

  describe('ATS score badge colors', () => {
    it('applies green color for ATS score 9-10', () => {
      const template = { ...mockTemplate, atsScore: 9 }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('ATS 9/10')
      expect(badge.className).toContain('text-green-400')
    })

    it('applies blue color for ATS score 7-8', () => {
      const template = { ...mockTemplate, atsScore: 7 }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('ATS 7/10')
      expect(badge.className).toContain('text-blue-400')
    })

    it('applies yellow color for ATS score below 7', () => {
      const template = { ...mockTemplate, atsScore: 6 }
      render(<TemplateCard template={template} onSelect={mockOnSelect} />)

      const badge = screen.getByText('ATS 6/10')
      expect(badge.className).toContain('text-yellow-400')
    })
  })
})
