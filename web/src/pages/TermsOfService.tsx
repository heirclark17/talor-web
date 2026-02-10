import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <Link to="/settings" className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <FileText className="w-8 h-8 text-theme" />
        <h1 className="text-3xl font-bold text-theme">Terms of Service</h1>
      </div>

      <div className="prose-theme space-y-6 text-theme-secondary leading-relaxed">
        <p className="text-theme-tertiary text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using TalorMe ("the Service"), available at talorme.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">2. Description of Service</h2>
          <p>TalorMe is an AI-powered resume tailoring platform that helps users customize their resumes for specific job postings. The Service includes resume upload and parsing, AI-powered resume tailoring, cover letter generation, interview preparation tools, and application tracking.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">3. User Accounts</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must create an account to use the Service's features.</li>
            <li>You are responsible for maintaining the security of your account.</li>
            <li>You must provide accurate information when creating your account.</li>
            <li>You are solely responsible for all activity that occurs under your account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">4. User Content</h2>
          <p>You retain ownership of all content you upload to the Service, including your resumes, cover letters, and personal information. By uploading content, you grant us a limited license to process, store, and use your content solely for the purpose of providing the Service to you.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">5. AI-Generated Content</h2>
          <p>The Service uses artificial intelligence to generate tailored resumes and related content. You acknowledge that:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>AI-generated content should be reviewed for accuracy before use.</li>
            <li>You are responsible for the final content of any resume or document you submit to employers.</li>
            <li>We do not guarantee that AI-generated content will result in job interviews or employment.</li>
            <li>AI output may occasionally contain errors or inaccuracies that you should correct.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">6. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Use the Service for any unlawful purpose</li>
            <li>Upload false or misleading information</li>
            <li>Attempt to access other users' data</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Use automated tools to access the Service beyond normal use</li>
            <li>Resell or redistribute the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">7. Limitation of Liability</h2>
          <p>The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the preceding 12 months.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">8. Service Availability</h2>
          <p>We strive to maintain high availability but do not guarantee uninterrupted access to the Service. We may modify, suspend, or discontinue the Service at any time with reasonable notice.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">9. Termination</h2>
          <p>We may terminate or suspend your account at our discretion if you violate these terms. You may delete your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">10. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Material changes will be communicated through the Service. Your continued use after changes constitutes acceptance of the updated terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">11. Contact</h2>
          <p>For questions about these terms, contact us at <a href="mailto:support@talorme.com" className="text-blue-400 hover:underline">support@talorme.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
