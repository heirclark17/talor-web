import React, { useState } from 'react'
import { HelpCircle, Search, FileText, Sparkles, Mail, Target } from 'lucide-react'
import FlowDiagram, { type FlowNode, type FlowEdge } from '../components/guidance/FlowDiagram'

const QUICK_APPLY_FLOW: FlowNode[] = [
  {
    id: '1',
    label: 'Upload Resume',
    description: 'Start by uploading your existing resume (PDF or Word)',
    href: '/upload',
    estimatedTime: '30s',
  },
  {
    id: '2',
    label: 'Pick Template',
    description: 'Choose a professional, ATS-friendly template',
    href: '/templates',
    estimatedTime: '1m',
  },
  {
    id: '3',
    label: 'Paste Job Description',
    description: 'Add the job posting you want to apply for',
    href: '/tailor',
    estimatedTime: '30s',
  },
  {
    id: '4',
    label: 'AI Tailoring',
    description: 'Our AI customizes your resume for the specific role',
    href: '/tailor',
    estimatedTime: '2m',
  },
  {
    id: '5',
    label: 'Generate Cover Letter',
    description: 'Create a matching cover letter in seconds',
    href: '/cover-letters',
    estimatedTime: '1m',
  },
  {
    id: '6',
    label: 'Export & Apply',
    description: 'Download your tailored resume and apply',
    href: '/tailor',
    estimatedTime: '30s',
  },
]

const DEEP_CUSTOMIZATION_FLOW: FlowNode[] = [
  {
    id: '1',
    label: 'Upload Resume',
    description: 'Upload your master resume with all experience',
    href: '/upload',
    estimatedTime: '1m',
  },
  {
    id: '2',
    label: 'Analyze Resume',
    description: 'Review AI analysis of strengths and weaknesses',
    href: '/',
    estimatedTime: '2m',
  },
  {
    id: '3',
    label: 'Use Resume Builder',
    description: 'Edit and enhance sections with AI assistance',
    href: '/builder',
    estimatedTime: '10m',
  },
  {
    id: '4',
    label: 'Try Multiple Templates',
    description: 'Preview your resume in different formats',
    href: '/templates',
    estimatedTime: '5m',
  },
  {
    id: '5',
    label: 'Batch Tailor',
    description: 'Create versions for multiple jobs at once',
    href: '/batch-tailor',
    estimatedTime: '5m',
  },
  {
    id: '6',
    label: 'Apply & Track',
    description: 'Monitor your applications and follow-ups',
    href: '/applications',
    estimatedTime: 'Ongoing',
  },
]

const FAQS = [
  {
    question: 'What is an ATS score?',
    answer:
      'ATS (Applicant Tracking System) scores indicate how well a resume template works with automated screening software used by companies. Higher scores (9-10) are best for corporate roles where ATS systems are common, while creative templates (5-7) prioritize visual appeal over ATS optimization.',
  },
  {
    question: 'How does the AI tailoring work?',
    answer:
      'Our AI analyzes the job description to extract key requirements, skills, and company culture indicators. It then customizes your resume by emphasizing relevant experience, incorporating job-specific keywords, and reframing your accomplishments to match what the employer is looking for.',
  },
  {
    question: 'Can I edit the AI-generated content?',
    answer:
      'Absolutely! Every AI-generated section is fully editable. We recommend reviewing and personalizing the content to ensure it accurately represents your experience and matches your voice.',
  },
  {
    question: 'What file formats can I upload?',
    answer:
      'You can upload resumes in PDF (.pdf) or Word document (.docx) format. Maximum file size is 10MB.',
  },
  {
    question: 'How many resumes can I create?',
    answer:
      'There\'s no limit! You can create as many tailored versions of your resume as you need. We recommend creating a unique version for each job application.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. All resume data is encrypted in transit and at rest. We never share your personal information with third parties, and you can delete your account and data at any time from the Settings page.',
  },
]

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFlow, setSelectedFlow] = useState<'quick' | 'deep'>('quick')

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-theme mb-4">Help Center</h1>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Learn how to get the most out of TailorMe
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass border border-theme-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-theme"
            />
          </div>
        </div>

        {/* Flow Diagrams */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-theme mb-6">How It Works</h2>

          {/* Flow Selector */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelectedFlow('quick')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                selectedFlow === 'quick'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-theme-glass-10 text-theme hover:bg-theme-glass-20'
              }`}
            >
              Quick Apply (5 min)
            </button>
            <button
              onClick={() => setSelectedFlow('deep')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                selectedFlow === 'deep'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-theme-glass-10 text-theme hover:bg-theme-glass-20'
              }`}
            >
              Deep Customization (20 min)
            </button>
          </div>

          {/* Active Flow */}
          {selectedFlow === 'quick' && (
            <FlowDiagram
              name="Quick Apply Flow"
              description="The fastest path from resume to application - perfect for when you're short on time"
              nodes={QUICK_APPLY_FLOW}
              edges={[]}
            />
          )}

          {selectedFlow === 'deep' && (
            <FlowDiagram
              name="Deep Customization Flow"
              description="Comprehensive approach for maximum impact - ideal for dream jobs and career transitions"
              nodes={DEEP_CUSTOMIZATION_FLOW}
              edges={[]}
            />
          )}
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-theme mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <details
                key={index}
                className="glass rounded-xl border border-theme-subtle overflow-hidden group"
              >
                <summary className="px-6 py-4 font-medium text-theme cursor-pointer list-none flex items-center justify-between hover:bg-theme-glass-5 transition-colors">
                  <span>{faq.question}</span>
                  <svg
                    className="w-5 h-5 text-theme-tertiary transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-6 py-4 border-t border-theme-subtle text-theme-secondary">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-500/10 rounded-xl p-8 text-center border border-blue-500/20">
          <h3 className="text-xl font-bold text-theme mb-2">
            Still need help?
          </h3>
          <p className="text-theme-secondary mb-6">
            Our support team is here to assist you
          </p>
          <a
            href="mailto:support@talorme.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Mail className="w-5 h-5" />
            <span>Contact Support</span>
          </a>
        </div>
      </div>
    </div>
  )
}
