import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TermsOfService from './TermsOfService'

describe('TermsOfService Page', () => {
  const renderTermsOfService = () => {
    return render(
      <BrowserRouter>
        <TermsOfService />
      </BrowserRouter>
    )
  }

  describe('Header', () => {
    it('should render back to settings link', () => {
      renderTermsOfService()
      const backLink = screen.getByRole('link', { name: /back to settings/i })
      expect(backLink).toBeInTheDocument()
      expect(backLink).toHaveAttribute('href', '/settings')
    })

    it('should render Terms of Service heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: 'Terms of Service', level: 1 })).toBeInTheDocument()
    })

    it('should render FileText icon', () => {
      const { container } = renderTermsOfService()
      const icon = container.querySelector('.w-8.h-8.text-theme')
      expect(icon).toBeInTheDocument()
    })

    it('should render last updated date', () => {
      renderTermsOfService()
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
    })
  })

  describe('Section 1: Acceptance of Terms', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /1\. Acceptance of Terms/i })).toBeInTheDocument()
    })

    it('should describe agreement to terms', () => {
      renderTermsOfService()
      expect(screen.getByText(/By accessing or using TalorMe/)).toBeInTheDocument()
    })
  })

  describe('Section 2: Description of Service', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /2\. Description of Service/i })).toBeInTheDocument()
    })

    it('should describe service features', () => {
      renderTermsOfService()
      expect(screen.getByText(/AI-powered resume tailoring platform/)).toBeInTheDocument()
    })

    it('should list key features', () => {
      renderTermsOfService()
      expect(screen.getByText(/resume upload and parsing/)).toBeInTheDocument()
    })
  })

  describe('Section 3: User Accounts', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /3\. User Accounts/i })).toBeInTheDocument()
    })

    it('should list account creation requirement', () => {
      renderTermsOfService()
      expect(screen.getByText(/You must create an account/)).toBeInTheDocument()
    })

    it('should list security responsibility', () => {
      renderTermsOfService()
      expect(screen.getByText(/maintaining the security of your account/)).toBeInTheDocument()
    })

    it('should list accuracy requirement', () => {
      renderTermsOfService()
      expect(screen.getByText(/provide accurate information/)).toBeInTheDocument()
    })
  })

  describe('Section 4: User Content', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /4\. User Content/i })).toBeInTheDocument()
    })

    it('should describe content ownership', () => {
      renderTermsOfService()
      expect(screen.getByText(/You retain ownership of all content you upload/)).toBeInTheDocument()
    })
  })

  describe('Section 5: AI-Generated Content', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /5\. AI-Generated Content/i })).toBeInTheDocument()
    })

    it('should describe AI usage', () => {
      renderTermsOfService()
      expect(screen.getByText(/The Service uses artificial intelligence/)).toBeInTheDocument()
    })

    it('should list content review requirement', () => {
      renderTermsOfService()
      expect(screen.getByText(/AI-generated content should be reviewed for accuracy/)).toBeInTheDocument()
    })

    it('should list user responsibility', () => {
      renderTermsOfService()
      expect(screen.getByText(/You are responsible for the final content/)).toBeInTheDocument()
    })

    it('should include no guarantee disclaimer', () => {
      renderTermsOfService()
      expect(screen.getByText(/We do not guarantee that AI-generated content/)).toBeInTheDocument()
    })
  })

  describe('Section 6: Acceptable Use', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /6\. Acceptable Use/i })).toBeInTheDocument()
    })

    it('should prohibit unlawful use', () => {
      renderTermsOfService()
      expect(screen.getByText(/Use the Service for any unlawful purpose/)).toBeInTheDocument()
    })

    it('should prohibit false information', () => {
      renderTermsOfService()
      expect(screen.getByText(/Upload false or misleading information/)).toBeInTheDocument()
    })

    it('should prohibit unauthorized access', () => {
      renderTermsOfService()
      expect(screen.getByText(/Attempt to access other users' data/)).toBeInTheDocument()
    })
  })

  describe('Section 7: Limitation of Liability', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /7\. Limitation of Liability/i })).toBeInTheDocument()
    })

    it('should include as-is disclaimer', () => {
      renderTermsOfService()
      expect(screen.getByText(/The Service is provided "as is"/)).toBeInTheDocument()
    })

    it('should limit liability amount', () => {
      renderTermsOfService()
      expect(screen.getByText(/total liability shall not exceed/)).toBeInTheDocument()
    })
  })

  describe('Section 8: Service Availability', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /8\. Service Availability/i })).toBeInTheDocument()
    })

    it('should describe availability commitment', () => {
      renderTermsOfService()
      expect(screen.getByText(/We strive to maintain high availability/)).toBeInTheDocument()
    })
  })

  describe('Section 9: Termination', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /9\. Termination/i })).toBeInTheDocument()
    })

    it('should describe termination rights', () => {
      renderTermsOfService()
      expect(screen.getByText(/We may terminate or suspend your account/)).toBeInTheDocument()
    })

    it('should describe user deletion rights', () => {
      renderTermsOfService()
      expect(screen.getByText(/You may delete your account at any time/)).toBeInTheDocument()
    })
  })

  describe('Section 10: Changes to Terms', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /10\. Changes to Terms/i })).toBeInTheDocument()
    })

    it('should describe modification rights', () => {
      renderTermsOfService()
      expect(screen.getByText(/We reserve the right to modify these terms/)).toBeInTheDocument()
    })
  })

  describe('Section 11: Contact', () => {
    it('should render section heading', () => {
      renderTermsOfService()
      expect(screen.getByRole('heading', { name: /11\. Contact/i })).toBeInTheDocument()
    })

    it('should have contact email link', () => {
      renderTermsOfService()
      const emailLink = screen.getByRole('link', { name: /support@talorme.com/i })
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveAttribute('href', 'mailto:support@talorme.com')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderTermsOfService()
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
    })

    it('should have section headings at h2 level', () => {
      renderTermsOfService()
      const h2Headings = screen.getAllByRole('heading', { level: 2 })
      expect(h2Headings.length).toBe(11)
    })

    it('should have descriptive link text', () => {
      renderTermsOfService()
      expect(screen.getByRole('link', { name: /back to settings/i })).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have container with max width', () => {
      const { container } = renderTermsOfService()
      const mainContainer = container.querySelector('.max-w-3xl')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should have prose theme styling', () => {
      const { container } = renderTermsOfService()
      const proseContainer = container.querySelector('.prose-theme')
      expect(proseContainer).toBeInTheDocument()
    })
  })
})
