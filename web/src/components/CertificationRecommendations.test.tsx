import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CertificationRecommendations from './CertificationRecommendations'

const mockCertifications = {
  certifications_by_level: {
    entry: [
      {
        name: 'CompTIA Security+',
        provider: 'CompTIA',
        priority: 'high' as const,
        why_recommended: 'Foundational security certification',
        skills_gained: ['Network Security', 'Cryptography', 'Risk Management'],
        cost: '$370',
        time_to_complete: '3-4 months',
        difficulty: 'intermediate',
        roi_rating: 'high',
        prerequisites: 'None',
        study_resources: ['Official Study Guide', 'Professor Messer Videos'],
        exam_details: {
          format: 'Multiple choice and performance-based',
          duration: '90 minutes',
          passing_score: '750/900',
          validity: '3 years'
        }
      }
    ],
    mid: [
      {
        name: 'CISSP',
        provider: 'ISC2',
        priority: 'medium' as const,
        why_recommended: 'Industry standard for security professionals',
        skills_gained: ['Security Architecture', 'Risk Management', 'Compliance'],
        cost: '$749',
        time_to_complete: '6-12 months',
        difficulty: 'advanced',
        roi_rating: 'high',
        prerequisites: '5 years of experience',
        study_resources: ['Official Study Guide', 'Cybrary Course'],
        exam_details: {
          format: 'CAT exam',
          duration: '4 hours',
          passing_score: '700/1000',
          validity: '3 years'
        }
      }
    ],
    advanced: [
      {
        name: 'OSCP',
        provider: 'Offensive Security',
        priority: 'low' as const,
        why_recommended: 'Hands-on penetration testing certification',
        skills_gained: ['Penetration Testing', 'Exploit Development', 'Buffer Overflows'],
        cost: '$1,499',
        time_to_complete: '90 days',
        difficulty: 'expert',
        roi_rating: 'medium',
        prerequisites: 'Strong Linux and networking knowledge',
        study_resources: ['PWK Course', 'Hack The Box'],
        exam_details: {
          format: '24-hour practical exam',
          duration: '24 hours',
          passing_score: '70 points',
          validity: 'Lifetime'
        }
      }
    ]
  },
  recommended_path: [
    {
      step: 1,
      certification: 'CompTIA Security+',
      timeline: '0-3 months',
      rationale: 'Build foundational security knowledge'
    },
    {
      step: 2,
      certification: 'CISSP',
      timeline: '3-15 months',
      rationale: 'Establish credibility with industry standard cert'
    }
  ],
  personalized_advice: 'Focus on hands-on experience alongside certifications.\nConsider starting with Security+ to build a strong foundation.'
}

describe('CertificationRecommendations Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Loading State', () => {
    it('should show loading spinner', () => {
      render(<CertificationRecommendations certifications={null} loading={true} />)
      const spinner = screen.getByTestId('certifications-section').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should show loading message', () => {
      render(<CertificationRecommendations certifications={null} loading={true} />)
      expect(screen.getByText(/Loading certification recommendations/)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show empty message when no certifications', () => {
      render(<CertificationRecommendations certifications={null} loading={false} />)
      expect(screen.getByText(/No certification recommendations available/)).toBeInTheDocument()
    })
  })

  describe('Initial Rendering', () => {
    it('should render header', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByText('Recommended Certifications')).toBeInTheDocument()
      expect(screen.getByText(/Personalized recommendations/)).toBeInTheDocument()
    })

    it('should render level filter buttons', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByText('All Levels')).toBeInTheDocument()
      expect(screen.getByText('Entry Level')).toBeInTheDocument()
      expect(screen.getByText('Mid Level')).toBeInTheDocument()
      expect(screen.getByText('Advanced')).toBeInTheDocument()
    })

    it('should have All Levels selected by default', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const allButton = screen.getByText('All Levels').closest('button')
      expect(allButton).toHaveClass('bg-blue-500')
    })

    it('should display all certifications by default', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      // Certs appear in cards AND roadmap, so use getAllByText
      expect(screen.getAllByText('CompTIA Security+').length).toBeGreaterThan(0)
      expect(screen.getAllByText('CISSP').length).toBeGreaterThan(0)
      expect(screen.getByText('OSCP')).toBeInTheDocument()
    })
  })

  describe('Level Filtering', () => {
    it('should filter to entry level certifications', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const entryButton = screen.getByTestId('level-filter-entry')
      fireEvent.click(entryButton)

      // CompTIA Security+ should be in cards (not roadmap when filtered)
      const certNames = screen.getAllByTestId('cert-name')
      expect(certNames.length).toBe(1)
      expect(certNames[0]).toHaveTextContent('CompTIA Security+')
    })

    it('should filter to mid level certifications', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const midButton = screen.getByTestId('level-filter-mid')
      fireEvent.click(midButton)

      const certNames = screen.getAllByTestId('cert-name')
      expect(certNames.length).toBe(1)
      expect(certNames[0]).toHaveTextContent('CISSP')
    })

    it('should filter to advanced level certifications', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const advancedButton = screen.getByTestId('level-filter-advanced')
      fireEvent.click(advancedButton)

      const certNames = screen.getAllByTestId('cert-name')
      expect(certNames.length).toBe(1)
      expect(certNames[0]).toHaveTextContent('OSCP')
    })

    it('should show all certifications when All Levels clicked', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      // Filter to entry
      fireEvent.click(screen.getByTestId('level-filter-entry'))
      expect(screen.getAllByTestId('cert-name').length).toBe(1)

      // Click All Levels
      fireEvent.click(screen.getByText('All Levels'))
      expect(screen.getAllByTestId('cert-name').length).toBe(3)
    })

    it('should show empty message when no certs in filtered level', () => {
      const emptyCerts = {
        certifications_by_level: { entry: [], mid: [], advanced: [] },
        recommended_path: [],
        personalized_advice: ''
      }
      render(<CertificationRecommendations certifications={emptyCerts} loading={false} />)

      expect(screen.getByText(/No certifications found for this level/)).toBeInTheDocument()
    })
  })

  describe('Certification Cards', () => {
    it('should display certification name and provider', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      // Names appear in cards AND roadmap
      expect(screen.getAllByText('CompTIA Security+').length).toBeGreaterThan(0)
      expect(screen.getAllByText('CompTIA').length).toBeGreaterThan(0)
    })

    it('should display level badge', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const certCards = screen.getAllByTestId('cert-level')
      expect(certCards[0]).toHaveTextContent('entry')
    })

    it('should display priority badge', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByText(/high priority/)).toBeInTheDocument()
    })

    it('should display cost, time, and ROI', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByText('$370')).toBeInTheDocument()
      // "3-4 months" and "high ROI" appear multiple times for different certs
      expect(screen.getAllByText('3-4 months').length).toBeGreaterThan(0)
      expect(screen.getAllByText(/high ROI/).length).toBeGreaterThan(0)
    })

    it('should render save/bookmark button', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const saveButtons = screen.getAllByTestId('save-cert-btn')
      expect(saveButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Card Expansion', () => {
    it('should expand card when clicked', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      // Initially collapsed
      expect(screen.queryByTestId('cert-description')).not.toBeInTheDocument()

      // Click to expand
      const certCard = screen.getAllByTestId('cert-card')[0]
      const expandButton = certCard.querySelector('button')
      fireEvent.click(expandButton!)

      // Should show details
      expect(screen.getByTestId('cert-description')).toHaveTextContent('Foundational security certification')
    })

    it('should collapse card when clicked again', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const certCard = screen.getAllByTestId('cert-card')[0]
      const expandButton = certCard.querySelector('button')

      // Expand
      fireEvent.click(expandButton!)
      expect(screen.getByTestId('cert-description')).toBeInTheDocument()

      // Collapse
      fireEvent.click(expandButton!)
      expect(screen.queryByTestId('cert-description')).not.toBeInTheDocument()
    })

    it('should show skills gained when expanded', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const certCard = screen.getAllByTestId('cert-card')[0]
      fireEvent.click(certCard.querySelector('button')!)

      expect(screen.getByText('Network Security')).toBeInTheDocument()
      expect(screen.getByText('Cryptography')).toBeInTheDocument()
      expect(screen.getByText('Risk Management')).toBeInTheDocument()
    })

    it('should show exam details when expanded', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const certCard = screen.getAllByTestId('cert-card')[0]
      fireEvent.click(certCard.querySelector('button')!)

      expect(screen.getByText('Exam Details')).toBeInTheDocument()
      expect(screen.getByText('Multiple choice and performance-based')).toBeInTheDocument()
      expect(screen.getByText('90 minutes')).toBeInTheDocument()
      expect(screen.getByText('750/900')).toBeInTheDocument()
      expect(screen.getByText('3 years')).toBeInTheDocument()
    })

    it('should show study resources when expanded', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const certCard = screen.getAllByTestId('cert-card')[0]
      fireEvent.click(certCard.querySelector('button')!)

      expect(screen.getByTestId('study-resources')).toBeInTheDocument()
      expect(screen.getByText(/Official Study Guide/)).toBeInTheDocument()
      expect(screen.getByText(/Professor Messer Videos/)).toBeInTheDocument()
    })
  })

  describe('Save/Bookmark Functionality', () => {
    it('should toggle saved state when bookmark clicked', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const saveButton = screen.getAllByTestId('save-cert-btn')[0]

      // Initially not saved
      expect(saveButton).not.toHaveClass('bg-blue-500')

      // Click to save
      fireEvent.click(saveButton)
      expect(saveButton).toHaveClass('bg-blue-500')

      // Click to unsave
      fireEvent.click(saveButton)
      expect(saveButton).not.toHaveClass('bg-blue-500')
    })

    it('should save to localStorage when bookmarked', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const saveButton = screen.getAllByTestId('save-cert-btn')[0]
      fireEvent.click(saveButton)

      const saved = localStorage.getItem('saved_certifications')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed).toContain('CompTIA Security+')
    })

    it('should load saved certifications from localStorage', () => {
      localStorage.setItem('saved_certifications', JSON.stringify(['CompTIA Security+']))

      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const saveButton = screen.getAllByTestId('save-cert-btn')[0]
      expect(saveButton).toHaveClass('bg-blue-500')
    })

    it('should not propagate click when bookmark button clicked', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const saveButton = screen.getAllByTestId('save-cert-btn')[0]
      fireEvent.click(saveButton)

      // Card should not expand
      expect(screen.queryByTestId('cert-description')).not.toBeInTheDocument()
    })
  })

  describe('Recommended Path', () => {
    it('should display recommended certification path', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByTestId('cert-roadmap')).toBeInTheDocument()
      expect(screen.getByText('Recommended Certification Path')).toBeInTheDocument()
    })

    it('should show roadmap steps', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const steps = screen.getAllByTestId('roadmap-step')
      expect(steps.length).toBe(2)
    })

    it('should display step numbers', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      const stepNumbers = screen.getAllByTestId('step-number')
      expect(stepNumbers[0]).toHaveTextContent('1')
      expect(stepNumbers[1]).toHaveTextContent('2')
    })

    it('should display timeline and rationale', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByText('0-3 months')).toBeInTheDocument()
      expect(screen.getByText(/Build foundational security knowledge/)).toBeInTheDocument()
    })

    it('should not show roadmap when empty', () => {
      const certsWithoutPath = {
        ...mockCertifications,
        recommended_path: []
      }
      render(<CertificationRecommendations certifications={certsWithoutPath} loading={false} />)
      expect(screen.queryByTestId('cert-roadmap')).not.toBeInTheDocument()
    })
  })

  describe('Personalized Advice', () => {
    it('should display personalized advice', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)
      expect(screen.getByText('Personalized Career Advice')).toBeInTheDocument()
      expect(screen.getByText(/Focus on hands-on experience/)).toBeInTheDocument()
    })

    it('should not show advice when empty', () => {
      const certsWithoutAdvice = {
        ...mockCertifications,
        personalized_advice: ''
      }
      render(<CertificationRecommendations certifications={certsWithoutAdvice} loading={false} />)
      expect(screen.queryByText('Personalized Career Advice')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle certifications with no prerequisites', () => {
      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      const certCard = screen.getAllByTestId('cert-card')[0]
      fireEvent.click(certCard.querySelector('button')!)

      // Prerequisites section should not show for "None"
      expect(screen.queryByText('Prerequisites')).not.toBeInTheDocument()
    })

    it('should handle empty skills gained array', () => {
      const certsWithoutSkills = {
        certifications_by_level: {
          entry: [{
            ...mockCertifications.certifications_by_level.entry[0],
            skills_gained: []
          }],
          mid: [],
          advanced: []
        },
        recommended_path: [],
        personalized_advice: ''
      }
      render(<CertificationRecommendations certifications={certsWithoutSkills} loading={false} />)

      const certCard = screen.getByTestId('cert-card')
      fireEvent.click(certCard.querySelector('button')!)

      expect(screen.queryByText('Skills Gained')).not.toBeInTheDocument()
    })

    it('should handle localStorage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem('saved_certifications', 'invalid json')

      render(<CertificationRecommendations certifications={mockCertifications} loading={false} />)

      expect(consoleErrorSpy).toHaveBeenCalled()
      consoleErrorSpy.mockRestore()
    })
  })
})
