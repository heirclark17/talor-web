import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <Link to="/settings" className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Settings
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-theme" />
        <h1 className="text-3xl font-bold text-theme">Privacy Policy</h1>
      </div>

      <div className="prose-theme space-y-6 text-theme-secondary leading-relaxed">
        <p className="text-theme-tertiary text-sm">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">1. Information We Collect</h2>
          <p>When you use TalorMe ("the Service"), we collect the following information:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong className="text-theme">Account Information:</strong> Email address and authentication data provided through our authentication provider (Supabase).</li>
            <li><strong className="text-theme">Resume Data:</strong> Resume files you upload, including personal information contained within them (name, contact information, work history, education, skills).</li>
            <li><strong className="text-theme">Usage Data:</strong> Job URLs you provide for tailoring, cover letter content, interview preparation data, and application tracking information.</li>
            <li><strong className="text-theme">Technical Data:</strong> Browser type, device information, and general usage patterns to improve the Service.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and operate the resume tailoring service</li>
            <li>To generate AI-powered resume customizations, cover letters, and interview preparation materials</li>
            <li>To store and manage your resumes and application data</li>
            <li>To improve and maintain the Service</li>
            <li>To communicate with you about the Service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">3. AI Processing</h2>
          <p>Your resume content and job descriptions are processed using third-party AI services (OpenAI) to generate tailored resumes and related content. This data is sent to AI service providers solely for the purpose of generating your requested content and is subject to their respective privacy policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">4. Data Storage and Security</h2>
          <p>Your data is stored on secure cloud servers. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">5. Data Sharing</h2>
          <p>We do not sell your personal information. We share your data only with:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>AI service providers (for resume processing)</li>
            <li>Authentication providers (Supabase)</li>
            <li>Cloud hosting providers (for data storage)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Access your personal data</li>
            <li>Delete your resumes and associated data</li>
            <li>Export your data</li>
            <li>Request correction of inaccurate data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">7. Data Retention</h2>
          <p>We retain your data for as long as your account is active. You may delete individual resumes at any time. If you wish to delete all your data, please contact us at <a href="mailto:support@talorme.com" className="text-blue-400 hover:underline">support@talorme.com</a>.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">8. Changes to This Policy</h2>
          <p>We may update this privacy policy from time to time. We will notify you of any material changes by posting the updated policy on this page with a revised "Last updated" date.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-theme mb-3">9. Contact Us</h2>
          <p>If you have questions about this privacy policy, please contact us at <a href="mailto:support@talorme.com" className="text-blue-400 hover:underline">support@talorme.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
