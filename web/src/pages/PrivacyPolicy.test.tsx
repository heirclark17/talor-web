import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PrivacyPolicy from './PrivacyPolicy'

describe('PrivacyPolicy Page', () => {
  const renderPrivacyPolicy = () => {
    return render(
      <BrowserRouter>
        <PrivacyPolicy />
      </BrowserRouter>
    )
  }

  describe('Header', () => {
    it('should render back to settings link', () => {
      renderPrivacyPolicy()
      const backLink = screen.getByRole('link', { name: /back to settings/i })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/settings')
    })

    it('should render Privacy Policy heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: 'Privacy Policy', level: 1 })).toBeInTheDocument()
    })

    it('should render Shield icon', () => {
      const { container } = renderPrivacyPolicy()
      const icon = container.querySelector('.w-8.h-8.text-theme')
      expect(icon).toBeInTheDocument()
    })

    it('should render last updated date', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  describe('Section 1: Information We Collect', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /1\. Information We Collect/i })).toBeInTheDocument()
    })

    it('should list account information', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Account Information:/)).toBeInTheDocument()
    })

    it('should list resume data', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Resume Data:/)).toBeInTheDocument()
    })

    it('should list usage data', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Usage Data:/)).toBeInTheDocument()
    })

    it('should list technical data', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Technical Data:/)).toBeInTheDocument()
    })
  })

  describe('Section 2: How We Use Your Information', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /2\. How We Use Your Information/i })).toBeInTheDocument()
    })

    it('should describe service provision', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/To provide and operate the resume tailoring service/)).toBeInTheDocument()
    })

    it('should describe AI-powered features', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/To generate AI-powered resume customizations/)).toBeInTheDocument()
    })
  })

  describe('Section 3: AI Processing', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /3\. AI Processing/i })).toBeInTheDocument()
    })

    it('should mention OpenAI usage', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/third-party AI services \(OpenAI\)/)).toBeInTheDocument()
    })
  })

  describe('Section 4: Data Storage and Security', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /4\. Data Storage and Security/i })).toBeInTheDocument()
    })

    it('should describe security measures', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/We implement appropriate technical and organizational measures/)).toBeInTheDocument()
    })
  })

  describe('Section 5: Data Sharing', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /5\. Data Sharing/i })).toBeInTheDocument()
    })

    it('should state data is not sold', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/We do not sell your personal information/)).toBeInTheDocument()
    })

    it('should list AI service providers', () => {
      renderPrivacyPolicy()
      const providers = screen.getAllByText(/AI service providers/)
      expect(providers.length).toBeGreaterThan(0)
    })

    it('should list authentication providers', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Authentication providers \(Clerk\)/)).toBeInTheDocument()
    })
  })

  describe('Section 6: Your Rights', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /6\. Your Rights/i })).toBeInTheDocument()
    })

    it('should list data access rights', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Access your personal data/)).toBeInTheDocument()
    })

    it('should list data deletion rights', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Delete your resumes and associated data/)).toBeInTheDocument()
    })

    it('should list data export rights', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/Export your data/)).toBeInTheDocument()
    })
  })

  describe('Section 7: Data Retention', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /7\. Data Retention/i })).toBeInTheDocument()
    })

    it('should have support email link', () => {
      renderPrivacyPolicy()
      const emailLinks = screen.getAllByRole('link', { name: /support@talorme.com/i })
      expect(emailLinks.length).toBeGreaterThan(0)
      expect(emailLinks[0]).toHaveAttribute('href', 'mailto:support@talorme.com')
    })
  })

  describe('Section 8: Changes to This Policy', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /8\. Changes to This Policy/i })).toBeInTheDocument()
    })

    it('should describe update notification process', () => {
      renderPrivacyPolicy()
      expect(screen.getByText(/We may update this privacy policy from time to time/)).toBeInTheDocument()
    })
  })

  describe('Section 9: Contact Us', () => {
    it('should render section heading', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('heading', { name: /9\. Contact Us/i })).toBeInTheDocument()
    })

    it('should have contact email link', () => {
      renderPrivacyPolicy()
      const emailLinks = screen.getAllByRole('link', { name: /support@talorme.com/i })
      expect(emailLinks.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderPrivacyPolicy()
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('should have section headings at h2 level', () => {
      renderPrivacyPolicy()
      const h2Headings = screen.getAllByRole('heading', { level: 2 })
      expect(h2Headings.length).toBe(9)
    })

    it('should have descriptive link text', () => {
      renderPrivacyPolicy()
      expect(screen.getByRole('link', { name: /back to settings/i })).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have container with max width', () => {
      const { container } = renderPrivacyPolicy()
      const mainContainer = container.querySelector('.max-w-3xl')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should have prose theme styling', () => {
      const { container } = renderPrivacyPolicy()
      const proseContainer = container.querySelector('.prose-theme')
      expect(proseContainer).toBeInTheDocument()
    })
  })
})
